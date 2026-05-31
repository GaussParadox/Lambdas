# JOSE Encryptor - Design Document

## Architecture

```
┌─────────────────────────────────────────┐
│   AWS Lambda: JOSE Encryptor            │
├─────────────────────────────────────────┤
│                                         │
│  Event (JSON Payload)                   │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ Input Validation     │               │
│  │ - Parse JSON         │               │
│  │ - Check size         │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ JWE Encryption       │               │
│  │ - Load Public Key    │               │
│  │ - Encrypt payload    │               │
│  │ - Generate JWE token │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ Response Formatting  │               │
│  │ - Return JWE token   │               │
│  │ - Include metadata   │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│   JWE Token + Metadata                  │
│                                         │
└─────────────────────────────────────────┘
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| jose    | ^5.2.0  | JWE encryption/decryption library |
| jest    | ^29.7.0 | Unit testing framework |
| aws-sdk | -       | AWS Lambda runtime (pre-installed) |

## Encryption Specifications

| Parameter | Value | Reason |
|-----------|-------|--------|
| Key Encryption Algorithm | RSA-OAEP | Strong asymmetric encryption |
| Content Encryption Algorithm | A256CBC-HS512 | AES-256 with HMAC |
| Key Format | RSA 2048-bit PEM | Industry standard |

## Data Flow

1. **Input**: `{ payload: { ... } }` (JSON object)
2. **Processing**: JWE encryption using public key
3. **Output**: `{ statusCode: 200, body: { jwe: "..." } }`

## Error Handling Strategy

- **Validation Errors** (400): Input validation failures
- **Runtime Errors** (500): Key loading, encryption failures
- **System Errors** (500): Unexpected errors

## Security Considerations

1. **Key Management**: 
   - Public key only (safe to share)
   - Loaded from environment/file on cold start
   - No key caching across invocations recommended in production

2. **Payload Encryption**:
   - End-to-end encryption using RSA-OAEP
   - Content encrypted with AES-256
   - Tamper-resistant (HMAC included)

3. **Logging**:
   - No sensitive data in logs
   - Token prefix logged for tracking (first 50 chars)
   - Full errors logged for debugging

## Testing Strategy

- **Unit Tests**: Isolated function testing
- **Integration Tests**: With actual RSA keys
- **Error Path Tests**: All error scenarios covered
