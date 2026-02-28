# DriveHire — On-Demand Driver Hiring Web Application

> A full-stack web application that connects personal vehicle owners with verified drivers for flexible hiring durations.

## 🚗 Features

### For Customers
- Register and manage profile
- Add/manage vehicles (car, bike)
- Search drivers by city, vehicle type, transmission, rating
- **Interactive map view** — see drivers on OpenStreetMap, toggle list/map
- Book drivers (hourly, daily, weekly)
- **Pick pickup location on map** with reverse geocoding
- Real-time price estimation
- Track bookings, cancel with penalty rules
- Rate and review drivers
- View invoices and payment history

### For Drivers
- Register with license and experience details
- Upload documents for admin verification
- Toggle online/offline status
- **View service area on map** with online/offline indicator
- Accept, reject, or complete job requests
- Track earnings and view reviews

### For Admins
- Dashboard with platform analytics
- Approve/reject driver applications
- Manage users (block/unblock)
- View all bookings
- Configure pricing rules (base rates, multipliers, penalties)
- Monitor all payments

---

## 🏗️ Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Frontend  | React 19, Vite, React Router 7 |
| Styling   | Custom CSS (dark theme, glassmorphism) |
| Maps      | OpenStreetMap, Leaflet, react-leaflet |
| Geocoding | Nominatim (free reverse geocoding) |
| Backend   | Node.js, Express.js    |
| Database  | MongoDB, Mongoose       |
| Auth      | JWT, bcryptjs           |
| File Upload | Multer               |
| HTTP Client | Axios                |

---

## 📁 Project Structure

```
project/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Shared components
│   │   ├── context/           # Auth context provider
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register, ForgotPassword
│   │   │   ├── customer/      # Customer dashboard & pages
│   │   │   ├── driver/        # Driver dashboard & pages
│   │   │   └── admin/         # Admin dashboard & pages
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main routing
│   │   └── index.css          # Design system
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/                # Database config
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth & error middleware
│   ├── models/                # Mongoose schemas (7 models)
│   ├── routes/                # API routes
│   ├── services/              # Business logic (pricing)
│   ├── scripts/               # Admin seed script
│   ├── uploads/               # File uploads
│   ├── .env                   # Environment variables
│   └── server.js              # Entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment Setup

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/drivehire
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 3. Seed Admin User

```bash
cd server
node scripts/seedAdmin.js
```
Default admin credentials: `admin@drivehire.com` / `Admin@123`

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd server
npm start

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/customers/profile` | Get customer profile |
| CRUD | `/api/customers/vehicles` | Vehicle management |
| GET | `/api/customers/search-drivers` | Search available drivers |
| POST | `/api/customers/bookings` | Create booking |
| PUT | `/api/customers/bookings/:id/cancel` | Cancel booking |
| POST | `/api/customers/reviews` | Submit review |
| GET | `/api/drivers/profile` | Driver profile |
| PUT | `/api/drivers/toggle-online` | Toggle availability |
| PUT | `/api/drivers/jobs/:id/accept` | Accept job |
| PUT | `/api/drivers/jobs/:id/complete` | Complete job |
| GET | `/api/admin/dashboard` | Admin analytics |
| PUT | `/api/admin/drivers/:id/approve` | Approve driver |
| PUT | `/api/admin/users/:id/toggle-block` | Block/unblock user |
| CRUD | `/api/admin/pricing` | Pricing rules |

---

## 🔐 Authentication

- JWT tokens stored in `localStorage`
- Automatic token attachment via Axios interceptor
- Role-based route protection (customer, driver, admin)
- Password hashing with bcrypt (10 salt rounds)

---

## 📌 Notes

- **Payment system is simulated** (mock transactions)
- **Location is text-based** (no Google Maps integration)
- **File uploads** stored locally in `server/uploads/`
- Designed for **academic/portfolio** purposes

---

## 📄 License

This project was created for academic purposes as a BSc Computer Science final year project.
