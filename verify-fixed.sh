#!/bin/bash

echo "🔍 Post-Fix Verification"
echo "========================"

echo "1. Checking Bun..."
bun --version && echo "✅ Bun OK" || echo "❌ Bun issue"

echo "2. Checking TypeScript..."
if command -v tsc &> /dev/null; then
    tsc --version && echo "✅ TypeScript OK"
else
    echo "⚠️ TypeScript not in PATH (may be installed locally)"
fi

echo "3. Checking shared package..."
[ -f "packages/shared/dist/index.js" ] && echo "✅ Shared package built" || echo "❌ Shared package missing"

echo "4. Checking WordPress..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ WordPress running"
else
    echo "⚠️ WordPress not responding (might be starting)"
    echo "   Check with: docker compose ps"
fi

echo "5. Checking Docker containers..."
if command -v docker &> /dev/null; then
    docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "⚠️ Docker not running or containers not started"
else
    echo "❌ Docker not found"
fi

echo ""
echo "🎯 Next steps:"
echo "   cd apps/nextjs && bun run dev"
