# Road Damage Detection Backend

Python backend service for processing road camera footage to detect and classify road damage using YOLO-based ONNX models.

## Features

- Video processing with frame extraction
- ONNX model inference for damage detection
- IoU-based duplicate detection tracking
- Supabase integration for storage and database
- REST API for video processing and damage retrieval

## Setup

### Prerequisites

- Python 3.10+
- pip or uv package manager

### Installation

1. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Place your ONNX model file:

```bash
mkdir models
# Copy your road_damage_yolo.onnx to models/
```

### Running the Server

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /api/v1/process-video

Upload and process a video file for damage detection.

**Request**: multipart/form-data with video file
**Response**: `{ "job_id": "uuid", "status": "processing" }`

### GET /api/v1/processing-status/{job_id}

Check the status of a video processing job.

**Response**:

```json
{
	"job_id": "uuid",
	"status": "processing|completed|failed",
	"processed_frames": 100,
	"detections_found": 5,
	"error_message": null
}
```

### GET /api/v1/damages/latest?limit=10

Retrieve the latest N damage detection records.

**Response**: Array of damage records with images and metadata

## Seeding Test Data

Populate the database with sample data for frontend testing:

```bash
# Quick seeding with placeholder images (recommended)
python seed_data.py

# Realistic seeding with generated images
python seed_with_images.py

# Custom count
python seed_data.py --count 50

# Clear existing seed data
python seed_data.py --clear-only
```

See [SEEDING.md](SEEDING.md) for detailed seeding guide.

## Testing

Run unit tests:

```bash
pytest tests/unit/
```

Run property-based tests:

```bash
pytest tests/property/
```

Run all tests with coverage:

```bash
pytest --cov=app tests/
```

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes and models
│   ├── services/         # Business logic services
│   ├── utils/            # Utilities and error handling
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI app
├── tests/
│   ├── unit/             # Unit tests
│   └── property/         # Property-based tests
├── models/               # ONNX model files
├── uploads/              # Temporary video storage
└── requirements.txt
```

## Configuration

Key configuration options in `.env`:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `MODEL_PATH`: Path to ONNX model file
- `CONFIDENCE_THRESHOLD`: Minimum confidence for detections (0.0-1.0)
- `IOU_THRESHOLD`: IoU threshold for duplicate detection (0.0-1.0)
- `TRACKING_WINDOW_SIZE`: Number of frames to track for duplicates
- `MAX_VIDEO_SIZE_MB`: Maximum video file size
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## Architecture

The backend follows a layered architecture:

1. **API Layer**: FastAPI routes handling HTTP requests
2. **Services Layer**: Business logic components
   - Video Processor: Frame extraction and preprocessing
   - ONNX Model Service: Model inference
   - Detection Tracker: IoU-based duplicate elimination
   - Storage Service: Supabase integration
3. **Data Access Layer**: Supabase client wrapper

## Development

### Adding New Damage Types

Update the `DAMAGE_TYPE_MAPPING` in `app/services/storage_service.py`:

```python
DAMAGE_TYPE_MAPPING = {
    0: "crack",
    1: "pothole",
    2: "patch",
    3: "manhole",
    4: "your_new_type"
}
```

### Customizing Processing

Adjust thresholds and parameters in `.env` or `app/config.py`.

## License

MIT
