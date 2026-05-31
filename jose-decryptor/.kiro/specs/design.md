# JOSE Decryptor - Design Document

## Architecture

```
┌─────────────────────────────────────────┐
│   AWS Lambda: JOSE Decryptor            │
├─────────────────────────────────────────┤
│                                         │
│  Event (JWE Token)                      │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ JWE Format Validation│               │
│  │ - Check format       │               │
│  │ - Verify structure   │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ JWE Decryption       │               │
│  │ - Load Private Key   │               │
│  │ - Decrypt token      │               │
│  │ - Verify signature   │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ Payload Validation   │               │
│  │ - Parse JSON         │               │
│  │ - Validate structure │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│  ┌──────────────────────┐               │
│  │ Response Formatting  │               │
│  │ - Return payload     │               │
│  │ - Include metadata   │               │
│  └──────────────────────┘               │
│         │                               │
│         ▼                               │
│   Decrypted Payload + Metadata          │
│                                         │
└─────────────────────────────────────────┘
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| jose    | ^5.2.0  | JWE encryption/decryption library |
| jest    | ^29.7.0 | Unit testing framework |
| aws-sdk | -       | AWS Lambda runtime (pre-installed) |

## Decryption Specifications

| Parameter | Value | Reason |
|-----------|-------|--------|
| Key Decryption Algorithm | RSA-OAEP | Matches encryptor |
| Content Encryption Algorithm | A256CBC-HS512 | Matches encryptor |
| Key Format | RSA 2048-bit PEM | Industry standard |
| Signature Verification | Automatic (JOSE) | Integrity check |

## Data Flow

1. **Input**: `{ jwe: "eyJ..." }` (JWE token string)
2. **Processing**: JWE decryption using private key
3. **Output**: `{ statusCode: 200, body: { payload: { ... } } }`

## Error Handling Strategy

- **Validation Errors** (400): Format validation, structure checks
- **Authentication Errors** (401): Invalid/tampered tokens, wrong key
- **Runtime Errors** (500): Key loading, decryption failures

## Security Considerations

1. **Key Management**: 
   - Private key stored securely (NOT in repo, use AWS Secrets Manager in production)
   - Loaded from environment/file on cold start
   - Key access restricted

2. **Decryption Security**:
   - Automatic signature verification via JOSE
   - Tamper detection via HMAC
   - Decryption failures return 500 (no information leakage)

3. **Logging**:
   - No sensitive data in logs
   - Token prefix logged for tracking
   - Decrypted payloads NOT logged to prevent PII leakage

## Testing Strategy

- **Unit Tests**: Isolated decryption function tests
- **Cross-Lambda Tests**: Encryptor output → Decryptor input
- **Error Path Tests**: All error scenarios
- **Tamper Tests**: Modified tokens should fail
- **Key Mismatch Tests**: Wrong key should fail
