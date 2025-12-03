const express = require('express');
const router = express.Router();

// Import route modules
const escolaRoutes = require('./escolaRoutes');
const turmaRoutes = require('./turmaRoutes');
const alunoRoutes = require('./alunoRoutes');
const presencaRoutes = require('./presencaRoutes');
const registroInvalidoRoutes = require('./registroInvalidoRoutes');

// Setup routes
router.use('/escolas', escolaRoutes);
router.use('/turmas', turmaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/presencas', presencaRoutes);
router.use('/registros-invalidos', registroInvalidoRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.redirect('/api-docs');
});

module.exports = router;
