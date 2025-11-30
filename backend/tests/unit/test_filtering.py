import pytest
from app.api.models import Detection, BoundingBox


def test_confidence_filtering_above_threshold():
    detections = [
        Detection(bbox=BoundingBox(x1=0, y1=0, x2=10, y2=10), class_id=0, confidence=0.8),
        Detection(bbox=BoundingBox(x1=10, y1=10, x2=20, y2=20), class_id=1, confidence=0.3),
        Detection(bbox=BoundingBox(x1=20, y1=20, x2=30, y2=30), class_id=0, confidence=0.6),
    ]
    
    threshold = 0.5
    filtered = [d for d in detections if d.confidence > threshold]
    
    assert len(filtered) == 2
    assert all(d.confidence > threshold for d in filtered)


def test_confidence_filtering_all_below_threshold():
    detections = [
        Detection(bbox=BoundingBox(x1=0, y1=0, x2=10, y2=10), class_id=0, confidence=0.3),
        Detection(bbox=BoundingBox(x1=10, y1=10, x2=20, y2=20), class_id=1, confidence=0.2),
    ]
    
    threshold = 0.5
    filtered = [d for d in detections if d.confidence > threshold]
    
    assert len(filtered) == 0


def test_confidence_filtering_empty_list():
    detections = []
    threshold = 0.5
    filtered = [d for d in detections if d.confidence > threshold]
    
    assert len(filtered) == 0
