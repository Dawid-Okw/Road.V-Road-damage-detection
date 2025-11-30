#!/usr/bin/env python3
"""
Verification script to check backend setup and dependencies
"""
import sys
import os


def check_python_version():
    """Check Python version is 3.10+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("❌ Python 3.10+ required")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_dependencies():
    """Check required packages are installed"""
    required = [
        'fastapi',
        'uvicorn',
        'onnxruntime',
        'cv2',
        'numpy',
        'supabase',
        'pydantic'
    ]
    
    missing = []
    for package in required:
        try:
            if package == 'cv2':
                __import__('cv2')
            else:
                __import__(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"❌ {package} not found")
            missing.append(package)
    
    return len(missing) == 0


def check_env_file():
    """Check .env file exists and has required variables"""
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        print("   Run: cp .env.example .env")
        return False
    
    print("✓ .env file exists")
    
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'MODEL_PATH'
    ]
    
    from dotenv import load_dotenv
    load_dotenv()
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            print(f"❌ {var} not set in .env")
            missing.append(var)
        else:
            print(f"✓ {var} configured")
    
    return len(missing) == 0


def check_directories():
    """Check required directories exist"""
    dirs = ['models', 'uploads']
    
    for directory in dirs:
        if not os.path.exists(directory):
            print(f"⚠ {directory}/ directory not found, creating...")
            os.makedirs(directory)
        print(f"✓ {directory}/ directory exists")
    
    return True


def check_model_file():
    """Check ONNX model file exists"""
    from dotenv import load_dotenv
    load_dotenv()
    
    model_path = os.getenv('MODEL_PATH', './models/road_damage_yolo.onnx')
    
    if not os.path.exists(model_path):
        print(f"⚠ Model file not found: {model_path}")
        print("   Place your ONNX model file in the models/ directory")
        return False
    
    print(f"✓ Model file exists: {model_path}")
    return True


def main():
    print("=" * 60)
    print("Road Damage Detection Backend - Setup Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", check_env_file),
        ("Directories", check_directories),
        ("Model File", check_model_file),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        print("-" * 40)
        results.append(check_func())
    
    print("\n" + "=" * 60)
    if all(results[:-1]):  # All except model file (optional)
        print("✓ Setup verification passed!")
        print("\nYou can now start the server:")
        print("  python -m uvicorn app.main:app --reload")
    else:
        print("❌ Setup verification failed")
        print("\nPlease fix the issues above and run again.")
        sys.exit(1)
    
    if not results[-1]:
        print("\n⚠ Note: Model file not found. Add it before processing videos.")


if __name__ == "__main__":
    main()
