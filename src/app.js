import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import categoryRoutes from './routes/categoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
	res.json({ message: 'Task Manager API' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
