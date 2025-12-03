const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { faker } = require('@faker-js/faker/locale/pt_BR');

// Inicializa o Express
const app = express();
app.use(express.json());
app.use(cors());

// Configuração do banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Definição dos modelos
const Escola = sequelize.define('Escola', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Turma = sequelize.define('Turma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Aluno = sequelize.define('Aluno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Presenca = sequelize.define('Presenca', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  present: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

// Definindo relacionamentos
Escola.hasMany(Turma);
Turma.belongsTo(Escola);

Turma.hasMany(Aluno);
Aluno.belongsTo(Turma);

Aluno.hasMany(Presenca);
Presenca.belongsTo(Aluno);


// Rotas da API

// Listar todas as escolas
app.get('/api/escolas', async (req, res) => {
  try {
    const escolas = await Escola.findAll();
    res.json(escolas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar escolas' });
  }
});

// Listar turmas de uma escola
app.get('/api/escolas/:escolaId/turmas', async (req, res) => {
  try {
    const turmas = await Turma.findAll({
      where: { EscolaId: req.params.escolaId }
    });
    res.json(turmas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

// Listar alunos de uma turma
app.get('/api/turmas/:turmaId/alunos', async (req, res) => {
  try {
    const alunos = await Aluno.findAll({
      where: { TurmaId: req.params.turmaId },
      order: [['name', 'ASC']]
    });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Registrar presença
app.post(
  '/api/presencas',
  [
    body('alunoId').isInt().toInt(),
    body('data').isISO8601().toDate(),
    body('presente').isBoolean()
  ],
  async (req, res) => {
    try {
      const { alunoId, date, presente } = req.body;
      console.log({
        alunoId,
        date,
        presente
      })

      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(alunoId);
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // Atualiza ou cria o registro de presença
      const [attendance, created] = await Presenca.upsert(
        {
          AlunoId: alunoId,
          date: date,
          present: presente
        },
        {
          where: {
            AlunoId: alunoId,
            date: date
          },
          returning: true
        }
      );

      res.status(created ? 201 : 200).json(attendance);
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      res.status(400).json({ error: error.message || error });
    }
  }
);

// Buscar presenças de uma turma em uma data específica
app.get('/api/turmas/:turmaId/presencas', async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.status(400).json({ error: 'Parâmetro "data" é obrigatório' });
    }

    const presencas = await Presenca.findAll({
      include: [{
        model: Aluno,
        where: { TurmaId: req.params.turmaId },
        attributes: ['id', 'name']
      }],
      where: { date: data },
      attributes: ['id', 'present', 'date']
    });

    res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
});

// Buscar presenças de um aluno específico
app.get('/api/alunos/:alunoId/presencas', async (req, res) => {
  try {
    const { data } = req.query;

    const whereClause = {
      AlunoId: req.params.alunoId
    };

    if (data) {
      whereClause.date = data;
    }

    const presencas = await Presenca.findAll({
      where: whereClause,
      include: [{
        model: Aluno,
        attributes: ['id', 'name']
      }],
      attributes: ['id', 'present', 'date'],
      order: [['date', 'DESC']]
    });

    // Calcular estatísticas
    const totalRegistros = presencas.length;
    const totalPresencas = presencas.filter(p => p.present).length;
    const frequencia = totalRegistros > 0
      ? Math.round((totalPresencas / totalRegistros) * 100)
      : 0;

    res.json({
      aluno: presencas[0]?.Student || {},
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
});

app.get('/api/presencas', async (req, res) => {
  try {
    const presencas = await Presenca.findAll();
    res.json(presencas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3002;

// Sincronizar o banco de dados e iniciar o servidor
sequelize.sync({ force: true })
  .then(() => {
    console.log('Banco de dados sincronizado');
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse a documentação em: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(error => {
    console.error('Erro ao sincronizar o banco de dados:', error);
  });

// Documentação da API
app.get('/api-docs', (req, res) => {
  const docs = `
    <h1>Documentação da API de Controle de Frequência Escolar</h1>
    <h2>Endpoints disponíveis:</h2>
    
    <h3>Escolas</h3>
    <p><strong>GET /api/escolas</strong> - Lista todas as escolas</p>
    
    <h3>Turmas</h3>
    <p><strong>GET /api/escolas/:escolaId/turmas</strong> - Lista turmas de uma escola</p>
    
    <h3>Alunos</h3>
    <p><strong>GET /api/turmas/:turmaId/alunos</strong> - Lista alunos de uma turma</p>
    
    <h3>Presenças</h3>
    <p><strong>POST /api/presencas</strong> - Registrar/atualizar presença de um aluno</p>
    <p>Exemplo de corpo da requisição:</p>
    <pre>{
      "alunoId": 1,
      "data": "2023-12-01",
      "presente": true
    }</pre>
    
    <p><strong>GET /api/turmas/:turmaId/presencas?data=YYYY-MM-DD</strong> - Buscar presenças de uma turma em uma data específica</p>
     
    <p><strong>GET /api/alunos/:alunoId/presencas?data=YYYY-MM-DD</strong> - Buscar presenças de um aluno em uma data específica</p>
     
    <h4>Dados de Teste</h4>
    <p>O sistema já vem com dados de teste pré-cadastrados, incluindo:</p>
    <ul>
      <li>2 escolas</li>
      <li>3 turmas por escola (6 no total)</li>
      <li>10 alunos por turma (60 no total)</li>
    </ul>
  `;
  res.send(docs);
});

// Rota padrão
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});
