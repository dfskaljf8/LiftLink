#!/bin/bash
set -e

echo "🔧 Starting minimal build process..."

# Clean any cached pip files
echo "🧹 Cleaning pip cache..."
pip cache purge || true

# Upgrade pip without cache
echo "⬆️ Upgrading pip..."
python -m pip install --no-cache-dir --upgrade pip

# Install each dependency individually to catch errors
echo "📦 Installing dependencies one by one..."
pip install --no-cache-dir fastapi==0.104.1
pip install --no-cache-dir uvicorn==0.24.0
pip install --no-cache-dir motor==3.3.2
pip install --no-cache-dir pymongo==4.6.0
pip install --no-cache-dir "pydantic==1.10.13"
pip install --no-cache-dir python-multipart==0.0.6
pip install --no-cache-dir stripe==7.8.0
pip install --no-cache-dir httpx==0.25.2
pip install --no-cache-dir python-dotenv==1.0.0
pip install --no-cache-dir PyJWT==2.8.0

# Verify installations
echo "✅ Verifying installations..."
python -c "import fastapi; print('✅ FastAPI:', fastapi.__version__)"
python -c "import uvicorn; print('✅ Uvicorn:', uvicorn.__version__)"
python -c "import motor; print('✅ Motor installed')"
python -c "import pydantic; print('✅ Pydantic:', pydantic.VERSION)"

echo "✅ Build completed successfully - NO RUST REQUIRED!"