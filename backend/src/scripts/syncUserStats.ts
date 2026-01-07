import mongoose from 'mongoose';
import User from '../models/User.model';
import Order from '../models/Order.model';

const syncUserStats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxestore');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({ role: 'user' });
    console.log(`Found ${users.length} users to sync`);

    for (const user of users) {
      // Get all orders for this user (excluding cancelled)
      const orders = await Order.find({
        user: user._id,
        orderStatus: { $ne: 'cancelled' }
      });

      // Calculate statistics
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrder = orders.length > 0
        ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : null;

      // Update user
      await User.findByIdAndUpdate(user._id, {
        totalOrders,
        totalSpent,
        lastOrder,
      });

      console.log(`Updated ${user.name}: ${totalOrders} orders, $${totalSpent.toFixed(2)} spent`);
    }

    console.log('✅ User statistics synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing user stats:', error);
    process.exit(1);
  }
};

syncUserStats();
