import pytest
from app.services.detection_tracker import DetectionTracker
from app.api.models import Detection, BoundingBox


def test_duplicate_detection_high_iou():
    tracker = DetectionTracker(window_size=5, iou_threshold=0.5)
    
    detection1 = Detection(
        bbox=BoundingBox(x1=0, y1=0, x2=10, y2=10),
        class_id=0,
        confidence=0.8
    )
    
    detection2 = Detection(
        bbox=BoundingBox(x1=1, y1=1, x2=11, y2=11),
        class_id=0,
        confidence=0.9
    )
    
    tracker.add_detection(detection1, frame_number=0)
    is_dup = tracker.is_duplicate(detection2, frame_number=1)
    
    assert is_dup is True


def test_unique_detection_low_iou():
    tracker = DetectionTracker(window_size=5, iou_threshold=0.5)
    
    detection1 = Detection(
        bbox=BoundingBox(x1=0, y1=0, x2=10, y2=10),
        class_id=0,
        confidence=0.8
    )
    
    detection2 = Detection(
        bbox=BoundingBox(x1=50, y1=50, x2=60, y2=60),
        class_id=0,
        confidence=0.9
    )
    
    tracker.add_detection(detection1, frame_number=0)
    is_dup = tracker.is_duplicate(detection2, frame_number=1)
    
    assert is_dup is False


def test_sliding_window_cleanup():
    tracker = DetectionTracker(window_size=3, iou_threshold=0.5)
    
    for i in range(5):
        detection = Detection(
            bbox=BoundingBox(x1=i*10, y1=i*10, x2=i*10+10, y2=i*10+10),
            class_id=0,
            confidence=0.8
        )
        tracker.add_detection(detection, frame_number=i)
    
    # Window size is 3, so should only have last 3 detections
    assert len(tracker.detections_window) == 3
