# Khatabook ERP

A TallyPrime-inspired ERP system for Indian businesses built with Next.js and FastAPI.

## Features
- Ledger Management (Customer, Supplier, Bank)
- Stock Items with auto inventory tracking
- Sales Voucher with PDF Invoice
- Purchase Voucher with auto stock update
- Payment Voucher with bank/cash tracking
- Reports (Stock Summary, Sales Register, Purchase Register)
- Excel Export
- Global Search (Ctrl+K)
- Keyboard Shortcuts
- Dark Mode
- Real-time Notifications

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion
- Zustand

### Backend
- FastAPI (Python 3.11)
- SQLAlchemy
- PostgreSQL (Supabase)
- JWT Authentication
- ReportLab (PDF)

## Setup

### Backend
```bash
cd khatabook-erp-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd khatabook-erp-frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

## Environment Variables

### Backend (.env)
- DATABASE_URL — Supabase PostgreSQL URL
- SECRET_KEY — JWT secret key
- FRONTEND_URL — Frontend URL

### Frontend (.env.local)
- NEXT_PUBLIC_API_URL — Backend API URL
