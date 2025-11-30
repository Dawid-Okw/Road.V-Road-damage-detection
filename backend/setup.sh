#!/bin/bash

echo "Setting up Road Damage Detection Backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p models
mkdir -p uploads

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update with your Supabase credentials."
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Place your ONNX model file in models/ directory"
echo "3. Run the server: python -m uvicorn app.main:app --reload"
