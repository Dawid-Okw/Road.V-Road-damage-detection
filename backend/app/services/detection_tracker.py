import numpy as np
from typing import List, Dict
from collections import deque
import logging
from app.api.models import Detection, BoundingBox

logger = logging.getLogger(__name__)


class TrackedDetection:
    def __init__(self, detection: Detection, frame_number: int):
        self.detection = detection
        self.frame_number = frame_number


class DetectionTracker:
    def __init__(self, window_size: int = 30, iou_threshold: float = 0.5):
        self.window_size = window_size
        self.iou_threshold = iou_threshold
        self.detections_window: deque = deque(maxlen=window_size)
        self.frame_detections: Dict[int, List[Detection]] = {}
    
    def calculate_iou(self, bbox1: BoundingBox, bbox2: BoundingBox) -> float:
        # Calculate intersection
        x_left = max(bbox1.x1, bbox2.x1)
        y_top = max(bbox1.y1, bbox2.y1)
        x_right = min(bbox1.x2, bbox2.x2)
        y_bottom = min(bbox1.y2, bbox2.y2)
        
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        
        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        
        # Calculate union
        bbox1_area = (bbox1.x2 - bbox1.x1) * (bbox1.y2 - bbox1.y1)
        bbox2_area = (bbox2.x2 - bbox2.x1) * (bbox2.y2 - bbox2.y1)
        union_area = bbox1_area + bbox2_area - intersection_area
        
        if union_area == 0:
            return 0.0
        
        iou = intersection_area / union_area
        return iou
    
    def is_duplicate(self, detection: Detection, frame_number: int) -> bool:
        # Check against all detections in the sliding window
        for tracked in self.detections_window:
            iou = self.calculate_iou(detection.bbox, tracked.detection.bbox)
            
            if iou > self.iou_threshold:
                logger.debug(
                    f"Duplicate detected: IoU={iou:.3f} with frame {tracked.frame_number}"
                )
                return True
        
        return False
    
    def add_detection(self, detection: Detection, frame_number: int):
        tracked = TrackedDetection(detection, frame_number)
        self.detections_window.append(tracked)
        
        # Track detections by frame for cleanup
        if frame_number not in self.frame_detections:
            self.frame_detections[frame_number] = []
        self.frame_detections[frame_number].append(detection)
    
    def cleanup_old_frames(self, current_frame: int):
        # Remove frames outside the sliding window
        cutoff_frame = current_frame - self.window_size
        frames_to_remove = [f for f in self.frame_detections.keys() if f < cutoff_frame]
        
        for frame in frames_to_remove:
            del self.frame_detections[frame]
