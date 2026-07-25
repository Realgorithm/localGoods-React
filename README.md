# LocalGoods — POS & Inventory Management System

A full-stack point-of-sale and inventory management app for small local businesses — sales, stock, customers, suppliers, payments, and reporting in one dashboard. React on the frontend, Node/Express + MySQL on the backend.

🔗 **Live app:** [localgoods.netlify.app](https://localgoods.netlify.app/)

---

## ✨ Features

- **Authentication & Access Control** — JWT-based login/registration with httpOnly cookies, and Admin vs. User roles with route-level permission checks.
- **Dashboard** — At-a-glance totals for sales, profit, stock levels, and outstanding credit, with low-stock alerts.
- **Sales / POS** — Cart-style sale creation, a dedicated checkout screen for tendering payment and change, and a searchable sales history with payment status.
- **Product Management** — Full CRUD with stock and pricing, low/out-of-stock indicators, and barcode generation + scan-to-cart support.
- **Categories, Customers & Suppliers** — Simple CRUD management for each, with search and outstanding-balance status badges.
- **Purchasing** — Record stock received from suppliers; inventory levels and average cost price update automatically.
- **Payments Hub** — Record payments received from customers and payments made to suppliers, updating balances automatically.
- **Reporting** — Sales/profit reports over a custom date range, with charts and CSV export.
- **Responsive UI** — Usable end-to-end on mobile: a collapsible sidebar drawer, a collapsing public nav, and layouts that adapt down to phone widths.
- **Polished UX** — Dark/light mode, page transitions, toast notifications, and an app-wide error boundary so a single page crash doesn't take down the whole session.

## 🚀 Tech Stack

**Frontend**
- React (Create React App) + React Router
- Axios for API communication
- Bootstrap & React-Bootstrap (Offcanvas, Navbar, Modal)
- Framer Motion for animation
- Recharts for reporting charts
- React Toastify for notifications

**Backend**
- Node.js & Express
- MySQL (via `mysql2`)
- JWT for authentication, `bcryptjs` for password hashing
- Helmet for security headers, `express-rate-limit` for brute-force/DoS protection

## 📂 Project Structure

```
/
├── server/                # Backend Express application
│   ├── db.mjs               # MySQL connection pool
│   ├── utils.mjs             # Shared error handling + validation helpers
│   ├── schema.mjs            # Database schema reference
│   └── index.mjs             # App setup, middleware, and all API routes
├── src/                   # Frontend React application
│   ├── api.js               # Configured Axios instance
│   ├── components/          # Reusable UI (modals, sidebar, badges, spinners...)
│   ├── contexts/            # React Context providers (Auth, Theme)
│   ├── hooks/                # Shared data hooks (e.g. useCrudResource)
│   ├── layouts/              # Route-level layouts (public site vs. app shell)
│   ├── pages/                # One component per route
│   ├── styles/                # Global CSS
│   └── App.js                # Routing + top-level providers
├── public/                # Static assets and index.html
├── netlify.toml            # Netlify build config (frontend)
└── package.json             # Scripts and dependencies for both frontend and backend
```

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+ (the backend uses `.mjs` files for native ES modules — no special `package.json` config needed)
- A MySQL-compatible database (MySQL or MariaDB)

### 1. Clone and install

```bash
git clone https://github.com/Realgorithm/localGoods-React.git
cd localGoods-React
npm install
```

This installs both the frontend and backend dependencies from the single root `package.json`.

### 2. Set up the database

Create a local database and import the schema (see `server/schema.mjs` for the table definitions), then point the backend at it with the environment variables below.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Frontend — REACT_APP_API_URL points the React app at your local API
REACT_APP_API_URL=http://localhost:3001/api

# Backend
PORT=3001
FRONTEND_URL=http://localhost:3000

# Local database (ignored if DATABASE_URL is set — see Deployment below)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=shop_management

# Auth
JWT_SECRET=generate-a-long-random-secret-key
JWT_COOKIE_EXPIRES_IN=1d
```

> Both the React dev server and the backend read `process.env.PORT`, so don't set `PORT` for the frontend in this shared file — it would collide with the backend's port. Leaving it unset lets Create React App default to `3000` on its own.

### 4. Run it

```bash
npm run dev
```

This runs the React dev server and the API concurrently:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Other useful scripts:

| Script | What it does |
|---|---|
| `npm run client` | Frontend only (`react-scripts start`) |
| `npm run server` | Backend only, with auto-restart (`nodemon`) |
| `npm run build` | Production frontend build |
| `npm start` | Runs the backend with plain `node` (used in production) |

## ☁️ Deployment

This project is deployed as two independently-hosted pieces:

- **Frontend → [Netlify](https://www.netlify.com/)**, built from `npm run build`, configured via `netlify.toml`. Needs `REACT_APP_API_URL` set to the deployed API's URL.
- **Backend + Database → [Railway](https://railway.app/)**, running `npm start`. Railway's MySQL plugin provides a `DATABASE_URL` automatically, which `server/db.mjs` picks up in place of the individual `DB_*` variables.

Required environment variables in production (backend):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Full MySQL connection string (Railway sets this automatically if you attach its MySQL plugin) |
| `FRONTEND_URL` | Your deployed frontend origin (e.g. `https://localgoods.netlify.app`) — required for CORS to allow it |
| `JWT_SECRET` | Long, random signing secret for auth tokens |
| `JWT_COOKIE_EXPIRES_IN` | Token/cookie lifetime, e.g. `1d` |
| `NODE_ENV` | Set to `production` so cookies are issued as `Secure`/`SameSite=None` correctly |

**Deploy order matters occasionally:** frontend and backend build independently from the same push. Most changes are backward-compatible either direction, but if a change alters the shape of a request/response between them (as noted in a given commit), push the backend first and confirm it's healthy before the frontend rollout finishes.

## 🔒 Security Notes

- Passwords are hashed with `bcryptjs`; sessions use short-lived, httpOnly, signed JWT cookies.
- All data-changing routes are scoped to the authenticated user's shop (`shop_id`) at the query level — one shop can never read or modify another's data.
- All SQL is parameterized (no string-built queries).
- Line-item prices for sales are always resolved server-side from the database, never trusted from the client.
- `express-rate-limit` throttles auth endpoints and the API as a whole; `helmet` sets standard security headers.
- The `/health` endpoint intentionally returns no schema or environment details — just an up/down status.

## 🎨 Future Enhancements

- **Tax management (GST)** — configurable tax rates applied at the point of sale.
- **Expense tracking** — record general business expenses to calculate true net profit.
- **Automated tests** — no test suite exists yet; would be worth adding before this handles a growing volume of real transactions.

## 👤 Author

**Tabish Hussain**
[GitHub](https://github.com/Realgorithm)

## 📄 License

No license has been chosen for this project yet — all rights are reserved by default until one is added.
