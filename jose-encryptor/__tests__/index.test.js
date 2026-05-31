const { handler, validatePayload, encryptPayload } = require('../src/index');
const fs = require('fs');
const path = require('path');

describe('JOSE Encryptor Lambda', () => {
  describe('validatePayload', () => {
    test('should accept valid JSON object', () => {
      const payload = { user: 'john', age: 30 };
      expect(() => validatePayload(payload)).not.toThrow();
    });

    test('should reject null payload', () => {
      expect(() => validatePayload(null)).toThrow('Payload cannot be null or undefined');
    });

    test('should reject undefined payload', () => {
      expect(() => validatePayload(undefined)).toThrow('Payload cannot be null or undefined');
    });

    test('should reject non-object payload', () => {
      expect(() => validatePayload('string')).toThrow('Payload must be a JSON object');
      expect(() => validatePayload(123)).toThrow('Payload must be a JSON object');
      expect(() => validatePayload(true)).toThrow('Payload must be a JSON object');
    });

    test('should reject array payload', () => {
      expect(() => validatePayload([1, 2, 3])).toThrow('Payload must be a JSON object');
    });

    test('should reject payload exceeding 1MB', () => {
      const largePayload = {
        data: 'x'.repeat(1024 * 1024 + 1) // Over 1MB
      };
      expect(() => validatePayload(largePayload)).toThrow('exceeds 1MB limit');
    });

    test('should accept complex nested objects', () => {
      const complexPayload = {
        user: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          roles: ['admin', 'user']
        },
        metadata: {
          created: '2024-01-01',
          updated: '2024-01-02'
        }
      };
      expect(() => validatePayload(complexPayload)).not.toThrow();
    });

    test('should accept empty object', () => {
      expect(() => validatePayload({})).not.toThrow();
    });
  });

  describe('Handler - Happy Path', () => {
    test('should encrypt valid payload successfully', async () => {
      const payload = { message: 'Hello, World!' };
      const event = {
        body: JSON.stringify({ payload })
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.jwe).toBeDefined();
      expect(typeof body.jwe).toBe('string');
      expect(body.jwe.split('.')).toHaveLength(5); // JWE has 5 parts
      expect(body.timestamp).toBeDefined();
    });

    test('should handle payload as direct event body', async () => {
      const payload = { data: 'test' };
      const event = payload;

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.jwe).toBeDefined();
    });

    test('should encrypt complex nested payload', async () => {
      const payload = {
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
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.jwe).toBeDefined();
    });

    test('should produce valid JWE token format', async () => {
      const payload = { test: 'data' };
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);
      const body = JSON.parse(response.body);
      const jwe = body.jwe;

      // JWE Compact Serialization: 5 parts
      const parts = jwe.split('.');
      expect(parts).toHaveLength(5);
      parts.forEach(part => {
        expect(part).toMatch(/^[A-Za-z0-9_-]+$/); // Valid base64url
      });
    });
  });

  describe('Handler - Error Cases', () => {
    test('should return 400 for null payload', async () => {
      const event = { body: JSON.stringify({ payload: null }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('cannot be null');
    });

    test('should return 400 for invalid JSON in body', async () => {
      const event = { body: 'invalid json {' };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    test('should return 400 for non-object payload', async () => {
      const event = { body: JSON.stringify({ payload: 'string' }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('must be a JSON object');
    });

    test('should return 400 for array payload', async () => {
      const event = { body: JSON.stringify({ payload: [1, 2, 3] }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('must be a JSON object');
    });

    test('should return 400 for oversized payload', async () => {
      const payload = {
        data: 'x'.repeat(1024 * 1024 + 1) // Over 1MB
      };
      const event = { body: JSON.stringify({ payload }) };
      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('exceeds 1MB');
    });

    test('should include timestamp in error response', async () => {
      const event = { body: JSON.stringify({ payload: null }) };
      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    test('should handle payload with special characters', async () => {
      const payload = {
        text: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: 'Unicode: 你好世界 🚀 🔐'
      };
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should handle payload with deeply nested structure', async () => {
      const payload = {
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
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should handle payload with large arrays', async () => {
      const payload = {
        items: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` }))
      };
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should handle payload with numeric values', async () => {
      const payload = {
        integer: 42,
        float: 3.14159,
        negative: -100,
        zero: 0,
        scientific: 1.23e-4
      };
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should handle payload with boolean values', async () => {
      const payload = {
        active: true,
        enabled: false,
        nullable: null
      };
      const event = { body: JSON.stringify({ payload }) };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    test('should include Content-Type header', async () => {
      const event = { body: JSON.stringify({ payload: { test: true } }) };
      const response = await handler(event);

      expect(response.headers).toBeDefined();
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    test('should always include timestamp', async () => {
      const event = { body: JSON.stringify({ payload: { test: true } }) };
      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });

    test('should include success flag', async () => {
      const event = { body: JSON.stringify({ payload: { test: true } }) };
      const response = await handler(event);

      const body = JSON.parse(response.body);
      expect(body.success).toBeDefined();
      expect(typeof body.success).toBe('boolean');
    });
  });
});
