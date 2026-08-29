# ERP System Monorepo

Welcome to the ERP System Monorepo! This repository contains both the frontend React application and the backend Node.js Express API.

## 🚀 Quick Start

Ensure you have Node.js (v18+) installed.

1. **Install Dependencies:**
   Run the following from the root directory to install all dependencies for both frontend and backend using `npm workspaces`:
   ```bash
   npm install
   ```

2. **Start Development Servers:**
   To run both the Vite frontend and the Nodemon backend simultaneously:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`
   - Backend API runs on: `http://localhost:3000`

## 📁 Repository Structure

- `frontend/`: React, Vite, TailwindCSS, Radix UI.
- `backend/`: Node.js, Express, TypeScript.

## 🔒 Production Readiness

This repository has been audited and configured for strict production standards:

### Backend Security
- **Helmet:** Configured to secure HTTP headers.
- **Express-Rate-Limit:** Protects against brute-force attacks (100 req / 15 mins).
- **CORS:** Strictly limited to the frontend URL.
- **Morgan:** Structured HTTP request logging.
- **Centralized Error Handling:** Errors in production are sanitized to prevent leaking stack traces.
- **Environment Validation:** Startup checks to ensure all necessary environment variables are set.

### Frontend Optimization
- **Vite Code Splitting:** `manualChunks` is configured to separate vendor libraries (React, UI components) from application code for optimized caching.

## 📜 Available Scripts (Root)

- `npm run dev`: Starts both servers.
- `npm run build`: Compiles both frontend and backend.
- `npm run install:all`: Fresh install of all workspace dependencies.

## 🛠️ API Documentation

Currently available endpoints:
- `GET /api/health`: Returns the health status of the backend API.
