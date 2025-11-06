#!/bin/bash

# Abort on any error
set -e

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build Angular application
echo "Building Angular application..."
npm run build

echo "Deployment completed successfully!"