const { Aluno, Turma, Presenca, RegistroInvalido } = require('../config/database');
const { body, validationResult } = require('express-validator');
const registroInvalido = require('../models/registroInvalido');

// Listar todos os alunos
const listarTodosAlunos = async (req, res) => {
  try {   
    
    const alunos = await Aluno.findAll({ 
      include: [{
        model: Turma,
        attributes: ['id', 'name']
      }, {
        model: Presenca,
        attributes: ['id', 'present', 'date', 'observacao'],
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

// Listar alunos de uma turma
const listarAlunosByTurmaId = async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { synced } = req.query;
    
    const whereClause = { TurmaId: turmaId };
    

    const alunos = await Aluno.findAll({ 
      where: whereClause,
      include: [{
        model: Turma,
        attributes: ['id', 'name']
      }, {
        model: Presenca,
        attributes: ['id', 'present', 'date', 'observacao'],
        required: false
      }],
      order: [['name', 'ASC']]
    });
    
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

// Criar ou atualizar aluno
const salvarAluno = [
  body('name').notEmpty(),
  body('turmaId').isInt(),
  body('synced').optional().isBoolean().toBoolean(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, name, turmaId, synced = true } = req.body;
      
      // Verifica se a turma existe
      const turma = await Turma.findByPk(turmaId);
      if (!turma) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }
      
      const [aluno, created] = await Aluno.upsert(
        { id, name, TurmaId: turmaId, synced },
        { returning: true }
      );
      
      res.status(created ? 201 : 200).json(aluno);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      res.status(500).json({ error: 'Erro ao salvar aluno' });
    }
  }
];

// Sincronizar alunos
const sincronizarAlunos = async (req, res) => {
  try {
    const { alunos } = req.body;
    
    // Verifica se os dados são corretos
    if (!alunos || !Array.isArray(alunos) || alunos.length === 0) {
      return res.status(400).json({ error: 'Lista de alunos é obrigatória' });
    }

    const alunosAtualizadosComSucesso = [];
    const alunosInvalidos = [];

    for (const aluno of alunos) {
      const { id, ...restAluno } = aluno;

      if (!id) {
        alunosInvalidos.push(aluno);
        continue;
      }

      const [rowsUpdated] = await Aluno.update(
        { ...restAluno, synced: true },
        { where: { id } }
      );

      if (rowsUpdated > 0) {
        alunosAtualizadosComSucesso.push(aluno);
      } else {
        alunosInvalidos.push(aluno);
      }
    }

    if (alunosInvalidos.length > 0) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Aluno',
        dadosOriginais: alunosInvalidos.map(aluno => ({
          id: aluno.id,
          name: aluno.name,
          turmaId: aluno.turmaId,
          synced: aluno.synced
        })),
        motivo: 'IDs de alunos inválidos durante a sincronização',
        observacoes: `Os seguintes alunos não foram encontrados no banco de dados: ${alunosInvalidos.map(a => a.id).join(', ')}`
      });
    }

    return res.json({
      message: `${alunosAtualizadosComSucesso.length} aluno(s) marcado(s) como sincronizado(s)`,
      alunosInvalidos: alunosInvalidos.length > 0 ? alunosInvalidos : undefined
    });
  } catch (error) {
    if (req.body.alunos && Array.isArray(req.body.alunos)) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Aluno',
        dadosOriginais: req.body.alunos,
        motivo: 'Erro durante a sincronização',
        observacoes: error.message
      });
    }
    console.error('Erro ao sincronizar alunos:', error);
    res.status(500).json({ error: 'Erro ao sincronizar alunos' });
  }
};

module.exports = {
  listarAlunosByTurmaId,
  salvarAluno,
  sincronizarAlunos,
  listarTodosAlunos
};
