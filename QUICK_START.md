# ⚡ Quick Start Guide - UI Interactiva

## 🚀 En 3 Pasos

### Paso 1️⃣: Instalar (Solo Primera Vez)
```bash
npm install express
```

### Paso 2️⃣: Ejecutar
```bash
node server.js
```

Deberías ver:
```
🚀 Servidor JWE Lambda UI corriendo en http://localhost:3000
📂 Abre http://localhost:3000/index.html en tu navegador
```

### Paso 3️⃣: Abrir en Navegador
```
http://localhost:3000/index.html
```

---

## 🎯 Usar la Interfaz

### Encriptar JSON
1. Ingresa JSON en el panel izquierdo
2. Haz clic en **🔐 Encriptar**
3. Obtienes un token JWE (5 partes)
4. El token se copia automáticamente al panel derecho

### Desencriptar Token
1. El token ya está en el panel derecho (auto-cargado)
2. Haz clic en **🔓 Desencryptar**
3. Obtienes el JSON original
4. Verifica que coincida con el original

---

## 📋 Ejemplos

### Ejemplo 1: Objeto Simple
**Input:**
```json
{
  "mensaje": "Hola Mundo",
  "nivel": 5
}
```

**Output después de desencriptar:**
```json
{
  "mensaje": "Hola Mundo",
  "nivel": 5
}
```
✅ **Coinciden perfectamente**

### Ejemplo 2: Datos de Usuario
```json
{
  "id": 1,
  "email": "user@example.com",
  "nombre": "Juan",
  "activo": true
}
```

### Ejemplo 3: Transacción
```json
{
  "transaccion": {
    "id": "TRX-2024-001",
    "monto": 1500.50,
    "moneda": "USD"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔐 Seguridad

| Aspecto | Especificación |
|--------|----------------|
| **Key Encryption** | RSA-OAEP (2048-bit) |
| **Content Encryption** | AES-256-CBC |
| **Authentication** | HMAC-SHA512 |
| **Tampering Detection** | ✅ Verificado |
| **Format** | JWE Compact Serialization |

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "Error de conexión" | Ejecuta `node server.js` en la terminal |
| "JSON inválido" | Verifica sintaxis (comillas, llaves, comas) |
| "No se puede copiar" | Primero encripta o desencripta algo |
| "Token inválido" | Usa el token generado por el encryptor |
| "Puerto en uso" | Espera o cambia PORT en `server.js` |

---

## 📱 Funciona en

✅ Chrome / Chromium  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Opera  
✅ Navegadores Móviles  

---

## 📚 Documentación Completa

- **UI_README.md** - Guía completa
- **UI_VISUAL_GUIDE.md** - Cómo se ve
- **README.md** - Descripción general
- **DEPLOYMENT.md** - AWS deployment

---

## 🎨 Características

✅ Dos paneles lado a lado  
✅ Auto-copia de token  
✅ Validación de JSON  
✅ Información detallada  
✅ Copiar con un click  
✅ Responsive (mobile-friendly)  
✅ Diseño moderno  

---

## 🆘 Contacto/Ayuda

Si necesitas ayuda, revisa:
1. La sección "Solución de Problemas" arriba
2. UI_README.md para guía detallada
3. UI_VISUAL_GUIDE.md para ver cómo se ve

---

**¡Disfruta explorando la encriptación JWE de forma interactiva!** 🔐
