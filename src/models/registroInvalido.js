module.exports = (sequelize, DataTypes) => {
  const RegistroInvalido = sequelize.define('RegistroInvalido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tabelaOrigem: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nome da tabela de origem do registro inválido (ex: Aluno, Turma, etc)'
    },
    dadosOriginais: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Dados originais do registro em formato JSON',
      get() {
        const rawValue = this.getDataValue('dadosOriginais');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('dadosOriginais', JSON.stringify(value));
      }
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descrição do motivo pelo qual o registro é inválido'
    },
    resolvido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o problema foi resolvido'
    },
    dataCorrecao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data em que o problema foi resolvido'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais sobre a correção'
    }
  }, {
    tableName: 'RegistrosInvalidos',
    timestamps: true,
    paranoid: true
  });

  return RegistroInvalido;
};
