# Anyaa Textiles Backend

A production-ready Node.js backend for the Anyaa Textiles Billing & Stock Management System.

## Features

- **RESTful API** with Express.js
- **SQLite Database** with better-sqlite3 (no external database server required)
- **JWT Authentication** with role-based access control
- **Input Validation** with express-validator
- **Security Features**: Helmet, CORS, Rate Limiting
- **Transaction Support** for data integrity
- **Comprehensive Error Handling**
- **Logging** with Morgan
- **Compression** for better performance

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite (better-sqlite3)** - Embedded database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **compression** - Response compression

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── database/         # Database connection & initialization
│   ├── middleware/       # Custom middleware (auth, validation, error handling)
│   ├── models/           # Data models (if using ORM)
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Server entry point
├── data/                 # SQLite database file (auto-created)
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── README.md            # This file
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (already done)
   - Update the values if needed:
     ```env
     PORT=5000
     NODE_ENV=development
     FRONTEND_URL=http://localhost:3000
     JWT_SECRET=your-secret-key-here
     ```

4. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will:
   - Create the `data/` directory
   - Create the SQLite database file (`anyaa.db`)
   - Create all required tables
   - Insert default data (users, products, customers, settings)
   - Create indexes for performance

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Default Users

After database initialization, these default users are created:

| Email | Password | Role |
|-------|----------|------|
| admin@anyaa.com | admin | Admin |
| sales@anyaa.com | sales | Sales |
| accounts@anyaa.com | accounts | Accounts |

**⚠️ Important:** Change these passwords in production!

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)

### Products

- `GET /api/products` - Get all products (with search, filter, sort)
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Customers

- `GET /api/customers` - Get all customers (with search, filter)
- `GET /api/customers/:id` - Get single customer with recent bills
- `POST /api/customers` - Create customer (requires auth)
- `PUT /api/customers/:id` - Update customer (requires auth)
- `DELETE /api/customers/:id` - Delete customer (requires auth)

### Bills

- `GET /api/bills` - Get all bills (with search, filter, date range)
- `GET /api/bills/:id` - Get single bill with items
- `POST /api/bills` - Create bill (requires auth, with transaction)
- `PUT /api/bills/:id` - Update bill (requires auth)
- `DELETE /api/bills/:id` - Delete bill (requires auth, restores stock)

### Returns

- `GET /api/returns` - Get all returns (with search, filter)
- `GET /api/returns/:id` - Get single return
- `POST /api/returns` - Create return (requires auth)
- `PUT /api/returns/:id` - Update return (requires auth)
- `DELETE /api/returns/:id` - Delete return (requires auth)

### Dashboard

- `GET /api/dashboardStats` - Get dashboard statistics

### Health Check

- `GET /health` - Server health check

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "errors": null
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Authentication

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@anyaa.com",
  "password": "admin"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@anyaa.com",
      "name": "Admin User",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer <your-token-here>
```

## Database Schema

### Tables

- **users** - User accounts with roles
- **products** - Product catalog
- **product_variants** - Product variants (color, size, design)
- **customers** - Customer information
- **bills** - Invoice/bill records
- **bill_items** - Bill line items
- **returns** - Return/exchange records
- **settings** - System configuration
- **roles** - Role definitions (future use)
- **staff** - Staff information (future use)

## Security Features

- **Password Hashing** - All passwords are hashed with bcrypt
- **JWT Authentication** - Secure token-based authentication
- **CORS** - Configured for frontend origin
- **Helmet** - Security headers
- **Rate Limiting** - 1000 requests per 15 minutes per IP
- **Input Validation** - All inputs are validated
- **SQL Injection Protection** - Parameterized queries
- **Foreign Key Constraints** - Data integrity

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for auto-reload on file changes.

### Database Reset

To reset the database:

```bash
# Delete the database file
rm data/anyaa.db

# Reinitialize
npm run init-db
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Import and use routes in `src/server.js`
4. Add validation rules in `src/middleware/validation.js` if needed

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production` in `.env`
2. Change `JWT_SECRET` to a strong random string
3. Update `FRONTEND_URL` to production frontend URL
4. Change default user passwords

### Building for Production

The backend is already production-ready. Just run:

```bash
npm start
```

### Database Backup

The SQLite database file is located at `backend/data/anyaa.db`

To backup:
```bash
cp data/anyaa.db data/anyaa-backup-$(date +%Y%m%d).db
```

To restore:
```bash
cp data/anyaa-backup-YYYYMMDD.db data/anyaa.db
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, change the PORT in `.env`:

```env
PORT=5001
```

### Database Locked

If you get a "database is locked" error:
- Ensure no other process is using the database
- Restart the server
- Check for WAL mode issues

### Permission Errors

On Windows, ensure you have write permissions to the `backend/data/` directory.

## Frontend Integration

Update the frontend API configuration to point to the new backend:

```javascript
// In src/services/api.js
const API_URL = 'http://localhost:5000/api';
```

Then update all API calls to use the new endpoint structure:

```javascript
// Old: /products
// New: /api/products

// Old: /users
// New: /api/auth/users
```

## License

ISC

## Support

For issues or questions, please contact the development team.
