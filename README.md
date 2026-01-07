# LuxeStore - Premium E-Commerce Ecosystem

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

LuxeStore is a full-stack, high-performance e-commerce solution designed for modern luxury brands. It features a stunning, responsive frontend with dark mode support, a robust REST API, and a comprehensive administrative dashboard for complete business control.

---

## 🌟 Key Highlights

### 🎨 Frontend (Next.js 14)
*   **Aesthetic Design**: Modern, clean, and premium UI with smooth transitions.
*   **Dual Themes**: Seamless Light/Dark mode integration.
*   **Performance**: Server-side rendering and image optimization for lightning-fast loads.
*   **Responsive**: Fully optimized for mobile, tablet, and desktop experiences.
*   **State Management**: Complex state handled efficiently with Redux Toolkit.

### ⚙️ Backend (Node.js & Express)
*   **Secure Auth**: JWT-based authentication with role-based access control (RBAC).
*   **Verified Accounts**: Complete email verification and password reset flows.
*   **Payment Ready**: Integrated with Stripe for secure transactional processing.
*   **Media Hosting**: Dynamic image management via Cloudinary.
*   **Scalable DB**: MongoDB integration with advanced schema design.

### 🛡️ Admin Dashboard
*   **Analytics**: Real-time sales and customer growth insights.
*   **Inventory Control**: Advanced product, stock, and category management.
*   **Order Fulfillment**: End-to-end order tracking and status management.
*   **Support System**: integrated contact message and inquiry handling.

---

## 📂 Project Structure

LuxeStore is organized as a monorepo for ease of development:

```text
LuxeStore/
├── frontend/        # Next.js Application (Port 3000)
├── backend/         # Node.js API Service (Port 5000)
└── MD/              # Historical documentation and fix logs (Internal)
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/luxestore.git
cd luxestore
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI, STRIPE_SECRET_KEY, and CLOUDINARY credentials
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

---

## 🔑 Demo Credentials

For demonstration and testing purposes:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@luxestore.com` | `admin123` |
| **Admin** | `admin@luxestore.com` | `admin123` |
| **Customer** | `customer@luxestore.com` | `Customer@123` |

---

## 🛠️ Technology Stack

| Sphere | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js, Redux Toolkit, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Mongoose |
| **Database** | MongoDB Atlas, Redis (Optional for caching) |
| **Services** | Stripe (Payments), Cloudinary (Images), Nodemailer (Emails) |
| **DevOps** | Vercel Deployment, ESLint, Git |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the **LuxeStore Team**.
