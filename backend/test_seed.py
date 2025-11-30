#!/usr/bin/env python3
"""
Quick test script to verify seeding and API functionality
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def test_connection():
    """Test Supabase connection"""
    print("Testing Supabase connection...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ SUPABASE_URL and SUPABASE_KEY must be set")
        return False
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        result = supabase.table('road_damage').select('id').limit(1).execute()
        print("✅ Connection successful")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


def test_table_exists():
    """Test if road_damage table exists"""
    print("\nTesting road_damage table...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        result = supabase.table('road_damage').select('*').limit(1).execute()
        print("✅ Table exists")
        return True
    except Exception as e:
        print(f"❌ Table check failed: {e}")
        return False


def test_storage_bucket():
    """Test if damage-images bucket exists"""
    print("\nTesting damage-images storage bucket...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        # Try to list files in bucket
        result = supabase.storage.from_('damage-images').list()
        print("✅ Storage bucket exists")
        return True
    except Exception as e:
        print(f"❌ Storage bucket check failed: {e}")
        print("   Create bucket 'damage-images' in Supabase Dashboard")
        return False


def count_seed_records():
    """Count existing seed records"""
    print("\nCounting seed records...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # Count all records
        all_result = supabase.table('road_damage').select('id', count='exact').execute()
        total_count = all_result.count if hasattr(all_result, 'count') else len(all_result.data)
        
        # Count seed records
        seed_result = supabase.table('road_damage').select('*').execute()
        seed_count = sum(1 for r in seed_result.data if r.get('metadata', {}).get('seed_data'))
        
        print(f"✅ Total records: {total_count}")
        print(f"   Seed records: {seed_count}")
        print(f"   Real records: {total_count - seed_count}")
        
        return True
    except Exception as e:
        print(f"❌ Count failed: {e}")
        return False


def show_sample_records():
    """Show sample records"""
    print("\nSample records (latest 3):")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        result = supabase.table('road_damage').select('*').order('detected_at', desc=True).limit(3).execute()
        
        for i, record in enumerate(result.data, 1):
            print(f"\n   Record {i}:")
            print(f"   - ID: {record['id']}")
            print(f"   - Type: {record['damage_type']}")
            print(f"   - Severity: {record['severity']}")
            print(f"   - Confidence: {record['confidence_score']}")
            print(f"   - Location: ({record['latitude']}, {record['longitude']})")
            print(f"   - Detected: {record['detected_at']}")
            is_seed = record.get('metadata', {}).get('seed_data', False)
            print(f"   - Seed data: {is_seed}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to fetch records: {e}")
        return False


def main():
    print("=" * 60)
    print("Seed Data Test Script")
    print("=" * 60)
    print()
    
    tests = [
        test_connection,
        test_table_exists,
        test_storage_bucket,
        count_seed_records,
        show_sample_records
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    if all(results[:3]):  # First 3 tests are critical
        print("✅ All critical tests passed!")
        print("\nYou can now run:")
        print("  python seed_data.py          # Seed with placeholder images")
        print("  python seed_with_images.py   # Seed with generated images")
    else:
        print("❌ Some tests failed. Fix issues above before seeding.")
        sys.exit(1)


if __name__ == "__main__":
    main()
