#!/bin/bash

# Local Development Setup Script
# This script restores your database schema for local development

echo "🛠️  Restoring Local Development Setup"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if backup exists
if [ -f "prisma/schema.dev.prisma.backup" ]; then
    echo "📦 Restoring schema from backup..."
    cp prisma/schema.dev.prisma.backup prisma/schema.prisma
    echo "✅ Schema restored from backup"
else
    echo "⚠️  No backup found. Using default SQLite schema..."
    # Restore the provider to sqlite
    sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    sed -i.bak 's/@db.Text//g' prisma/schema.prisma
    rm -f prisma/schema.prisma.bak
    echo "✅ Schema updated to SQLite"
fi

echo ""

# Update environment
echo "📝 Checking environment configuration..."
if [ -f ".env" ]; then
    if grep -q "file:./dev.db" .env; then
        echo "✅ .env already configured for SQLite"
    else
        echo "⚠️  Please ensure .env has: DATABASE_URL=\"file:./dev.db\""
    fi
else
    echo "⚠️  .env file not found. Please create it with: DATABASE_URL=\"file:./dev.db\""
fi

echo ""

# Generate Prisma Client
echo "🔨 Generating Prisma Client for SQLite..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev
echo "✅ Database ready"
echo ""

echo "✅ Local development environment restored!"
echo ""
echo "You can now run: npm run dev"
