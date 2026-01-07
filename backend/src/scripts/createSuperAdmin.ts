import mongoose from 'mongoose';
import User from '../models/User.model';
import config from '../config';
import { USER_ROLES } from '../constants';

const createSuperAdminUser = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@luxestore.com';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123456';
    const superAdminName = process.env.SUPERADMIN_NAME || 'Super Admin';

    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin user already exists with email:', superAdminEmail);

      if (existingSuperAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        existingSuperAdmin.role = USER_ROLES.SUPER_ADMIN;
        await existingSuperAdmin.save();
        console.log('✅ Updated existing user to Super Admin role');
      }
    } else {
      const superAdmin = await User.create({
        name: superAdminName,
        email: superAdminEmail,
        password: superAdminPassword,
        role: USER_ROLES.SUPER_ADMIN,
        isEmailVerified: true,
      });

      console.log('✅ Super Admin user created successfully!');
      console.log('📧 Email:', superAdmin.email);
      console.log('👤 Name:', superAdmin.name);
      console.log('🔑 Role:', superAdmin.role);
      console.log('🆔 ID:', superAdmin._id);
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createSuperAdminUser();
