# Footwear E-commerce Backend

Backend API cho ứng dụng bán giày trực tuyến.

## Cấu trúc thư mục

```
backend/
├── config/              # Database configuration
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   └── libs/            # Utility functions
├── package.json
├── server.js           # Entry point
└── .env.example        # Environment variables template
```

## Cài đặt

```bash
npm install
```

## Biến môi trường

Tạo file `.env` dựa trên `.env.example`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/footwear-ecommerce
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

## Chạy server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get user profile (requires token)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

## Technologies

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcryptjs for password hashing

## License

ISC
