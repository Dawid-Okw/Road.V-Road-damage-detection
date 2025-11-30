import cv2
import numpy as np
from typing import Iterator, Tuple
import logging
from app.api.models import VideoMetadata
from app.utils.errors import VideoError

logger = logging.getLogger(__name__)


class Frame:
    def __init__(self, frame_number: int, timestamp_ms: float, image: np.ndarray):
        self.frame_number = frame_number
        self.timestamp_ms = timestamp_ms
        self.image = image


class VideoProcessor:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = None
        self.metadata = None
    
    def validate_video(self) -> VideoMetadata:
        try:
            self.cap = cv2.VideoCapture(self.video_path)
            
            if not self.cap.isOpened():
                raise VideoError(
                    f"Failed to open video file: {self.video_path}",
                    {"video_path": self.video_path}
                )
            
            width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = self.cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration_seconds = frame_count / fps if fps > 0 else 0
            
            self.metadata = VideoMetadata(
                width=width,
                height=height,
                fps=fps,
                frame_count=frame_count,
                duration_seconds=duration_seconds
            )
            
            logger.info(f"Video validated: {width}x{height}, {fps} fps, {frame_count} frames")
            return self.metadata
            
        except Exception as e:
            raise VideoError(
                f"Video validation failed: {str(e)}",
                {"video_path": self.video_path}
            )
    
    def extract_frames(self) -> Iterator[Frame]:
        if self.cap is None or not self.cap.isOpened():
            raise VideoError("Video not opened. Call validate_video() first.", {})
        
        frame_number = 0
        
        while True:
            ret, frame = self.cap.read()
            
            if not ret:
                break
            
            timestamp_ms = self.cap.get(cv2.CAP_PROP_POS_MSEC)
            
            yield Frame(
                frame_number=frame_number,
                timestamp_ms=timestamp_ms,
                image=frame
            )
            
            frame_number += 1
    
    def preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        # Basic preprocessing - convert to RGB
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return frame
    
    def close(self):
        if self.cap is not None:
            self.cap.release()
            logger.info("Video capture released")
