const express = require('express');
const router = express.Router();
const registroInvalidoController = require('../controllers/registroInvalidoController');

/**
 * @swagger
 * tags:
 *   name: Registros Inválidos
 *   description: Gerenciamento de registros com dados inválidos
 */

/**
 * @swagger
 * /registros-invalidos:
 *   get:
 *     summary: Lista todos os registros inválidos
 *     description: Retorna uma lista de todos os registros inválidos, com opção de filtrar por status de resolução e tabela de origem
 *     tags: [Registros Inválidos]
 *     parameters:
 *       - in: query
 *         name: resolvido
 *         schema:
 *           type: boolean
 *         description: Filtrar por status de resolução (true/false)
 *       - in: query
 *         name: tabelaOrigem
 *         schema:
 *           type: string
 *         description: Filtrar por tabela de origem (ex: Aluno, Turma, etc)
 *     responses:
 *       200:
 *         description: Lista de registros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroInvalido'
 */
router.get('/', registroInvalidoController.listarRegistrosInvalidos);

/**
 * @swagger
 * /registros-invalidos/{id}:
 *   get:
 *     summary: Obtém um registro inválido pelo ID
 *     tags: [Registros Inválidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro inválido
 *     responses:
 *       200:
 *         description: Dados do registro inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroInvalido'
 *       404:
 *         description: Registro não encontrado
 */
router.get('/:id', registroInvalidoController.obterRegistroInvalido);

/**
 * @swagger
 * /registros-invalidos:
 *   post:
 *     summary: Cria um novo registro de dado inválido
 *     tags: [Registros Inválidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoRegistroInvalido'
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroInvalido'
 *       400:
 *         description: Dados inválidos fornecidos
 */
router.post('/', registroInvalidoController.criarRegistroInvalido);

/**
 * @swagger
 * /registros-invalidos/{id}:
 *   put:
 *     summary: Atualiza um registro inválido
 *     tags: [Registros Inválidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro inválido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarRegistroInvalido'
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroInvalido'
 *       400:
 *         description: Dados inválidos fornecidos
 *       404:
 *         description: Registro não encontrado
 */
router.put('/:id', ...registroInvalidoController.atualizarRegistroInvalido);

/**
 * @swagger
 * /registros-invalidos/{id}:
 *   delete:
 *     summary: Remove um registro inválido (soft delete)
 *     tags: [Registros Inválidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro inválido a ser removido
 *     responses:
 *       204:
 *         description: Registro removido com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/:id', registroInvalidoController.excluirRegistroInvalido);

// Esquemas Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     RegistroInvalido:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do registro
 *         tabelaOrigem:
 *           type: string
 *           description: Nome da tabela de origem do registro inválido
 *         dadosOriginais:
 *           type: object
 *           description: Dados originais do registro em formato JSON
 *         motivo:
 *           type: string
 *           description: Descrição do motivo pelo qual o registro é inválido
 *         resolvido:
 *           type: boolean
 *           description: Indica se o problema foi resolvido
 *         dataCorrecao:
 *           type: string
 *           format: date-time
 *           description: Data em que o problema foi resolvido
 *         observacoes:
 *           type: string
 *           description: Observações adicionais sobre a correção
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Data de remoção do registro (soft delete)
 * 
 *     NovoRegistroInvalido:
 *       type: object
 *       required:
 *         - tabelaOrigem
 *         - dadosOriginais
 *         - motivo
 *       properties:
 *         tabelaOrigem:
 *           type: string
 *           description: Nome da tabela de origem do registro inválido
 *         dadosOriginais:
 *           type: object
 *           description: Dados originais do registro em formato JSON
 *         motivo:
 *           type: string
 *           description: Descrição do motivo pelo qual o registro é inválido
 *         observacoes:
 *           type: string
 *           description: Observações adicionais sobre o registro inválido
 * 
 *     AtualizarRegistroInvalido:
 *       type: object
 *       properties:
 *         resolvido:
 *           type: boolean
 *           description: Indica se o problema foi resolvido
 *         observacoes:
 *           type: string
 *           description: Observações adicionais sobre a correção
 */

module.exports = router;
