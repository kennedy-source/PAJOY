const express = require('express');
const router = express.Router();
const db = require('../db');
const pesapalService = require('../services/pesapalService');

/**
 * Health check endpoint for monitoring backend status
 */
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      ok: true,
      service: 'pajoy-pos-backend',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: false,
        checked_at: null
      },
      pesapal: {
        configured: false,
        token_available: false
      },
      endpoints: {
        api: true,
        database: false,
        payment_gateway: false
      }
    };

    // Check database connection
    try {
      const result = db.prepare("SELECT 1 as test").get();
      healthCheck.database.connected = !!result;
      healthCheck.database.checked_at = new Date().toISOString();
      healthCheck.endpoints.database = true;
    } catch (dbError) {
      healthCheck.database.connected = false;
      healthCheck.database.error = dbError.message;
      healthCheck.ok = false;
    }

    // Check Pesapal configuration
    healthCheck.pesapal.configured = !!(pesapalService.consumerKey && pesapalService.consumerSecret);
    healthCheck.pesapal.token_available = !!pesapalService.tokenCache;
    healthCheck.endpoints.payment_gateway = healthCheck.pesapal.configured;

    // Check if all critical services are healthy
    const criticalServices = [
      healthCheck.database.connected,
      healthCheck.pesapal.configured
    ];
    
    const allCriticalHealthy = criticalServices.every(service => service === true);
    healthCheck.ok = healthCheck.ok && allCriticalHealthy;

    const statusCode = healthCheck.ok ? 200 : 503;
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      ok: false,
      service: 'pajoy-pos-backend',
      timestamp: new Date().toISOString(),
      error: error.message,
      endpoints: {
        api: false,
        database: false,
        payment_gateway: false
      }
    });
  }
});

/**
 * Detailed health check with system information
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailed = {
      ok: true,
      service: 'pajoy-pos-backend',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      node_version: process.version,
      database: {
        connected: false,
        checked_at: null,
        tables: [],
        size: null
      },
      pesapal: {
        configured: false,
        token_available: false,
        token_expiry: null,
        base_url: process.env.PESAPAL_BASE_URL
      },
      endpoints: {
        api: true,
        database: false,
        payment_gateway: false
      },
      system: {
        free_memory: require('os').freemem(),
        total_memory: require('os').totalmem(),
        load_average: require('os').loadavg()
      }
    };

    // Check database connection and get table info
    try {
      const result = db.prepare("SELECT 1 as test").get();
      detailed.database.connected = !!result;
      detailed.database.checked_at = new Date().toISOString();
      detailed.endpoints.database = true;

      // Get table information
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      detailed.database.tables = tables.map(t => t.name);

      // Get database size
      try {
        const size = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get();
        detailed.database.size = size.size;
      } catch (sizeError) {
        detailed.database.size = null;
      }

    } catch (dbError) {
      detailed.database.connected = false;
      detailed.database.error = dbError.message;
      detailed.ok = false;
    }

    // Check Pesapal configuration
    detailed.pesapal.configured = !!(pesapalService.consumerKey && pesapalService.consumerSecret);
    detailed.pesapal.token_available = !!pesapalService.tokenCache;
    detailed.pesapal.token_expiry = pesapalService.tokenExpiry;
    detailed.endpoints.payment_gateway = detailed.pesapal.configured;

    // Check if all critical services are healthy
    const criticalServices = [
      detailed.database.connected,
      detailed.pesapal.configured
    ];
    
    const allCriticalHealthy = criticalServices.every(service => service === true);
    detailed.ok = detailed.ok && allCriticalHealthy;

    const statusCode = detailed.ok ? 200 : 503;
    res.status(statusCode).json(detailed);

  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      ok: false,
      service: 'pajoy-pos-backend',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Readiness probe - checks if backend is ready to serve requests
 */
router.get('/ready', async (req, res) => {
  try {
    // Quick checks for readiness
    const dbCheck = db.prepare("SELECT 1 as test").get();
    const pesapalConfigured = !!(pesapalService.consumerKey && pesapalService.consumerSecret);
    
    const ready = !!dbCheck && pesapalConfigured;
    
    res.status(ready ? 200 : 503).json({
      ready: ready,
      timestamp: new Date().toISOString(),
      checks: {
        database: !!dbCheck,
        pesapal: pesapalConfigured
      }
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Liveness probe - checks if backend is alive
 */
router.get('/alive', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
});

module.exports = router;
