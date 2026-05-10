# CHT - Cash. Harmony. Transparent. 💰

Complete petty cash management system built on Next.js, TypeScript, Prisma, and PostgreSQL.

## 🎯 Overview

CHT is a comprehensive cash management platform designed to streamline requisition workflows, approvals, treasury operations, and payment execution. Built with modern web technologies, it integrates the complete business logic from the Django petty cash system into a scalable Next.js architecture.

**Key Features:**
- 🔄 Multi-tier approval workflows with dynamic routing
- 💼 Organization hierarchy management (Company → Region → Branch → Department)
- 💳 Payment execution with 2FA (One-Time Password) validation
- 💰 Treasury fund management with auto-replenishment triggers
- 📊 Comprehensive audit trails for all transactions
- 🚀 Scalable API architecture with Next.js
- 🔐 Role-based access control (Staff, Manager, Treasury, CFO, CEO)
- ⚡ Real-time requisition status tracking

---

## 📋 System Architecture

### Database Models (Prisma Schema)

**Organization Structure:**
- **Company** - Top-level organization entity
- **Region** - Geographic regions within company
- **Branch** - Office locations within regions
- **Department** - Departments within branches
- **CostCenter** - Cost centers for budget tracking
- **User** - Staff members with roles and org assignments

**Approval Workflow:**
- **ApprovalThreshold** - Tier-based approval configurations (Tier 1-4)
- **Requisition** - Cash requisition requests with multi-stage approvals
- **ApprovalTrail** - Audit log of all approval actions

**Treasury & Payments:**
- **TreasuryFund** - Fund balance tracking per org level
- **Payment** - Payment records with M-Pesa, Bank, Cash methods
- **LedgerEntry** - Financial transaction ledger
- **Replenishment** - Auto-replenishment requests

### API Endpoints

#### Requisitions
```
POST   /api/requisitions/create       - Create new requisition
GET    /api/requisitions/list         - List requisitions with filtering
POST   /api/requisitions/[id]/approve - Approve/reject requisition
```

#### Payments
```
POST   /api/payments/execute          - Execute payment with 2FA
```

#### Treasury
```
GET    /api/treasury/funds            - List treasury funds
POST   /api/treasury/funds            - Create/update fund
```

#### Workflow
```
GET    /api/workflow/thresholds       - List approval thresholds
POST   /api/workflow/thresholds       - Create threshold
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- PostgreSQL 12+ (Render hosted or local)
- npm or yarn

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/quickserviceslqs-netizen/cht.git
cd cht
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cht"

# Authentication
JWT_SECRET="your-secret-key-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-min-32-chars"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Setup database:**
```bash
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations (first time)
npm run prisma:seed        # Seed demo data
```

5. **Start dev server:**
```bash
npm run dev
```

Visit http://localhost:3000

### Demo Credentials
```
Staff User:    staff@cht.local / demo123
Manager:       manager@cht.local / demo123
Treasury:      treasury@cht.local / demo123
CFO:           cfo@cht.local / demo123
CEO:           ceo@cht.local / demo123
```

---

## 📊 Approval Workflow

### Approval Thresholds

**Tier 1 (0 - 50,000 KES)**
- Route: Department Head → Treasury
- Fast-track: ✅ Allowed for urgent
- CFO Required: ❌
- CEO Required: ❌

**Tier 2 (50,001 - 200,000 KES)**
- Route: Department Head → Branch Manager → Treasury
- Fast-track: ✅ Allowed for urgent
- CFO Required: ❌
- CEO Required: ❌

**Tier 3 (200,001 - 500,000 KES)**
- Route: Department Head → Branch Manager → Regional Manager → CFO → Treasury
- Fast-track: ❌ Not allowed
- CFO Required: ✅
- CEO Required: ❌

**Tier 4 (500,001+ KES)**
- Route: Department Head → CFO → CEO → Treasury
- Fast-track: ❌ Not allowed
- CFO Required: ✅
- CEO Required: ✅

### Workflow State Machine

```
draft
  ↓
pending
  ├→ pending_changes (if changes requested)
  │   ├→ pending (after changes submitted)
  │   └→ rejected
  ├→ approved (after final approval)
  └→ rejected
    
pending_urgency_confirmation
  ├→ approved (after urgency confirmed)
  └→ rejected

pending_cfo_approval → pending_ceo_approval → pending_treasury_validation → paid → reviewed

rejected (terminal)
paid (terminal)
reviewed (terminal)
```

### Core Invariants

1. **No Self-Approval:** User cannot approve their own requisition
2. **Sequential Routing:** Must follow approval sequence, no skipping required tiers
3. **Treasury Validation:** All approved requisitions must be treasury-validated before payment
4. **Segregation of Duties:** Creator ≠ Executor for payments
5. **2FA on Payment:** OTP required for payment execution above certain thresholds

---

## 🔐 Role-Based Access

| Role | Can Create | Can Approve | Can Execute Payments | Can Manage Config |
|------|-----------|-------------|--------------------|--------------------|
| **Staff** | ✅ | ❌ | ❌ | ❌ |
| **Manager** | ✅ | ✅ (Tier 1-2) | ❌ | ❌ |
| **Treasury** | ❌ | ✅ (Validation) | ✅ | ❌ |
| **CFO** | ❌ | ✅ (Tier 3-4) | ✅ | ✅ (Limited) |
| **CEO** | ❌ | ✅ (Tier 4) | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

---

## 💳 Payment Processing with 2FA

### Payment Execution Flow

1. **Request OTP:**
```bash
POST /api/payments/execute
{
  "requisitionId": 1,
  "amount": 50000,
  "method": "mpesa",
  "destination": "+254712345678",
  "requestOTP": true
}
```

2. **Verify OTP:**
```bash
POST /api/payments/execute
{
  "requisitionId": 1,
  "amount": 50000,
  "method": "mpesa",
  "destination": "+254712345678",
  "otpCode": "123456"
}
```

### Payment Methods
- **M-Pesa** - Mobile money transfer (phone number)
- **Bank** - Bank transfer (account details)
- **Cash** - Physical cash disbursement (recipient name)

---

## 📝 Requisition Lifecycle

### Creating a Requisition

```typescript
// API Request
POST /api/requisitions/create
{
  "amount": 75000,
  "purpose": "Emergency equipment repair",
  "originType": "branch",
  "companyId": 1,
  "branchId": 1,
  "departmentId": 2,
  "isUrgent": true,
  "urgencyReason": "Critical system failure",
  "receiptUrl": "https://example.com/receipt.pdf"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "transactionId": "REQ-001",
    "status": "pending",
    "nextApproverId": 3,
    "tier": "Tier 2",
    ...
  }
}
```

### Approving a Requisition

```typescript
POST /api/requisitions/[id]/approve
{
  "action": "approved|rejected|changes_requested",
  "comment": "Approved - funds available"
}
```

### Requesting Changes

```typescript
POST /api/requisitions/[id]/approve
{
  "action": "changes_requested",
  "comment": "Please provide detailed breakdown of equipment items"
}
// Requisition status: pending_changes
// Deadline: 7 days for requester to respond
```

---

## 🏢 Organization Management

### Creating Organization Structure

```bash
# Company
POST /api/organization/companies
{
  "name": "Quick Services Ltd",
  "code": "QSL"
}

# Region
POST /api/organization/regions
{
  "name": "Central Region",
  "code": "CR",
  "companyId": 1
}

# Branch
POST /api/organization/branches
{
  "name": "Nairobi Branch",
  "code": "NRB",
  "companyId": 1,
  "regionId": 1
}

# Department
POST /api/organization/departments
{
  "name": "Finance",
  "code": "FIN",
  "companyId": 1,
  "branchId": 1
}
```

---

## 💰 Treasury Fund Management

### Checking Fund Balances

```bash
GET /api/treasury/funds?companyId=1&checkReorder=true

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "companyId": 1,
      "branchId": 1,
      "currentBalance": 450000,
      "reorderLevel": 100000,
      "needsReplenishment": false,
      "balancePercentage": 450%
    }
  ]
}
```

### Updating Fund Settings

```bash
POST /api/treasury/funds
{
  "companyId": 1,
  "branchId": 1,
  "currentBalance": 500000,
  "reorderLevel": 80000,
  "minBalance": 50000,
  "autoReplenish": true
}
```

### Replenishment Triggers

- **Auto-triggered** when balance < reorderLevel
- **Manual trigger** when admin initiates replenishment
- **Creates ReplenishmentRequest** for approval workflow
- **Treasury executes** when approved

---

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio UI
```

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── requisitions/     # Requisition endpoints
│   │   ├── payments/          # Payment endpoints
│   │   ├── treasury/          # Treasury endpoints
│   │   └── workflow/          # Workflow configuration
│   ├── dashboard/             # Dashboard pages
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Login page
├── components/                # Reusable components
├── lib/
│   ├── auth.ts               # Authentication helpers
│   └── workflow-resolver.ts  # Approval routing logic
└── styles/                    # Styling

prisma/
├── schema.prisma             # Database schema
└── seed.ts                    # Database seed script
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `NEXTAUTH_URL` | NextAuth callback URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret (min 32 chars) | ✅ |
| `NEXT_PUBLIC_API_URL` | Public API base URL | ❌ |

---

## 🚀 Deployment

### Deploy on Render

1. **Push to GitHub:**
```bash
git push origin main
```

2. **Create Render Service:**
- Service: New Web Service
- Connect GitHub repository
- Build command: `npm run build`
- Start command: `npm start`

3. **Environment Variables:**
```
DATABASE_URL=postgresql://render_user:password@host/cht
JWT_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your-secret-min-32-chars
NODE_ENV=production
```

4. **Database Migrations:**
```bash
# After deployment, run migrations
render-cli run "npm run prisma:migrate"
render-cli run "npm run prisma:seed"
```

---

## 📊 API Response Format

All endpoints follow standardized JSON response format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

---

## 🔍 Audit & Compliance

### Approval Trail

Every approval action is logged with:
- User ID and role
- Action type (approved, rejected, changes_requested, paid, etc.)
- Comment/reason
- IP address
- Timestamp
- Auto-escalation flags
- Skipped roles (if any)

### Financial Ledger

Every transaction creates ledger entries:
- Description
- Debit/Credit amounts
- Running balance
- Timestamp

### Change Tracking

Requisitions track:
- Change requests with deadline
- Who requested changes
- Original and updated details
- Resubmission history

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL format
# postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL
```

### Prisma Migration Issues
```bash
# Reset database (⚠️ destructive)
npm run prisma:migrate reset

# Check migration status
npx prisma migrate status
```

### OTP Not Sending
- Check SMTP configuration (future enhancement)
- Currently logs OTP to console in dev
- Implement SMS provider integration (Twilio, AWS SNS)

---

## 🔒 Security

- **Passwords:** Hashed with bcryptjs (salt rounds: 10)
- **Authentication:** JWT tokens with 32-char+ secrets
- **2FA:** OTP via SHA-256 hashing (SMS/Email in future)
- **Role-Based Access:** Database-level enforcement
- **No Self-Approval:** Core business logic invariant
- **Segregation of Duties:** Creator ≠ Executor for payments
- **IP Tracking:** All actions logged with source IP

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Support

For issues or questions:
1. Check GitHub Issues: https://github.com/quickserviceslqs-netizen/cht/issues
2. Review API documentation above
3. Check database schema in `prisma/schema.prisma`

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Production Ready
