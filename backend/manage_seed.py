#!/usr/bin/env python3
"""
Convenient CLI tool to manage seed data
"""
import sys
import subprocess


def print_menu():
    """Print main menu"""
    print("\n" + "=" * 60)
    print("Seed Data Management Tool")
    print("=" * 60)
    print("\n1. Quick seed (20 records, placeholder images)")
    print("2. Realistic seed (20 records, generated images)")
    print("3. Custom seed (specify count)")
    print("4. View seed statistics")
    print("5. Clear all seed data")
    print("6. Test database connection")
    print("7. Exit")
    print()


def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True)
        return result.returncode == 0
    except subprocess.CalledProcessError:
        return False


def quick_seed():
    """Quick seed with placeholder images"""
    print("\n🚀 Quick seeding with placeholder images...")
    return run_command("python seed_data.py")


def realistic_seed():
    """Realistic seed with generated images"""
    print("\n🎨 Realistic seeding with generated images...")
    print("⚠️  This may take 1-2 minutes...")
    return run_command("python seed_with_images.py")


def custom_seed():
    """Custom seed with user-specified count"""
    print("\nCustom Seed Options:")
    print("1. Placeholder images (fast)")
    print("2. Generated images (slow)")
    
    choice = input("\nSelect option (1-2): ").strip()
    
    if choice not in ["1", "2"]:
        print("❌ Invalid choice")
        return False
    
    count = input("Enter number of records (default 20): ").strip()
    if not count:
        count = "20"
    
    try:
        count_int = int(count)
        if count_int < 1 or count_int > 1000:
            print("❌ Count must be between 1 and 1000")
            return False
    except ValueError:
        print("❌ Invalid number")
        return False
    
    clear = input("Clear existing seed data first? (y/n): ").strip().lower()
    clear_flag = "--clear" if clear == "y" else ""
    
    if choice == "1":
        print(f"\n🚀 Seeding {count} records with placeholder images...")
        return run_command(f"python seed_data.py --count {count} {clear_flag}")
    else:
        print(f"\n🎨 Seeding {count} records with generated images...")
        print("⚠️  This may take several minutes...")
        return run_command(f"python seed_with_images.py --count {count} {clear_flag}")


def view_stats():
    """View seed statistics"""
    print("\n📊 Viewing seed statistics...")
    return run_command("python test_seed.py")


def clear_seed():
    """Clear all seed data"""
    print("\n⚠️  WARNING: This will delete all seed data!")
    confirm = input("Are you sure? (yes/no): ").strip().lower()
    
    if confirm != "yes":
        print("❌ Cancelled")
        return False
    
    print("\n🗑️  Clearing seed data...")
    return run_command("python seed_data.py --clear-only")


def test_connection():
    """Test database connection"""
    print("\n🔌 Testing database connection...")
    return run_command("python test_seed.py")


def main():
    """Main entry point"""
    while True:
        print_menu()
        choice = input("Select option (1-7): ").strip()
        
        if choice == "1":
            success = quick_seed()
        elif choice == "2":
            success = realistic_seed()
        elif choice == "3":
            success = custom_seed()
        elif choice == "4":
            success = view_stats()
        elif choice == "5":
            success = clear_seed()
        elif choice == "6":
            success = test_connection()
        elif choice == "7":
            print("\n👋 Goodbye!")
            sys.exit(0)
        else:
            print("❌ Invalid choice. Please select 1-7.")
            continue
        
        if success:
            print("\n✅ Operation completed successfully!")
        else:
            print("\n❌ Operation failed. Check errors above.")
        
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
