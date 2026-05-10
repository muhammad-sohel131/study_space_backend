# StudySpace Backend

A robust, Student-focused Study Center Management API built with NestJS and GraphQL.

## 🚀 Key Features

- **GraphQL API**: Type-safe, efficient data fetching with Apollo Server.
- **Role-Based Auth**: Secure JWT-based authentication for Students and Admins.
- **Seat Management**: Physical grid coordinate system (x, y) for floor plan mapping.
- **Live Bookings**: Real-time availability checks and conflict prevention.
- **SSLCommerz Integration**: Full payment gateway integration for secure transactions.
- **Media Management**: Secure image uploads via Cloudinary.

## 🛠️ Technology Stack & Package Rationale

| Package | Purpose | Why We Chose It |
| :--- | :--- | :--- |
| **NestJS** | Core Framework | Provides a modular, scalable architecture with strong TypeScript support. |
| **GraphQL/Apollo** | API Layer | Allows frontend to request exactly what it needs, reducing payload and over-fetching. |
| **Mongoose** | MongoDB ODM | Offers a schema-based solution for application data, ensuring data integrity. |
| **Passport/JWT** | Authentication | Industry-standard security for stateless, scalable authentication. |
| **SSLCommerz** | Payments | Seamless integration with Bangladesh's leading payment gateway. |
| **Cloudinary** | Image Hosting | Reliable cloud storage for branch cover images and student profiles. |
| **Bcrypt** | Encryption | Secure hashing for user passwords. |

## ⚙️ Installation & Setup

1. **Clone & Install**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   SSL_STORE_ID=your_store_id
   SSL_STORE_PASS=your_store_password
   SSL_IS_LIVE=false
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   ```

3. **Run Development**:
   ```bash
   npm run start:dev
   ```

## 🔐 Admin Credentials

For testing and management purposes:
- **Email**: `admin@studyspace.com`
- **Password**: `Admin123!`
*(Note: These should be changed immediately in a production environment)*
