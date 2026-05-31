# 🎨 Interfaz Web - Mockup Visual

## Vista Principal - Desktop

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                         🔐 JWE Lambda Functions                           ║
║              Encriptación y Desencriptación de Payloads JSON              ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────┬──────────────────────────────────────┐
│ 🔒 ENCRIPTACIÓN                       │ 🔓 DESENCRIPTACIÓN                   │
├───────────────────────────────────────┼──────────────────────────────────────┤
│                                       │                                      │
│ ℹ️ Ingresa un objeto JSON que será   │ ℹ️ Ingresa un token JWE para        │
│    encriptado con RSA-OAEP +         │    desencriptar y recuperar el       │
│    AES-256-CBC-HS512                 │    payload original                  │
│                                       │                                      │
│ Payload JSON:                        │ Token JWE:                           │
│ ┌─────────────────────────────────┐  │ ┌──────────────────────────────────┐ │
│ │ {                               │  │ │ eyJhbGciOiJSU0EtT0FFUCIsImVuYyI │ │
│ │   "mensaje": "¡Hola Lambda!",   │  │ │ 6IkEyNTZDQkMtSFM1MTIifQ.GvJKY3 │ │
│ │   "usuario": "developer",       │  │ │ rS8qc2B5Z1jY2lKc9xX3r3w5v6y7z  │ │
│ │   "timestamp": "2024-01-15..."  │  │ │ 8a9b0c1d2e3f4g5h6i7j8k9l0m1n  │ │
│ │ }                               │  │ │ 2o3p4q5r6s7t8u9v0w1x2y3z4a5b │ │
│ └─────────────────────────────────┘  │ └──────────────────────────────────┘ │
│                                       │                                      │
│ [🔐 Encriptar]  [Limpiar]           │ [🔓 Desencryptar]  [Limpiar]        │
│                                       │                                      │
│ ✅ Encriptación Exitosa              │ ✅ Desencriptación Exitosa          │
│                                       │                                      │
│ Token JWE (Encriptado):              │ Payload Desencriptado:              │
│ ┌─────────────────────────────────┐  │ ┌──────────────────────────────────┐ │
│ │ eyJhbGciOiJSU0EtT0FFUCIsImVuYyI │  │ │ {                              │ │
│ │ 6IkEyNTZDQkMtSFM1MTIifQ.GvJKY3r │  │ │   "mensaje": "¡Hola Lambda!", │ │
│ │ S8qc2B5Z1jY2lKc9xX3r3w5v6y7z8a │  │ │   "usuario": "developer",    │ │
│ │ 9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p │  │ │   "timestamp": "2024-01-15"  │ │
│ │                                  │  │ │ }                              │ │
│ │ [📋 Copiar Token]              │  │ │ [📋 Copiar Payload]           │ │
│ │                                  │  │ │                              │ │
│ │ ⬆️ Se copia automáticamente al  │  │ │ ✅ Recuperado correctamente  │ │
│ │    panel derecho                 │  │ │                              │ │
│ └─────────────────────────────────┘  │ └──────────────────────────────────┘ │
│                                       │                                      │
│ Información de Encriptación:         │ Información de Desencriptación:      │
│ ┌─────────────────────────────────┐  │ ┌──────────────────────────────────┐ │
│ │ Algoritmo de Encriptación:      │  │ │ Verificación de Integridad:     │ │
│ │ • Key Encryption: RSA-OAEP      │  │ │ • Firma HMAC: ✅ Válida         │ │
│ │ • Content: AES-256-CBC-HS512    │  │ │ • Token sin Tampering: ✅      │ │
│ │                                  │  │ │                                │ │
│ │ Timestamp:                      │  │ │ Timestamp:                     │ │
│ │ 2024-01-15T10:30:00.123Z       │  │ │ 2024-01-15T10:30:00.456Z      │ │
│ │                                  │  │ │                                │ │
│ │ Tamaño del Token:               │  │ │ Tamaño del Payload:            │ │
│ │ 412 caracteres                  │  │ │ 85 caracteres                  │ │
│ └─────────────────────────────────┘  │ └──────────────────────────────────┘ │
│                                       │                                      │
└───────────────────────────────────────┴──────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ ✅ ¡Copiado al portapapeles!     (notificación en esquina inferior derecha) │
└────────────────────────────────────────────────────────────────────────────┘
```

## Estados de la Interfaz

### Estado: Cargando
```
┌─────────────────────┐
│ ⏳ Procesando...    │
│ (animación pulsante)│
└─────────────────────┘
```

### Estado: Éxito
```
┌─────────────────────────────────┐
│ ✅ Encriptación Exitosa        │
│                                 │
│ Información detallada de la    │
│ operación mostrada             │
└─────────────────────────────────┘
```

### Estado: Error
```
┌─────────────────────────────────┐
│ ❌ Error: JSON inválido        │
│                                 │
│ Mensaje de error descriptivo   │
└─────────────────────────────────┘
```

## Esquema de Colores

```
Encabezado (Gradiente):
┌──────────────────────────────┐
│  #667eea → #764ba2          │  Morado a Púrpura
│  (Encabezado principal)      │
└──────────────────────────────┘

Botones Principales:
┌──────────────────────────────┐
│ 🔐 Encryptar                 │  Gradiente: #667eea → #764ba2 (Morado)
├──────────────────────────────┤
│ 🔓 Desencryptar              │  Gradiente: #f093fb → #f5576c (Rosa)
├──────────────────────────────┤
│ Limpiar                      │  #ff9800 (Naranja)
├──────────────────────────────┤
│ 📋 Copiar                    │  #4CAF50 (Verde)
└──────────────────────────────┘

Estados de Éxito/Error:
✅ Verde:   #d4edda (fondo) + #155724 (texto)
❌ Rojo:    #f8d7da (fondo) + #721c24 (texto)
⏳ Gris:    #e2e3e5 (fondo) + #383d41 (texto)

Fondos:
Input:          #ffffff (blanco)
Output:         #f5f5f5 (gris claro)
Página:         Blanco con sombra
```

## Componentes Interactivos

### Input de Payload
```
┌─────────────────────────────────────┐
│ Payload JSON:                       │
├─────────────────────────────────────┤
│ {                                   │
│   "mensaje": "Ejemplo",             │  ← Editable
│   "valor": 123                      │
│ }                                   │
│                                     │
│ Validación en tiempo real:          │
│ ✅ JSON válido                      │
│ ✅ Tamaño: 45 bytes (< 1MB)        │
│ ✅ Listo para encriptar             │
└─────────────────────────────────────┘
```

### Output de Token/Payload
```
┌─────────────────────────────────────────────────┐
│ Token JWE (Encriptado):                         │
├─────────────────────────────────────────────────┤
│ eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMt │
│ S1M1MTIifQ.GvJKY3rS8qc2B5Z1jY2lKc9xX3r3w5v6 │
│ y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7 │
│ t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8 │
│ o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9 │
│                                                 │
│ [📋 Copiar]  [✅ Copiado recientemente]       │
└─────────────────────────────────────────────────┘
```

## Flujo de Interacción

```
Usuario abre la página
        ↓
    Pre-cargada con ejemplo JSON
        ↓
Usuario modifica JSON (si quiere)
        ↓
Usuario hace clic en [🔐 Encryptar]
        ↓
[⏳ Procesando...]
        ↓
Servidor encripta
        ↓
[✅ Encriptación Exitosa]
        ↓
Token JWE aparece en output
        ↓
Token se auto-copia al panel derecho
        ↓
Usuario hace clic en [🔓 Desencryptar]
        ↓
[⏳ Procesando...]
        ↓
Servidor desencripta
        ↓
[✅ Desencriptación Exitosa]
        ↓
Payload original aparece en output
        ↓
✅ Verifica que coincida con original
```

## Responsividad

### Desktop (>768px)
```
┌─────────────────────────────────────────────────────┐
│ [Panel 50%]              [Panel 50%]               │
└─────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│ [Panel 100%]         │
├──────────────────────┤
│ [Panel 100%]         │
└──────────────────────┘
```

---

**Interfaz creada:** ✅ UI moderna, responsiva y profesional
