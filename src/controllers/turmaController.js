const { Turma, Escola, Aluno, Presenca } = require('../config/database');
const { body, validationResult } = require('express-validator');

//Listar alunos por id da turma
const listarAlunosByTurmaId = async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { synced } = req.query;
    
    const whereClause = { TurmaId: turmaId };
    
    if (synced === 'true' || synced === 'false') {
      whereClause.synced = synced === 'true';
    }

    const alunos = await Aluno.findAll({ 
      where: whereClause,
      include: [{
        model: Turma,
        attributes: ['id', 'name']
      }, {
        model: Presenca,
        attributes: ['id', 'present', 'date', 'observacao'],
        required: false
      }]
    });
    
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

// Listar turmas de uma escola
const listarTurmasByEscolaId = async (req, res) => {
  try {
    const { escolaId } = req.params;
    const { synced } = req.query;
    
    const whereClause = { EscolaId: escolaId };
    
    if (synced === 'true' || synced === 'false') {
      whereClause.synced = synced === 'true';
    }

    const turmas = await Turma.findAll({ 
      where: whereClause,
      include: [{
        model: Escola,
        attributes: ['id', 'name']
      }, {
        model: Aluno,
        attributes: ['id', 'name']
      }]
    });
    
    res.json(turmas);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
};

// Criar ou atualizar turma
const salvarTurma = [
  body('name').notEmpty(),
  body('escolaId').isInt(),
  body('synced').optional().isBoolean().toBoolean(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, name, escolaId, synced = true } = req.body;
      
      // Verifica se a escola existe
      const escola = await Escola.findByPk(escolaId);
      if (!escola) {
        return res.status(404).json({ error: 'Escola não encontrada' });
      }
      
      const [turma, created] = await Turma.upsert(
        { id, name, EscolaId: escolaId, synced },
        { returning: true }
      );
      
      res.status(created ? 201 : 200).json(turma);
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      res.status(500).json({ error: 'Erro ao salvar turma' });
    }
  }
];

// Sincronizar turmas
const sincronizarTurmas = async (req, res) => {
  try {
    const { turmas } = req.body;
    
    if (!turmas || !Array.isArray(turmas) || turmas.length === 0) {
      return res.status(400).json({ error: 'Lista de turmas é obrigatória' });
    }

    const turmasValidas = [];

    for (const turma of turmas) {
      const [updatedCount] = await Turma.update(
        { 
          name: turma.name,
          EscolaId: turma.EscolaId,
          synced: true 
        },
        { 
          where: { 
            id: turma.id 
          } 
        }
      );

      if (updatedCount > 0) {
        turmasValidas.push(turma.id);
      }
    }

    // Identifica turmas inválidas
    const turmasInvalidas = turmas
      .filter(turma => !turmasValidas.includes(turma.id))
      .map(turma => turma.id);

    // Se houver turmas inválidas, registra na tabela de registros inválidos
    if (turmasInvalidas.length > 0) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Turma',
        dadosOriginais: turmas.filter(turma => turmasInvalidas.includes(turma.id)),
        motivo: 'IDs de turmas inválidos durante a sincronização',
        observacoes: `As seguintes turmas não foram encontradas no banco de dados: ${turmasInvalidas.join(', ')}`
      });
    }

    res.json({
      message: `${turmasValidas.length} turma(s) sincronizada(s) com sucesso`,
      turmasInvalidas: turmasInvalidas.length > 0 ? turmasInvalidas : undefined
    });

  } catch (error) {
    console.error('Erro ao sincronizar turmas:', error);
    
    // Registra o erro na tabela de registros inválidos
    if (req.body.turmas && Array.isArray(req.body.turmas)) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Turma',
        dadosOriginais: req.body.turmas,
        motivo: 'Erro durante a sincronização',
        observacoes: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao sincronizar turmas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar todas as turmas
const listarTodasTurmas = async (req, res) => {
  try {
    const { synced } = req.query;
    
    const whereClause = {};
    
    if (synced === 'true' || synced === 'false') {
      whereClause.synced = synced === 'true';
    }

    const turmas = await Turma.findAll({ 
      where: whereClause,
      include: [{
        model: Escola,
        attributes: ['id', 'name']
      }]
    });
    
    res.json(turmas);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
};


module.exports = {
  listarTurmasByEscolaId,
  salvarTurma,
  sincronizarTurmas,
  listarTodasTurmas,
  listarAlunosByTurmaId
};
