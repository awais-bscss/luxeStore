import Product from '../models/Product.model';
import { ValidationError, NotFoundError } from '../utils/errors';

class ProductService {
  async createProduct(productData: any) {
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      throw new ValidationError('Product with this SKU already exists');
    }

    // Create product
    const product = await Product.create(productData);
    return product;
  }

  async getAllProducts(filters: any = {}) {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
      createdBy,
      createdAt,
    } = filters;

    const query: any = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (isActive !== undefined) query.isActive = isActive;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    // Filter by creator
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Filter by creation date range
    if (createdAt) {
      const dateFilter: any = {};
      if (createdAt.gte) {
        dateFilter.$gte = new Date(createdAt.gte);
      }
      if (createdAt.lt) {
        dateFilter.$lt = new Date(createdAt.lt);
      }
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption: any = sort;

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // If searching and no explicit sort provided, use text score relevance
    if (search && sort === '-createdAt') {
      sortOption = { score: { $meta: 'textScore' } };
    }

    const [products, total] = await Promise.all([
      Product.find(query, search ? { score: { $meta: 'textScore' } } : {})
        .populate('createdBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getProductById(id: string, populateCreator = false) {
    let query = Product.findById(id);

    if (populateCreator) {
      query = query.populate('createdBy', 'name email');
    }

    const product = await query;
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async updateProduct(id: string, updateData: any) {
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async updateStock(id: string, quantity: number) {
    const product = await Product.findOneAndUpdate(
      { _id: id, stock: { $gte: -quantity } }, // Ensure we don't go below 0 if reducing
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      // Check if product exists at all
      const exists = await Product.findById(id);
      if (!exists) throw new NotFoundError('Product not found');
      throw new ValidationError('Insufficient stock');
    }

    return product;
  }
}

export default new ProductService();
