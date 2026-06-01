# 🔐 Script Interactivo de Prueba - Interactive Test

Script interactivo en Node.js para probar encriptación y desencriptación JWE desde la terminal de forma visual.

## 🚀 Inicio Rápido

### 1. Ejecuta el script
```bash
node interactive-test.js
```

### 2. Verás un menú como este:
```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   🔐 PRUEBA INTERACTIVA: ENCRIPTACIÓN/DESENCRIPTACIÓN JWE 🔐     ║
║                                                                    ║
║          Ingresa datos, encripta y desencripta en vivo            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────┐
│                    📋 MENÚ PRINCIPAL                    │
├────────────────────────────────────────────────────────┤
│  1. Encriptar un mensaje                               │
│  2. Desencriptar un token                              │
│  3. Prueba completa (Encriptar + Desencriptar)         │
│  4. Ver ejemplos de payloads                           │
│  5. Salir                                              │
└────────────────────────────────────────────────────────┘

👉 Selecciona una opción (1-5):
```

## 📖 Opciones Disponibles

### **Opción 1: Encriptar un mensaje**
- Ingresa un JSON manualmente o usa un ejemplo
- El script lo encripta con RSA-2048 + AES-256
- Muestra el token JWE generado
- **Guarda el token automáticamente** para usarlo después en Opción 2

**Ejemplo:**
```
👉 Selecciona una opción (1-5): 1

¿Usar un ejemplo? (s/n): n

📝 Ingresa tu JSON:
{"nombre": "Alejandro", "email": "test@example.com"}

✅ JSON válido

⏳ Encriptando...

✅ ¡ENCRIPTACIÓN EXITOSA!

📊 Detalles de la Encriptación:
   Status Code: 200
   Algoritmo Key: RSA-OAEP
   Algoritmo Content: AES-256-CBC-HS512
   Timestamp: 2024-01-15T10:30:00.123Z

🔐 TOKEN JWE GENERADO:

eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ.XbzKlN...

📏 Tamaño del token: 412 caracteres

💾 Token guardado (puedes usarlo en la opción 2)
```

### **Opción 2: Desencriptar un token**
- Ingresa un token JWE
- Si hay un token guardado de la opción anterior, puedes usarlo automáticamente
- Verifica la integridad (HMAC)
- Detecta tampering
- Muestra el payload original

**Ejemplo:**
```
👉 Selecciona una opción (1-5): 2

¿Usar el último token generado? (s/n): s

✅ Usando token anterior

⏳ Desencriptando...

✅ ¡DESENCRIPTACIÓN EXITOSA!

📊 Detalles de la Desencriptación:
   Status Code: 200
   Firma HMAC: ✅ Válida
   Tampering: ❌ No detectado
   Timestamp: 2024-01-15T10:30:01.456Z

📝 PAYLOAD RECUPERADO:

{
  "nombre": "Alejandro",
  "email": "test@example.com"
}

📏 Tamaño del payload: 55 caracteres
```

### **Opción 3: Prueba completa (Encriptar + Desencriptar)**
- Realiza un ciclo completo:
  1. Encripta tu payload
  2. Muestra el token JWE
  3. Desencripta automáticamente
  4. Recupera el payload original
  5. **Verifica que coincidan** ✅

**Ejemplo:**
```
👉 Selecciona una opción (1-5): 3

¿Usar un ejemplo? (s/n): s

📝 PASO 1: PAYLOAD ORIGINAL
─────────────────────────────
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "administrador",
  "activo": true,
  "creado": "2024-01-15T10:30:00.000Z"
}

⏳ PASO 2: ENCRIPTANDO...
─────────────────────────────
✅ Encriptación exitosa

🔐 TOKEN JWE GENERADO:
eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIifQ...
Tamaño: 520 caracteres

⏳ PASO 3: DESENCRIPTANDO...
─────────────────────────────
✅ Desencriptación exitosa

📝 PAYLOAD RECUPERADO:
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "administrador",
  "activo": true,
  "creado": "2024-01-15T10:30:00.000Z"
}

✔️  PASO 4: VERIFICACIÓN
─────────────────────────────
¿Payloads idénticos? ✅ SÍ

🎉 ¡PRUEBA COMPLETAMENTE EXITOSA!
```

### **Opción 4: Ver ejemplos de payloads**
Muestra 4 ejemplos prehechos:
1. Objeto Simple
2. Datos de Usuario
3. Transacción
4. Datos Complejos

Puedes copiar estos ejemplos y usarlos en las otras opciones.

### **Opción 5: Salir**
Cierra el programa.

---

## 🔄 Flujo de Uso Recomendado

### Ciclo Completo (Opción 3)
```
1. Ejecuta: node interactive-test.js
2. Selecciona: 3 (Prueba completa)
3. Elige si usar ejemplo o ingresar datos manualmente
4. El script:
   ✅ Encripta automáticamente
   ✅ Genera el token JWE
   ✅ Desencripta automáticamente
   ✅ Verifica que coincida
5. Presiona: s para otra prueba o n para salir
```

### Ciclo Manual (Opciones 1 + 2)
```
1. Ejecuta: node interactive-test.js
2. Selecciona: 1 (Encriptar)
3. Ingresa tu JSON
4. El token se guarda automáticamente
5. Selecciona: 2 (Desencriptar)
6. Presiona: s para usar el token anterior
7. Se muestra el payload original
```

---

## 💡 Tips y Trucos

### Copiar Ejemplos
```
1. Selecciona opción 4 (Ver ejemplos)
2. Copia un ejemplo
3. Vuelve a menú (presiona Enter)
4. Selecciona opción 1
5. Presiona: n (no usar ejemplo)
6. Pega el ejemplo
```

### Formato JSON Válido
✅ **Correcto:**
```json
{"nombre": "Juan", "id": 1}
```

❌ **Incorrecto (falta coma):**
```json
{"nombre": "Juan" "id": 1}
```

### Múltiples Líneas en JSON
Si tu JSON es largo, puedes pegarlo en varias líneas y el script lo unirá:
```
{"nombre": "Alejandro",
 "email": "test@example.com",
 "activo": true}

(presiona Enter dos veces para terminar)
```

---

## 🔐 Información de Seguridad

**El script usa:**
- ✅ RSA-OAEP para encriptación de claves (2048-bit)
- ✅ AES-256-CBC para encriptación de contenido
- ✅ HMAC-SHA512 para autenticación e integridad
- ✅ Verificación automática de tampering
- ✅ Timestamps para cada operación

---

## 📊 Salida Esperada

El script muestra:
- ✅ Estado de encriptación/desencriptación
- ✅ Algoritmos utilizados
- ✅ Tokens JWE completos
- ✅ Payloads recuperados
- ✅ Verificación de integridad
- ✅ Timestamps
- ✅ Tamaños de datos

---

## 🐛 Solución de Problemas

### "Error: Cannot find module './jose-encryptor/src/index'"
**Solución:** Asegúrate de estar en la carpeta correcta:
```bash
cd c:\Users\ALEJANDRO\OneDrive\Desktop\lamda
node interactive-test.js
```

### "JSON inválido"
**Solución:** Verifica que el JSON esté bien formado (comillas, comas, llaves)

### "Token inválido"
**Solución:** Usa el token generado por la Opción 1 o la Opción 3

---

## ✨ Características

✅ **Interactivo** - Menú visual y fácil de usar  
✅ **Sin dependencias externas** - Solo Node.js  
✅ **Almacenamiento temporal** - Guarda tokens entre opciones  
✅ **Ejemplos incluidos** - 4 ejemplos predefinidos  
✅ **Información detallada** - Muestra todos los detalles de encriptación  
✅ **Verificación automática** - Verifica que los datos coincidan  

---

**¡Disfruta probando la encriptación JWE de forma interactiva!** 🔐
