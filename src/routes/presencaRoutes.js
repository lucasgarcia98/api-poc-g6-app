const express = require('express');
const router = express.Router();
const presencaController = require('../controllers/presencaController');
const { body } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Presenças
 *   description: Gerenciamento de presenças
 */


/**
 * @swagger
 * /presencas:
 *   get:
 *     summary: Lista todas as presenças
 *     description: Retorna uma lista de todas as presenças
 *     tags: [Presenças]
 *     responses:
 *       200:
 *         description: Lista de presenças retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
 */
router.get('/', presencaController.listarPresencas);


/**
 * @swagger
 * /presencas:
 *   post:
 *     summary: Registra ou atualiza uma presença
 *     description: Registra a presença de um aluno em uma data específica
 *     tags: [Presenças]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - AlunoId
 *               - date
 *               - presente
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da presença (opcional para atualização)
 *               AlunoId:
 *                 type: integer
 *                 description: ID do aluno
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Data da presença no formato YYYY-MM-DD
 *               presente:
 *                 type: boolean
 *                 description: Indica se o aluno estava presente
 *               synced:
 *                 type: boolean
 *                 description: Indica se o registro foi sincronizado
 *                 default: false
 *               observacao:
 *                 type: string
 *                 description: Observação sobre a presença
 *     responses:
 *       201:
 *         description: Presença registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presenca'
 *       200:
 *         description: Presença atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presenca'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Aluno não encontrado
 */
router.post('/', presencaController.registrarPresenca);

/**
 * @swagger
 * /turmas/{turmaId}/presencas:
 *   get:
 *     summary: Lista presenças de uma turma
 *     description: Retorna as presenças de todos os alunos de uma turma em uma data específica
 *     tags: [Presenças]
 *     parameters:
 *       - $ref: '#/components/parameters/turmaIdParam'
 *       - $ref: '#/components/parameters/dateParam'
 *     responses:
 *       200:
 *         description: Lista de presenças retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   present:
 *                     type: boolean
 *                   date:
 *                     type: string
 *                     format: date
 *                   synced:
 *                     type: boolean
 *                   Aluno:
 *                     $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Parâmetro de data inválido ou ausente
 */
router.get('/turmas/:turmaId/presencas', presencaController.listarPresencasTurma);

/**
 * @swagger
 * /alunos/{alunoId}/presencas:
 *   get:
 *     summary: Lista histórico de presenças de um aluno
 *     description: Retorna o histórico de presenças de um aluno específico
 *     tags: [Presenças]
 *     parameters:
 *       - $ref: '#/components/parameters/alunoIdParam'
 *       - name: data
 *         in: query
 *         description: Filtrar por data específica (opcional)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Histórico de presenças retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presencas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Presenca'
 *                 estatisticas:
 *                   type: object
 *                   properties:
 *                     totalRegistros:
 *                       type: integer
 *                     totalPresencas:
 *                       type: integer
 *                     totalFaltas:
 *                       type: integer
 *                     frequencia:
 *                       type: string
 */
router.get('/alunos/:alunoId', presencaController.listarPresencasAluno);

/**
 * @swagger
 * /presencas/sync:
 *   post:
 *     summary: Marca presenças como sincronizadas
 *     description: Atualiza o status de sincronização para múltiplas presenças
 *     tags: [Presenças]
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
 *                 description: Lista de IDs das presenças a serem marcadas como sincronizadas
 *     responses:
 *       200:
 *         description: Número de presenças atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '10 presenças marcadas como sincronizadas'
 */
router.post('/sync', presencaController.sincronizarPresencas);

/**
 * @swagger
 * /presencas/batch:
 *   post:
 *     summary: Salva presenças em lote
 *     description: Registra múltiplas presenças de uma só vez
 *     tags: [Presenças]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - presencas
 *             properties:
 *               presencas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - AlunoId
 *                     - date
 *                     - present
 *                   properties:
 *                     AlunoId:
 *                       type: integer
 *                       description: ID do aluno
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Data da presença no formato YYYY-MM-DD
 *                     present:
 *                       type: boolean
 *                       description: Indica se o aluno estava presente
 *                     synced:
 *                       type: boolean
 *                       description: Indica se o registro foi sincronizado
 *                       default: true
 *                     observacao:
 *                       type: string
 *                       description: Observação sobre a presença
 *     responses:
 *       201:
 *         description: Presenças salvas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sucessos:
 *                   type: array
 *                   items:
 *                     type: object
 *                 falhas:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalProcessadas:
 *                   type: integer
 *                 totalSucessos:
 *                   type: integer
 *                 totalFalhas:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/batch', presencaController.salvarPresencasBatch);

module.exports = router;
