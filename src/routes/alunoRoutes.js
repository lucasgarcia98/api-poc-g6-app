const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

/**
 * @swagger
 * tags:
 *   name: Alunos
 *   description: Gerenciamento de alunos
 */


/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     description: Retorna uma lista de todos os alunos, com opção de filtrar por status de sincronização
 *     tags: [Alunos]
 *     parameters:
 *       - $ref: '#/components/parameters/syncedParam'
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aluno'
 */
router.get('/', alunoController.listarTodosAlunos);


/**
 * @swagger
 * /turmas/{turmaId}/alunos:
 *   get:
 *     summary: Lista alunos de uma turma
 *     description: Retorna todos os alunos de uma turma específica
 *     tags: [Alunos]
 *     parameters:
 *       - $ref: '#/components/parameters/turmaIdParam'
 *       - $ref: '#/components/parameters/syncedParam'
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aluno'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/turmas/:turmaId', alunoController.listarAlunosByTurmaId);

/**
 * @swagger
 * /alunos:
 *   post:
 *     summary: Cria ou atualiza um aluno
 *     description: Cria um novo aluno ou atualiza um existente se o ID for fornecido
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - turmaId
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do aluno (opcional para atualização)
 *               name:
 *                 type: string
 *                 description: Nome completo do aluno
 *               turmaId:
 *                 type: integer
 *                 description: ID da turma à qual o aluno pertence
 *               synced:
 *                 type: boolean
 *                 description: Indica se o registro foi sincronizado
 *                 default: false
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Turma não encontrada
 */
router.post('/', alunoController.salvarAluno);

/**
 * @swagger
 * /alunos/sync:
 *   post:
 *     summary: Marca alunos como sincronizados
 *     description: Atualiza o status de sincronização para múltiplos alunos
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Lista de IDs dos alunos a serem marcados como sincronizados
 *     responses:
 *       200:
 *         description: Número de alunos atualizados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '5 alunos marcados como sincronizados'
 */
router.post('/sync', alunoController.sincronizarAlunos);

module.exports = router;
