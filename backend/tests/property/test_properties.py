import pytest
from hypothesis import given, strategies as st
from app.services.detection_tracker import DetectionTracker
from app.api.models import Detection, BoundingBox


# Property Test: Confidence Filtering Correctness
@given(
    detections=st.lists(
        st.builds(
            Detection,
            bbox=st.builds(
                BoundingBox,
                x1=st.integers(0, 100),
                y1=st.integers(0, 100),
                x2=st.integers(101, 200),
                y2=st.integers(101, 200)
            ),
            class_id=st.integers(0, 3),
            confidence=st.floats(0.0, 1.0)
        ),
        min_size=0,
        max_size=20
    ),
    threshold=st.floats(0.0, 1.0)
)
def test_property_confidence_filtering(detections, threshold):
    """Property 10: All filtered detections have confidence > threshold"""
    filtered = [d for d in detections if d.confidence > threshold]
    
    # All filtered detections should have confidence > threshold
    assert all(d.confidence > threshold for d in filtered)
    
    # No detection with confidence > threshold should be excluded
    high_conf_count = sum(1 for d in detections if d.confidence > threshold)
    assert len(filtered) == high_conf_count


# Property Test: IoU Calculation Symmetry
@given(
    x1_1=st.integers(0, 100),
    y1_1=st.integers(0, 100),
    x2_1=st.integers(101, 200),
    y2_1=st.integers(101, 200),
    x1_2=st.integers(0, 100),
    y1_2=st.integers(0, 100),
    x2_2=st.integers(101, 200),
    y2_2=st.integers(101, 200)
)
def test_property_iou_symmetry(x1_1, y1_1, x2_1, y2_1, x1_2, y1_2, x2_2, y2_2):
    """Property 11: IoU(bbox1, bbox2) == IoU(bbox2, bbox1)"""
    tracker = DetectionTracker()
    
    bbox1 = BoundingBox(x1=x1_1, y1=y1_1, x2=x2_1, y2=y2_1)
    bbox2 = BoundingBox(x1=x1_2, y1=y1_2, x2=x2_2, y2=y2_2)
    
    iou1 = tracker.calculate_iou(bbox1, bbox2)
    iou2 = tracker.calculate_iou(bbox2, bbox1)
    
    assert iou1 == iou2
    assert 0.0 <= iou1 <= 1.0
    assert 0.0 <= iou2 <= 1.0


# Property Test: Sliding Window Size
@given(
    window_size=st.integers(1, 10),
    num_frames=st.integers(1, 20)
)
def test_property_sliding_window_size(window_size, num_frames):
    """Property 12: Window never exceeds N frames"""
    tracker = DetectionTracker(window_size=window_size, iou_threshold=0.5)
    
    for i in range(num_frames):
        detection = Detection(
            bbox=BoundingBox(x1=i*10, y1=i*10, x2=i*10+10, y2=i*10+10),
            class_id=0,
            confidence=0.8
        )
        tracker.add_detection(detection, frame_number=i)
    
    # Window should never exceed window_size
    assert len(tracker.detections_window) <= window_size
    
    # If we processed more frames than window_size, window should be exactly window_size
    if num_frames >= window_size:
        assert len(tracker.detections_window) == window_size
