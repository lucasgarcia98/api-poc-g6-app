const express = require('express');
const router = express.Router();
const escolaController = require('../controllers/escolaController');

/**
 * @swagger
 * tags:
 *   name: Escolas
 *   description: Gerenciamento de escolas
 */


/**
 * @swagger
 * /escolas/{escolaId}/turmas:
 *   get:
 *     summary: Lista turmas de uma escola
 *     description: Retorna todas as turmas de uma escola específica
 *     tags: [Escolas]
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
router.get('/:escolaId/turmas', escolaController.listarTurmasByEscolaId);

/**
 * @swagger
 * /escolas:
 *   get:
 *     summary: Lista todas as escolas
 *     description: Retorna uma lista de escolas, com opção de filtrar por status de sincronização
 *     tags: [Escolas]
 *     parameters:
 *       - $ref: '#/components/parameters/syncedParam'
 *     responses:
 *       200:
 *         description: Lista de escolas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Escola'
 */
router.get('/', escolaController.listarEscolas);

/**
 * @swagger
 * /escolas:
 *   post:
 *     summary: Cria ou atualiza uma escola
 *     description: Cria uma nova escola ou atualiza uma existente se o ID for fornecido
 *     tags: [Escolas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da escola (opcional para atualização)
 *               name:
 *                 type: string
 *                 description: Nome da escola
 *               address:
 *                 type: string
 *                 description: Endereço completo da escola
 *               synced:
 *                 type: boolean
 *                 description: Indica se o registro foi sincronizado
 *                 default: false
 *     responses:
 *       201:
 *         description: Escola criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Escola'
 *       200:
 *         description: Escola atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Escola'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', escolaController.salvarEscola);

/**
 * @swagger
 * /escolas/sync:
 *   post:
 *     summary: Marca escolas como sincronizadas
 *     description: Atualiza o status de sincronização para múltiplas escolas
 *     tags: [Escolas]
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
 *                 description: Lista de IDs das escolas a serem marcadas como sincronizadas
 *     responses:
 *       200:
 *         description: Número de escolas atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: '2 escolas marcadas como sincronizadas'
 */
router.post('/sync', escolaController.sincronizarEscolas);

module.exports = router;
