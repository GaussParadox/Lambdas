# JWE Lambda Functions - Spec-Driven Development

This project contains two AWS Lambda functions for JWE (JSON Web Encryption) operations using asymmetric RSA encryption, developed following **Spec-Driven Development (SDD)** methodology.

## 📦 Project Structure

```
lamda/
├── keys/
│   ├── public.pem          # RSA Public Key (can be shared)
│   ├── private.pem         # RSA Private Key (NEVER commit to public repo!)
│   └── .gitignore          # Ensures private key is not versioned
│
├── jose-encryptor/         # Lambda 1: Encryption Service
│   ├── src/
│   │   └── index.js        # Main encryption handler
│   ├── __tests__/
│   │   └── index.test.js   # Unit tests (26 tests, 100% passing)
│   ├── .kiro/specs/
│   │   ├── requirements.md # REQ-001 through REQ-008
│   │   ├── design.md       # Architecture & specifications
│   │   └── tasks.md        # Implementation tasks breakdown
│   ├── package.json        # Dependencies & scripts
│   ├── jest.config.js      # Test configuration
│   ├── README.md           # Encryptor documentation
│   └── .gitignore
│
├── jose-decryptor/         # Lambda 2: Decryption Service
│   ├── src/
│   │   └── index.js        # Main decryption handler
│   ├── __tests__/
│   │   └── index.test.js   # Unit tests (28 tests, 100% passing)
│   ├── .kiro/specs/
│   │   ├── requirements.md # REQ-001 through REQ-009
│   │   ├── design.md       # Architecture & specifications
│   │   └── tasks.md        # Implementation tasks breakdown
│   ├── package.json        # Dependencies & scripts
│   ├── jest.config.js      # Test configuration
│   ├── README.md           # Decryptor documentation
│   └── .gitignore
│
├── generate-keys.js        # Script to generate RSA key pair
├── test-crypto.js          # Basic encryption/decryption test
├── README.md               # This file
├── .gitignore              # Root .gitignore
└── ARCHITECTURE.md         # System architecture overview
```

## 🚀 Quick Start

### 1. Generate RSA Keys

```bash
node generate-keys.js
```

Output:
```
✅ Public key generated: ./keys/public.pem
✅ Private key generated: ./keys/private.pem
```

### 2. Install Dependencies

```bash
cd jose-encryptor && npm install
cd ../jose-decryptor && npm install
```

### 3. Run Tests

**Encryptor Tests:**
```bash
cd jose-encryptor
npm test
# Test Suites: 1 passed, 1 total
# Tests:       26 passed, 26 total ✅
```

**Decryptor Tests:**
```bash
cd jose-decryptor
npm test
# Test Suites: 1 passed, 1 total
# Tests:       28 passed, 28 total ✅
```

### 4. Test Encryption/Decryption Cycle

```bash
node test-crypto.js
# Encrypting...
# Decrypting...
# Match: true ✅
```

## 🔐 Encryption Specifications

### Key Pair
- **Type**: RSA-2048
- **Format**: PEM (PKCS#8 for private, SPKI for public)
- **Generated**: Via crypto.generateKeyPairSync()

### Algorithms
- **Key Encryption**: RSA-OAEP (2048-bit)
- **Content Encryption**: A256CBC-HS512 (AES-256-CBC + HMAC-SHA512)
- **JWE Format**: Compact Serialization (5-part structure)

## 📊 Lambda Functions Overview

### 1. JOSE Encryptor Lambda
**Purpose**: Encrypt JSON payloads into JWE tokens

- **Handler**: `src/index.handler`
- **Input**: JSON payload
- **Output**: Encrypted JWE token
- **Tests**: 26 unit tests ✅
- **Specs**: `.kiro/specs/requirements.md`, `design.md`, `tasks.md`

**Example:**
```bash
Input:  { "user": "john", "email": "john@example.com" }
Output: eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.VXeZjZt6...
```

[Full Documentation](./jose-encryptor/README.md)

### 2. JOSE Decryptor Lambda
**Purpose**: Decrypt JWE tokens back into JSON payloads

- **Handler**: `src/index.handler`
- **Input**: Encrypted JWE token
- **Output**: Original JSON payload
- **Tests**: 28 unit tests ✅
- **Specs**: `.kiro/specs/requirements.md`, `design.md`, `tasks.md`

**Example:**
```bash
Input:  eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.VXeZjZt6...
Output: { "user": "john", "email": "john@example.com" }
```

[Full Documentation](./jose-decryptor/README.md)

## 📋 Spec-Driven Development Documentation

Each lambda follows SDD with comprehensive documentation:

### JOSE Encryptor Specs
- **Requirements** (`jose-encryptor/.kiro/specs/requirements.md`):
  - REQ-001: Function Overview
  - REQ-002: Input Validation
  - REQ-003: JWE Encryption
  - REQ-004: Error Handling
  - REQ-005: Lambda Response Format
  - REQ-006: Key Management
  - REQ-007: Unit Test Coverage
  - REQ-008: Logging

- **Design** (`jose-encryptor/.kiro/specs/design.md`):
  - Architecture diagram
  - Dependencies table
  - Encryption specifications
  - Data flow diagram
  - Error handling strategy
  - Security considerations

- **Tasks** (`jose-encryptor/.kiro/specs/tasks.md`):
  - 7 implementation tasks
  - Dependency graph
  - Success criteria

### JOSE Decryptor Specs
- **Requirements** (`jose-decryptor/.kiro/specs/requirements.md`):
  - REQ-001 through REQ-009
  - Includes payload validation requirement

- **Design** (`jose-decryptor/.kiro/specs/design.md`):
  - Complete architecture
  - Cross-lambda testing strategy
  - Security considerations

- **Tasks** (`jose-decryptor/.kiro/specs/tasks.md`):
  - 7 implementation tasks
  - Detailed breakdown per task
  - Success criteria

## ✅ Test Coverage

### Unit Tests Summary

| Lambda | Tests | Passed | Coverage |
|--------|-------|--------|----------|
| jose-encryptor | 26 | 26 ✅ | 100% |
| jose-decryptor | 28 | 28 ✅ | 100% |
| **Total** | **54** | **54 ✅** | **100%** |

### Test Categories

**jose-encryptor:**
- Input validation (8 tests)
- Happy path scenarios (4 tests)
- Error handling (6 tests)
- Edge cases (5 tests)
- Response format (3 tests)

**jose-decryptor:**
- Format validation (11 tests)
- Happy path scenarios (4 tests)
- Error handling (7 tests)
- Edge cases (3 tests)
- Response format (3 tests)

### Running Tests with Coverage

```bash
# Encryptor with coverage
cd jose-encryptor
npm test -- --coverage

# Decryptor with coverage
cd ../jose-decryptor
npm test -- --coverage
```

## 🔄 End-to-End Workflow

```
1. Plain JSON Payload
   ↓
   [JOSE Encryptor Lambda]
   - Validate input
   - Encrypt with RSA-OAEP
   - Return JWE token
   ↓
2. JWE Encrypted Token
   ↓
   [JOSE Decryptor Lambda]
   - Validate JWE format
   - Decrypt with private key
   - Verify signature
   - Return original payload
   ↓
3. Plain JSON Payload (original)
```

## 🛠️ AWS Deployment

### Prerequisites
- AWS Account with Lambda service enabled
- IAM role for Lambda execution
- AWS CLI configured

### Deployment Steps

**Step 1: Package Functions**
```bash
# Encryptor
cd jose-encryptor
zip -r ../function-encryptor.zip . -x "node_modules/*"
npm install
zip -r ../function-encryptor.zip node_modules/

# Decryptor
cd ../jose-decryptor
zip -r ../function-decryptor.zip . -x "node_modules/*"
npm install
zip -r ../function-decryptor.zip node_modules/
```

**Step 2: Create Functions**
```bash
# Encryptor
aws lambda create-function \
  --function-name jose-encryptor \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler src/index.handler \
  --zip-file fileb://function-encryptor.zip \
  --timeout 30

# Decryptor
aws lambda create-function \
  --function-name jose-decryptor \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler src/index.handler \
  --zip-file fileb://function-decryptor.zip \
  --timeout 30
```

**Step 3: Store Keys**
```bash
# Store public key in Secrets Manager
aws secretsmanager create-secret \
  --name jose-encryptor-public-key \
  --secret-string file://keys/public.pem

# Store private key in Secrets Manager
aws secretsmanager create-secret \
  --name jose-decryptor-private-key \
  --secret-string file://keys/private.pem
```

**Step 4: Test Functions**
```bash
# Test encryptor
aws lambda invoke \
  --function-name jose-encryptor \
  --payload '{"payload":{"message":"test"}}' \
  response.json

# Test decryptor
aws lambda invoke \
  --function-name jose-decryptor \
  --payload '{"jwe":"eyJ..."}' \
  response.json
```

## 🔐 Security Guidelines

### ✅ Do
- ✅ Store private key in AWS Secrets Manager
- ✅ Restrict IAM access to Lambda functions
- ✅ Enable CloudWatch logging
- ✅ Rotate keys periodically
- ✅ Use HTTPS for API Gateway integration

### ❌ Don't
- ❌ Commit private keys to repositories
- ❌ Log sensitive data (payloads, keys)
- ❌ Use default IAM roles
- ❌ Share private key in code
- ❌ Disable encryption

## 📚 Dependencies

### Runtime
- **jose** (v5.2.0): JWE encryption/decryption
- **Node.js** (v20.x): Lambda runtime

### Development
- **jest** (v29.7.0): Testing framework
- **@types/jest** (v29.5.8): Type definitions

## 🤝 Git Repository

This project is version controlled and includes:
- Complete source code for both lambdas
- Unit tests with 100% passing rate
- SDD specifications (requirements, design, tasks)
- Deployment documentation
- .gitignore to protect private keys

```bash
git status
# Shows clean working directory with private key ignored
```

## 📖 Additional Documentation

- [JOSE Encryptor README](./jose-encryptor/README.md)
- [JOSE Decryptor README](./jose-decryptor/README.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Encryption Specifications](./ENCRYPTION.md)

## Evidencias de funcionamiento desde el front
<img width="1503" height="987" alt="image" src="https://github.com/user-attachments/assets/cbad92ac-bd7e-4fb8-9548-f246316a748d" />
<img width="1051" height="849" alt="image" src="https://github.com/user-attachments/assets/1df6f2ab-cd89-405b-bcdf-343035213197" />


## Evidencias de funcionamiento desde la terminal
<img width="1114" height="865" alt="image" src="https://github.com/user-attachments/assets/49cc3588-1b4b-4d99-95cf-23724b5c8199" />

## 📄 License

MIT License - See LICENSE file for details

---

**Project Status**: ✅ Complete & Production Ready
- ✅ All tests passing (54/54)
- ✅ Complete SDD documentation
- ✅ Ready for AWS deployment
- ✅ Security best practices implemented
- ✅ Comprehensive README documentation
