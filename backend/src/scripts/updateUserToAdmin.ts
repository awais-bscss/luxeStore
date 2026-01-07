import mongoose from 'mongoose';
import User from '../models/User.model';
import config from '../config';

async function updateUserToAdmin() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    // Update the user with email a4@gmail.com to admin
    const result = await User.findOneAndUpdate(
      { email: 'a4@gmail.com' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log('✅ User updated successfully:');
      console.log({
        name: result.name,
        email: result.email,
        role: result.role,
      });
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserToAdmin();
