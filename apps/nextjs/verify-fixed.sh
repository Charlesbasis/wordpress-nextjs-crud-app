#!/bin/bash

echo "🔍 Next.js Verification"
echo "========================"

echo "1. Checking Bun..."
bun --version && echo "✅ Bun OK" || echo "❌ Bun issue"

echo "2. Checking TypeScript..."
tsc --version && echo "✅ TypeScript OK" || echo "❌ TypeScript not found"

echo "3. Checking shared package..."
[ -f "../../packages/shared/dist/index.js" ] && echo "✅ Shared package built" || echo "❌ Shared package missing"

echo "4. Checking WordPress..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ WordPress running"
else
    echo "⚠️ WordPress not responding (might be starting)"
    echo "   Check with: cd ../.. && docker-compose ps"
fi

echo ""
echo "🎯 Next steps:"
echo "   bun run dev"
