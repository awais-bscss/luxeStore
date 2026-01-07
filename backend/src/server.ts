import app from './app';
import config from './config';
import connectDB from './config/database';

const PORT = config.port;

// Start server first (so API is accessible even without DB)
const server = app.listen(PORT, () => {
  console.log(`
Port: ${PORT.toString().padEnd(43)}
URL: http://localhost:${PORT.toString().padEnd(30)}
`);

  // Connect to database after server starts
  connectDB().catch((error) => {
    console.error('\n⚠️  WARNING: MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\n📝 Server is running but database features won\'t work.');
    console.error('💡 To fix this:');
    console.error('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
    console.error('   2. Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    console.error('   3. Update MONGODB_URI in .env file');
    console.error('   4. Restart the server\n');
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});
