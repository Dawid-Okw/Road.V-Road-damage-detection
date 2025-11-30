import pytest
from app.services.detection_tracker import DetectionTracker
from app.api.models import BoundingBox


def test_iou_no_overlap():
    tracker = DetectionTracker()
    bbox1 = BoundingBox(x1=0, y1=0, x2=10, y2=10)
    bbox2 = BoundingBox(x1=20, y1=20, x2=30, y2=30)
    
    iou = tracker.calculate_iou(bbox1, bbox2)
    assert iou == 0.0


def test_iou_perfect_overlap():
    tracker = DetectionTracker()
    bbox1 = BoundingBox(x1=0, y1=0, x2=10, y2=10)
    bbox2 = BoundingBox(x1=0, y1=0, x2=10, y2=10)
    
    iou = tracker.calculate_iou(bbox1, bbox2)
    assert iou == 1.0


def test_iou_partial_overlap():
    tracker = DetectionTracker()
    bbox1 = BoundingBox(x1=0, y1=0, x2=10, y2=10)
    bbox2 = BoundingBox(x1=5, y1=5, x2=15, y2=15)
    
    iou = tracker.calculate_iou(bbox1, bbox2)
    
    # Intersection: 5x5 = 25
    # Union: 100 + 100 - 25 = 175
    # IoU: 25/175 ≈ 0.143
    assert 0.14 < iou < 0.15


def test_iou_symmetry():
    tracker = DetectionTracker()
    bbox1 = BoundingBox(x1=0, y1=0, x2=10, y2=10)
    bbox2 = BoundingBox(x1=5, y1=5, x2=15, y2=15)
    
    iou1 = tracker.calculate_iou(bbox1, bbox2)
    iou2 = tracker.calculate_iou(bbox2, bbox1)
    
    assert iou1 == iou2
