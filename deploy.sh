#!/bin/bash

# Production deployment script for modern-invoicing-app
# This script deploys only the necessary components (no storage)

echo "🚀 Starting deployment to Firebase..."

# Build the production version
echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build successful!"

# Deploy only firestore and hosting (no storage)
echo "🌐 Deploying to Firebase (firestore + hosting)..."
firebase deploy --only firestore,hosting

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "Your app is now live at: https://invoicewritenow.web.app"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi