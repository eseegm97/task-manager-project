import path from 'path';
import { fileURLToPath } from 'url';
import swaggerAutogen from 'swagger-autogen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'Task Manager API',
    description: 'API documentation for the Task Manager project.',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http']
};

const outputFile = path.join(__dirname, 'swagger-output.json');
const endpointsFiles = [
  path.join(__dirname, '../routes/index.js'),
  path.join(__dirname, '../routes/categoryRoutes.js'),
  path.join(__dirname, '../routes/taskRoutes.js'),
  path.join(__dirname, '../app.js')
];

await swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
console.log(`Swagger docs generated at ${outputFile}`);
