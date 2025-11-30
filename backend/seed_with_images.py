#!/usr/bin/env python3
"""
Advanced seed script that generates actual images and uploads them to Supabase storage
"""
import os
import sys
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
from supabase import create_client
import numpy as np
import cv2
from io import BytesIO

# Load environment variables
load_dotenv()

# Sample damage data
DAMAGE_TYPES = ["crack", "pothole", "patch", "manhole"]
SEVERITIES = ["low", "medium", "high"]

# Sample coordinates
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


def generate_sample_image(damage_type: str, index: int) -> bytes:
    """Generate a sample image with damage type label"""
    # Create a 640x480 image
    width, height = 640, 480
    
    # Color schemes for different damage types
    colors = {
        "crack": (107, 107, 255),      # Red-ish
        "pothole": (196, 205, 78),     # Teal-ish
        "patch": (211, 225, 149),      # Light green
        "manhole": (129, 129, 243)     # Pink-ish
    }
    
    bg_color = colors.get(damage_type, (200, 200, 200))
    
    # Create image with gradient background
    img = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        factor = y / height
        color = tuple(int(c * (0.7 + 0.3 * factor)) for c in bg_color)
        img[y, :] = color
    
    # Add some noise for texture
    noise = np.random.randint(-20, 20, (height, width, 3), dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Draw a bounding box to simulate detection
    bbox_x1 = random.randint(100, 200)
    bbox_y1 = random.randint(100, 200)
    bbox_x2 = bbox_x1 + random.randint(150, 250)
    bbox_y2 = bbox_y1 + random.randint(100, 150)
    
    cv2.rectangle(img, (bbox_x1, bbox_y1), (bbox_x2, bbox_y2), (0, 255, 0), 3)
    
    # Add text labels
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # Damage type label
    label = f"{damage_type.upper()} #{index}"
    cv2.putText(img, label, (20, 50), font, 1.5, (255, 255, 255), 3)
    cv2.putText(img, label, (20, 50), font, 1.5, (0, 0, 0), 2)
    
    # Confidence score
    confidence = random.uniform(0.65, 0.98)
    conf_text = f"Confidence: {confidence:.1%}"
    cv2.putText(img, conf_text, (20, 100), font, 0.8, (255, 255, 255), 2)
    cv2.putText(img, conf_text, (20, 100), font, 0.8, (0, 0, 0), 1)
    
    # Sample ID
    sample_text = "SAMPLE DATA"
    cv2.putText(img, sample_text, (20, height - 20), font, 0.6, (255, 255, 255), 2)
    
    # Encode to JPEG
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()


def upload_image_to_storage(supabase, image_bytes: bytes, filename: str) -> str:
    """Upload image to Supabase storage and return public URL"""
    try:
        # Upload to damage-images bucket
        result = supabase.storage.from_('damage-images').upload(
            filename,
            image_bytes,
            file_options={"content-type": "image/jpeg"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_('damage-images').get_public_url(filename)
        
        return public_url
        
    except Exception as e:
        # If file already exists, try to get its URL
        if "already exists" in str(e).lower():
            return supabase.storage.from_('damage-images').get_public_url(filename)
        raise


def seed_database_with_images(count: int = 20, clear_existing: bool = False):
    """Seed the database with sample data and actual images"""
    
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
                result = supabase.table('road_damage').delete().eq('metadata->>seed_data', 'true').execute()
                print(f"   Deleted {len(result.data) if result.data else 0} existing seed records")
            except Exception as e:
                print(f"   Warning: Could not clear existing data: {e}")
        
        # Generate and upload records
        print(f"📝 Generating {count} sample records with images...")
        records = []
        base_time = datetime.utcnow()
        
        for i in range(count):
            print(f"   Processing record {i + 1}/{count}...", end="\r")
            
            # Random damage type and severity
            damage_type = random.choice(DAMAGE_TYPES)
            severity = random.choice(SEVERITIES)
            
            # Random location
            location = random.choice(SAMPLE_LOCATIONS)
            lat_offset = random.uniform(-0.05, 0.05)
            lng_offset = random.uniform(-0.05, 0.05)
            
            # Random confidence score
            confidence = random.uniform(0.65, 0.98)
            
            # Stagger timestamps
            time_offset = timedelta(hours=random.randint(0, 72))
            detected_at = base_time - time_offset
            
            # Generate image
            image_bytes = generate_sample_image(damage_type, i + 1)
            
            # Upload image to storage
            filename = f"seed_{damage_type}_{i + 1}_{int(datetime.now().timestamp())}.jpg"
            image_url = upload_image_to_storage(supabase, image_bytes, filename)
            
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
                "image_url": image_url,
                "metadata": metadata
            }
            
            records.append(record)
        
        print(f"\n💾 Inserting {len(records)} records into database...")
        result = supabase.table('road_damage').insert(records).execute()
        
        if result.data:
            print(f"✅ Successfully inserted {len(result.data)} records with images!")
            
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
            print(f"   Images uploaded: {len(records)}")
            
            print("\n🎉 Database seeded successfully with images!")
            print("\nYou can now test the frontend with this data.")
            print("API endpoint: GET http://localhost:8000/api/v1/damages/latest")
            
        else:
            print("❌ Error: No data was inserted")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed database with sample data and images")
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
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Road Damage Detection - Database Seeder (with Images)")
    print("=" * 60)
    print()
    
    seed_database_with_images(count=args.count, clear_existing=args.clear)


if __name__ == "__main__":
    main()
