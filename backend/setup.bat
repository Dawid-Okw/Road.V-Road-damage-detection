@echo off

echo Setting up Road Damage Detection Backend...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install dependencies
pip install -r requirements.txt

REM Create necessary directories
if not exist models mkdir models
if not exist uploads mkdir uploads

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo Created .env file. Please update with your Supabase credentials.
)

echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your Supabase credentials
echo 2. Place your ONNX model file in models/ directory
echo 3. Run the server: python -m uvicorn app.main:app --reload

pause
