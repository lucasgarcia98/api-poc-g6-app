const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Aumenta o limite para 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api', routes);

// Swagger Documentation
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Controle de Frequência Escolar',
  customfavIcon: 'https://img.icons8.com/color/48/000000/school.png',
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// JSON Documentation
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/seed', (req, res) => {
  const { gerarDadosTeste } = require('./seeders/testData');
  gerarDadosTeste();
  res.send('Dados de teste gerados com sucesso!');
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

module.exports = app;