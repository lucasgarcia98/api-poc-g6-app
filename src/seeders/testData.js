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
    const escolasCount = faker.number.int({ min: 3, max: 10 });
    for (let i = 1; i <= escolasCount; i++) {
      const escola = await Escola.create({
        name: `Escola ${i}`,
        address: faker.location.streetAddress(),
        synced: false
      });
      
      // Cria turmas para cada escola
      await Promise.all(Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, async (_, i) => {
        const turma = await Turma.create({
          name: `${i}º Ano ${String.fromCharCode(64 + i)}`, // 1º A, 1º B, etc.
          EscolaId: escola.id,
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
        await Promise.all(Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, async (_, j) => {
          await Aluno.create({
            name: faker.person.fullName(),
            TurmaId: turma.id,
            synced: false
          });
        }));
      }));
    }

    console.log('Dados de teste gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar dados de teste:', error);
    throw error;
  }
}

module.exports = { gerarDadosTeste };
