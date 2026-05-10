# Superuser/Admin Management

## Overview

The CHT system uses environment variables to manage superuser (admin) creation. This ensures that:
- ✅ Admin credentials are not hardcoded
- ✅ Different admins can be created for different environments
- ✅ Sensitive credentials are managed via environment variables
- ✅ Automatic initialization on first run

## Environment Variables

### Required (with defaults)

```bash
# Admin email address
SUPERUSER_EMAIL=admin@cht.local

# Admin username
SUPERUSER_USERNAME=admin

# Admin password (CHANGE IN PRODUCTION!)
SUPERUSER_PASSWORD=demo123
```

## Creating/Updating Superuser

### Option 1: During Database Seeding (Recommended)

Run the full seed script which includes superuser initialization:

```bash
npm run prisma:seed
```

This will:
1. Create the superuser from environment variables
2. Create demo data (companies, users, thresholds, etc.)
3. Set up initial treasury funds

### Option 2: Independent Superuser Creation

Create or update the superuser without running the full seed:

```bash
npm run prisma:create-superuser
```

### Option 3: Manual Script Execution

```bash
tsx prisma/create-superuser.ts
```

## Environment Setup

### Local Development

1. Update `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@localhost/cht
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-chars

# Superuser configuration
SUPERUSER_EMAIL=admin@cht.local
SUPERUSER_USERNAME=admin
SUPERUSER_PASSWORD=demo123
```

2. Run seed:

```bash
npm run prisma:seed
```

### Production (Render)

1. In Render Dashboard → Environment Variables, add:

```
SUPERUSER_EMAIL=admin@yourdomain.com
SUPERUSER_USERNAME=admin
SUPERUSER_PASSWORD=your-secure-password-min-12-chars
```

2. The superuser will be auto-created during the build process via:
   ```json
   "build": "prisma db push --skip-generate --accept-data-loss && next build"
   ```

## Security Best Practices

### ⚠️ IMPORTANT

1. **Change default password immediately** after first login
2. **Never commit** credentials to version control
3. **Use strong passwords** in production (min 12 characters)
4. **Rotate passwords** regularly
5. **Use environment secrets** in CI/CD pipelines

### Password Requirements

- **Local Development**: demo123 (acceptable for dev)
- **Production**: Min 12 characters, mix of uppercase, lowercase, numbers, symbols

### Example Strong Password

```
Secure!P@ssw0rd2024
AdminK3y$Secure#CHT
```

## Accessing Admin Panel

1. **Login URL**: `https://your-app.com/admin`
   
2. **Using seed demo admin**: admin@cht.local / demo123

3. **Using custom env superuser**: Use SUPERUSER_EMAIL / SUPERUSER_PASSWORD

## Managing Multiple Superusers

The CHT system supports multiple admin users:

1. **Create initial superuser** via environment variables
2. **Create additional admins** via `/admin/users` interface
3. **All admins** have full system access

### Via Admin UI

1. Go to `/admin/users`
2. Click "Create User"
3. Fill in details
4. Select role: `admin`
5. Click "Create User"

## Troubleshooting

### Superuser Not Created

**Problem**: Superuser email already exists in database

**Solution**: 
```bash
# Option 1: Change SUPERUSER_EMAIL env var
# Option 2: Delete existing user and recreate
# Option 3: Update existing user via /admin/users
```

### Cannot Login

**Problem**: Password incorrect

**Solution**:
1. Reset via `/admin/users` (if another admin exists)
2. Or recreate: `npm run prisma:create-superuser`

### Database Connection Error

**Problem**: Superuser creation fails during seed

**Solution**:
1. Verify DATABASE_URL is correct
2. Check database is running
3. Ensure database is accessible from your network

## API Reference

### Superuser Initialization (Internal)

File: `prisma/init-superuser.ts`

```typescript
import { initializeSuperuser } from '@/prisma/init-superuser';

// Automatically creates superuser from env vars if it doesn't exist
const admin = await initializeSuperuser();
```

### Environment Variable Priority

1. `SUPERUSER_EMAIL` env variable
2. Falls back to: `admin@cht.local`

Same for username and password.

## Migration from Django

If migrating from Django:

1. Get Django superuser credentials
2. Set as environment variables:
   ```
   SUPERUSER_EMAIL=your-django-admin@email.com
   SUPERUSER_PASSWORD=your-password
   ```
3. Run seed or create-superuser command
4. Admin user created with same credentials

## Related Files

- `/prisma/init-superuser.ts` - Superuser initialization logic
- `/prisma/create-superuser.ts` - CLI script for manual creation
- `/prisma/seed.ts` - Full database seed including superuser
- `/src/app/admin/users/page.tsx` - Admin UI for user management
- `/src/app/api/admin/users/route.ts` - Admin API endpoints
