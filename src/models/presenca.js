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
    }
  }, {
    tableName: 'Presencas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['AlunoId', 'date']
      }
    ]
  });

  return Presenca;
};
