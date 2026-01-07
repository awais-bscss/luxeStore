# 🔑 LuxeStore - Demo Credentials

This file contains demo credentials for testing the LuxeStore platform.

## ⚠️ Important Information

**Admin Account Registration:**
- ❌ **No public admin registration** - Admin accounts cannot be created via the signup page
- ✅ **Pre-seeded in database** - Admin accounts are hardcoded in MongoDB
- ✅ **Customer registration available** - Regular users can register at `/auth/signup`

**To Create New Admins:**
1. Use backend script: `npm run create:admin`
2. Use backend script: `npm run create:superadmin`
3. Manually insert into MongoDB database

---

## 🎯 Quick Access

### **Super Admin** (Full Access) - Pre-seeded
- **Email:** `superadmin@luxestore.com`
- **Password:** `admin123`
- **Access:** All features, full permissions
- **Dashboard:** `/admin`
- **Status:** ✅ Hardcoded in database

### **Admin** (Standard Admin) - Pre-seeded
- **Email:** `admin@luxestore.com`
- **Password:** `admin123`
- **Access:** Standard admin features
- **Dashboard:** `/admin`
- **Status:** ✅ Hardcoded in database

### **Customer** (Demo Account) - Pre-seeded
- **Email:** `customer@luxestore.com` (Not a real email)
- **Password:** `Customer@123`
- **Access:** Shopping, orders, reviews
- **Dashboard:** `/account`
- **Status:** ✅ Pre-seeded for testing only
- **Note:** ⚠️ This is a demo account. **Create your own account** for real testing!

> 💡 **Recommended:** Register your own customer account with a real email to test email verification, password reset, and order notifications.

---

## 📋 Feature Access by Role

### **Super Admin Can:**
- ✅ Manage all products
- ✅ Manage all orders
- ✅ Manage all users (customers & admins)
- ✅ Manage blog posts
- ✅ Manage job postings
- ✅ View all analytics
- ✅ Configure site settings
- ✅ Manage notifications
- ✅ Access all admin features

### **Admin Can:**
- ✅ Manage products (own products)
- ✅ View and process orders
- ✅ View customer information
- ✅ Create blog posts
- ✅ View analytics
- ✅ Respond to contact messages
- ❌ Cannot manage other admins
- ❌ Cannot change critical settings

### **Customer Can:**
- ✅ Browse products
- ✅ Add to cart and checkout
- ✅ Place orders
- ✅ Write product reviews
- ✅ Save favorites/wishlist
- ✅ Track orders
- ✅ Update profile
- ✅ View order history
- ❌ No admin access

---

## 🚀 How to Test

### **Testing Admin Features:**

1. **Open the Application:**
   ```
   Navigate to: http://localhost:3000
   ```

2. **Open Login Modal:**
   - Click the **"Login"** button in the navbar
   - Or click the **user icon** in the top right
   - Login modal will appear

3. **Login as Super Admin:**
   ```
   Email: superadmin@luxestore.com
   Password: admin123
   ```
   
   **Or Login as Admin:**
   ```
   Email: admin@luxestore.com
   Password: admin123
   ```

4. **Access Admin Dashboard:**
   ```
   After login, click your profile icon → "Admin Dashboard"
   Or navigate to: http://localhost:3000/admin
   ```

5. **Test Features:**
   - Create/Edit/Delete products
   - Manage orders
   - View analytics
   - Manage users
   - Configure settings

### **Testing Customer Features:**

1. **Open the Application:**
   ```
   Navigate to: http://localhost:3000
   ```

2. **Create Your Own Account (Recommended):**
   - Click the **"Login"** button in the navbar
   - Click **"Sign Up"** tab in the modal
   - Fill in your details:
     - Name
     - Email (use a real email for verification)
     - Password
   - Click **"Sign Up"**
   - Check your email for verification link
   - Verify your email
   - Login with your new account

   **Or Use Demo Account (Limited Testing):**
   - Click the **"Login"** button in the navbar
   - Enter:
     ```
     Email: customer@luxestore.com
     Password: Customer@123
     ```
   - **Note:** This is a pre-seeded demo account with fake email

3. **Test Shopping:**
   - Browse products
   - Add to cart
   - Checkout
   - Write reviews
   - Track orders
   - Test email notifications (only works with real email)

---

## 🔐 Creating New Admin Accounts

> ⚠️ **Important:** There is NO public admin registration API. Admins must be created using these methods:

### **Method 1: Using Backend Script (Recommended)**
```bash
cd backend

# Create a new admin
npm run create:admin

# Or create a super admin
npm run create:superadmin
```
Follow the prompts to enter admin details.

### **Method 2: Manually in MongoDB**

Connect to your MongoDB database and insert a new admin:

```javascript
// Connect to MongoDB
use luxestore

// Insert new admin
db.users.insertOne({
  name: "New Admin",
  email: "newadmin@luxestore.com",
  password: "$2a$10$...", // Use bcrypt to hash password
  role: "admin", // or "superadmin"
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**To hash password:**
```bash
# In backend directory
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10));"
```

### **Method 3: Promote Existing Customer**

If a customer account exists, promote them to admin:

```javascript
// In MongoDB
db.users.updateOne(
  { email: "customer@example.com" },
  { 
    $set: { 
      role: "admin" // or "superadmin"
    } 
  }
)
```

> 💡 **Note:** After creating/promoting an admin, they can log in via the login modal on the homepage (click "Login" button in navbar).

---

## ⚠️ Security Notes

### **For Development:**
- ✅ These credentials are fine for local testing
- ✅ Use them to explore all features
- ✅ Share with team members for testing

### **For Production:**
- ❌ **NEVER** use these credentials in production
- ❌ **DELETE** or change these accounts before deploying
- ❌ **DO NOT** commit real admin passwords to Git

### **Best Practices:**
1. Change all demo passwords before going live
2. Use strong, unique passwords for real admin accounts
3. Enable two-factor authentication (if implemented)
4. Regularly audit admin accounts
5. Remove unused admin accounts

---

## 📊 Account Status

| Account | Email | Status | Last Updated |
|---------|-------|--------|--------------|
| Super Admin | superadmin@luxestore.com | ✅ Active | 2026-01-07 |
| Admin | admin@luxestore.com | ✅ Active | 2026-01-07 |
| Customer | customer@luxestore.com | ✅ Active | 2026-01-07 |

---

## 🆘 Troubleshooting

### **Can't Login?**
1. Make sure backend server is running
2. Check if MongoDB is connected
3. Verify the email and password are correct

### **No Admin Access?**
1. Verify you're using an admin account
2. Check user role in database
3. Clear browser cache and cookies
4. Try logging out and back in

### **Forgot Password?**
1. Use password reset feature
2. Or manually reset in database
3. Or create a new admin account

---

## 📝 Notes

- All demo accounts are pre-seeded in the database
- Passwords are hashed using bcrypt
- Accounts have sample data for testing
- Safe to use in development environment

---

**Happy Testing! 🎉**

> Remember to secure your admin accounts in production!
