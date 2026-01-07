/**
 * Migration Script: Add shippingMethod to existing orders
 * 
 * This script updates all orders that don't have a shippingMethod field
 * and sets them to 'standard' as the default.
 * 
 * Run this once to fix old orders created before the shippingMethod field was added.
 */

import mongoose from 'mongoose';
import Order from '../models/Order.model';
import config from '../config';

async function migrateOrders() {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to database');

    // Find orders without shippingMethod
    const ordersToUpdate = await Order.find({
      shippingMethod: { $exists: false }
    });

    console.log(`📦 Found ${ordersToUpdate.length} orders to update`);

    if (ordersToUpdate.length === 0) {
      console.log('✅ All orders already have shippingMethod field');
      process.exit(0);
    }

    // Update all orders to have standard shipping as default
    const result = await Order.updateMany(
      { shippingMethod: { $exists: false } },
      { $set: { shippingMethod: 'standard' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} orders`);
    console.log('✅ Migration completed successfully!');

    // Show sample of updated orders
    const sampleOrders = await Order.find({})
      .select('orderNumber shippingMethod orderStatus')
      .limit(5);

    console.log('\n📋 Sample of orders:');
    sampleOrders.forEach(order => {
      console.log(`  - ${order.orderNumber}: ${order.shippingMethod} (${order.orderStatus})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateOrders();
