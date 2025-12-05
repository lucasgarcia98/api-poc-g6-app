const { Escola, Turma, RegistroInvalido } = require('../config/database');
const { body, validationResult } = require('express-validator');


//Listar turmas por id escola
const listarTurmasByEscolaId = async (req, res) => {
  try {
    const { escolaId } = req.params;
    if (!escolaId) {
      return res.status(400).json({ error: 'Parâmetro "escolaId" é obrigatório' });
    }

    const turmas = await Turma.findAll({ where: {
      EscolaId: escolaId
    } });
    res.json(turmas);
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({ error: 'Erro ao buscar escolas' });
  }
};
// Listar todas as escolas
const listarEscolas = async (req, res) => {
  try {
    const { synced } = req.query;
    const whereClause = {};
    
    if (synced === 'true' || synced === 'false') {
      whereClause.synced = synced === 'true';
    }

    const escolas = await Escola.findAll({ where: whereClause });
    res.json(escolas);
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({ error: 'Erro ao buscar escolas' });
  }
};

// Criar ou atualizar escola
const salvarEscola = [
  body('name').notEmpty(),
  body('address').notEmpty(),
  body('synced').optional().isBoolean().toBoolean(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, name, address, synced = true } = req.body;
      
      const [escola, created] = await Escola.upsert(
        { id, name, address, synced },
        { returning: true }
      );
      
      res.status(created ? 201 : 200).json(escola);
    } catch (error) {
      console.error('Erro ao salvar escola:', error);
      res.status(500).json({ error: 'Erro ao salvar escola' });
    }
  }
];

// Sincronizar escolas
const sincronizarEscolas = async (req, res) => {
  console.log('chegou aqui')
  try {
    const { escolas } = req.body;
    
    if (!escolas || !Array.isArray(escolas) || escolas.length === 0) {
      return res.status(400).json({ error: 'Lista de escolas é obrigatória' });
    }
 
    const escolaValidas = []

    for (const escola of escolas) {
      const {id, ...restEscola} = escola
      const escolaUpdated =await Escola.update(
        { ...restEscola, synced: true},
        { where: { id: id } }
      )

      escolaValidas.push(escolaUpdated)
    }
    
    // Se houver IDs inválidos, registra na tabela de registros inválidos
    if (escolaValidas.length > 0) {
      const escolasInvalidas = escolas.filter(escola => escola.id !== escolaValidas);
      
      await RegistroInvalido.create({
        tabelaOrigem: 'Escola',
        dadosOriginais: escolasInvalidas.map(escola => ({
          id: escola.id,
          name: escola.name,
          address: escola.address,
          synced: escola.synced
        })),
        motivo: 'IDs de escolas inválidos durante a sincronização',
        observacoes: `As seguintes escolas não foram encontradas no banco de dados: ${escolasInvalidas.join(', ')}`
      });
      res.json({
        message: `${escolaValidas.length} escola(s) marcada(s) como sincronizada(s)`,
        escolasInvalidas: escolasInvalidas.length > 0 ? escolasInvalidas : undefined
      });
    }

  } catch (error) {
    console.error('Erro ao sincronizar escolas:', error);
    
    // Em caso de erro, registra o erro na tabela de registros inválidos
    if (req.body.escolas && Array.isArray(req.body.escolas)) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Escola',
        dadosOriginais: req.body.escolas,
        motivo: 'Erro durante a sincronização',
        observacoes: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao sincronizar escolas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  listarEscolas,
  salvarEscola,
  sincronizarEscolas,
  listarTurmasByEscolaId
};
