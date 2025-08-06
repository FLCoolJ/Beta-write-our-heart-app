#!/bin/bash
echo "Installing production dependencies for Write Our Heart app..."

# Core authentication dependencies
npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken @anthropic-ai/sdk uuid @types/uuid

# AI and API dependencies
npm install sib-api-v3-sdk
npm install stripe

# Database dependencies (SQLite for now)
npm install sqlite3 prisma @prisma/client

echo "Dependencies installed successfully!"
