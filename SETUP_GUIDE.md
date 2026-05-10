# CHT - Setup & Development Guide

## Overview

CHT (Cash. Harmony. Transparent.) is a lightweight cash management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## ✅ What's Been Created

### Project Structure
```
web-app/
├── src/
│   ├── app/
│   │   ├── api/                    # RESTful API endpoints
│   │   │   ├── auth/login/        # Login endpoint
│   │   │   ├── requisitions/      # Requisition CRUD
│   │   │   ├── approvals/         # Approval workflow
│   │   │   └── treasury/          # Treasury management
│   │   ├── dashboard/             # Main dashboard
│   │   ├── dashboard/requisitions/new/  # New requisition form
│   │   ├── page.tsx               # Login page
│   │   └── layout.tsx             # Root layout
│   └── components/                # Reusable React components
├── prisma/
│   └── schema.prisma              # PostgreSQL database schema
├── .vscode/
│   └── tasks.json                 # VS Code tasks
├── .env.local                     # Environment variables (local)
├── .env.example                   # Environment template
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind CSS config
└── README.md                      # Full documentation
```

### Core Features Implemented

✅ **Modern UI**
- Login page with gradient design
- Dashboard with stats, quick actions, and requisitions table
- New requisition form with validation
- Responsive design (mobile & desktop)
- Tailwind CSS styling

✅ **API Endpoints**
- POST /api/auth/login - Authentication
- GET/POST /api/requisitions - Requisition management
- POST /api/approvals - Approval workflow
- GET/POST /api/treasury - Treasury management

✅ **Database Schema** (Prisma)
- User model (roles: staff, manager, treasurer, ceo)
- Requisition model with approval tracking
- Approval model for workflow
- Payment model for fund execution
- TreasuryFund model for fund management
- LedgerEntry model for financial tracking
- Replenishment model for auto-replenishment

✅ **Configuration**
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Environment variables setup
- Development task configured

---

## 📋 What You Need to Do Next

### 1. Configure PostgreSQL Database

Choose one:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL from: https://www.postgresql.org/download/windows/
# Create a database:
createdb pettycash
```

**Option B: Cloud Database (Recommended)**
- Neon: https://neon.tech/
- Supabase: https://supabase.com/
- Railway: https://railway.app/
- Render: https://render.com/

### 2. Set Environment Variables

```bash
cd c:\Users\ADMIN\pettycash_system\web-app
# Edit .env.local with your database URL
```

Example `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pettycash"
NEXTAUTH_SECRET="generate-a-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Prisma

```bash
cd web-app

# Generate Prisma Client
npm run prisma:generate

# Create database migrations
npm run prisma:migrate init

# Optional: View database with Prisma Studio
npm run prisma:studio
```

### 4. Start Development Server

```bash
cd web-app
npm run dev
```

Then open: **http://localhost:3000**

---

## 🚀 Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create migrations
npm run prisma:studio    # Open Prisma Studio
```

---

## 📦 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 16+ |
| **Language** | TypeScript | 5+ |
| **UI Library** | React | 19+ |
| **Styling** | Tailwind CSS | 4+ |
| **Database** | PostgreSQL | 12+ |
| **ORM** | Prisma | 5+ |
| **Runtime** | Node.js | 20+ |

---

## 🔌 Integration with Django Backend

To connect with your existing Django API:

1. Update API routes to proxy requests to Django
2. Create `.env.local` entry:
   ```
   DJANGO_API_URL="https://your-django-app.com"
   ```

3. Example proxy route in `src/app/api/proxy/[...path]/route.ts`:
   ```typescript
   export async function POST(request, context) {
     const { path } = context.params;
     const response = await fetch(`${DJANGO_API_URL}/${path.join('/')}`, {
       method: 'POST',
       body: await request.json(),
       headers: request.headers,
     });
     return response;
   }
   ```

---

## 📚 Next Steps After Setup

1. ✅ Test login page (currently uses mock auth)
2. ✅ Test dashboard and requisition form
3. ✅ Connect to real database
4. 🔄 Implement real authentication (add NextAuth.js if needed)
5. 🔄 Replace mock data with database queries
6. 🔄 Add real approval workflow logic
7. 🔄 Implement treasury payment execution
8. 🔄 Add reporting and analytics
9. 🔄 Deploy to production (Vercel recommended)

---

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Database connection error?
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Test connection: `psql -U user -d pettycash`

### Node modules issues?
```bash
rm -r node_modules package-lock.json
npm install
```

### Prisma migration error?
```bash
npm run prisma:migrate reset
```

---

## 📱 Deployment Options

1. **Vercel** (Recommended - One-click deploy)
   - Connect GitHub repo → Auto-deploy on push
   - Free tier available

2. **Railway**
   - Connect GitHub → Deploy
   - Free trial available

3. **Render**
   - Similar to Railway
   - PostgreSQL database included

4. **Self-hosted**
   - Docker containerization
   - Run on any server (AWS, DigitalOcean, etc.)

---

## 💡 Key Features to Implement Next

- [ ] Real database integration
- [ ] User authentication (NextAuth.js)
- [ ] Role-based access control (RBAC)
- [ ] Email notifications
- [ ] File uploads (receipts)
- [ ] PDF reports generation
- [ ] Real-time updates (WebSockets)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Test suite (Jest + React Testing Library)
- [ ] E2E tests (Playwright/Cypress)

---

## 📞 Support

For questions or issues:
1. Check the README.md for detailed documentation
2. Review the Prisma schema in `prisma/schema.prisma`
3. Check API routes in `src/app/api/`

**Created:** May 10, 2026  
**Status:** Ready for development  
**Next:** Configure database and start dev server!
