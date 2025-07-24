#!/bin/bash
set -o errexit

echo "🔧 Starting build process..."

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Verify uvicorn installation
python -c "import uvicorn; print('✅ uvicorn installed successfully')"

# Verify FastAPI installation  
python -c "import fastapi; print('✅ FastAPI installed successfully')"

echo "✅ Build completed successfully"