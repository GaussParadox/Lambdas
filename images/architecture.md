# 🏗️ Arquitectura del Proyecto

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWE Lambda Functions                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Interfaz Web (UI)                       │  │
│  │                   (index.html)                           │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐   │  │
│  │  │ Panel Encriptación  │  │ Panel Desencriptación   │   │  │
│  │  │                     │  │                          │   │  │
│  │  │ • Input JSON        │  │ • Input JWE             │   │  │
│  │  │ • Botón Encryptar   │  │ • Botón Desencryptar    │   │  │
│  │  │ • Output JWE Token  │  │ • Output Payload JSON   │   │  │
│  │  │ • Info Seguridad    │  │ • Info Integridad       │   │  │
│  │  └─────────────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↕️                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express Backend (server.js)                │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ POST /api/encrypt  │  POST /api/decrypt             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↕️                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Lambda Functions (Node.js 20)                │  │
│  │  ┌──────────────────┐      ┌──────────────────────┐   │  │
│  │  │ jose-encryptor   │      │ jose-decryptor       │   │  │
│  │  │                  │      │                      │   │  │
│  │  │ • Validación     │      │ • Validación JWE     │   │  │
│  │  │ • RSA-OAEP       │      │ • Desencriptación    │   │  │
│  │  │ • AES-256-CBC    │      │ • Verificación HMAC  │   │  │
│  │  │ • HMAC-SHA512    │      │ • Detección tampering│   │  │
│  │  │ • JWE Output     │      │ • Payload Output     │   │  │
│  │  └──────────────────┘      └──────────────────────┘   │  │
│  │           ↓ / ↑                    ↓ / ↑              │  │
│  │       ┌──────────────────────────────────┐            │  │
│  │       │  RSA-2048 Key Pair (keys/)       │            │  │
│  │       │  • public.pem (repositorio)      │            │  │
│  │       │  • private.pem (.gitignore)      │            │  │
│  │       └──────────────────────────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Encriptación

```
┌───────────────┐
│  JSON Input   │
│ (User data)   │
└───────┬───────┘
        │
        ▼
┌──────────────────┐
│   Validación     │
│ • Is valid JSON? │
│ • Size < 1MB?    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Encriptación RSA-OAEP              │
│   (Encriptar clave de sesión)        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Encriptación AES-256-CBC           │
│   (Encriptar contenido)              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Generación HMAC-SHA512             │
│   (Autenticación e integridad)       │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│   JWE Token                │
│ (5 partes, formato compacto)│
│ Header.Key.IV.Ciphertext   │
│ .AuthenticationTag          │
└────────────────────────────┘
```

## Flujo de Desencriptación

```
┌─────────────────┐
│   JWE Token     │
│  (5 partes)     │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│   Validación     │
│ • 5 partes?      │
│ • Base64url OK?  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│   Verificación HMAC      │
│   (Detectar tampering)   │
│   ✅ o ❌ Token válido    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Desencriptación RSA-OAEP       │
│   (Desencriptar clave sesión)    │
└────────┬───────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Desencriptación AES-256-CBC    │
│   (Desencriptar contenido)       │
└────────┬───────────────────────────┘
         │
         ▼
┌──────────────────┐
│  JSON Original   │
│  (Recuperado)    │
└──────────────────┘
```

## Especificaciones de Seguridad

| Aspecto | Especificación |
|---------|----------------|
| **Key Encryption Algorithm** | RSA-OAEP (2048-bit) |
| **Content Encryption Algorithm** | AES-256-CBC |
| **Authentication** | HMAC-SHA512 |
| **Key Derivation** | Direct (no KDF) |
| **Compression** | No |
| **JWE Format** | Compact Serialization |
| **Supported Payloads** | JSON objects (no arrays, strings, null) |
| **Max Payload Size** | 1 MB |
| **Key Format** | PEM (PKCS#8 for private, SPKI for public) |

## Stack Tecnológico

```
Frontend Layer:
├── HTML5
├── CSS3 (gradientes, animaciones)
├── JavaScript (vanilla, sin frameworks)
└── Fetch API + Clipboard API

Application Layer:
├── Express.js (servidor HTTP)
├── Node.js v20 (runtime)
└── JOSE (RFC 7516 implementation)

Cryptography Layer:
├── crypto (Node.js native)
├── RSA-OAEP (key encryption)
├── AES-256-CBC (content encryption)
└── HMAC-SHA512 (authentication)

Testing Layer:
├── Jest (test runner)
├── Unit tests (54 tests)
└── 100% pass rate

Deployment Layer:
├── AWS Lambda (runtime)
├── AWS Secrets Manager (key storage)
├── AWS IAM (permissions)
└── AWS CloudWatch (logs)
```

## Estructura de Carpetas

```
lamda/
├── 📁 keys/
│   ├── public.pem (en repo)
│   ├── private.pem (.gitignore)
│   └── .gitignore
├── 📁 jose-encryptor/
│   ├── 📁 src/
│   │   └── index.js
│   ├── 📁 __tests__/
│   │   └── index.test.js
│   ├── 📁 .kiro/specs/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── package.json
│   ├── jest.config.js
│   ├── README.md
│   └── .gitignore
├── 📁 jose-decryptor/
│   ├── 📁 src/
│   │   └── index.js
│   ├── 📁 __tests__/
│   │   └── index.test.js
│   ├── 📁 .kiro/specs/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── package.json
│   ├── jest.config.js
│   ├── README.md
│   └── .gitignore
├── 📁 images/
│   ├── architecture.md (este archivo)
│   ├── ui-interface.md
│   └── test-results.md
├── 📄 README.md
├── 📄 QUICK_START.md
├── 📄 UI_README.md
├── 📄 UI_VISUAL_GUIDE.md
├── 📄 DEPLOYMENT.md
├── 📄 COMPLETION_SUMMARY.md
├── 🖥️  server.js
├── 🌐 index.html
├── 🔑 generate-keys.js
├── 🧪 test-crypto.js
├── 📦 deploy.ps1
├── 📦 deploy.sh
├── .git/
└── .gitignore
```

---

**Diagrama creado:** ✅ Arquitectura del proyecto completa
