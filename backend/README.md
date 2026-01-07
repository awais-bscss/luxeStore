# LuxeStore Backend API

Production-ready REST API for LuxeStore e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## 🏗️ Architecture

This backend follows a **layered architecture** pattern:

```
src/
├── config/          # Configuration files (database, env)
├── controllers/     # Request handlers
├── services/        # Business logic layer
├── models/          # Database models (Mongoose schemas)
├── routes/          # API route definitions
├── middleware/      # Custom middleware (auth, validation, error handling)
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## ✨ Features

### Core Features
- ✅ **TypeScript** - Full type safety
- ✅ **Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Email Verification** - Secure email verification system
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Validation** - Input validation with express-validator
- ✅ **Security** - Helmet, CORS, rate limiting
- ✅ **Error Handling** - Centralized error handling
- ✅ **Database** - MongoDB Atlas with Mongoose ODM
- ✅ **Logging** - Morgan HTTP request logger
- ✅ **Environment Config** - dotenv for configuration management

### E-Commerce Features
- ✅ **Product Management** - CRUD operations for products
- ✅ **Inventory Tracking** - Real-time stock management
- ✅ **Shopping Cart** - Session-based cart management
- ✅ **Order Processing** - Complete order lifecycle
- ✅ **Payment Integration** - Stripe payment processing
- ✅ **Reviews & Ratings** - Product review system
- ✅ **Favorites/Wishlist** - Save products for later

### Admin Features
- ✅ **Admin Dashboard** - Analytics and insights
- ✅ **User Management** - Manage customers and admins
- ✅ **Order Management** - Process and track orders
- ✅ **Blog System** - Create and manage blog posts
- ✅ **Career Management** - Job postings and applications
- ✅ **Contact Messages** - Handle customer inquiries
- ✅ **Settings Management** - Configure site settings
- ✅ **Notifications** - Real-time admin notifications

### Additional Features
- ✅ **File Upload** - Cloudinary integration for images
- ✅ **Email Service** - Nodemailer for transactional emails
- ✅ **Currency Conversion** - Multi-currency support
- ✅ **Shipping Methods** - Standard and express shipping
- ✅ **RBAC** - Role-based access control
- ✅ **Session Management** - Secure session handling

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong secret key for JWT tokens
   - `FRONTEND_URL` - Your frontend URL for CORS

3. **Start MongoDB:**
   
   Make sure MongoDB is running locally or you have a cloud MongoDB URI.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## 🔑 Demo Credentials

For testing admin features, use these **pre-seeded** demo accounts:

> ⚠️ **Important:** Admin accounts are hardcoded in the database. There is no public admin registration. Only customers can register via the signup page.

### **Super Admin Account**
```
Email: superadmin@luxestore.com
Password: admin123
```
**Permissions:** Full access to all features  
**Note:** Pre-seeded in database, cannot be created via signup

### **Admin Account**
```
Email: admin@luxestore.com
Password: admin123
```
**Permissions:** Standard admin access  
**Note:** Pre-seeded in database, cannot be created via signup

### **Customer Account (Can Register)**
```
Email: customer@luxestore.com (Not a real email - demo only)
Password: Customer@123
```
**Permissions:** Customer features only  
**Note:** Pre-seeded demo account. **Users should create their own accounts** with real emails to test email verification and notifications.

> 💡 **To add new admins:** Use the backend script `npm run create:admin` or manually insert into the database.

> 📝 **Login:** Click the "Login" button in the navbar to open the login modal (not a separate page).

> ✅ **Customer Registration:** Users can register their own accounts via the signup modal with real email addresses.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/health` | API health status | Public |

## 📝 API Usage Examples

### Signup

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Profile (Protected)

```bash
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **HTTP Headers** - Helmet for security headers
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Sanitize and validate all inputs
- **CORS** - Configured for frontend origin
- **Cookie Security** - HttpOnly, Secure, SameSite cookies

## 🛠️ Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📦 Dependencies

### Production
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **morgan** - HTTP logger
- **dotenv** - Environment variables

### Development
- **typescript** - TypeScript compiler
- **ts-node** - TypeScript execution
- **nodemon** - Auto-reload on changes
- **@types/** - TypeScript type definitions

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/luxestore |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | 7 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `EMAIL_HOST` | Email SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | Email SMTP port | 587 |
| `EMAIL_SECURE` | Use SSL/TLS | false |
| `EMAIL_USER` | Email account | - |
| `EMAIL_PASS` | Email password/app password | - |
| `EMAIL_FROM` | From email address | noreply@luxestore.com |

## 🧪 Testing

To test the API, you can use:
- **Postman** - Import the endpoints
- **Thunder Client** - VS Code extension
- **curl** - Command line

Example curl request:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'
```

## 📚 Project Structure Details

### Controllers
Handle HTTP requests and responses. Keep them thin - delegate business logic to services.

### Services
Contain business logic. Services are reusable and testable.

### Models
Define database schemas and model methods.

### Middleware
- `auth.ts` - JWT verification and route protection
- `validators.ts` - Input validation rules
- `errorHandler.ts` - Global error handling

### Utils
- `errors.ts` - Custom error classes
- `asyncHandler.ts` - Async error wrapper
- `apiResponse.ts` - Standardized response format

## 🚧 Future Enhancements

- [ ] Refresh token mechanism
- [ ] Social authentication (Google, Facebook)
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📄 License

ISC

## 👨‍💻 Author

LuxeStore Team
