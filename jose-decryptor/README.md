# JOSE Decryptor Lambda

AWS Lambda function to decrypt JWE (JSON Web Encryption) tokens and return the original JSON payload using RSA-2048 asymmetric decryption.

## 📋 Overview

This Lambda function:
- Accepts an encrypted JWE token as input
- Validates the JWE token format and integrity
- Decrypts the token using RSA private key
- Returns the original JSON payload
- Performs automatic signature verification

## 🏗️ Architecture

```
Input JWE Token (5-part Compact Serialization)
        ↓
   [Format Validation]
   - Check 5-part structure
   - Verify base64url encoding
        ↓
   [Decryption]
   - Load Private RSA Key
   - Decrypt with RSA-OAEP
   - Verify authentication tag
        ↓
   [Payload Validation]
   - Parse JSON
   - Return object
        ↓
Output Payload (JSON)
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
  "body": "{\"jwe\": \"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ...\"}"
}
```

Or directly:
```
eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.VXeZjZt6C_-w8KBFp1wVVTdzDs5L7zgjKELADbpCVzr_q...
```

**Output Format (Success):**
```json
{
  "statusCode": 200,
  "body": "{
    \"success\": true,
    \"payload\": {
      \"user\": \"john\",
      \"email\": \"john@example.com\"
    },
    \"timestamp\": \"2024-01-15T10:30:45.123Z\"
  }"
}
```

**Output Format (Error):**
```json
{
  "statusCode": 401,
  "body": "{
    \"success\": false,
    \"error\": \"Decryption failed. Token may be invalid or tampered.\",
    \"timestamp\": \"2024-01-15T10:30:45.123Z\"
  }"
}
```

## 📊 Test Coverage

### Test Results
```
 PASS  __tests__/index.test.js
  JOSE Decryptor Lambda
    isValidBase64Url
      ✓ should accept valid base64url characters (2 ms)
      ✓ should reject invalid characters
      ✓ should accept empty string as valid
      ✓ should handle numbers and dash/underscore
    validateJWEFormat
      ✓ should accept valid JWE token format (5 parts) (1 ms)
      ✓ should reject non-string token (17 ms)
      ✓ should reject empty string (1 ms)
      ✓ should reject token with less than 5 parts (1 ms)
      ✓ should reject token with more than 5 parts (1 ms)
      ✓ should reject token with invalid base64url characters (2 ms)
      ✓ should reject token with empty parts (1 ms)
    Handler - Happy Path
      ✓ should decrypt valid JWE token successfully (104 ms)
      ✓ should handle jwe as direct event body (15 ms)
      ✓ should decrypt complex nested payload (21 ms)
      ✓ should preserve special characters through encryption/decryption (22 ms)
    Handler - Error Cases
      ✓ should return 400 for null jwe (10 ms)
      ✓ should return 400 for empty jwe (8 ms)
      ✓ should return 400 for malformed JWE (not 5 parts) (10 ms)
      ✓ should return 400 for invalid base64url encoding (11 ms)
      ✓ should return 401 for tampered token (11 ms)
      ✓ should return 401 when decryption fails (11 ms)
      ✓ should include timestamp in error response (8 ms)
    Edge Cases
      ✓ should handle very large payloads (45 ms)
      ✓ should handle payload with deeply nested structure (16 ms)
      ✓ should handle payload with arrays (16 ms)
    Response Format
      ✓ should include Content-Type header (16 ms)
      ✓ should always include timestamp (15 ms)
      ✓ should include success flag (13 ms)

Test Suites: 1 passed, 1 total
Tests:       28 passed, 28 total
Time:        1.234 s
```

### Coverage by Category

| Test Category | Tests | Status |
|---------------|-------|--------|
| Format Validation | 11 | ✅ Passing |
| Happy Path | 4 | ✅ Passing |
| Error Cases | 7 | ✅ Passing |
| Edge Cases | 3 | ✅ Passing |
| Response Format | 3 | ✅ Passing |
| **Total** | **28** | **✅ 100% Passing** |

## 🔐 Security Considerations

### Decryption Specifications
- **Key Decryption Algorithm**: RSA-OAEP (2048-bit)
- **Content Encryption**: AES-256-CBC with HMAC-SHA-512
- **Signature Verification**: Automatic via JOSE library
- **Tamper Detection**: HMAC validation fails on any modification

### Security Features
- ✅ Automatic signature/authentication verification
- ✅ Tamper detection (returns 401 if token modified)
- ✅ Invalid key detection (returns 401 if wrong key)
- ✅ Proper error messages (no sensitive data leakage)
- ✅ Token preview in logs (first 50 chars only)

### Key Management
- Private key must be **securely stored** (AWS Secrets Manager recommended)
- Never commit private key to repositories
- Implement key rotation policies
- Restrict access to Lambda execution role

## 📝 Environment Variables

```bash
PRIVATE_KEY_PATH=/path/to/private.pem  # Optional, defaults to ../keys/private.pem
```

## 🛠️ Deployment to AWS

### 1. Create Lambda Function
```bash
aws lambda create-function \
  --function-name jose-decryptor \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler src/index.handler \
  --zip-file fileb://function.zip
```

### 2. Store Private Key in Secrets Manager
```bash
aws secretsmanager create-secret \
  --name jose-decryptor-private-key \
  --secret-string file://keys/private.pem
```

### 3. Update Lambda IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:jose-decryptor-private-key-*"
    }
  ]
}
```

### 4. Test
```bash
aws lambda invoke \
  --function-name jose-decryptor \
  --payload file://jwe-token.json \
  response.json
```

## 📚 API Contracts

### Input Validation Rules
- JWE token must be a non-empty string
- JWE token must have exactly 5 parts (separated by dots)
- Each part must be valid base64url encoded
- Token must not be tampered with or modified

### Error Codes
| Code | Reason | Example |
|------|--------|---------|
| 200 | Success | Token decrypted successfully |
| 400 | Bad Request | Malformed token, invalid format |
| 401 | Unauthorized | Invalid/tampered token, wrong key |
| 500 | Server Error | Key loading failed, parsing error |

## 🔄 Integration with Encryptor Lambda

This lambda is designed to work seamlessly with **jose-encryptor**:

```
┌──────────────────┐
│ Original Payload │
└────────┬─────────┘
         │
    [ENCRYPT]
    jose-encryptor
         │
         ▼
┌──────────────────┐
│   JWE Token      │
└────────┬─────────┘
         │
    [DECRYPT]
    jose-decryptor
         │
         ▼
┌──────────────────┐
│ Original Payload │
└──────────────────┘
```

## 🧪 Example Usage

### Decrypting User Data
```javascript
const jweToken = "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ...";

// Lambda invocation
const result = await lambda.invoke({
  FunctionName: 'jose-decryptor',
  Payload: JSON.stringify({ jwe: jweToken })
}).promise();

const { payload } = JSON.parse(result.Payload);
console.log('Decrypted data:', payload);
// { userId: 12345, email: "user@example.com", roles: ["admin"] }
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
