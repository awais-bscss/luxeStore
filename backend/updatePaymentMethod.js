// Script to update payment method from PayPal to COD
// Run this with: node updatePaymentMethod.js

const mongoose = require('mongoose');

// MongoDB connection string - UPDATE THIS with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxestore';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    updatePaymentMethods();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Define Order schema (minimal version for update)
const orderSchema = new mongoose.Schema({
  paymentMethod: String,
  orderNumber: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

async function updatePaymentMethods() {
  try {
    console.log('\n🔄 Starting payment method update...\n');

    // Find all orders with PayPal payment method
    const paypalOrders = await Order.find({ paymentMethod: 'paypal' });
    
    console.log(`📊 Found ${paypalOrders.length} orders with PayPal payment method\n`);

    if (paypalOrders.length === 0) {
      console.log('✅ No orders to update. All done!');
      process.exit(0);
    }

    // Update all PayPal orders to COD
    const result = await Order.updateMany(
      { paymentMethod: 'paypal' },
      { $set: { paymentMethod: 'cod' } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} orders`);
    console.log(`   - Changed from: paypal`);
    console.log(`   - Changed to: cod (Cash on Delivery)\n`);

    // Verify the update
    const remainingPaypal = await Order.countDocuments({ paymentMethod: 'paypal' });
    const codOrders = await Order.countDocuments({ paymentMethod: 'cod' });

    console.log('📊 Current status:');
    console.log(`   - PayPal orders: ${remainingPaypal}`);
    console.log(`   - COD orders: ${codOrders}\n`);

    console.log('✅ Update complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating payment methods:', error);
    process.exit(1);
  }
}
