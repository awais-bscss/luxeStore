import mongoose from 'mongoose';
import User from '../models/User.model';
import config from '../config';
import { USER_ROLES } from '../constants';

const createAdminUser = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxestore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);

      if (existingAdmin.role !== USER_ROLES.ADMIN) {
        existingAdmin.role = USER_ROLES.ADMIN;
        await existingAdmin.save();
        console.log('✅ Updated existing user to Admin role');
      }
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: USER_ROLES.ADMIN,
        isEmailVerified: true,
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔑 Role:', admin.role);
      console.log('🆔 ID:', admin._id);
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUser();
