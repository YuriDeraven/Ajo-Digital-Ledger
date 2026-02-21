#!/bin/bash

echo "🚀 Ajo Digital Ledger - Application Status"
echo "==========================================="
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm available"

# Check if Next.js is running on port 3000
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server running on http://localhost:3000"
else
    echo "❌ Server not responding on port 3000"
    exit 1
fi

# Check database
if [ -f "./db/custom.db" ]; then
    echo "✅ Database exists at ./db/custom.db"
else
    echo "❌ Database not found"
    exit 1
fi

# Check .env.local
if [ -f "./.env.local" ]; then
    echo "✅ Environment configuration found"
else
    echo "❌ .env.local not found"
    exit 1
fi

# Check source files
if [ -d "./src/app" ]; then
    echo "✅ Application source code found"
else
    echo "❌ Source code not found"
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Sign up with admin@test.com to test admin features"
echo "3. Sign up with member@test.com to test member features"
echo "4. Follow QUICK_START.md for complete workflow"
echo ""
echo "📚 Documentation: See DOCUMENTATION_INDEX.md"
