const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware CORS para controle de acesso
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configuração do proxy para requisições à API
app.use('/api', createProxyMiddleware({
  target: 'https://controlepesssoalapi-d8g6bbhedcd3cvfk.eastus-01.azurewebsites.net',
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
}));

// Servir apenas arquivos estáticos do diretório dist
app.use(express.static(path.join(__dirname, 'dist/browser')));

// Para todas as requisições GET, retornar index.html para permitir o uso do PathLocationStrategy
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/browser/index.html'));
});

// Iniciar a aplicação escutando na porta padrão do Azure
const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`App running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});