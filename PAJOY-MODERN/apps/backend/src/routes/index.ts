import { Express } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import productRoutes from './products';
import customerRoutes from './customers';
import salesRoutes from './sales';
import embroideryRoutes from './embroidery';
import printingRoutes from './printing';
import reportsRoutes from './reports';
import pesapalRoutes from './pesapal';
import syncRoutes from './sync';
import settingsRoutes from './settings';
import inventoryRoutes from './inventory';

export const setupRoutes = (app: Express): void => {
  // API versioning
  const API_VERSION = '/api/v1';

  // Health check (no versioning)
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'PAJOY Backend API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use(`${API_VERSION}/auth`, authRoutes);
  app.use(`${API_VERSION}/users`, userRoutes);
  app.use(`${API_VERSION}/products`, productRoutes);
  app.use(`${API_VERSION}/customers`, customerRoutes);
  app.use(`${API_VERSION}/sales`, salesRoutes);
  app.use(`${API_VERSION}/embroidery`, embroideryRoutes);
  app.use(`${API_VERSION}/printing`, printingRoutes);
  app.use(`${API_VERSION}/reports`, reportsRoutes);
  app.use(`${API_VERSION}/pesapal`, pesapalRoutes);
  app.use(`${API_VERSION}/sync`, syncRoutes);
  app.use(`${API_VERSION}/settings`, settingsRoutes);
  app.use(`${API_VERSION}/inventory`, inventoryRoutes);

  // Legacy API routes (for backward compatibility)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/embroidery', embroideryRoutes);
  app.use('/api/printing', printingRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/pesapal', pesapalRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/inventory', inventoryRoutes);
};
