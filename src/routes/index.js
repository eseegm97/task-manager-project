import { Router } from 'express';
import categoryRoutes from './categoryRoutes.js';
import taskRoutes from './taskRoutes.js';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/tasks', taskRoutes);

export default router;
