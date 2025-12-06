#!/bin/bash

# Spotonaut Database Setup Script
# Run this after setting up your .env file with DATABASE_URL

echo "🚀 Setting up Spotonaut database..."

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Creating database migrations..."
npx prisma migrate dev --name initial_setup

echo "✅ Database setup complete!"
echo ""
echo "To view your database in Prisma Studio, run:"
echo "  npx prisma studio"
echo ""
echo "To deploy migrations to production, run:"
echo "  npx prisma migrate deploy"
