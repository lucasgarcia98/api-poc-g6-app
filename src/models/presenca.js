module.exports = (sequelize, DataTypes) => {
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
    },
    AlunoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Alunos',
        key: 'id'
      }
    },
    synced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Presencas',
    timestamps: true,
  });

  return Presenca;
};
