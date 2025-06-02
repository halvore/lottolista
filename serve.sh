#!/bin/bash
echo "🚀 Installerer avhengigheter og starter server..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installerer npm pakker..."
    npm install
fi

echo "🚀 Starter Node.js server..."
echo "📂 Admin interface: http://localhost:3000/admin/"
echo "📄 Hovedside: http://localhost:3000/"
echo ""
echo "Trykk Ctrl+C for å stoppe serveren"
echo ""
node server.js