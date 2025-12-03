const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// Import models
const Escola = require('../models/escola')(sequelize, DataTypes);
const Turma = require('../models/turma')(sequelize, DataTypes);
const Aluno = require('../models/aluno')(sequelize, DataTypes);
const Presenca = require('../models/presenca')(sequelize, DataTypes);
const RegistroInvalido = require('../models/registroInvalido')(sequelize, DataTypes);

// Define relationships
Turma.belongsTo(Escola, { foreignKey: 'EscolaId' });
Escola.hasMany(Turma, { foreignKey: 'EscolaId' });

Aluno.belongsTo(Turma, { foreignKey: 'TurmaId' });
Turma.hasMany(Aluno, { foreignKey: 'TurmaId' });

Presenca.belongsTo(Aluno, { foreignKey: 'AlunoId' });
Aluno.hasMany(Presenca, { foreignKey: 'AlunoId' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  Escola,
  Turma,
  Aluno,
  Presenca,
  RegistroInvalido
};
