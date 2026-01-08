import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * Health check endpoint - publicly accessible
 * Checks database connection status
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const isConnected = dbState === 1;

    // Try to ping the database
    let dbPingSuccess = false;
    if (isConnected) {
      try {
        await mongoose.connection.db.admin().ping();
        dbPingSuccess = true;
      } catch (pingError) {
        console.error('Database ping failed:', pingError);
      }
    }

    const healthStatus = {
      status: isConnected && dbPingSuccess ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        state: states[dbState as keyof typeof states] || 'unknown',
        stateCode: dbState,
        connected: isConnected,
        pingSuccess: dbPingSuccess,
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...',
      },
      uptime: process.uptime(),
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus,
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
