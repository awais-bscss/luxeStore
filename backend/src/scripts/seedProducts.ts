import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    description: "High-fidelity audio with active noise cancellation",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4.8,
    stock: 45,
    brand: "AudioTech"
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 399.99,
    description: "Advanced fitness tracking with health monitoring",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    category: "Wearables",
    rating: 4.6,
    stock: 32,
    brand: "TechFit"
  },
  {
    id: 3,
    name: "Designer Leather Backpack",
    price: 179.99,
    description: "Handcrafted genuine leather with laptop compartment",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4.9,
    stock: 18,
    brand: "LuxeCarry"
  },
  {
    id: 4,
    name: "4K Action Camera",
    price: 249.99,
    description: "Waterproof ultra HD camera for adventure enthusiasts",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4.7,
    stock: 27,
    brand: "ProShot"
  },
  {
    id: 5,
    name: "Minimalist Desk Lamp",
    price: 89.99,
    description: "LED desk lamp with adjustable brightness and color",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
    category: "Home",
    rating: 4.5,
    stock: 56,
    brand: "LightSpace"
  },
  {
    id: 6,
    name: "Mechanical Keyboard RGB",
    price: 159.99,
    description: "Cherry MX switches with customizable RGB lighting",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4.8,
    stock: 41,
    brand: "KeyMaster"
  },
  {
    id: 7,
    name: "Wireless Earbuds Pro",
    price: 149.99,
    description: "True wireless earbuds with premium sound quality",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4.7,
    stock: 38,
    brand: "AudioTech"
  },
  {
    id: 8,
    name: "Portable Bluetooth Speaker",
    price: 129.99,
    description: "Waterproof speaker with 360-degree sound",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4.6,
    stock: 52,
    brand: "SoundWave"
  },
  {
    id: 9,
    name: "Smart Coffee Maker",
    price: 199.99,
    description: "WiFi-enabled coffee maker with app control",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop",
    category: "Home",
    rating: 4.4,
    stock: 29,
    brand: "BrewMaster"
  },
  {
    id: 10,
    name: "Premium Yoga Mat",
    price: 79.99,
    description: "Eco-friendly non-slip yoga mat with carrying strap",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4.8,
    stock: 64,
    brand: "ZenFit"
  },
  {
    id: 11,
    name: "Running Shoes Elite",
    price: 139.99,
    description: "Lightweight running shoes with advanced cushioning",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4.9,
    stock: 15,
    brand: "SpeedRun"
  },
  {
    id: 12,
    name: "Designer Sunglasses",
    price: 189.99,
    description: "Polarized UV protection with premium frame",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4.7,
    stock: 22,
    brand: "LuxeVision"
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedProducts = async () => {
  await connectDB();

  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Transform and insert new products
    const productsToInsert = PRODUCTS_DATA.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      sku: `SKU-${product.id.toString().padStart(6, '0')}`,
      stock: product.stock,
      images: [product.image],
      thumbnail: product.image,
      rating: product.rating,
      isActive: true,
      tags: [product.category],
      specifications: []
    }));

    await Product.insertMany(productsToInsert);
    console.log('Products seeded successfully');
    process.exit(0);
  } catch (error: any) {
    console.error(`Error seeding products: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
