module.exports = (sequelize, DataTypes) => {
  const Turma = sequelize.define('Turma', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EscolaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Escolas',
        key: 'id'
      }
    },
    synced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Turmas',
    timestamps: true
  });

  return Turma;
};
