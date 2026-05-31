const { handler, validateJWEFormat, isValidBase64Url } = require('../src/index');
const { handler: encryptHandler } = require('../../jose-encryptor/src/index');
const fs = require('fs');
const path = require('path');

describe('JOSE Decryptor Lambda', () => {
  describe('isValidBase64Url', () => {
    test('should accept valid base64url characters', () => {
      expect(isValidBase64Url('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')).toBe(true);
    });

    test('should reject invalid characters', () => {
      expect(isValidBase64Url('ABC+DEF')).toBe(false); // Plus sign
      expect(isValidBase64Url('ABC/DEF')).toBe(false); // Slash
      expect(isValidBase64Url('ABC=DEF')).toBe(false); // Equals sign
      expect(isValidBase64Url('ABC DEF')).toBe(false); // Space
    });

    test('should accept empty string as valid', () => {
      expect(isValidBase64Url('')).toBe(true);
    });

    test('should handle numbers and dash/underscore', () => {
      expect(isValidBase64Url('abc123-_')).toBe(true);
    });
  });

  describe('validateJWEFormat', () => {
    test('should accept valid JWE token format (5 parts)', () => {
      const validJWE = 'header.encrypted_key.iv.ciphertext.auth_tag';
      expect(() => validateJWEFormat(validJWE)).not.toThrow();
    });

    test('should reject non-string token', () => {
      expect(() => validateJWEFormat(null)).toThrow('JWE token must be a non-empty string');
      expect(() => validateJWEFormat(undefined)).toThrow('JWE token must be a non-empty string');
      expect(() => validateJWEFormat(123)).toThrow('JWE token must be a non-empty string');
    });

    test('should reject empty string', () => {
      expect(() => validateJWEFormat('')).toThrow('JWE token must be a non-empty string');
      expect(() => validateJWEFormat('   ')).toThrow('JWE token must be a non-empty string');
    });

    test('should reject token with less than 5 parts', () => {
      expect(() => validateJWEFormat('a.b.c.d')).toThrow('Invalid JWE format');
      expect(() => validateJWEFormat('a.b.c')).toThrow('Invalid JWE format');
      expect(() => validateJWEFormat('a.b')).toThrow('Invalid JWE format');
    });

    test('should reject token with more than 5 parts', () => {
      expect(() => validateJWEFormat('a.b.c.d.e.f')).toThrow('Invalid JWE format');
    });

    test('should reject token with invalid base64url characters', () => {
      const invalidTokens = [
        'header+invalid.encrypted_key.iv.ciphertext.auth_tag',
        'header/invalid.encrypted_key.iv.ciphertext.auth_tag',
        'header=invalid.encrypted_key.iv.ciphertext.auth_tag',
      ];

      invalidTokens.forEach(token => {
        expect(() => validateJWEFormat(token)).toThrow('Invalid base64url encoding');
      });
    });

    test('should reject token with empty parts', () => {
      expect(() => validateJWEFormat('.b.c.d.e')).toThrow('Invalid base64url encoding');
      expect(() => validateJWEFormat('a..c.d.e')).toThrow('Invalid base64url encoding');
    });
  });

  describe('Handler - Happy Path', () => {
    test('should decrypt valid JWE token successfully', async () => {
      // First, encrypt a payload
      const payloadToEncrypt = { message: 'Hello, World!' };
      const encryptEvent = { body: JSON.stringify({ payload: payloadToEncrypt }) };

      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);
      const jweToken = encryptedBody.jwe;

      // Now decrypt it
      const decryptEvent = { body: JSON.stringify({ jwe: jweToken }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const decryptedBody = JSON.parse(decryptResponse.body);
      expect(decryptedBody.success).toBe(true);
      expect(decryptedBody.payload).toEqual(payloadToEncrypt);
      expect(decryptedBody.timestamp).toBeDefined();
    });

    test('should handle jwe as direct event body', async () => {
      // Encrypt first
      const payloadToEncrypt = { data: 'test' };
      const encryptEvent = { body: JSON.stringify({ payload: payloadToEncrypt }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);
      const jweToken = encryptedBody.jwe;

      // Decrypt with jwe as direct body
      const decryptEvent = jweToken;
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const decryptedBody = JSON.parse(decryptResponse.body);
      expect(decryptedBody.success).toBe(true);
      expect(decryptedBody.payload).toEqual(payloadToEncrypt);
    });

    test('should decrypt complex nested payload', async () => {
      const complexPayload = {
        user: {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com'
        },
        roles: ['admin', 'user'],
        permissions: {
          read: true,
          write: true
        }
      };
      const encryptEvent = { body: JSON.stringify({ payload: complexPayload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const decryptedBody = JSON.parse(decryptResponse.body);
      expect(decryptedBody.payload).toEqual(complexPayload);
    });

    test('should preserve special characters through encryption/decryption', async () => {
      const specialPayload = {
        text: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: 'Unicode: 你好世界 🚀 🔐'
      };
      const encryptEvent = { body: JSON.stringify({ payload: specialPayload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const decryptedBody = JSON.parse(decryptResponse.body);
      expect(decryptedBody.payload).toEqual(specialPayload);
    });
  });

  describe('Handler - Error Cases', () => {
    test('should return 400 for null jwe', async () => {
      const event = { body: JSON.stringify({ jwe: null }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('non-empty string');
    });

    test('should return 400 for empty jwe', async () => {
      const event = { body: JSON.stringify({ jwe: '' }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('non-empty string');
    });

    test('should return 400 for malformed JWE (not 5 parts)', async () => {
      const event = { body: JSON.stringify({ jwe: 'a.b.c.d' }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid JWE format');
    });

    test('should return 400 for invalid base64url encoding', async () => {
      const event = { body: JSON.stringify({ jwe: 'inv+lid.b64.c.d.e' }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('base64url');
    });

    test('should return 401 for tampered token', async () => {
      // Encrypt first
      const payload = { secret: 'data' };
      const encryptEvent = { body: JSON.stringify({ payload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);
      let jweToken = encryptedBody.jwe;

      // Tamper with the auth tag (last part)
      const parts = jweToken.split('.');
      parts[4] = 'tampered_auth_tag'; // Change last part
      const tamperedToken = parts.join('.');

      const decryptEvent = { body: JSON.stringify({ jwe: tamperedToken }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(401);
      const body = JSON.parse(decryptResponse.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('invalid') || expect(body.error).toContain('tampered');
    });

    test('should return 401 when decryption fails', async () => {
      // Create a fake JWE token with wrong content
      const parts = [
        Buffer.from('{"alg":"RSA-OAEP","enc":"A256CBC-HS512"}').toString('base64url'),
        'wrongencryptedkey',
        Buffer.from('iv').toString('base64url'),
        Buffer.from('ciphertext').toString('base64url'),
        Buffer.from('authtag').toString('base64url')
      ];
      const fakeJWE = parts.join('.');

      const event = { body: JSON.stringify({ jwe: fakeJWE }) };
      const response = await handler(event);

      expect([400, 401, 500]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('should include timestamp in error response', async () => {
      const event = { body: JSON.stringify({ jwe: null }) };
      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large payloads', async () => {
      const largePayload = {
        data: 'x'.repeat(500 * 1024) // 500KB
      };
      const encryptEvent = { body: JSON.stringify({ payload: largePayload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const body = JSON.parse(decryptResponse.body);
      expect(body.payload).toEqual(largePayload);
    });

    test('should handle payload with deeply nested structure', async () => {
      const nestedPayload = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: 'deep'
                }
              }
            }
          }
        }
      };
      const encryptEvent = { body: JSON.stringify({ payload: nestedPayload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const body = JSON.parse(decryptResponse.body);
      expect(body.payload).toEqual(nestedPayload);
    });

    test('should handle payload with arrays', async () => {
      const arrayPayload = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' }
        ]
      };
      const encryptEvent = { body: JSON.stringify({ payload: arrayPayload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const decryptResponse = await handler(decryptEvent);

      expect(decryptResponse.statusCode).toBe(200);
      const body = JSON.parse(decryptResponse.body);
      expect(body.payload).toEqual(arrayPayload);
    });
  });

  describe('Response Format', () => {
    test('should include Content-Type header', async () => {
      const payload = { test: true };
      const encryptEvent = { body: JSON.stringify({ payload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const response = await handler(decryptEvent);

      expect(response.headers).toBeDefined();
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    test('should always include timestamp', async () => {
      const payload = { test: true };
      const encryptEvent = { body: JSON.stringify({ payload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const response = await handler(decryptEvent);

      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });

    test('should include success flag', async () => {
      const payload = { test: true };
      const encryptEvent = { body: JSON.stringify({ payload }) };
      const encryptResponse = await encryptHandler(encryptEvent);
      const encryptedBody = JSON.parse(encryptResponse.body);

      const decryptEvent = { body: JSON.stringify({ jwe: encryptedBody.jwe }) };
      const response = await handler(decryptEvent);

      const body = JSON.parse(response.body);
      expect(body.success).toBeDefined();
      expect(typeof body.success).toBe('boolean');
    });
  });
});
