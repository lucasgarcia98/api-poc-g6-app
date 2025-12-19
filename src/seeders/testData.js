// src/seeders/testData.js
const { Escola, Turma, Aluno, Presenca } = require('../config/database');
const { faker } = require('@faker-js/faker');
const { Op } = require('sequelize');

async function gerarDadosTeste() {
  try {
    //limpar base
    // await Presenca.destroy({ where: {} });
    // await Aluno.destroy({ where: {} });
    // await Turma.destroy({ where: {} });
    // await Escola.destroy({ where: {} });

    console.log('Gerando dados de teste...');

    //criar um numero aleatorio de escolas de 3 a 10
    // const escolasCount = faker.number.int({ min: 10, max: 20 });
    // const escola = await Escola.create({
    //   name: `Escola TESTE CARGA`,
    //   address: faker.location.streetAddress(),
    //   synced: false
    // });

    // Cria turmas para cada escola
    await Promise.all(Array.from({ length: faker.number.int({ min: 2, max: 2 }) }, async (_, i) => {
      const turma = await Turma.create({
        name: `TURMAS ESCOLA TESTE CARGA º Ano ${String.fromCharCode(64 + i)}`, // 1º A, 1º B, etc.
        EscolaId: 1,
        synced: false
      }, {
        include: [
          {
            model: Escola,
            attributes: ['id', 'name', 'address']
          }
        ]
      });

      // Cria alunos para cada turma
      await Promise.all(Array.from({ length: faker.number.int({ min: 50, max: 80 }) }, async (_, j) => {
        await Aluno.create({
          name: faker.person.fullName(),
          TurmaId: turma.id,
          synced: false
        });
      }));
    }));

    console.log('Dados de teste gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar dados de teste:', error);
    throw error;
  }
}

module.exports = { gerarDadosTeste };
