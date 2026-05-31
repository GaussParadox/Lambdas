const express = require('express');
const path = require('path');
const encryptorHandler = require('./jose-encryptor/src/index');
const decryptorHandler = require('./jose-decryptor/src/index');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Rutas
app.post('/api/encrypt', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify({
        payload: req.body.payload
      })
    };
    
    const result = await encryptorHandler.handler(event);
    const responseBody = JSON.parse(result.body);
    
    res.json({
      success: true,
      statusCode: result.statusCode,
      jwe: responseBody.jwe || null,
      timestamp: responseBody.timestamp,
      error: responseBody.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/decrypt', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify({
        jwe: req.body.jwe
      })
    };
    
    const result = await decryptorHandler.handler(event);
    const responseBody = JSON.parse(result.body);
    
    res.json({
      success: true,
      statusCode: result.statusCode,
      payload: responseBody.payload || null,
      timestamp: responseBody.timestamp,
      error: responseBody.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor JWE Lambda UI corriendo en http://localhost:${PORT}`);
  console.log(`📂 Abre http://localhost:${PORT}/index.html en tu navegador\n`);
});
