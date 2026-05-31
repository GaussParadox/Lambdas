# JOSE Encryptor - Specification

## REQ-001: Function Overview
The JOSE Encryptor Lambda function must receive a JSON payload and return an encrypted JWE (JSON Web Encryption) token using RSA encryption.

**Status**: ACTIVE  
**Priority**: P0  
**Complexity**: Medium

## REQ-002: Input Validation
The function must validate that the input payload:
- Contains a valid JSON object
- Is not null or undefined
- Does not exceed 1MB in size

**Status**: ACTIVE  
**Priority**: P0

## REQ-003: JWE Encryption
The function must:
- Use JOSE library for JWE encryption
- Use RSA-OAEP for key encryption algorithm
- Use A256CBC-HS512 for content encryption
- Use the public RSA key to encrypt the payload
- Return the encrypted JWE token as a string

**Status**: ACTIVE  
**Priority**: P0

## REQ-004: Error Handling
The function must handle the following error scenarios:
- Invalid JSON payload → Return 400 Bad Request with error message
- File I/O errors reading keys → Return 500 Internal Server Error
- Encryption failures → Return 500 Internal Server Error

**Status**: ACTIVE  
**Priority**: P1

## REQ-005: Lambda Response Format
The function must return:
- **Success**: `{ statusCode: 200, body: JSON.stringify({ jwe: token }) }`
- **Error**: `{ statusCode: 400/500, body: JSON.stringify({ error: message }) }`

**Status**: ACTIVE  
**Priority**: P0

## REQ-006: Key Management
The function must:
- Read the public RSA key from environment or file path
- Load the key only once at initialization
- Cache the key for subsequent invocations

**Status**: ACTIVE  
**Priority**: P1

## REQ-007: Unit Test Coverage
The function must have unit tests covering:
- Happy path: Valid JSON payload encryption
- Error case: Invalid/malformed JSON
- Error case: Missing/invalid RSA key
- Edge case: Large payloads

**Status**: ACTIVE  
**Priority**: P0

## REQ-008: Logging
The function must:
- Log successful encryption with token prefix (first 50 chars)
- Log errors with full stack trace
- Not log sensitive information (private keys)

**Status**: ACTIVE  
**Priority**: P1
