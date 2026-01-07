import mongoose from 'mongoose';
import Review from '../models/Review.model';
import Product from '../models/Product.model';
import config from '../config';

/**
 * Script to recalculate all product ratings
 * Run this after fixing the calcAverageRating function
 */

async function recalculateAllRatings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let updated = 0;

    for (const product of products) {
      // Recalculate rating for this product
      await (Review as any).calcAverageRating(product._id);
      updated++;
      console.log(`✅ Updated rating for: ${product.name}`);
    }

    console.log(`\n🎉 Successfully updated ${updated} products!`);

    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
recalculateAllRatings();
