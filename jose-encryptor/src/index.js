const fs = require('fs');
const path = require('path');
const { CompactEncrypt } = require('jose');
const crypto = require('crypto');

// Cache for the public key
let publicKeyCache = null;

/**
 * Load public RSA key from file
 * @returns {Promise<crypto.KeyObject>} The public key object
 */
async function loadPublicKey() {
  if (publicKeyCache) {
    return publicKeyCache;
  }

  try {
    const keyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/public.pem');
    const keyData = fs.readFileSync(keyPath, 'utf8');
    
    const publicKey = crypto.createPublicKey({
      key: keyData,
      format: 'pem'
    });
    
    publicKeyCache = publicKey;
    return publicKey;
  } catch (error) {
    throw new Error(`Failed to load public key: ${error.message}`);
  }
}

/**
 * Validate input payload
 * @param {*} payload - The payload to validate
 * @throws {Error} If validation fails
 */
function validatePayload(payload) {
  if (payload === null || payload === undefined) {
    throw new Error('Payload cannot be null or undefined');
  }

  if (typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a JSON object');
  }

  const payloadString = JSON.stringify(payload);
  const payloadSize = Buffer.byteLength(payloadString, 'utf8');

  if (payloadSize > 1 * 1024 * 1024) { // 1MB limit
    throw new Error(`Payload exceeds 1MB limit (${(payloadSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  return payload;
}

/**
 * Encrypt payload to JWE token
 * @param {*} payload - The payload to encrypt
 * @param {CryptoKey} publicKey - The public key
 * @returns {Promise<string>} The encrypted JWE token
 */
async function encryptPayload(payload, publicKey) {
  try {
    const encoder = new TextEncoder();
    const encryptedJWE = await new CompactEncrypt(
      encoder.encode(JSON.stringify(payload))
    )
      .setProtectedHeader({
        alg: 'RSA-OAEP',
        enc: 'A256CBC-HS512'
      })
      .encrypt(publicKey);

    return encryptedJWE;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Lambda handler for encrypting payloads
 * @param {*} event - Lambda event
 * @returns {Promise<{statusCode: number, body: string}>} Lambda response
 */
async function handler(event) {
  console.log('📨 JOSE Encryptor Lambda invoked');

  try {
    // Parse input
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    } catch (parseError) {
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    // Extract payload, handling null explicitly
    const payload = (body && body.payload !== undefined) ? body.payload : body;

    console.log('🔍 Validating payload...');
    validatePayload(payload);

    console.log('🔑 Loading public key...');
    const publicKey = await loadPublicKey();

    console.log('🔐 Encrypting payload...');
    const jweToken = await encryptPayload(payload, publicKey);

    console.log(`✅ Encryption successful. Token preview: ${jweToken.substring(0, 50)}...`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        jwe: jweToken,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('❌ Encryption error:', error);

    const statusCode = error.message.includes('cannot be null') ||
                      error.message.includes('must be a JSON') ||
                      error.message.includes('exceeds 1MB') ||
                      error.message.includes('Invalid JSON')
      ? 400
      : 500;

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

module.exports = { handler, validatePayload, encryptPayload, loadPublicKey };
