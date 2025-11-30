# Database Seeding Guide

This guide explains how to populate your database with sample data for testing the frontend.

## Overview

Two seeding scripts are available:

1. **seed_data.py** - Fast seeding with placeholder images (recommended for quick testing)
2. **seed_with_images.py** - Generates and uploads actual images to Supabase storage (more realistic)

## Prerequisites

- Backend environment configured (`.env` file with Supabase credentials)
- Python virtual environment activated
- Supabase database table `road_damage` exists
- Supabase storage bucket `damage-images` exists and is public

## Quick Start

### Interactive Tool (Recommended)

```bash
cd backend
python manage_seed.py
```

This launches an interactive menu with all seeding options.

### Option 1: Fast Seeding (Placeholder Images)

```bash
cd backend
python seed_data.py
```

This creates 20 sample records with placeholder images from via.placeholder.com.

### Option 2: Realistic Seeding (Generated Images)

```bash
cd backend
python seed_with_images.py
```

This creates 20 sample records with generated images uploaded to Supabase storage.

## Usage

### Basic Seeding

```bash
# Seed with default 20 records
python seed_data.py

# Seed with custom count
python seed_data.py --count 50

# Clear existing seed data and insert new data
python seed_data.py --clear

# Only clear seed data (don't insert new)
python seed_data.py --clear-only
```

### Seeding with Images

```bash
# Seed with default 20 records
python seed_with_images.py

# Seed with custom count
python seed_with_images.py --count 30

# Clear existing seed data and insert new data
python seed_with_images.py --clear
```

## Sample Data Details

### Damage Types

- crack
- pothole
- patch
- manhole

### Severities

- low
- medium
- high

### Locations

Sample data includes coordinates from 10 major US cities:

- New York, Los Angeles, Chicago, Houston, Phoenix
- Denver, Seattle, San Francisco, Miami, Boston

Each record has slight random offsets for variety.

### Timestamps

Records are distributed over the last 72 hours with random timestamps.

### Confidence Scores

Random confidence scores between 0.65 and 0.98 (realistic detection confidence).

### Metadata

Each record includes:

- Frame number (simulated)
- Video filename (simulated)
- Bounding box coordinates
- Location name
- `seed_data: true` flag (for easy cleanup)

## Generated Images (seed_with_images.py)

The image generator creates 640x480 JPEG images with:

- Color-coded backgrounds by damage type
- Simulated bounding box overlay
- Damage type label
- Confidence score display
- "SAMPLE DATA" watermark

Images are uploaded to Supabase storage bucket `damage-images`.

## Clearing Seed Data

### Clear Only Seed Data

```bash
python seed_data.py --clear-only
```

This removes only records with `metadata.seed_data = true`, preserving real data.

### Clear and Reseed

```bash
python seed_data.py --clear
```

This clears existing seed data and inserts fresh data in one command.

## Verifying Seeded Data

### Via API

```bash
# Get latest 10 damages
curl http://localhost:8000/api/v1/damages/latest

# Get latest 50 damages
curl http://localhost:8000/api/v1/damages/latest?limit=50
```

### Via Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Open `road_damage` table
4. Filter by `metadata->seed_data = true`

### Via Frontend

1. Start the backend: `python -m uvicorn app.main:app --reload`
2. Start the frontend: `npm run dev`
3. Navigate to the damages list or map view
4. You should see the seeded damage records

## Troubleshooting

### Error: SUPABASE_URL and SUPABASE_KEY must be set

**Solution**: Ensure `.env` file exists with correct credentials:

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Error: relation "road_damage" does not exist

**Solution**: Create the database table in Supabase:

```sql
CREATE TABLE road_damage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  confidence_score DECIMAL NOT NULL,
  detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  image_url TEXT NOT NULL,
  metadata JSONB
);
```

### Error: storage bucket "damage-images" does not exist

**Solution**: Create the storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `damage-images`
4. Set to **Public**
5. Click "Create bucket"

### Images Not Loading in Frontend

**Possible causes**:

1. Storage bucket is not public
2. CORS not configured on storage bucket
3. Image URLs are incorrect

**Solution**:

1. Verify bucket is public in Supabase Dashboard
2. Check browser console for CORS errors
3. Test image URL directly in browser

### Slow Image Generation

The `seed_with_images.py` script generates and uploads images, which takes longer than placeholder images.

**Expected times**:

- 20 records: ~30-60 seconds
- 50 records: ~2-3 minutes

For faster testing, use `seed_data.py` with placeholder images.

## Examples

### Seed 100 Records for Load Testing

```bash
python seed_data.py --count 100
```

### Reseed with Fresh Data

```bash
python seed_data.py --clear --count 30
```

### Create Realistic Test Data

```bash
python seed_with_images.py --clear --count 25
```

### Clear All Seed Data

```bash
python seed_data.py --clear-only
```

## Integration with Frontend

After seeding, test these frontend features:

### Damage List View

- Should display seeded damages
- Should show damage type, severity, confidence
- Should display images (placeholder or generated)
- Should show timestamps

### Map View

- Should display markers at seeded locations
- Should cluster nearby markers
- Should show damage details on marker click
- Markers should be distributed across US cities

### Statistics View

- Should show damage type distribution
- Should show severity distribution
- Should show detection timeline

### Filtering

- Filter by damage type
- Filter by severity
- Filter by date range
- Filter by confidence threshold

## Best Practices

1. **Use placeholder images for quick testing**: `seed_data.py` is faster
2. **Use generated images for realistic testing**: `seed_with_images.py` for demos
3. **Clear seed data regularly**: Prevents confusion with real data
4. **Use appropriate counts**: 20-50 records for development, 100+ for load testing
5. **Mark seed data**: The `seed_data: true` flag makes cleanup easy

## Advanced Usage

### Custom Locations

Edit the `SAMPLE_LOCATIONS` array in the seed script to add your own coordinates:

```python
SAMPLE_LOCATIONS = [
    {"lat": 51.5074, "lng": -0.1278, "name": "London"},
    {"lat": 48.8566, "lng": 2.3522, "name": "Paris"},
    # Add more locations...
]
```

### Custom Damage Types

Edit the `DAMAGE_TYPES` array:

```python
DAMAGE_TYPES = ["crack", "pothole", "patch", "manhole", "sinkhole", "bump"]
```

### Custom Time Range

Modify the time offset in the seed script:

```python
# Change from 72 hours to 7 days
time_offset = timedelta(days=random.randint(0, 7))
```

## Cleanup

To remove all seed data and start fresh:

```bash
# Clear seed data
python seed_data.py --clear-only

# Optionally, manually delete images from Supabase storage
# Go to Storage → damage-images → Delete files starting with "seed_"
```

## Summary

- **Quick testing**: Use `seed_data.py` (fast, placeholder images)
- **Realistic testing**: Use `seed_with_images.py` (slower, real images)
- **Default count**: 20 records (good for development)
- **Load testing**: 100+ records
- **Cleanup**: Use `--clear-only` flag to remove seed data
- **Safety**: Seed data is marked with `seed_data: true` flag

Happy testing! 🎉
