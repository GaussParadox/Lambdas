# 🔄 Flujo de Datos y Ejemplos

## Flujo Completo: De JSON a JWE y Viceversa

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ENCRIPTACIÓN                         │
└──────────────────────────────────────────────────────────────────┘

PASO 1: INPUT (Usuario ingresa JSON)
┌────────────────────────────────────────────────────────────────┐
│ {                                                              │
│   "usuario": {                                                 │
│     "id": 12345,                                               │
│     "nombre": "Juan Pérez",                                    │
│     "email": "juan@example.com"                                │
│   },                                                           │
│   "acción": "login",                                           │
│   "timestamp": "2024-01-15T10:30:00Z",                         │
│   "datos_sensibles": "secreto_confidencial"                   │
│ }                                                              │
│                                                                │
│ Tamaño: 156 bytes ✅                                           │
│ Validez JSON: ✅                                               │
│ Tipo: object ✅                                                │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 2: SERIALIZACIÓN
┌────────────────────────────────────────────────────────────────┐
│ JSON → Buffer UTF-8                                            │
│                                                                │
│ Contenido binario:                                             │
│ 7B 22 75 73 75 61 72 69 6F 22 3A 7B 22 69 64 22 3A 31 32 33 │
│ 34 35 2C 22 6E 6F 6D 62 72 65 22 3A 22 4A 75 61 6E 20 50 65 │
│ ...                                                            │
│                                                                │
│ Tamaño: 156 bytes                                              │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 3: GENERACIÓN DE CLAVES Y IV
┌────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐           │
│ │ Clave de Sesión (AES-256):                      │           │
│ │ 32 bytes random = 256 bits ✅                   │           │
│ │ ac 23 f7 19 45 e2 d8 92 56 41 73 c9 8f 6e 02  │           │
│ │ b1 4d 72 89 c3 1a 47 66 98 45 73 bb e7 2f c4  │           │
│ └─────────────────────────────────────────────────┘           │
│                                                                │
│ ┌─────────────────────────────────────────────────┐           │
│ │ IV (Initialization Vector):                     │           │
│ │ 16 bytes random = 128 bits ✅                   │           │
│ │ 34 e1 72 c9 56 8b 92 f1 c7 83 9a 45 67 e2 b3  │           │
│ │ 8f                                               │           │
│ └─────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 4: ENCRIPTACIÓN CON RSA-OAEP (Clave de Sesión)
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Input: Clave de Sesión (32 bytes)           │              │
│ │ Algoritmo: RSA-OAEP (2048-bit key)          │              │
│ │ Padding: OAEP con SHA1                       │              │
│ │ Clave Pública: public.pem                    │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Output: Encrypted Key (256 bytes)                            │
│ ┌──────────────────────────────────────────────┐              │
│ │ a7 3b 9e 22 c1 5f 84 7d b2 41 6e 93 12 c5  │              │
│ │ 8f 17 49 6b e3 7a 92 c4 51 68 b9 e2 f1 d3  │              │
│ │ ... (total 256 bytes)                        │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ✅ Clave de sesión ahora protegida por RSA                   │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 5: ENCRIPTACIÓN CON AES-256-CBC (Contenido)
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Input: Contenido JSON (156 bytes)           │              │
│ │ Algoritmo: AES-256-CBC                      │              │
│ │ Clave: Clave de Sesión (32 bytes)           │              │
│ │ IV: 16 bytes (del paso 3)                    │              │
│ │ Padding: PKCS#7                              │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Output: Ciphertext (160 bytes - incluye padding)             │
│ ┌──────────────────────────────────────────────┐              │
│ │ 2f 8a 1b 3c 7d 91 e5 42 b9 c4 63 17 8e f2  │              │
│ │ 5a 6b 73 9c 48 e1 d6 4a 92 b3 27 65 f8 4e  │              │
│ │ ... (total 160 bytes)                        │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ✅ Contenido JSON ahora encriptado                           │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 6: GENERACIÓN HMAC-SHA512 (Autenticación)
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Entrada para HMAC:                          │              │
│ │ • Header (Base64URL)                         │              │
│ │ • Encrypted Key (256 bytes)                 │              │
│ │ • IV (16 bytes)                              │              │
│ │ • Ciphertext (160 bytes)                    │              │
│ │                                               │              │
│ │ Algoritmo: HMAC-SHA512                       │              │
│ │ Clave secreta: Derivada de sesión           │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Output: Authentication Tag (64 bytes)                         │
│ ┌──────────────────────────────────────────────┐              │
│ │ f3 2e 9a 1b 7c 4e 21 8d 95 6a 43 c8 17 e5  │              │
│ │ 9f 2b 3a 8c 51 d7 44 e9 62 b1 35 a6 78 9d  │              │
│ │ ... (total 64 bytes)                         │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ✅ Integridad protegida contra tampering                     │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 7: CODIFICACIÓN BASE64URL Y FORMATO COMPACTO
┌────────────────────────────────────────────────────────────────┐
│ Estructura JWE Compacto:                                       │
│                                                                │
│ [HEADER].[ENCRYPTED_KEY].[IV].[CIPHERTEXT].[AUTH_TAG]        │
│                                                                │
│ 1. HEADER (Base64URL):                                        │
│    eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ  │
│                                                                │
│ 2. ENCRYPTED_KEY (Base64URL):                                │
│    a7s3b9e22c15f847db2416e9312c58f174969kbe37a92c4516...   │
│                                                                │
│ 3. IV (Base64URL):                                            │
│    NOFyyVaLkslz1yNLpUXrAw                                     │
│                                                                │
│ 4. CIPHERTEXT (Base64URL):                                   │
│    L4obPH2R5UKbjETzF47yWqtzjBhLHdRKkrMnZfiE7iRxZ5VN2T2j... │
│                                                                │
│ 5. AUTH_TAG (Base64URL):                                      │
│    8y6aG3xOIY2VakPIHvnfKwMFjxXH3FO...                        │
│                                                                │
│ TOKEN FINAL (419 caracteres):                                │
│ eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.   │
│ a7s3b9e22c15f847db2416e9312c58f174969kbe37a92c45168...     │
│ NOFyyVaLkslz1yNLpUXrAw.L4obPH2R5UKbjETzF47yWqtzjBhLH...   │
│ 8y6aG3xOIY2VakPIHvnfKwMFjxXH3FO...                           │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

✅ TOKEN JWE GENERADO Y LISTO PARA TRANSMISIÓN
```

---

## Flujo Completo: De JWE a JSON

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DESENCRIPTACIÓN                      │
└──────────────────────────────────────────────────────────────────┘

PASO 1: INPUT (Token JWE)
┌────────────────────────────────────────────────────────────────┐
│ eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.   │
│ a7s3b9e22c15f847db2416e9312c58f174969kbe37a92c4516.       │
│ NOFyyVaLkslz1yNLpUXrAw.L4obPH2R5UKbjETzF47yWqtzjBh.       │
│ 8y6aG3xOIY2VakPIHvnfKwMFjxXH3FO...                         │
│                                                                │
│ Formato: ✅ 5 partes separadas por puntos                    │
│ Tamaño: 419 caracteres                                        │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 2: PARSEO Y DECODIFICACIÓN
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ 1. Header (Decodificado de Base64URL):      │              │
│ │    {                                          │              │
│ │      "alg": "RSA-OAEP",                       │              │
│ │      "enc": "A256CBC-HS512"                   │              │
│ │    }                                          │              │
│ │    ✅ Algoritmos reconocidos                 │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ┌──────────────────────────────────────────────┐              │
│ │ 2. Encrypted Key (Decodificado):             │              │
│ │    a7 3b 9e 22 c1 5f 84 7d b2 41 6e 93 12 c5 8f 17... │   │
│ │    Tamaño: 256 bytes                          │              │
│ │    ✅ Válido para RSA-2048                    │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ┌──────────────────────────────────────────────┐              │
│ │ 3. IV (Decodificado):                        │              │
│ │    34 e1 72 c9 56 8b 92 f1 c7 83 9a 45 67 e2 b3 8f      │   │
│ │    Tamaño: 16 bytes                          │              │
│ │    ✅ Válido para AES-256-CBC                │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ┌──────────────────────────────────────────────┐              │
│ │ 4. Ciphertext (Decodificado):               │              │
│ │    2f 8a 1b 3c 7d 91 e5 42 b9 c4 63 17 8e f2 5a 6b 73... │   │
│ │    Tamaño: 160 bytes                         │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ┌──────────────────────────────────────────────┐              │
│ │ 5. Authentication Tag (Decodificado):       │              │
│ │    f3 2e 9a 1b 7c 4e 21 8d 95 6a 43 c8 17 e5 9f 2b 3a... │   │
│ │    Tamaño: 64 bytes                          │              │
│ └──────────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 3: VERIFICACIÓN DE INTEGRIDAD (HMAC-SHA512)
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Datos para verificar:                        │              │
│ │ • Header (original)                          │              │
│ │ • Encrypted Key (original)                  │              │
│ │ • IV (original)                              │              │
│ │ • Ciphertext (original)                     │              │
│ │                                               │              │
│ │ Recalcular HMAC-SHA512 con clave secreta   │              │
│ │ Comparar con Authentication Tag recibido   │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Resultado:                                                    │
│ ┌──────────────────────────────────────────────┐              │
│ │ ✅ HMAC Válido - Token no ha sido tampered   │              │
│ │ Integridad: ✅ Garantizada                   │              │
│ └──────────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 4: DESENCRIPTACIÓN DE CLAVE CON RSA-OAEP
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Input: Encrypted Key (256 bytes)            │              │
│ │ Algoritmo: RSA-OAEP Desencriptación         │              │
│ │ Clave Privada: private.pem                  │              │
│ │ Tamaño esperado de output: 32 bytes         │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Output: Clave de Sesión Desencriptada                        │
│ ┌──────────────────────────────────────────────┐              │
│ │ ac 23 f7 19 45 e2 d8 92 56 41 73 c9 8f 6e  │              │
│ │ 02 b1 4d 72 89 c3 1a 47 66 98 45 73 bb e7  │              │
│ │ 2f c4                                         │              │
│ │ Tamaño: 32 bytes ✅                          │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ✅ Clave de sesión recuperada                                │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 5: DESENCRIPTACIÓN CON AES-256-CBC
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐              │
│ │ Input: Ciphertext (160 bytes)               │              │
│ │ Algoritmo: AES-256-CBC Desencriptación     │              │
│ │ Clave: Clave de Sesión (32 bytes)          │              │
│ │ IV: 16 bytes                                 │              │
│ │ Padding: Remover PKCS#7                     │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ Output: Contenido Desencriptado (156 bytes)                 │
│ ┌──────────────────────────────────────────────┐              │
│ │ 7B 22 75 73 75 61 72 69 6F 22 3A 7B 22 69   │              │
│ │ 64 22 3A 31 32 33 34 35 2C 22 6E 6F 6D 62  │              │
│ │ ... (156 bytes total)                        │              │
│ └──────────────────────────────────────────────┘              │
│                                                                │
│ ✅ Contenido JSON desencriptado                             │
└────────────────────────────────────────────────────────────────┘

                            ↓↓↓

PASO 6: PARSEO JSON FINAL
┌────────────────────────────────────────────────────────────────┐
│ {                                                              │
│   "usuario": {                                                 │
│     "id": 12345,                                               │
│     "nombre": "Juan Pérez",                                    │
│     "email": "juan@example.com"                                │
│   },                                                           │
│   "acción": "login",                                           │
│   "timestamp": "2024-01-15T10:30:00Z",                         │
│   "datos_sensibles": "secreto_confidencial"                   │
│ }                                                              │
│                                                                │
│ ✅ RECUPERADO EXACTAMENTE IGUAL AL ORIGINAL                   │
│ ✅ Integridad: Verificada                                     │
│ ✅ Sin Tampering: Confirmado                                  │
│ ✅ Confidencialidad: Garantizada                              │
└────────────────────────────────────────────────────────────────┘
```

---

## Ejemplos de Payloads Válidos

```
✅ Ejemplo 1: Objeto simple
{
  "mensaje": "Hola",
  "valor": 42
}

✅ Ejemplo 2: Estructura anidada
{
  "usuario": {
    "id": 123,
    "perfil": {
      "nombre": "Juan",
      "rol": "admin"
    }
  }
}

✅ Ejemplo 3: Con caracteres especiales
{
  "mensaje": "¡Hola! ¿Cómo estás? 😊",
  "símbolos": "@#$%^&*()",
  "unicode": "中文, العربية, Ελληνικά"
}

✅ Ejemplo 4: Con valores nulos
{
  "campo": "valor",
  "nulo": null,
  "booleano": true,
  "número": 3.14159
}

✅ Ejemplo 5: Estructura compleja
{
  "transacción": {
    "id": "TXN-2024-001",
    "monto": 150.50,
    "moneda": "USD",
    "beneficiario": {
      "nombre": "María García",
      "cuenta": "1234567890"
    },
    "estado": "completada",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

**Flujos completados:** ✅ Documentación visual exhaustiva
