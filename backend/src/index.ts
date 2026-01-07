import app from './app';
import connectDB from './config/database';

// Initialize database connection
// In Vercel serverless functions, this will run on cold starts
connectDB().catch(err => {
  console.error('Database connection error in Vercel function:', err);
});

export default app;
