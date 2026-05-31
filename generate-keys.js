#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating RSA key pair for JWE encryption/decryption...\n');

// Generate RSA key pair (2048-bit)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const keysDir = path.join(__dirname, 'keys');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Write public key
const publicKeyPath = path.join(keysDir, 'public.pem');
fs.writeFileSync(publicKeyPath, publicKey);
console.log(`✅ Public key generated: ${publicKeyPath}`);

// Write private key
const privateKeyPath = path.join(keysDir, 'private.pem');
fs.writeFileSync(privateKeyPath, privateKey);
console.log(`✅ Private key generated: ${privateKeyPath}`);

console.log('\n⚠️  IMPORTANT: Do not commit the private key to public repositories!');
console.log('Add "keys/private.pem" to .gitignore\n');

console.log('Key Details:');
console.log('- Algorithm: RSA');
console.log('- Key Size: 2048 bits');
console.log('- Encoding: PEM (PKCS#8 for private key, SPKI for public key)\n');
