import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express): void => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PAJOY Backend API',
        version: '2.0.0',
        description: 'Production-ready API for PAJOY Uniforms Management System',
        contact: {
          name: 'PAJOY Support',
          email: 'info@pajoyuniforms.co.ke',
        },
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://your-app.railway.app' 
            : `http://localhost:${process.env.PORT || 5179}`,
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
  };

  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
