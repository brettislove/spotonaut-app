#!/bin/bash

# Production Deployment Preparation Script
# This script prepares your database schema for production deployment

echo "🚀 Preparing for Production Deployment"
echo "======================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Backup current schema
echo "📦 Backing up current schema..."
cp prisma/schema.prisma prisma/schema.dev.prisma.backup
echo "✅ Backup created: prisma/schema.dev.prisma.backup"
echo ""

# Copy production schema
echo "🔄 Switching to PostgreSQL schema for production..."
cp prisma/schema.production.prisma prisma/schema.prisma
echo "✅ Production schema activated"
echo ""

# Generate Prisma Client
echo "🔨 Generating Prisma Client for PostgreSQL..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Instructions
echo "📋 Next Steps:"
echo "1. Set your production DATABASE_URL in your deployment platform"
echo "2. Deploy your application"
echo "3. Run migrations: npx prisma migrate deploy"
echo ""
echo "⚠️  Don't forget to set all required environment variables:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - NEXTAUTH_URL (your production domain)"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - GOOGLE_GENERATIVE_AI_API_KEY"
echo "   - RESEND_API_KEY"
echo ""
echo "✅ Ready for production deployment!"
