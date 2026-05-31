# 🎨 Guía Visual de la UI Interactiva

## Pantalla Principal

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                    🔐 JWE Lambda Functions                           ║
║        Encriptación y Desencriptación de Payloads JSON               ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────┐    ┌──────────────────────────────┐
│ 🔒 ENCRIPTACIÓN              │    │ 🔓 DESENCRIPTACIÓN           │
├──────────────────────────────┤    ├──────────────────────────────┤
│                              │    │                              │
│ ℹ️  Ingresa un objeto JSON   │    │ ℹ️  Ingresa un token JWE    │
│    que será encriptado      │    │    para desencriptar        │
│                              │    │                              │
│ Payload JSON:                │    │ Token JWE:                   │
│ ┌──────────────────────────┐ │    │ ┌──────────────────────────┐ │
│ │ {                        │ │    │ │ eyJhbGciOiJSU0EtT0FFU... │ │
│ │   "mensaje": "Test",     │ │    │ │ .CiIsImVuYyI6IkEyNTZDQ... │ │
│ │   "id": 1                │ │    │ │ .IkEyNTZDQkMtSFM1MTIifQ... │ │
│ │ }                        │ │    │ │                          │ │
│ └──────────────────────────┘ │    │ └──────────────────────────┘ │
│                              │    │                              │
│ [🔐 Encriptar] [Limpiar]    │    │ [🔓 Desencriptar] [Limpiar] │
│                              │    │                              │
│ ✅ Encriptación Exitosa     │    │ ✅ Desencriptación Exitosa  │
│                              │    │                              │
│ Token JWE (Encriptado):      │    │ Payload Desencriptado:       │
│ ┌──────────────────────────┐ │    │ ┌──────────────────────────┐ │
│ │ eyJhbGciOiJSU0EtT0FFUCIsI... │ │ │ {                        │ │
│ │ [📋 Copiar Token]       │ │    │ │   "mensaje": "Test",    │ │
│ │                          │ │    │ │   "id": 1               │ │
│ │ ⬆️ Se copia automáticamente│ │    │ │ }                        │ │
│ │    al panel derecho      │ │    │ │ [📋 Copiar Payload]    │ │
│ └──────────────────────────┘ │    │ └──────────────────────────┘ │
│                              │    │                              │
│ Información de Encriptación: │    │ Información de Desencriptación:
│ • Key Encryption: RSA-OAEP   │    │ • Firma HMAC: ✅ Válida     │
│ • Content: AES-256-CBC-HS512 │    │ • Token sin Tampering: ✅   │
│ • Timestamp: 2024-01-15...   │    │ • Timestamp: 2024-01-15...  │
│ • Tamaño: 412 caracteres     │    │ • Tamaño: 45 caracteres     │
└──────────────────────────────┘    └──────────────────────────────┘
```

## Elementos Interactivos

### 1. Input de Payload (Panel Izquierdo)
```
Payload JSON:
┌─────────────────────────────────────┐
│ {                                   │ ← Área de texto editable
│   "mensaje": "¡Hola Lambda!",       │
│   "usuario": "developer",           │
│   "timestamp": "2024-01-15T10:30:00Z"
│ }                                   │
└─────────────────────────────────────┘

• Valida JSON automáticamente
• Muestra errores si JSON es inválido
• Pre-cargado con ejemplo al abrir
```

### 2. Botones de Acción

#### Panel de Encriptación
```
[🔐 Encriptar]  [Limpiar]

🔐 Encriptar:
  • Encripta el payload con RSA-OAEP + AES-256-CBC-HS512
  • Genera un token JWE en formato Compact
  • Auto-copia el token al panel derecho
  • Muestra información de la encriptación

Limpiar:
  • Limpia todos los campos
  • Reinicia los indicadores de estado
```

#### Panel de Desencriptación
```
[🔓 Desencriptar]  [Limpiar]

🔓 Desencriptar:
  • Desencripta el token JWE
  • Verifica la firma HMAC
  • Detecta tampering
  • Muestra el payload original

Limpiar:
  • Limpia todos los campos
  • Reinicia los indicadores de estado
```

### 3. Indicadores de Estado

#### Procesando
```
⏳ Procesando...
(con animación pulsante)
```

#### Éxito
```
✅ Encriptación Exitosa
```

#### Error
```
❌ Error: JSON inválido
```

### 4. Cajas de Salida

```
Información:
┌─────────────────────────────────────┐
│ ✅ Encriptación Exitosa             │
│                                     │
│ Algoritmo de Encriptación:          │
│ • Key Encryption: RSA-OAEP          │
│ • Content Encryption: AES-256-CBC-H │
│   S512                              │
│                                     │
│ Timestamp:                          │
│ 2024-01-15T10:30:00Z                │
│                                     │
│ Tamaño del Token:                   │
│ 412 caracteres                      │
└─────────────────────────────────────┘
```

## Colores y Tema

### Gradiente Principal
```
┌──────────────────────────┐
│ 🔐 JWE Lambda Functions  │  ← Gradiente: Morado → Púrpura
│        (Encabezado)      │     #667eea → #764ba2
└──────────────────────────┘
```

### Botones
- **Encriptar**: Gradiente Morado (#667eea → #764ba2)
- **Desencriptar**: Gradiente Rosa (#f093fb → #f5576c)
- **Limpiar**: Naranja (#ff9800)
- **Copiar**: Verde (#4CAF50)

### Estados
- **Éxito**: Verde claro (#d4edda)
- **Error**: Rojo claro (#f8d7da)
- **Información**: Azul claro (#e3f2fd)
- **Cargando**: Gris (#e2e3e5)

## Flujo de Interacción Completo

### Escenario 1: Encriptar un Payload

```
1. Usuario escribe JSON en el panel izquierdo
   
2. Usuario hace clic en "🔐 Encriptar"
   
   [Estado: ⏳ Procesando...]
   
3. El servidor encripta el payload
   
   [Estado: ✅ Encriptación Exitosa]
   
4. El token JWE aparece en la caja de salida
   
5. El token se auto-copia al panel derecho
   
6. Información detallada se muestra
   (Algoritmos, timestamp, tamaño)
```

### Escenario 2: Desencriptar un Token

```
1. Usuario tiene un token JWE en el panel derecho
   (copiado automáticamente del panel izquierdo)
   
2. Usuario hace clic en "🔓 Desencriptar"
   
   [Estado: ⏳ Procesando...]
   
3. El servidor desencripta el token
   
   [Estado: ✅ Desencriptación Exitosa]
   
4. El payload original aparece en la caja de salida
   
5. Información de integridad se muestra
   • Firma HMAC: ✅ Válida
   • Token sin Tampering: ✅
   • Timestamp
   • Tamaño del payload
```

### Escenario 3: Ciclo Completo

```
JSON Original
    ↓
[Panel Izquierdo: Escribir JSON]
    ↓
[Botón: Encriptar]
    ↓
Token JWE generado
    ↓
[Auto-copia a Panel Derecho]
    ↓
[Botón: Desencriptar]
    ↓
JSON Original recuperado
    ↓
[Verificación: ✅ Idéntico]
```

## Características Avanzadas

### Auto-relleno del Token
```
Cuando encriptas en el panel izquierdo:
1. El token se genera
2. Se copia automáticamente al panel derecho
3. El usuario puede desencriptar inmediatamente
4. Sin necesidad de copiar manualmente
```

### Validación de JSON
```
Si ingresas JSON inválido:

{
  "nombre": "Test",  ← Falta una coma
  "id": 1
}

Verás un indicador:
⚠️ JSON inválido

Correcto:
{
  "nombre": "Test",  ← Coma agregada
  "id": 1
}
```

### Copiar con Un Click
```
Cualquier salida se puede copiar:

[📋 Copiar Token]  o  [📋 Copiar Payload]

Feedback visual:
┌──────────────────────────────┐
│ ✅ ¡Copiado al portapapeles!│ ← Aparece en la esquina
└──────────────────────────────┘
```

## Responsividad

### Desktop (>768px)
```
┌─────────────────────────────────────────────┐
│  [Panel Encriptación]  [Panel Desencriptación]
│  50%                    50%
└─────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────┐
│  [Panel Encriptación]    │
│  100%                    │
└──────────────────────────┘
┌──────────────────────────┐
│  [Panel Desencriptación] │
│  100%                    │
└──────────────────────────┘
```

## Mensajes de Error Comunes

### 1. JSON Inválido
```
⚠️ El payload no es JSON válido

Solución: Verifica que el JSON esté bien formado
(comillas, llaves, comas)
```

### 2. Error de Conexión
```
⚠️ Error de conexión: Failed to fetch

Solución: Asegúrate de que node server.js está corriendo
```

### 3. Token Tampered
```
⚠️ Error: Token is tampered

Solución: Usa un token válido generado por el encryptor
```

### 4. No Hay Contenido
```
⚠️ No hay contenido para copiar

Solución: Primero encripta o desencripta algo
```

## Atajos de Teclado (Futuro)

```
[En desarrollo para versión 2.0]

Ctrl+Enter: Encriptar
Ctrl+Shift+Enter: Desencriptar
Ctrl+L: Limpiar todo
Ctrl+C: Copiar salida enfocada
```

---

**¡Disfruta de la interfaz interactiva!** 🚀
