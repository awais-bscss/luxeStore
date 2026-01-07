import Favorite from '../models/Favorite.model';
import Product from '../models/Product.model';
import { NotFoundError } from '../utils/errors';

class FavoriteService {
  async getFavorites(userId: string) {
    let favorite = await Favorite.findOne({ user: userId }).populate('products');

    if (!favorite) {
      favorite = await Favorite.create({ user: userId, products: [] });
    }

    return favorite.products;
  }

  async addToFavorites(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      favorite = await Favorite.create({
        user: userId,
        products: [productId],
      });
    } else {
      if (!favorite.products.includes(productId as any)) {
        favorite.products.push(productId as any);
        await favorite.save();
      }
    }

    const populated = await favorite.populate('products');
    return populated.products;
  }

  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      throw new NotFoundError('Favorites not found');
    }

    favorite.products = favorite.products.filter(
      (id) => id.toString() !== productId
    );
    await favorite.save();

    const populated = await favorite.populate('products');
    return populated.products;
  }

  async mergeFavorites(userId: string, localFavorites: string[]) {
    let favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      favorite = await Favorite.create({ user: userId, products: [] });
    }

    for (const productId of localFavorites) {
      if (!favorite.products.includes(productId as any)) {
        const product = await Product.findById(productId);
        if (product) {
          favorite.products.push(productId as any);
        }
      }
    }

    await favorite.save();
    const populated = await favorite.populate('products');
    return populated.products;
  }

  async clearFavorites(userId: string) {
    const favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      throw new NotFoundError('Favorites not found');
    }

    favorite.products = [];
    await favorite.save();

    return [];
  }
}

export default new FavoriteService();
