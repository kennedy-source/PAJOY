"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const setupSwagger = (app) => {
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
    const specs = (0, swagger_jsdoc_1.default)(options);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map