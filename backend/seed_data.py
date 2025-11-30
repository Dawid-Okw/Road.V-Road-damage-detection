#!/usr/bin/env python3
"""
Seed script to populate the database with sample road damage data for testing
"""
import os
import sys
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Sample damage data
DAMAGE_TYPES = ["crack", "pothole", "patch", "manhole"]
SEVERITIES = ["low", "medium", "high"]

# Sample coordinates (various locations for testing map view)
SAMPLE_LOCATIONS = [
    {"lat": 40.7128, "lng": -74.0060, "name": "New York"},
    {"lat": 34.0522, "lng": -118.2437, "name": "Los Angeles"},
    {"lat": 41.8781, "lng": -87.6298, "name": "Chicago"},
    {"lat": 29.7604, "lng": -95.3698, "name": "Houston"},
    {"lat": 33.4484, "lng": -112.0740, "name": "Phoenix"},
    {"lat": 39.7392, "lng": -104.9903, "name": "Denver"},
    {"lat": 47.6062, "lng": -122.3321, "name": "Seattle"},
    {"lat": 37.7749, "lng": -122.4194, "name": "San Francisco"},
    {"lat": 25.7617, "lng": -80.1918, "name": "Miami"},
    {"lat": 42.3601, "lng": -71.0589, "name": "Boston"},
]

# Sample placeholder images (using placeholder service)
def get_placeholder_image_url(damage_type: str, index: int) -> str:
    """Generate placeholder image URL"""
    colors = {
        "crack": "FF6B6B",
        "pothole": "4ECDC4",
        "patch": "95E1D3",
        "manhole": "F38181"
    }
    color = colors.get(damage_type, "CCCCCC")
    return f"https://via.placeholder.com/640x480/{color}/FFFFFF?text={damage_type.upper()}+{index}"


def create_sample_records(count: int = 20):
    """Create sample damage records"""
    records = []
    base_time = datetime.utcnow()
    
    for i in range(count):
        # Random damage type and severity
        damage_type = random.choice(DAMAGE_TYPES)
        severity = random.choice(SEVERITIES)
        
        # Random location
        location = random.choice(SAMPLE_LOCATIONS)
        
        # Add some random offset to coordinates for variety
        lat_offset = random.uniform(-0.05, 0.05)
        lng_offset = random.uniform(-0.05, 0.05)
        
        # Random confidence score (higher for testing)
        confidence = random.uniform(0.65, 0.98)
        
        # Stagger timestamps (most recent first)
        time_offset = timedelta(hours=random.randint(0, 72))
        detected_at = base_time - time_offset
        
        # Create metadata
        metadata = {
            "frame_number": random.randint(0, 1000),
            "video_filename": f"test_video_{random.randint(1, 5)}.mp4",
            "bbox": {
                "x1": random.randint(50, 200),
                "y1": random.randint(50, 200),
                "x2": random.randint(250, 400),
                "y2": random.randint(250, 400)
            },
            "location_name": location["name"],
            "seed_data": True
        }
        
        record = {
            "damage_type": damage_type,
            "severity": severity,
            "latitude": location["lat"] + lat_offset,
            "longitude": location["lng"] + lng_offset,
            "confidence_score": round(confidence, 3),
            "detected_at": detected_at.isoformat(),
            "image_url": get_placeholder_image_url(damage_type, i + 1),
            "metadata": metadata
        }
        
        records.append(record)
    
    return records


def seed_database(count: int = 20, clear_existing: bool = False):
    """Seed the database with sample data"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        sys.exit(1)
    
    print(f"Connecting to Supabase: {supabase_url}")
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Clear existing seed data if requested
        if clear_existing:
            print("🗑️  Clearing existing seed data...")
            try:
                # Delete records with seed_data flag in metadata
                result = supabase.table('road_damage').delete().eq('metadata->>seed_data', 'true').execute()
                print(f"   Deleted {len(result.data) if result.data else 0} existing seed records")
            except Exception as e:
                print(f"   Warning: Could not clear existing data: {e}")
        
        # Generate sample records
        print(f"📝 Generating {count} sample records...")
        records = create_sample_records(count)
        
        # Insert records
        print("💾 Inserting records into database...")
        result = supabase.table('road_damage').insert(records).execute()
        
        if result.data:
            print(f"✅ Successfully inserted {len(result.data)} records!")
            
            # Print summary
            print("\n📊 Summary:")
            damage_counts = {}
            severity_counts = {}
            
            for record in records:
                damage_type = record["damage_type"]
                severity = record["severity"]
                
                damage_counts[damage_type] = damage_counts.get(damage_type, 0) + 1
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            print("\n   Damage Types:")
            for dtype, count in sorted(damage_counts.items()):
                print(f"   - {dtype}: {count}")
            
            print("\n   Severities:")
            for sev, count in sorted(severity_counts.items()):
                print(f"   - {sev}: {count}")
            
            print(f"\n   Time range: Last 72 hours")
            print(f"   Locations: {len(SAMPLE_LOCATIONS)} cities")
            
            print("\n🎉 Database seeded successfully!")
            print("\nYou can now test the frontend with this data.")
            print("API endpoint: GET http://localhost:8000/api/v1/damages/latest")
            
        else:
            print("❌ Error: No data was inserted")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


def clear_seed_data():
    """Clear all seed data from database"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        sys.exit(1)
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        print("🗑️  Clearing all seed data...")
        result = supabase.table('road_damage').delete().eq('metadata->>seed_data', 'true').execute()
        
        count = len(result.data) if result.data else 0
        print(f"✅ Deleted {count} seed records")
        
    except Exception as e:
        print(f"❌ Error clearing seed data: {e}")
        sys.exit(1)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed database with sample road damage data")
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of records to create (default: 20)"
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing seed data before inserting new data"
    )
    parser.add_argument(
        "--clear-only",
        action="store_true",
        help="Only clear seed data, don't insert new data"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Road Damage Detection - Database Seeder")
    print("=" * 60)
    print()
    
    if args.clear_only:
        clear_seed_data()
    else:
        seed_database(count=args.count, clear_existing=args.clear)


if __name__ == "__main__":
    main()
