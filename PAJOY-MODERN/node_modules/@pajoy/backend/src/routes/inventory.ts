import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'Inventory endpoint - to be implemented' });
}));

export default router;
