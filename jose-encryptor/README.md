# JOSE Encryptor Lambda

AWS Lambda function to encrypt JSON payloads in JWE (JSON Web Encryption) format using RSA-2048 asymmetric encryption.

## 📋 Overview

This Lambda function:
- Accepts a JSON payload as input
- Encrypts the payload using RSA-OAEP encryption algorithm
- Returns an encrypted JWE token
- Uses AES-256 for content encryption with HMAC authentication

## 🏗️ Architecture

```
Input Payload (JSON)
        ↓
    [Validation]
   - Parse JSON
   - Check size (max 1MB)
        ↓
   [Encryption]
   - Load Public RSA Key
   - Encrypt with RSA-OAEP
   - Content encrypt with A256CBC-HS512
        ↓
Output JWE Token (5-part Compact Serialization)
```

## 🔧 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `jose` | ^5.2.0 | JWE encryption/decryption library |
| `jest` | ^29.7.0 | Unit testing framework |

## 📦 Installation

```bash
npm install
```

## 🚀 Usage

### Local Testing

```bash
npm test
```

### Lambda Handler

**Input Format:**
```json
{
  "body": "{\"payload\": {\"user\": \"john\", \"email\": \"john@example.com\"}}"
}
```

Or directly:
```json
{
  "user": "john",
  "email": "john@example.com"
}
```

**Output Format (Success):**
```json
{
  "statusCode": 200,
  "body": "{
    \"success\": true,
    \"jwe\": \"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ...\",
    \"timestamp\": \"2024-01-15T10:30:45.123Z\"
  }"
}
```

**Output Format (Error):**
```json
{
  "statusCode": 400,
  "body": "{
    \"success\": false,
    \"error\": \"Payload must be a JSON object\",
    \"timestamp\": \"2024-01-15T10:30:45.123Z\"
  }"
}
```

## 📊 Test Coverage

### Test Results
```
 PASS  __tests__/index.test.js
  JOSE Encryptor Lambda
    validatePayload
      ✓ should accept valid JSON object (3 ms)
      ✓ should reject null payload (16 ms)
      ✓ should reject undefined payload
      ✓ should reject non-object payload (1 ms)
      ✓ should reject array payload (1 ms)
      ✓ should reject payload exceeding 1MB (5 ms)
      ✓ should accept complex nested objects
      ✓ should accept empty object
    Handler - Happy Path
      ✓ should encrypt valid payload successfully (34 ms)
      ✓ should handle payload as direct event body (3 ms)
      ✓ should encrypt complex nested payload (4 ms)
      ✓ should produce valid JWE token format (3 ms)
    Handler - Error Cases
      ✓ should return 400 for null payload (7 ms)
      ✓ should return 400 for invalid JSON in body (7 ms)
      ✓ should return 400 for non-object payload (4 ms)
      ✓ should return 400 for array payload (3 ms)
      ✓ should return 400 for oversized payload (10 ms)
      ✓ should include timestamp in error response (9 ms)
    Edge Cases
      ✓ should handle payload with special characters (3 ms)
      ✓ should handle payload with deeply nested structure (3 ms)
      ✓ should handle payload with large arrays (5 ms)
      ✓ should handle payload with numeric values (2 ms)
      ✓ should handle payload with boolean values (3 ms)
    Response Format
      ✓ should include Content-Type header (3 ms)
      ✓ should always include timestamp (4 ms)
      ✓ should include success flag (3 ms)

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Time:        0.705 s
```

### Coverage by Category

| Test Category | Tests | Status |
|---------------|-------|--------|
| Input Validation | 8 | ✅ Passing |
| Happy Path | 4 | ✅ Passing |
| Error Cases | 6 | ✅ Passing |
| Edge Cases | 5 | ✅ Passing |
| Response Format | 3 | ✅ Passing |
| **Total** | **26** | **✅ 100% Passing** |

## 🔐 Security Considerations

### Encryption Specifications
- **Key Encryption Algorithm**: RSA-OAEP (2048-bit)
- **Content Encryption**: AES-256-CBC with HMAC-SHA-512
- **Key Format**: PKCS#8 PEM (Private), SPKI PEM (Public)

### Key Management
- Private key should **never** be committed to public repositories
- Use AWS Secrets Manager or Parameter Store for key storage in production
- Rotate keys according to security policies
- Public key can be safely shared

### Security Best Practices
1. ✅ No sensitive data in logs
2. ✅ Token preview only shows first 50 characters
3. ✅ Tamper-resistant (HMAC included)
4. ✅ Proper error messages (no information leakage)

## 📝 Environment Variables

```bash
PUBLIC_KEY_PATH=/path/to/public.pem  # Optional, defaults to ../keys/public.pem
```

## 🛠️ Deployment to AWS

### 1. Create Lambda Function
```bash
aws lambda create-function \
  --function-name jose-encryptor \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler src/index.handler \
  --zip-file fileb://function.zip
```

### 2. Upload Public Key
Store the public key in AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name jose-encryptor-public-key \
  --secret-string file://keys/public.pem
```

### 3. Update Lambda Environment
```bash
aws lambda update-function-configuration \
  --function-name jose-encryptor \
  --environment "Variables={PUBLIC_KEY_PATH=/opt/nodejs/public.pem}"
```

### 4. Test
```bash
aws lambda invoke \
  --function-name jose-encryptor \
  --payload '{"payload":{"message":"test"}}' \
  response.json
```

## 📚 API Contracts

### Input Validation Rules
- Payload must be a JSON object (not array, string, number, or boolean)
- Payload cannot be null or undefined
- Payload size must not exceed 1MB
- Request body must be valid JSON

### Error Codes
| Code | Reason | Example |
|------|--------|---------|
| 200 | Success | Payload encrypted successfully |
| 400 | Bad Request | Invalid JSON, oversized, or invalid type |
| 500 | Server Error | Key loading failed, encryption failure |

## 🧪 Example Usage

### Encrypting User Data
```javascript
const payload = {
  userId: 12345,
  email: "user@example.com",
  roles: ["admin", "viewer"],
  metadata: {
    loginTime: "2024-01-15T10:30:00Z",
    ipAddress: "192.168.1.1"
  }
};

// Lambda invocation
const result = await lambda.invoke({
  FunctionName: 'jose-encryptor',
  Payload: JSON.stringify({ payload })
}).promise();

const { jwe } = JSON.parse(result.Payload);
console.log('Encrypted token:', jwe);
// eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ...
```

## 📖 Specification Documents

For detailed requirements, design, and implementation tasks, see:
- [Requirements](./.kiro/specs/requirements.md)
- [Design Document](./.kiro/specs/design.md)
- [Implementation Tasks](./.kiro/specs/tasks.md)

## 📄 License

MIT

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Author**: Development Team
