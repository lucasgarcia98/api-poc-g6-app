const { Presenca, Aluno, Turma, RegistroInvalido } = require('../config/database');
const { body, validationResult } = require('express-validator');


// Listar todas as presenças
const listarPresencas = async (req, res) => {
  try {
    const presencas = await Presenca.findAll({
      include: [
        {
          model: Aluno,
          include: [{ model: Turma, attributes: ['id', 'name'] }],
          attributes: ['id', 'name', 'TurmaId'],
        }
      ],
      attributes: ['id', 'date', 'present', 'synced', 'observacao', 'AlunoId']
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, AlunoId, date, present, synced = true, observacao } = req.body;

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
          synced,
          observacao
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
      attributes: ['id', 'present', 'date', 'synced', 'observacao', 'AlunoId']
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
      attributes: ['id', 'date', 'present', 'synced', 'observacao', 'AlunoId']
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

    const resultados = [];

    for (const presenca of presencas) {
      try {
      let presencaFind = await Presenca.findOne({
        where: {
          id: presenca.id
        }
      })
      console.log('<----------------------->')
      if (!presencaFind && presenca.id) {
        presencaFind = await Presenca.findOne({
          where: {
            AlunoId: presenca?.AlunoId || presenca?.aluno?.id,
            date: presenca.date
          }
        })
      }

      if (presencaFind) {
        const atualizada = await presencaFind.update({
          present: presenca.present,
          synced: true,
          observacao: presenca.observacao,
          id: presencaFind.id
        })
        console.log({
          message: 'Presença atualizada',
          atualizada: atualizada.toJSON()
        })
      } else {
        try {
          const criada = await Presenca.create({
            ...presenca,
            synced: true,
            observacao: presenca.observacao
          })
          console.log({
            message: 'Nova presença criada',
            criada: criada.toJSON()
          })
        } catch (createError) {
          if (createError.name === 'SequelizeUniqueConstraintError') {
            const existing = await Presenca.findOne({
              where: {
                AlunoId: presenca?.AlunoId || presenca?.aluno?.id,
                date: presenca.date
              }
            })
            if (existing) {
              const atualizada = await existing.update({
                present: presenca.present,
                synced: true,
                observacao: presenca.observacao
              })
              console.log({
                message: 'Presença encontrada por AlunoId e data, atualizada',
                atualizada: atualizada.toJSON()
              })
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }

      resultados.push({
        status: 'fulfilled',
        value: presenca
      })
    } catch (error) {
      console.log(error)
      resultados.push({
        status: 'rejected',
        reason: error
      })
    }
    }

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
      falhas: JSON.stringify(falhas),
      sucessos: JSON.stringify(sucessos)
    });

  } catch (error) {

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
