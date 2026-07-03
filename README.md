# LocalGoods POS & Inventory Management System

A modern, full-stack web application designed to help small businesses manage sales, inventory, customers, and suppliers efficiently. Built with React for the frontend and Node.js/Express for the backend.

## ✨ Features

- **Authentication**: Secure user login, registration, and session management using JWT.
- **Role-Based Access**: Admin and User roles with different permissions.
- **Dashboard**: An at-a-glance overview of key business metrics like total sales, profit, stock levels, and credit balances.
- **Sales Management**: A complete point-of-sale interface to create new sales, a transaction screen to handle payments, and a searchable history of all sales with payment status (Paid, Partial, Unpaid).
- **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products, including stock tracking, pricing, and a searchable product list with stock status indicators (In Stock, Low Stock, Out of Stock).
- **Customer Management**: Manage a customer database with contact details and track outstanding credit balances. Includes search and status badges.
- **Supplier Management**: Manage a list of suppliers, track purchase orders, and monitor outstanding balances owed to them.
- **Inventory & Purchases**: Record new stock arrivals (purchases), update inventory levels and cost prices automatically, and maintain a searchable history of all purchase orders.
- **Payments Hub**: Dedicated sections to record payments received from customers and payments made to suppliers, automatically updating their respective balances.
- **Reporting**: Generate detailed sales and profit reports for custom date ranges, visualize data with charts, and export reports to CSV.
- **Modern UI/UX**: A responsive, user-friendly interface built with Bootstrap, featuring dark/light mode, smooth animations, and non-blocking toast notifications.

## 🚀 Tech Stack

- **Frontend**:
  - React.js
  - React Router for navigation
  - Axios for API communication
  - Bootstrap & React-Bootstrap for styling
  - Recharts for data visualization
  - Framer Motion for animations
  - React Toastify for notifications
- **Backend**:
  - Node.js & Express.js
  - MySQL2 for database interaction
  - JSON Web Tokens (JWT) for secure authentication
  - bcryptjs for password hashing
  - Helmet for security headers
  - Express Rate Limit for brute-force protection

## 📂 Project Structure

```
/
├── server/         # Backend Node.js/Express application
│   ├── db.js       # Database connection logic
│   └── index.js    # Main server file with all API routes
├── src/            # Frontend React application
│   ├── api/        # Axios instance configuration
│   ├── components/ # Reusable React components (Modals, Navbar, etc.)
│   ├── contexts/   # React Context providers (Auth, Theme)
│   ├── pages/      # Page components for each route
│   └── App.js      # Main application component with routing
├── .env            # Environment variables (NEVER commit this file)
└── package.json    # Project dependencies and scripts
```

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

- Node.js (v16 or later)
- MySQL or a compatible database (like MariaDB).

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### 2. Install Dependencies

Install both frontend and backend dependencies from the root directory.

```bash
npm install
```

### 3. Database Setup

1.  Create a new database in your MySQL instance named `elbaf`. The backend defaults to this name for development.
2.  Run the necessary SQL queries to create all the required tables (`users`, `products`, `customers`, `suppliers`, `sales`, etc.).

### 4. Environment Variables

Create a `.env` file in the project root. Use the structure below and fill in your details.

```env
# Frontend Configuration
PORT=3000
REACT_APP_API_URL=http://localhost:3001/api

# Backend Configuration
BACKEND_PORT=3001

# Security
JWT_SECRET=generate-a-super-long-and-random-secret-key
JWT_COOKIE_EXPIRES_IN=1d
```

**Important**: Your local database credentials are set directly in `server/db.js`. You may need to edit this file to match your local MySQL `user` and `password`.

### 5. Run the Application

Use the `dev` script to run both the frontend and backend servers concurrently.

```bash
npm run dev
```

- The React frontend will be available at `http://localhost:3000`.
- The Node.js backend will be running at `http://localhost:3001`.

## ☁️ Deployment

The application is configured for easy deployment to modern cloud platforms:

- **Backend (Node.js)**: Can be deployed to services like Render or Heroku.
- **Frontend (React)**: Can be deployed as a static site to services like Netlify or Vercel.
- **Database**: A cloud-based MySQL provider like PlanetScale or AWS RDS is recommended for production.

Remember to set the `DATABASE_URL`, `FRONTEND_URL`, and `JWT_SECRET` environment variables in your production environment.

## 🎨 Future Enhancements

- **Product Categories**: Group products for better organization and reporting.
- **Barcode Scanning**: Use a barcode scanner to quickly add products to the sales cart.
- **Tax Management (GST)**: Configure tax rates and apply them to sales.
- **Expense Tracking**: Record general business expenses to calculate true net profit.