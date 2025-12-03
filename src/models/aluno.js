module.exports = (sequelize, DataTypes) => {
  const Aluno = sequelize.define('Aluno', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TurmaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Turmas',
        key: 'id'
      }
    },
    synced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Alunos',
    timestamps: true
  });

  return Aluno;
};
