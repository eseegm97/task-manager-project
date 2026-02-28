import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const swaggerSpec = JSON.parse(
	readFileSync(new URL('./docs/swagger-output.json', import.meta.url), 'utf-8')
);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(publicDir));

app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/app', (req, res) => {
	res.sendFile(path.join(publicDir, 'app.html'));
});

app.get('/oauth/callback', (req, res) => {
	res.sendFile(path.join(publicDir, 'callback.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({
		message: err.message || 'Server error'
	});
});

export default app;
