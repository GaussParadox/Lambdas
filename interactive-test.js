#!/usr/bin/env node

const readline = require('readline');
const encryptor = require('./jose-encryptor/src/index');
const decryptor = require('./jose-decryptor/src/index');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   🔐 PRUEBA INTERACTIVA: ENCRIPTACIÓN/DESENCRIPTACIÓN JWE 🔐     ║
║                                                                    ║
║          Ingresa datos, encripta y desencripta en vivo            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  let continuar = true;

  while (continuar) {
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│                    📋 MENÚ PRINCIPAL                    │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│  1. Encriptar un mensaje                               │');
    console.log('│  2. Desencriptar un token                              │');
    console.log('│  3. Prueba completa (Encriptar + Desencriptar)         │');
    console.log('│  4. Ver ejemplos de payloads                           │');
    console.log('│  5. Salir                                              │');
    console.log('└────────────────────────────────────────────────────────┘');

    const opcion = await question('\n👉 Selecciona una opción (1-5): ');

    switch (opcion.trim()) {
      case '1':
        await encriptarManual();
        break;
      case '2':
        await desencriptarManual();
        break;
      case '3':
        await pruebacompleta();
        break;
      case '4':
        mostrarEjemplos();
        break;
      case '5':
        console.log('\n👋 ¡Hasta luego!\n');
        continuar = false;
        break;
      default:
        console.log('\n❌ Opción no válida, intenta de nuevo.');
    }

    if (continuar && ['1', '2', '3'].includes(opcion.trim())) {
      const again = await question('\n¿Quieres hacer otra prueba? (s/n): ');
      if (again.toLowerCase() !== 's') {
        continuar = false;
      }
    }
  }

  rl.close();
}

async function encriptarManual() {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│                   🔐 ENCRIPTACIÓN                      │');
  console.log('└────────────────────────────────────────────────────────┘');

  const usarEjemplo = await question('\n¿Usar un ejemplo? (s/n): ');

  let payload;

  if (usarEjemplo.toLowerCase() === 's') {
    payload = {
      mensaje: '¡Hola desde Terminal!',
      usuario: 'alejandro',
      timestamp: new Date().toISOString(),
      nivel: 5
    };
    console.log('\n✅ Usando ejemplo:');
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log('\n📝 Ingresa tu JSON (presiona Enter dos veces al terminar):');
    console.log('Ejemplo: {"mensaje": "hola", "id": 1}');
    console.log('');

    let jsonStr = '';
    let lineasVacias = 0;

    while (true) {
      const linea = await question('');
      if (linea === '') {
        lineasVacias++;
        if (lineasVacias >= 2) break;
      } else {
        lineasVacias = 0;
        jsonStr += linea;
      }
    }

    try {
      payload = JSON.parse(jsonStr);
      console.log('\n✅ JSON válido:');
      console.log(JSON.stringify(payload, null, 2));
    } catch (e) {
      console.log('\n❌ JSON inválido:', e.message);
      return;
    }
  }

  try {
    console.log('\n⏳ Encriptando...');
    const event = {
      body: JSON.stringify({ payload })
    };

    const result = await encryptor.handler(event);
    const response = JSON.parse(result.body);

    if (result.statusCode === 200) {
      console.log('\n✅ ¡ENCRIPTACIÓN EXITOSA!');
      console.log(`\n📊 Detalles de la Encriptación:`);
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Algoritmo Key: RSA-OAEP`);
      console.log(`   Algoritmo Content: AES-256-CBC-HS512`);
      console.log(`   Timestamp: ${response.timestamp}`);
      console.log(`\n🔐 TOKEN JWE GENERADO:`);
      console.log(`\n${response.jwe}`);
      console.log(`\n📏 Tamaño del token: ${response.jwe.length} caracteres`);

      // Guardar token para desencriptar después
      global.lastJwe = response.jwe;
      console.log(`\n💾 Token guardado (puedes usarlo en la opción 2)`);
    } else {
      console.log('\n❌ Error:', response.error);
    }
  } catch (error) {
    console.log('\n❌ Error en encriptación:', error.message);
  }
}

async function desencriptarManual() {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│                   🔓 DESENCRIPTACIÓN                   │');
  console.log('└────────────────────────────────────────────────────────┘');

  let jweToken;

  if (global.lastJwe) {
    const usar = await question(`\n¿Usar el último token generado? (s/n): `);
    if (usar.toLowerCase() === 's') {
      jweToken = global.lastJwe;
      console.log('\n✅ Usando token anterior');
    } else {
      jweToken = await question('\n📝 Ingresa el token JWE a desencriptar:\n');
    }
  } else {
    jweToken = await question('\n📝 Ingresa el token JWE a desencriptar:\n');
  }

  if (!jweToken.trim()) {
    console.log('\n❌ Token vacío');
    return;
  }

  try {
    console.log('\n⏳ Desencriptando...');
    const event = {
      body: JSON.stringify({ jwe: jweToken })
    };

    const result = await decryptor.handler(event);
    const response = JSON.parse(result.body);

    if (result.statusCode === 200) {
      console.log('\n✅ ¡DESENCRIPTACIÓN EXITOSA!');
      console.log(`\n📊 Detalles de la Desencriptación:`);
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Firma HMAC: ✅ Válida`);
      console.log(`   Tampering: ❌ No detectado`);
      console.log(`   Timestamp: ${response.timestamp}`);
      console.log(`\n📝 PAYLOAD RECUPERADO:`);
      console.log(`\n${JSON.stringify(response.payload, null, 2)}`);
      console.log(`\n📏 Tamaño del payload: ${JSON.stringify(response.payload).length} caracteres`);
    } else {
      console.log('\n❌ Error:', response.error);
      console.log(`   Status: ${result.statusCode}`);
    }
  } catch (error) {
    console.log('\n❌ Error en desencriptación:', error.message);
  }
}

async function pruebacompleta() {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│          🔄 PRUEBA COMPLETA (ENCRIPTAR + DESCR)       │');
  console.log('└────────────────────────────────────────────────────────┘');

  const usarEjemplo = await question('\n¿Usar un ejemplo? (s/n): ');

  let payload;

  if (usarEjemplo.toLowerCase() === 's') {
    payload = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      rol: 'administrador',
      activo: true,
      creado: new Date().toISOString()
    };
  } else {
    console.log('\n📝 Ingresa tu JSON:');
    const jsonStr = await question('');
    try {
      payload = JSON.parse(jsonStr);
    } catch (e) {
      console.log('\n❌ JSON inválido');
      return;
    }
  }

  try {
    // PASO 1: Encriptar
    console.log('\n\n📝 PASO 1: PAYLOAD ORIGINAL');
    console.log('─────────────────────────────');
    console.log(JSON.stringify(payload, null, 2));

    console.log('\n\n⏳ PASO 2: ENCRIPTANDO...');
    console.log('─────────────────────────────');
    const encryptEvent = { body: JSON.stringify({ payload }) };
    const encryptResult = await encryptor.handler(encryptEvent);
    const encryptResponse = JSON.parse(encryptResult.body);

    if (encryptResult.statusCode !== 200) {
      console.log('❌ Error en encriptación');
      return;
    }

    console.log('✅ Encriptación exitosa');
    console.log(`\n🔐 TOKEN JWE GENERADO:`);
    console.log(encryptResponse.jwe);
    console.log(`\nTamaño: ${encryptResponse.jwe.length} caracteres`);

    // PASO 2: Desencriptar
    console.log('\n\n⏳ PASO 3: DESENCRIPTANDO...');
    console.log('─────────────────────────────');
    const decryptEvent = { body: JSON.stringify({ jwe: encryptResponse.jwe }) };
    const decryptResult = await decryptor.handler(decryptEvent);
    const decryptResponse = JSON.parse(decryptResult.body);

    if (decryptResult.statusCode !== 200) {
      console.log('❌ Error en desencriptación');
      return;
    }

    console.log('✅ Desencriptación exitosa');
    console.log(`\n📝 PAYLOAD RECUPERADO:`);
    console.log(JSON.stringify(decryptResponse.payload, null, 2));

    // PASO 3: Verificar
    console.log('\n\n✔️  PASO 4: VERIFICACIÓN');
    console.log('─────────────────────────────');
    const coinciden = JSON.stringify(payload) === JSON.stringify(decryptResponse.payload);
    console.log(`¿Payloads idénticos? ${coinciden ? '✅ SÍ' : '❌ NO'}`);

    if (coinciden) {
      console.log('\n🎉 ¡PRUEBA COMPLETAMENTE EXITOSA!');
    }

    global.lastJwe = encryptResponse.jwe;
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

function mostrarEjemplos() {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│                   📚 EJEMPLOS DE PAYLOADS              │');
  console.log('└────────────────────────────────────────────────────────┘');

  const ejemplos = [
    {
      nombre: '1. Objeto Simple',
      payload: { mensaje: 'Hola Mundo', valor: 42 }
    },
    {
      nombre: '2. Datos de Usuario',
      payload: {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        activo: true
      }
    },
    {
      nombre: '3. Transacción',
      payload: {
        transaccion: {
          id: 'TRX-2024-001',
          monto: 1500.50,
          moneda: 'USD'
        },
        remitente: 'Juan',
        destinatario: 'María'
      }
    },
    {
      nombre: '4. Datos Complejos',
      payload: {
        usuario: {
          id: 123,
          nombre: 'Alejandro',
          rol: 'admin'
        },
        permisos: ['leer', 'escribir', 'eliminar'],
        metadata: {
          creado: '2024-01-15T10:30:00Z',
          actualizado: '2024-01-15T15:45:30Z'
        }
      }
    }
  ];

  ejemplos.forEach((ejemplo) => {
    console.log(`\n${ejemplo.nombre}:`);
    console.log(JSON.stringify(ejemplo.payload, null, 2));
  });

  console.log('\n💡 Tip: Puedes copiar cualquiera de estos ejemplos y pegarlo en las opciones 1 o 3');
}

// Iniciar
main().catch(console.error);
