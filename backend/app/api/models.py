from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Tuple


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class Detection(BaseModel):
    bbox: BoundingBox
    class_id: int
    confidence: float


class DamageResponse(BaseModel):
    id: str
    damage_type: str
    severity: str
    latitude: float
    longitude: float
    confidence_score: float
    detected_at: datetime
    image_url: str


class ProcessingStatusResponse(BaseModel):
    job_id: str
    status: str
    processed_frames: int
    detections_found: int
    error_message: Optional[str] = None


class VideoMetadata(BaseModel):
    width: int
    height: int
    fps: float
    frame_count: int
    duration_seconds: float


class ModelMetadata(BaseModel):
    input_shape: Tuple[int, int, int, int]
    output_shape: Tuple[int, ...]
    input_name: str
    output_names: list[str]
