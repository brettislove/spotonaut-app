# Spotonaut V1 Production Setup Guide

## ✅ Completed Implementation

The following has been implemented:

### Core Features
- ✅ Simplified AI metrics (locality score, footfall score, recommended hours)
- ✅ Location name display from geocoding
- ✅ Browser fingerprinting (User-Agent + Canvas)
- ✅ Updated UI components (map view with 3 metric cards)
- ✅ Database schema with all required models
- ✅ NextAuth.js configuration (Google OAuth + Email/Password)
- ✅ Authentication modal UI
- ✅ Usage tracking for anonymous users (1 analysis limit)
- ✅ Protected chat API (requires authentication)
- ✅ Session management with JWT

### Files Created/Modified
1. **lib/mastra/agent.ts** - Simplified AI prompt
2. **lib/fingerprint.ts** - Browser fingerprinting utility
3. **app/api/analysis/route.ts** - Updated with usage tracking
4. **app/api/chat/route.ts** - Protected with authentication
5. **app/api/auth/[...nextauth]/route.ts** - NextAuth configuration
6. **app/api/auth/signup/route.ts** - User registration endpoint
7. **components/auth-modal.tsx** - Login/signup modal
8. **components/auth-provider.tsx** - Session provider wrapper
9. **components/chat-interface.tsx** - Updated with auth integration
10. **components/map-view.tsx** - Redesigned with 3 metrics
11. **prisma/schema.prisma** - Complete database schema
12. **app/layout.tsx** - Wrapped with AuthProvider

---

## 🚀 Next Steps to Deploy

### 1. Local Development Database Setup

**You're already set up!** The project uses SQLite for local development:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) View database
npm run db:studio
```

Your local database is at `prisma/dev.db`.

### 2. Environment Variables Setup

For local development, update `.env`:

```bash
# Database (already configured for SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# AI Service (add your key)
GOOGLE_GENERATIVE_AI_API_KEY="your-existing-api-key"
```

For production deployment, you'll need:

```bash
# Database (PostgreSQL from Prisma or Vercel)
DATABASE_URL="postgresql://user:password@host:5432/spotonaut"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth - Get from https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Service
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"

# Email Service - Get from https://resend.com/
RESEND_API_KEY="re_your_resend_api_key"
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env` or `.env.local`

### 4. Testing Locally

```bash
# Start development server
npm run dev

# Test the following:
# 1. Anonymous user - one free analysis
# 2. Try second analysis - should show auth modal
# 3. Sign up with email/password
# 4. Sign in with Google OAuth
# 5. Authenticated user - unlimited analyses
# 6. Chat functionality (requires auth)
```

### 5. Production Deployment

When you're ready to deploy to production:

```bash
# 1. Prepare for production (switches to PostgreSQL schema)
npm run prepare:prod

# 2. Set environment variables in your deployment platform (Vercel, Railway, etc.)
# See DATABASE_SETUP.md for details

# 3. Deploy your application
# Your platform will run: npm run build && npm run start

# 4. Deploy database migrations (in your deployment platform or CI/CD)
npm run db:deploy
```

To return to local development after production prep:

```bash
npm run restore:dev
```

See `DATABASE_SETUP.md` for detailed instructions.

### 6. Optional: Email Templates (for future)

Email templates for password reset and verification will be needed. For now, basic functionality works without them.

---

## 📋 Features Overview

### For Anonymous Users
- ✅ 1 free location analysis
- ✅ View 3 simplified metrics (locality score, footfall score, recommended hours)
- ✅ See location on map
- ❌ Cannot chat with AI
- ❌ Cannot perform additional analyses

### For Authenticated Users
- ✅ Unlimited location analyses
- ✅ Full chat functionality with AI
- ✅ Analysis history saved to database
- ✅ All metrics and map features

### Authentication Methods
- ✅ Email/Password registration and login
- ✅ Google OAuth sign-in
- 🔜 Facebook OAuth (future)
- 🔜 Apple OAuth (future)

---

## 🔧 Troubleshooting

### Prisma Client Errors
If you see "PrismaClient is not configured" errors:
```bash
npx prisma generate
```

### NextAuth Session Errors
Make sure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain.

### Google OAuth Redirect Errors
Verify the redirect URIs in Google Cloud Console match your callback URL exactly.

### Database Connection Errors
Verify `DATABASE_URL` is correct and PostgreSQL is running.

---

## 🎯 Production Deployment Checklist

- [ ] Run `npm run prepare:prod` to switch to PostgreSQL schema
- [ ] Set up production PostgreSQL database (Vercel Postgres, Prisma, or Railway)
- [ ] Update `NEXTAUTH_URL` to production domain in deployment platform
- [ ] Generate and set `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure Google OAuth with production callback URL
- [ ] Set up Resend account for production emails
- [ ] Set all environment variables in deployment platform
- [ ] Deploy application
- [ ] Run `npm run db:deploy` to deploy migrations
- [ ] Test complete authentication flow
- [ ] Test usage limits
- [ ] Monitor error logs
- [ ] Run `npm run restore:dev` to return to local development

---

## 📊 Database Schema Summary

- **users** - User accounts (email/password + OAuth)
- **accounts** - OAuth provider connections
- **analyses** - Saved location analyses
- **anonymous_usage** - Usage tracking by IP + fingerprint
- **verification_tokens** - Email verification (optional)
- **password_reset_tokens** - Password reset tokens (to be implemented)

---

## 🚧 Future Enhancements

1. **Password Reset Flow**
   - Email templates with Resend
   - Reset token generation and validation
   - UI for password reset page

2. **Email Verification**
   - Optional verification on signup
   - Resend verification email option

3. **Analysis History**
   - View past analyses for authenticated users
   - Export analysis results

4. **Additional OAuth Providers**
   - Facebook
   - Apple

5. **Server-Side Rate Limiting**
   - Implement rate limiting middleware
   - Prevent API abuse

---

## 💡 Notes

- Anonymous usage tracking uses localStorage + IP + fingerprint for abuse prevention
- Chat API requires authentication to prevent abuse
- Analysis API allows 1 anonymous analysis, unlimited for authenticated users
- All sessions use JWT strategy for scalability
- Database saves all analyses for future analytics
