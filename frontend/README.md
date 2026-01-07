# LuxeStore Frontend

Modern e-commerce frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **UI Components:** Custom components with dark mode support
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **Form Handling:** React hooks

## ✨ Features

### 🛍️ Customer Features
- **Product Catalog** - Browse products with search and filtering
- **Shopping Cart** - Add, update, remove items with real-time updates
- **Checkout** - Secure checkout with Stripe integration
- **User Authentication** - Register, login, email verification
- **Product Reviews** - Rate and review products
- **Favorites/Wishlist** - Save products for later
- **Order Tracking** - View order history and status
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first, works on all devices
- **Currency Conversion** - Multiple currency support
- **Blog** - Read articles and updates
- **Job Applications** - Apply for careers

### 👨‍💼 Admin Features
- **Admin Dashboard** - Analytics and insights
- **Product Management** - CRUD operations for products
- **Order Management** - Process and track orders
- **User Management** - Manage customers and admins
- **Blog Management** - Create and edit blog posts
- **Career Management** - Post jobs and review applications
- **Settings** - Configure site settings
- **Notifications** - Real-time admin notifications

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main customer-facing pages
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── product/          # Product-related components
│   ├── cart/             # Shopping cart components
│   ├── admin/            # Admin components
│   └── ui/               # Reusable UI components
├── store/                # Redux store
│   └── slices/          # Redux slices
├── hooks/                # Custom React hooks
├── contexts/             # React contexts (Theme, Settings)
├── lib/                  # Utility libraries
├── styles/               # Global styles
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

- **Dark Mode:** Class-based dark mode support
- **Custom Colors:** Brand colors defined in `tailwind.config.ts`
- **Responsive:** Mobile-first responsive design
- **Animations:** Custom animations and transitions

### Theme System

Toggle between light and dark modes using the theme context:

```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { isDarkMode, toggleTheme } = useTheme();
```

## 🔐 Authentication

The app uses JWT-based authentication with HTTP-only cookies:

- **Registration:** Email verification required
- **Login:** Secure login with remember me option
- **Password Reset:** Email-based password recovery
- **Protected Routes:** Middleware-based route protection

## 🛒 State Management

### Redux Store

Global state managed with Redux Toolkit:

- **Cart:** Shopping cart state
- **Products:** Product catalog and filters
- **Auth:** User authentication state
- **Admin:** Admin-specific state

### Usage Example

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';

const { items } = useSelector((state) => state.cart);
const dispatch = useDispatch();

dispatch(addToCart(product));
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🎯 Key Pages

### Customer Pages
- `/` - Homepage with featured products
- `/products` - Product catalog
- `/product/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/account` - User account dashboard
- `/orders` - Order history
- `/favorites` - Wishlist

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/blog` - Blog management
- `/admin/careers` - Career management
- `/admin/settings` - Site settings

## 🔌 API Integration

All API calls go through the backend:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
const data = await response.json();
```

## 🎨 Components

### Reusable Components

- **Button** - Custom button with variants
- **Input** - Form input with validation
- **Modal** - Reusable modal component
- **Toast** - Notification system
- **Skeleton** - Loading skeletons
- **Dropdown** - Custom dropdown menus

### Layout Components

- **Navbar** - Main navigation with cart
- **Footer** - Site footer with links
- **Sidebar** - Admin sidebar navigation

## 🌐 Internationalization

The app supports multiple currencies:

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- PKR (Pakistani Rupee)

## 🔒 Security Features

- **XSS Protection:** Sanitized inputs
- **CSRF Protection:** Token-based protection
- **Secure Cookies:** HTTP-only, Secure, SameSite
- **Input Validation:** Client-side validation
- **Protected Routes:** Middleware authentication

## 📦 Dependencies

### Production
- **next** - React framework
- **react** - UI library
- **react-dom** - React DOM renderer
- **@reduxjs/toolkit** - State management
- **react-redux** - Redux bindings
- **lucide-react** - Icon library
- **tailwindcss** - CSS framework

### Development
- **typescript** - Type safety
- **eslint** - Code linting
- **@types/** - TypeScript types

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
4. Deploy

### Environment Variables

```env
# Production
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

## 🎯 Performance

- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automatic route-based splitting
- **Lazy Loading:** Components loaded on demand
- **Caching:** API response caching
- **Compression:** Gzip compression enabled

## 🧪 Testing

To test the application:

1. Start backend server
2. Start frontend server
3. Navigate to `http://localhost:3000`
4. Test features:
   - Browse products
   - Add to cart
   - Checkout
   - Admin login

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👨‍💻 Author

LuxeStore Team

---

**Built with ❤️ using Next.js 14**
