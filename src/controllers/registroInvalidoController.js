const { RegistroInvalido } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Listar todos os registros inválidos
const listarRegistrosInvalidos = async (req, res) => {
  try {
    const { resolvido, tabelaOrigem } = req.query;
    
    const whereClause = {};
    
    if (resolvido !== undefined) {
      whereClause.resolvido = resolvido === 'true';
    }
    
    if (tabelaOrigem) {
      whereClause.tabelaOrigem = tabelaOrigem;
    }
    
    const registros = await RegistroInvalido.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(registros);
  } catch (error) {
    console.error('Erro ao buscar registros inválidos:', error);
    res.status(500).json({ error: 'Erro ao buscar registros inválidos' });
  }
};

// Obter um registro inválido por ID
const obterRegistroInvalido = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await RegistroInvalido.findByPk(id);
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json(registro);
  } catch (error) {
    console.error('Erro ao buscar registro inválido:', error);
    res.status(500).json({ error: 'Erro ao buscar registro inválido' });
  }
};

// Criar um registro de dado inválido
const criarRegistroInvalido = async (req, res) => {
  try {
    const { tabelaOrigem, dadosOriginais, motivo, observacoes } = req.body;
    
    const registro = await RegistroInvalido.create({
      tabelaOrigem,
      dadosOriginais,
      motivo,
      observacoes,
      resolvido: false
    });
    
    res.status(201).json(registro);
  } catch (error) {
    console.error('Erro ao criar registro inválido:', error);
    res.status(500).json({ error: 'Erro ao criar registro inválido' });
  }
};

// Atualizar um registro inválido
const atualizarRegistroInvalido = [
  body('resolvido').optional().isBoolean(),
  body('observacoes').optional().isString(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { resolvido, observacoes } = req.body;
      
      const registro = await RegistroInvalido.findByPk(id);
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      // Atualiza os campos fornecidos
      if (resolvido !== undefined) {
        registro.resolvido = resolvido;
        if (resolvido) {
          registro.dataCorrecao = new Date();
        } else {
          registro.dataCorrecao = null;
        }
      }
      
      if (observacoes !== undefined) {
        registro.observacoes = observacoes;
      }
      
      await registro.save();
      
      res.json(registro);
    } catch (error) {
      console.error('Erro ao atualizar registro inválido:', error);
      res.status(500).json({ error: 'Erro ao atualizar registro inválido' });
    }
  }
];

// Excluir um registro inválido (soft delete)
const excluirRegistroInvalido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registro = await RegistroInvalido.findByPk(id);
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    await registro.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir registro inválido:', error);
    res.status(500).json({ error: 'Erro ao excluir registro inválido' });
  }
};

module.exports = {
  listarRegistrosInvalidos,
  obterRegistroInvalido,
  criarRegistroInvalido,
  atualizarRegistroInvalido,
  excluirRegistroInvalido
};
