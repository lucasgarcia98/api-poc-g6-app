const { Presenca, Aluno, Turma, RegistroInvalido } = require('../config/database');
const { body, validationResult } = require('express-validator');


// Listar todas as presenças
const listarPresencas = async (req, res) => {
  try {
    const presencas = await Presenca.findAll({
      include: [
        {
          model: Aluno,
          include: [{ model: Turma }]
        }
      ],
      attributes: ['id', 'date', 'present', 'synced']
    });
    res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
};


// Registrar ou atualizar presença
const registrarPresenca = [
  body('AlunoId').isInt(),
  body('date').isISO8601().toDate(),
  body('present').isBoolean(),
  body('synced').optional().isBoolean().toBoolean(),

  async (req, res) => {
    console.log(req.body)
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, AlunoId, date, present, synced = true } = req.body;

      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(AlunoId);
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      const [presenca, created] = await Presenca.upsert(
        {
          id,
          AlunoId,
          date: new Date(date).toISOString().split('T')[0], // Garante o formato YYYY-MM-DD
          present,
          synced
        },
        {
          where: {
            AlunoId,
            date: new Date(date).toISOString().split('T')[0]
          },
          returning: true
        }
      );

      res.status(created ? 201 : 200).json(presenca);
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      res.status(400).json({ error: error.message || 'Erro ao registrar presença' });
    }
  }
];

// Listar presenças de uma turma em uma data específica
const listarPresencasTurma = async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Parâmetro "date" é obrigatório' });
    }

    const presencas = await Presenca.findAll({
      include: [{
        model: Aluno,
        where: { TurmaId: turmaId },
        attributes: ['id', 'name'],
        include: [{
          model: Turma,
          attributes: ['id', 'name']
        }]
      }],
      where: {
        date: new Date(date).toISOString().split('T')[0]
      },
      attributes: ['id', 'present', 'date', 'synced']
    });

    res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
};

// Listar histórico de presenças de um aluno
const listarPresencasAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { date } = req.query;

    const whereClause = { AlunoId: alunoId };

    if (date) {
      whereClause.date = new Date(date).toISOString().split('T')[0];
    }

    const presencas = await Presenca.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
      attributes: ['id', 'date', 'present', 'synced']
    });

    // Calcular estatísticas
    const totalRegistros = presencas.length;
    const totalPresencas = presencas.filter(p => p.present).length;
    const frequencia = totalRegistros > 0
      ? Math.round((totalPresencas / totalRegistros) * 100)
      : 0;

    res.json({
      presencas,
      estatisticas: {
        totalRegistros,
        totalPresencas,
        totalFaltas: totalRegistros - totalPresencas,
        frequencia: `${frequencia}%`
      }
    });
  } catch (error) {
    console.error('Erro ao buscar presenças do aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar presenças do aluno' });
  }
};

// Sincronizar presenças
const sincronizarPresencas = async (req, res) => {
  try {
    const { presencas } = req.body;
    
    if (!presencas || !Array.isArray(presencas) || presencas.length === 0) {
      return res.status(400).json({ error: 'Lista de presenças é obrigatória' });
    }

    const resultados = await Promise.allSettled(
      presencas.map(presenca => {
       
        // Verifica se a presença já existe
        return Presenca.findOne({
          where: {
            id: presenca.id
          }
        }).then(existente => {
          console.log(existente.toJSON())
          if (existente) {
            // Atualiza a presença existente
            return existente.update({
              present: presenca.present,
              synced: true
            });
          } else {
            // Cria uma nova presença
            return Presenca.create({
              ...presenca,
              synced: true
            });
          }
        });
      })
    );

    // Processa os resultados
    const sucessos = resultados.filter(r => r.status === 'fulfilled').map(r => r.value);
    const falhas = resultados
      .filter((r, index) => r.status === 'rejected')
      .map((r, index) => ({
        presenca: presencas[index],
        motivo: r.reason.message
      }));

    // Registra as falhas na tabela de registros inválidos
    if (falhas.length > 0) {
      await Promise.all(
        falhas.map(falha => 
          RegistroInvalido.create({
            tabelaOrigem: 'Presenca',
            dadosOriginais: falha.presenca,
            motivo: 'Erro ao sincronizar presença',
            observacoes: falha.motivo
          })
        )
      );
    }

    res.json({
      message: `${sucessos.length} presença(s) sincronizada(s) com sucesso`,
      falhas: falhas.length > 0 ? falhas.length : undefined
    });

  } catch (error) {
    console.error('Erro ao sincronizar presenças:', error);
    
    // Registra o erro na tabela de registros inválidos
    if (req.body.presencas && Array.isArray(req.body.presencas)) {
      await RegistroInvalido.create({
        tabelaOrigem: 'Presenca',
        dadosOriginais: req.body.presencas,
        motivo: 'Erro durante a sincronização',
        observacoes: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao sincronizar presenças',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registrarPresenca,
  listarPresencasTurma,
  listarPresencasAluno,
  sincronizarPresencas,
  listarPresencas
};
