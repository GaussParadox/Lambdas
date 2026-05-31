const { CompactEncrypt, compactDecrypt } = require('./jose-encryptor/node_modules/jose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    // Load keys
    const publicKeyPem = fs.readFileSync(path.join(__dirname, './keys/public.pem'), 'utf8');
    const privateKeyPem = fs.readFileSync(path.join(__dirname, './keys/private.pem'), 'utf8');

    const publicKey = crypto.createPublicKey({
      key: publicKeyPem,
      format: 'pem'
    });

    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem'
    });

    // Test payload
    const payload = { message: 'Hello, World!', test: true };

    // Encrypt
    console.log('Encrypting...');
    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(JSON.stringify(payload)))
      .setProtectedHeader({
        alg: 'RSA-OAEP',
        enc: 'A256CBC-HS512'
      })
      .encrypt(publicKey);

    console.log('JWE Token:', jwe.substring(0, 100) + '...');

    // Decrypt
    console.log('\nDecrypting...');
    const decryptResult = await compactDecrypt(jwe, privateKey);
    
    console.log('Decrypt result keys:', Object.keys(decryptResult));
    console.log('Decrypt result:', decryptResult);
    
    const decryptedPayload = decryptResult.plaintext || decryptResult.payload;
    
    if (!decryptedPayload) {
      console.error('No payload in decrypt result');
      return;
    }
    
    console.log('Payload type:', decryptedPayload.constructor.name);
    console.log('Payload length:', decryptedPayload.length);
    
    let decryptedString;
    if (Buffer.isBuffer(decryptedPayload)) {
      decryptedString = decryptedPayload.toString('utf8');
    } else if (decryptedPayload instanceof Uint8Array) {
      decryptedString = Buffer.from(decryptedPayload).toString('utf8');
    } else {
      decryptedString = String(decryptedPayload);
    }
    
    console.log('Decrypted string:', decryptedString);
    console.log('String length:', decryptedString.length);
    
    if (decryptedString) {
      const decrypted = JSON.parse(decryptedString);
      console.log('Decrypted:', decrypted);
      console.log('Match:', JSON.stringify(payload) === JSON.stringify(decrypted));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
