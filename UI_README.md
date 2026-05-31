# 🎨 UI Interactiva para JWE Lambda Functions

Interfaz gráfica moderna para probar las funciones de encriptación y desencriptación sin necesidad de usar la terminal.

## 🚀 Inicio Rápido

### 1. Instalar dependencias (solo la primera vez)

```bash
npm install express
```

### 2. Iniciar el servidor

```bash
node server.js
```

Verás algo como:
```
🚀 Servidor JWE Lambda UI corriendo en http://localhost:3000
📂 Abre http://localhost:3000/index.html en tu navegador
```

### 3. Abrir en el navegador

Abre tu navegador y ve a:
```
http://localhost:3000/index.html
```

## 📋 Características

### 🔒 Panel de Encriptación (Lado Izquierdo)
- **Input de Payload:** Ingresa cualquier JSON que desees encriptar
- **Botón Encriptar:** Encripta el payload con RSA-OAEP + AES-256-CBC-HS512
- **Salida JWE:** Muestra el token encriptado
- **Información:** Muestra detalles de la encriptación (algoritmos, timestamp, tamaño)
- **Copiar Token:** Copia automáticamente el token al portapapeles

### 🔓 Panel de Desencriptación (Lado Derecho)
- **Input JWE:** Ingresa un token JWE para desencriptar
- **Botón Desencriptar:** Desencripta el token JWE
- **Salida de Payload:** Muestra el JSON original desencriptado
- **Información:** Muestra detalles de la desencriptación (verificación de integridad, timestamp, tamaño)
- **Copiar Payload:** Copia el payload desencriptado

## 🔄 Flujo de Uso

### Flujo Completo (Encriptación → Desencriptación)

```
┌─────────────────┐
│  JSON Original  │
│  (tu payload)   │
└────────┬────────┘
         │
         ↓
    ┌────────────┐
    │ Encryptador│
    │            │
    │ RSA-OAEP + │
    │ AES-256    │
    └────┬───────┘
         │
         ↓
    ┌──────────────────┐
    │   JWE Token      │
    │ (5 partes)       │
    └────┬─────────────┘
         │
         ↓
    ┌────────────┐
    │ Decryptador│
    │            │
    │ Verifica + │
    │ Desencripta│
    └────┬───────┘
         │
         ↓
    ┌──────────────────┐
    │  JSON Original   │
    │  (recovered)     │
    └──────────────────┘
```

## 💡 Ejemplos de Payloads

### Ejemplo 1: Objeto Simple
```json
{
  "mensaje": "Hola Mundo",
  "nivel": 5
}
```

### Ejemplo 2: Datos de Usuario
```json
{
  "usuario": "alejandro@example.com",
  "nombre": "Alejandro García",
  "rol": "admin",
  "activo": true
}
```

### Ejemplo 3: Datos Complejos
```json
{
  "transaccion": {
    "id": "TRX-2024-001",
    "monto": 1500.50,
    "moneda": "USD",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "remitente": {
    "nombre": "Juan Pérez",
    "cuenta": "****1234"
  },
  "destinatario": {
    "nombre": "María López",
    "cuenta": "****5678"
  }
}
```

## 🛠️ Características Técnicas

### Seguridad
- ✅ RSA-2048 para encriptación de claves
- ✅ AES-256-CBC con HMAC-SHA512 para integridad
- ✅ Verificación automática de firma
- ✅ Detección de tampering
- ✅ No se loguean datos sensibles

### Validación
- ✅ Validación de JSON en el lado del cliente
- ✅ Validación de formato JWE (5 partes)
- ✅ Validación de tamaño de payload (<1MB)
- ✅ Validación de estructura de datos

### Interfaz
- ✅ Diseño responsive (funciona en mobile)
- ✅ Tema oscuro/claro automático
- ✅ Animaciones suaves
- ✅ Indicadores de estado en tiempo real
- ✅ Copiar con un click
- ✅ Auto-llenado inteligente (el token encriptado se copia automáticamente al panel de desencriptación)

## 📊 Información en Tiempo Real

### Panel de Encriptación muestra:
- Algoritmo de encriptación: RSA-OAEP + AES-256-CBC-HS512
- Timestamp de encriptación
- Tamaño del token JWE en caracteres

### Panel de Desencriptación muestra:
- Estado de verificación HMAC
- Estado de verificación de tampering
- Timestamp de desencriptación
- Tamaño del payload original en caracteres

## 🔧 Solución de Problemas

### "Error de conexión"
**Causa:** El servidor no está corriendo  
**Solución:** Ejecuta `node server.js` en la terminal

### "No se puede copiar"
**Causa:** No hay contenido en el campo  
**Solución:** Primero encripta o desencripta algo

### "JSON inválido"
**Causa:** El payload no es JSON válido  
**Solución:** Asegúrate de que el JSON esté bien formado (comillas, llaves, etc.)

### "Token JWE inválido"
**Causa:** El token está corrupto o tampered  
**Solución:** Usa el token generado por el panel de encriptación

## 📱 Compatibilidad

- ✅ Chrome/Chromium (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)
- ✅ Opera (v76+)
- ✅ Navegadores móviles modernos

## 🎨 Personalización

### Cambiar colores
Edita los gradientes en `index.html` sección `<style>`:

```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Cambia estos colores hex (#667eea, #764ba2) */
}
```

### Cambiar puerto del servidor
En `server.js`:

```javascript
const PORT = 3000;  // Cambia a otro puerto
```

## 📚 Más Información

- Ver [README.md](./README.md) para descripción general del proyecto
- Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para despliegue en AWS
- Ver [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) para resumen del proyecto

## 🎯 Próximos Pasos

1. ✅ Abre la interfaz y prueba la encriptación
2. ✅ Experimenta con diferentes payloads
3. ✅ Verifica que los tokens se generen correctamente
4. ✅ Prueba la desencriptación
5. ✅ Cuando estés listo, despliega en AWS usando `deploy.ps1` o `deploy.sh`

---

**¡Disfruta explorando la seguridad JWE de manera interactiva!** 🔐
