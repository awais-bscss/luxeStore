/**
 * Product Type Definitions
 * 
 * This file contains TypeScript interfaces for product-related data structures.
 */

export interface Product {
  id: number;
  _id?: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviewCount?: number;
  stock: number;
  brand: string;
  thumbnail?: string;
  comparePrice?: number;
  discount?: number;
}