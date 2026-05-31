# JOSE Decryptor - Specification

## REQ-001: Function Overview
The JOSE Decryptor Lambda function must receive an encrypted JWE token and return the decrypted JSON payload using RSA decryption.

**Status**: ACTIVE  
**Priority**: P0  
**Complexity**: Medium

## REQ-002: Input Validation
The function must validate that the input:
- Contains a valid JWE token (3 parts separated by dots)
- Is a non-empty string
- Follows JWE format specification

**Status**: ACTIVE  
**Priority**: P0

## REQ-003: JWE Decryption
The function must:
- Use JOSE library for JWE decryption
- Use the private RSA key to decrypt the token
- Return the decrypted payload as a JSON object
- Verify token signature/integrity

**Status**: ACTIVE  
**Priority**: P0

## REQ-004: Error Handling
The function must handle the following error scenarios:
- Malformed JWE token → Return 400 Bad Request
- Invalid/tampered token → Return 401 Unauthorized
- Decryption failures → Return 500 Internal Server Error
- File I/O errors reading keys → Return 500 Internal Server Error
- Wrong key used for decryption → Return 401 Unauthorized

**Status**: ACTIVE  
**Priority**: P1

## REQ-005: Lambda Response Format
The function must return:
- **Success**: `{ statusCode: 200, body: JSON.stringify({ payload: decryptedData }) }`
- **Error**: `{ statusCode: 400/401/500, body: JSON.stringify({ error: message }) }`

**Status**: ACTIVE  
**Priority**: P0

## REQ-006: Key Management
The function must:
- Read the private RSA key from environment or file path
- Load the key only once at initialization
- Cache the key for subsequent invocations
- Handle key rotation scenarios

**Status**: ACTIVE  
**Priority**: P1

## REQ-007: Unit Test Coverage
The function must have unit tests covering:
- Happy path: Valid JWE token decryption
- Error case: Malformed JWE token
- Error case: Tampered/invalid token
- Error case: Wrong key used for decryption
- Error case: Missing/invalid RSA key

**Status**: ACTIVE  
**Priority**: P0

## REQ-008: Logging
The function must:
- Log successful decryption with token prefix (first 50 chars)
- Log errors with full stack trace
- Not log sensitive information (private keys, decrypted payloads with PII)
- Log token validation attempts

**Status**: ACTIVE  
**Priority**: P1

## REQ-009: Payload Validation
The function must:
- Validate that decrypted data is valid JSON
- Return appropriate error if payload is corrupted
- Handle non-JSON payloads gracefully

**Status**: ACTIVE  
**Priority**: P1
