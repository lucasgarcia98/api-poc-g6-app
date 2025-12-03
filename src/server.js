const { sequelize } = require('./config/database');
const app = require('./app');
const { gerarDadosTeste } = require('./seeders/testData');

const PORT = process.env.PORT || 3002;

// Sincroniza o banco de dados e inicia o servidor
async function startServer() {
  try {
    // Sincroniza os modelos com o banco de dados
    await sequelize.sync({ force: false }); // Defina como true para recriar as tabelas
    
    // Gera dados de teste (opcional)
    // await gerarDadosTeste();
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse a documentação em: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
    process.exit(1);
  }
}

startServer();