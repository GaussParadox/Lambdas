const fs = require('fs');
const path = require('path');
const { compactDecrypt } = require('jose');
const crypto = require('crypto');

// Cache for the private key
let privateKeyCache = null;

/**
 * Load private RSA key from file
 * @returns {Promise<crypto.KeyObject>} The private key object
 */
async function loadPrivateKey() {
  if (privateKeyCache) {
    return privateKeyCache;
  }

  try {
    const keyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../../keys/private.pem');
    const keyData = fs.readFileSync(keyPath, 'utf8');
    
    const privateKey = crypto.createPrivateKey({
      key: keyData,
      format: 'pem'
    });

    privateKeyCache = privateKey;
    return privateKey;
  } catch (error) {
    throw new Error(`Failed to load private key: ${error.message}`);
  }
}

/**
 * Validate JWE token format
 * @param {string} token - The token to validate
 * @throws {Error} If validation fails
 */
function validateJWEFormat(token) {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('JWE token must be a non-empty string');
  }

  const parts = token.split('.');
  if (parts.length !== 5) {
    throw new Error(
      'Invalid JWE format. Expected 5 parts separated by dots, ' +
      `got ${parts.length}`
    );
  }

  // Check that each part is valid base64url
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i] || !isValidBase64Url(parts[i])) {
      throw new Error(`Invalid base64url encoding in JWE part ${i + 1}`);
    }
  }

  return token;
}

/**
 * Check if a string is valid base64url
 * @param {string} str - String to check
 * @returns {boolean} True if valid base64url
 */
function isValidBase64Url(str) {
  const base64urlRegex = /^[A-Za-z0-9_-]*$/;
  return base64urlRegex.test(str);
}

/**
 * Decrypt JWE token
 * @param {string} token - The JWE token to decrypt
 * @param {crypto.KeyObject} privateKey - The private key
 * @returns {Promise<object>} The decrypted payload
 */
async function decryptToken(token, privateKey) {
  try {
    const { plaintext } = await compactDecrypt(token, privateKey);
    
    // Convert Uint8Array to string
    let payloadString;
    if (Buffer.isBuffer(plaintext)) {
      payloadString = plaintext.toString('utf8');
    } else if (plaintext instanceof Uint8Array) {
      payloadString = Buffer.from(plaintext).toString('utf8');
    } else {
      payloadString = String(plaintext);
    }

    // Parse and validate JSON
    try {
      return JSON.parse(payloadString);
    } catch (e) {
      throw new Error('Decrypted payload is not valid JSON');
    }
  } catch (error) {
    if (error.message.includes('Decrypted payload')) {
      throw error;
    }
    // Check for common decryption error patterns
    if (error.message.includes('decrypt') || error.message.includes('verify')) {
      throw new Error('Decryption failed. Token may be invalid or tampered.');
    }
    throw new Error(`Decryption error: ${error.message}`);
  }
}

/**
 * Lambda handler for decrypting JWE tokens
 * @param {*} event - Lambda event
 * @returns {Promise<{statusCode: number, body: string}>} Lambda response
 */
async function handler(event) {
  console.log('📨 JOSE Decryptor Lambda invoked');

  try {
    // Parse input
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    const jweToken = body.jwe || body;

    console.log('🔍 Validating JWE format...');
    validateJWEFormat(jweToken);

    console.log('🔑 Loading private key...');
    const privateKey = await loadPrivateKey();

    console.log('🔓 Decrypting token...');
    const decryptedPayload = await decryptToken(jweToken, privateKey);

    console.log(`✅ Decryption successful. Token preview: ${jweToken.substring(0, 50)}...`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        payload: decryptedPayload,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('❌ Decryption error:', error);

    // Determine HTTP status code
    let statusCode = 500;
    if (error.message.includes('must be a non-empty') ||
        error.message.includes('Invalid JWE') ||
        error.message.includes('base64url')) {
      statusCode = 400; // Bad request
    } else if (error.message.includes('invalid') ||
               error.message.includes('tampered') ||
               error.message.includes('Decrypted payload')) {
      statusCode = 401; // Unauthorized
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}

module.exports = {
  handler,
  validateJWEFormat,
  decryptToken,
  loadPrivateKey,
  isValidBase64Url
};
