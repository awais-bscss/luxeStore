import mongoose from 'mongoose';
import Review from '../models/Review.model';
import Product from '../models/Product.model';
import config from '../config';

/**
 * Debug script to check review and product data
 */

async function debugReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB\n');

    // Get all reviews (without populate)
    const reviews = await Review.find({});

    console.log(`📝 Total Reviews: ${reviews.length}\n`);

    if (reviews.length === 0) {
      console.log('❌ No reviews found in database!');
    } else {
      for (const review of reviews) {
        const product = await Product.findById(review.product);
        console.log(`Review:`);
        console.log(`  Product ID: ${review.product}`);
        console.log(`  Product Name: ${product?.name || 'Not found'}`);
        console.log(`  Rating: ${review.rating} ⭐`);
        console.log(`  Title: ${review.title}`);
        console.log(`  Approved: ${review.isApproved ? '✅ Yes' : '❌ No'}`);
        if (product) {
          console.log(`  Product Current Rating: ${product.rating}`);
          console.log(`  Product Review Count: ${product.reviewCount}`);
        }
        console.log('');
      }
    }

    // Get products with reviews
    console.log('\n📦 Products with Reviews:\n');
    const productsWithReviews = await Product.find({ reviewCount: { $gt: 0 } });

    if (productsWithReviews.length === 0) {
      console.log('❌ No products have reviewCount > 0!');
      console.log('This means the calcAverageRating is NOT working.\n');

      // Check if any products have reviews at all
      const allProducts = await Product.find({});
      console.log(`Total products in database: ${allProducts.length}`);

      // Show first few products
      console.log('\nFirst 5 products:');
      allProducts.slice(0, 5).forEach(p => {
        console.log(`  ${p.name}: rating=${p.rating}, reviewCount=${p.reviewCount}`);
      });
    } else {
      productsWithReviews.forEach((product) => {
        console.log(`Product: ${product.name}`);
        console.log(`  Rating: ${product.rating} ⭐`);
        console.log(`  Review Count: ${product.reviewCount}`);
        console.log('');
      });
    }

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
debugReviews();
