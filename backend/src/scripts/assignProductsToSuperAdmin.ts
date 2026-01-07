import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model';
import User from '../models/User.model';

dotenv.config();

const assignProductsToSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxestore');
    console.log('✅ Connected to MongoDB');

    // Find the superadmin user
    const superAdmin = await User.findOne({ role: 'superadmin' });

    if (!superAdmin) {
      console.log('❌ No superadmin found. Please create a superadmin first.');
      process.exit(1);
    }

    console.log(`✅ Found superadmin: ${superAdmin.name} (${superAdmin.email})`);

    // Update all products without a createdBy field
    const result = await Product.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: superAdmin._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log(`   Assigned to: ${superAdmin.name}`);

    // Show updated products
    const updatedProducts = await Product.find({ createdBy: superAdmin._id })
      .select('name createdBy')
      .populate('createdBy', 'name email');

    console.log('\n📦 Products now assigned to superadmin:');
    updatedProducts.forEach((product: any, index: number) => {
      console.log(`   ${index + 1}. ${product.name} - Created by: ${product.createdBy?.name || 'Unknown'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignProductsToSuperAdmin();
