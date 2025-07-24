#!/bin/bash
set -o errexit

echo "🔧 Starting build process..."

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies with no cache
echo "📦 Installing Python dependencies..."
pip install --no-cache-dir --upgrade -r requirements.txt

# Verify core installations
python -c "import uvicorn; print('✅ uvicorn installed successfully')"
python -c "import fastapi; print('✅ FastAPI installed successfully')" 
python -c "import motor; print('✅ motor installed successfully')"
python -c "import pymongo; print('✅ pymongo installed successfully')"
python -c "import stripe; print('✅ stripe installed successfully')"

echo "✅ Build completed successfully"