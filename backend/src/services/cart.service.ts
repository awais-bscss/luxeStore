import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import { NotFoundError, ValidationError } from '../utils/errors';

class CartService {
  async getCart(userId: string) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if product is out of stock
    if (product.stock === 0) {
      throw new ValidationError(`${product.name} is currently out of stock`);
    }

    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      throw new ValidationError(
        `Only ${product.stock} unit${product.stock > 1 ? 's' : ''} of ${product.name} available in stock`
      );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        // Check if new total quantity exceeds stock
        if (newQuantity > product.stock) {
          throw new ValidationError(
            `Cannot add ${quantity} more. Only ${product.stock} unit${product.stock > 1 ? 's' : ''} available (${existingItem.quantity} already in cart)`
          );
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ product: productId as any, quantity, price: product.price });
      }

      await cart.save();
    }

    return await cart.populate('items.product');
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const item = cart.items.find((item) => item.product.toString() === productId);

    if (!item) {
      throw new NotFoundError('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      // Validate stock availability
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (product.stock === 0) {
        throw new ValidationError(`${product.name} is currently out of stock`);
      }

      if (quantity > product.stock) {
        throw new ValidationError(
          `Only ${product.stock} unit${product.stock > 1 ? 's' : ''} of ${product.name} available in stock`
        );
      }

      item.quantity = quantity;
    }

    await cart.save();
    return await cart.populate('items.product');
  }

  async removeFromCart(userId: string, productId: string) {
    console.log('=== CART SERVICE: REMOVE FROM CART ===');
    console.log('User ID:', userId);
    console.log('Product ID to remove:', productId);

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    console.log('Cart items BEFORE removal:', cart.items.length);
    console.log('Items:', cart.items.map(item => ({ product: item.product.toString(), qty: item.quantity })));

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    console.log('Cart items AFTER filter:', cart.items.length);
    console.log('Items:', cart.items.map(item => ({ product: item.product.toString(), qty: item.quantity })));

    await cart.save();

    console.log('✅ Cart saved to database');

    return await cart.populate('items.product');
  }

  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return cart;
  }

  async mergeCart(userId: string, localCartItems: any[]) {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    for (const localItem of localCartItems) {
      const product = await Product.findById(localItem.productId);

      // Basic validation: product must exist and have at least 1 in stock
      if (!product || product.stock <= 0) continue;

      const existingItem = cart.items.find(
        (item) => item.product.toString() === localItem.productId
      );

      if (existingItem) {
        // Increment quantity but cap at available stock
        const totalRequested = existingItem.quantity + localItem.quantity;
        existingItem.quantity = Math.min(totalRequested, product.stock);
      } else {
        // Add new item but cap at available stock
        cart.items.push({
          product: localItem.productId,
          quantity: Math.min(localItem.quantity, product.stock),
          price: product.price,
        } as any);
      }
    }

    await cart.save();
    return await cart.populate('items.product');
  }
}

export default new CartService();
