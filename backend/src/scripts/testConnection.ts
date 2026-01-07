import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxestore';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  console.log(`Connection URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful!\n');

    // Get database info
    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database object is undefined');
      process.exit(1);
    }

    const admin = db.admin();
    const info = await admin.serverInfo();

    console.log('📊 Database Information:');
    console.log(`   Version: ${info.version}`);
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}\n`);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   No collections yet (database is empty)\n');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      console.log('');
    }

    console.log('✨ Everything looks good! You can start the server now.\n');

  } catch (error) {
    console.error('❌ MongoDB connection failed!\n');
    console.error('Error:', (error as Error).message, '\n');

    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check your MONGODB_URI in .env file');
    console.log('   3. For MongoDB Atlas, whitelist your IP address');
    console.log('   4. Verify your credentials are correct\n');

    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
