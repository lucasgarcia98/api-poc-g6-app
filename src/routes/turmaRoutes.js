const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');

/**
 * @swagger
 * tags:
 *   name: Turmas
 *   description: Gerenciamento de turmas
 */

/**
 * @swagger
 * /turmas/{turmaId}/alunos:
 *   get:
 *     summary: Lista alunos de uma turma
 *     description: Retorna todos os alunos de uma turma específica
 *     tags: [Turmas]
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
router.get('/:turmaId/alunos', turmaController.listarAlunosByTurmaId);

/**
 * @swagger
 * /turmas:
 *   post:
 *     summary: Cria ou atualiza uma turma
 *     description: Cria uma nova turma ou atualiza uma existente se o ID for fornecido
 *     tags: [Turmas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - escolaId
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da turma (opcional para atualização)
 *               name:
 *                 type: string
 *                 description: Nome da turma
 *               escolaId:
 *                 type: integer
 *                 description: ID da escola à qual a turma pertence
 *               synced:
 *                 type: boolean
 *                 description: Indica se o registro foi sincronizado
 *                 default: false
 *     responses:
 *       201:
 *         description: Turma criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turma'
 *       200:
 *         description: Turma atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turma'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Escola não encontrada
 */
router.post('/', turmaController.salvarTurma);

/**
 * @swagger
 * /turmas/sync:
 *   post:
 *     summary: Marca turmas como sincronizadas
 *     description: Atualiza o status de sincronização para múltiplas turmas
 *     tags: [Turmas]
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
 *                 description: Lista de IDs das turmas a serem marcadas como sincronizadas
 *     responses:
 *       200:
 *         description: Número de turmas atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '3 turmas marcadas como sincronizadas'
 */
router.post('/sync', turmaController.sincronizarTurmas);

/**
 * @swagger
 * /turmas/{escolaId}/turmas:
 *   get:
 *     summary: Lista turmas de uma escola
 *     description: Retorna todas as turmas de uma escola específica
 *     tags: [Turmas]
 *     parameters:
 *       - $ref: '#/components/parameters/escolaIdParam'
 *       - $ref: '#/components/parameters/syncedParam'
 *     responses:
 *       200:
 *         description: Lista de turmas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turma'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/escolas/:escolaId', turmaController.listarTurmasByEscolaId);


/**
 * @swagger
 * /turmas:
 *   get:
 *     summary: Lista todas as turmas
 *     description: Retorna uma lista de todas as turmas, com opção de filtrar por status de sincronização
 *     tags: [Turmas]
 *     parameters:
 *       - $ref: '#/components/parameters/syncedParam'
 *     responses:
 *       200:
 *         description: Lista de turmas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turma'
 */
router.get('/', turmaController.listarTodasTurmas);

module.exports = router;
