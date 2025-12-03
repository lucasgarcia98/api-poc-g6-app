const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Controle de Frequência Escolar',
      version: '1.0.0',
      description: 'API para gerenciamento de escolas, turmas, alunos e presenças',
      contact: {
        name: 'Suporte',
        email: 'suporte@escola.com',
        url: 'https://escola.com/suporte'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.escola.com/v1',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Escola: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Escola Municipal São Paulo' },
            address: { type: 'string', example: 'Rua das Flores, 123 - Centro, São Paulo/SP' },
            synced: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' }
          }
        },
        Turma: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '1º Ano A' },
            EscolaId: { type: 'integer', example: 1 },
            synced: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' }
          }
        },
        Aluno: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João da Silva' },
            TurmaId: { type: 'integer', example: 1 },
            synced: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' }
          }
        },
        Presenca: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date', example: '2023-12-01' },
            present: { type: 'boolean', example: true },
            AlunoId: { type: 'integer', example: 1 },
            synced: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro' }
          }
        }
      },
      parameters: {
        escolaId: {
          name: 'escolaId',
          in: 'path',
          required: true,
          description: 'ID da escola',
          schema: { type: 'integer' }
        },
        turmaId: {
          name: 'turmaId',
          in: 'path',
          required: true,
          description: 'ID da turma',
          schema: { type: 'integer' }
        },
        alunoId: {
          name: 'alunoId',
          in: 'path',
          required: true,
          description: 'ID do aluno',
          schema: { type: 'integer' }
        },
        data: {
          name: 'data',
          in: 'query',
          description: 'Data no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date' }
        },
        synced: {
          name: 'synced',
          in: 'query',
          description: 'Filtrar por status de sincronização',
          schema: { type: 'boolean' }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso inválido ou não fornecido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Não autorizado'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Recurso não encontrado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Erro de validação',
                details: [
                  {
                    message: 'O campo nome é obrigatório',
                    path: ['name']
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Caminho para os arquivos de rota
};

const specs = swaggerJsdoc(options);
module.exports = specs;
