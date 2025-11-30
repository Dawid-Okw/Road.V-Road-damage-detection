import numpy as np
import cv2
from typing import List
import logging
from datetime import datetime
import uuid
from app.api.models import Detection, DamageResponse
from app.services.supabase_client import SupabaseClientService
from app.utils.errors import StorageError

logger = logging.getLogger(__name__)

# Damage type mapping
DAMAGE_TYPE_MAPPING = {
    0: "crack",
    1: "pothole",
    2: "patch",
    3: "manhole",
}


class DamageStorageService:
    def __init__(self, supabase_service: SupabaseClientService):
        self.supabase_service = supabase_service
        self.client = supabase_service.get_client()
    
    async def upload_image(self, image: np.ndarray, detection_id: str) -> str:
        try:
            # Convert numpy array to JPEG bytes
            _, buffer = cv2.imencode('.jpg', image)
            image_bytes = buffer.tobytes()
            
            # Generate unique filename
            filename = f"{detection_id}.jpg"
            
            # Upload to Supabase storage
            result = self.client.storage.from_('damage-images').upload(
                filename,
                image_bytes,
                file_options={"content-type": "image/jpeg"}
            )
            
            # Get public URL
            public_url = self.client.storage.from_('damage-images').get_public_url(filename)
            
            logger.info(f"Image uploaded successfully: {filename}")
            return public_url
            
        except Exception as e:
            raise StorageError(
                f"Image upload failed: {str(e)}",
                {"detection_id": detection_id}
            )
    
    async def insert_damage_record(
        self,
        detection: Detection,
        image_url: str,
        frame_number: int,
        video_filename: str
    ) -> str:
        try:
            damage_type = DAMAGE_TYPE_MAPPING.get(detection.class_id, "unknown")
            
            record = {
                "damage_type": damage_type,
                "severity": "medium",  # Placeholder
                "latitude": 0.0,  # Placeholder
                "longitude": 0.0,  # Placeholder
                "confidence_score": detection.confidence,
                "detected_at": datetime.utcnow().isoformat(),
                "image_url": image_url,
                "metadata": {
                    "frame_number": frame_number,
                    "video_filename": video_filename,
                    "bbox": {
                        "x1": detection.bbox.x1,
                        "y1": detection.bbox.y1,
                        "x2": detection.bbox.x2,
                        "y2": detection.bbox.y2
                    }
                }
            }
            
            result = self.client.table('road_damage').insert(record).execute()
            
            record_id = result.data[0]['id']
            logger.info(f"Damage record inserted: {record_id}")
            return record_id
            
        except Exception as e:
            raise StorageError(
                f"Database insertion failed: {str(e)}",
                {"detection": detection.dict()}
            )
    
    async def store_detection(
        self,
        detection: Detection,
        frame_image: np.ndarray,
        frame_number: int,
        video_filename: str
    ) -> str:
        detection_id = str(uuid.uuid4())
        
        try:
            # Upload image first
            image_url = await self.upload_image(frame_image, detection_id)
            
            # Insert database record
            record_id = await self.insert_damage_record(
                detection,
                image_url,
                frame_number,
                video_filename
            )
            
            return record_id
            
        except StorageError as e:
            logger.error(f"Storage failed: {e.message}", extra=e.context)
            raise
    
    async def get_latest_damages(self, limit: int = 10) -> List[DamageResponse]:
        try:
            result = self.client.table('road_damage') \
                .select('*') \
                .order('detected_at', desc=True) \
                .limit(limit) \
                .execute()
            
            damages = []
            for record in result.data:
                damage = DamageResponse(
                    id=record['id'],
                    damage_type=record['damage_type'],
                    severity=record['severity'],
                    latitude=record['latitude'],
                    longitude=record['longitude'],
                    confidence_score=record['confidence_score'],
                    detected_at=record['detected_at'],
                    image_url=record['image_url']
                )
                damages.append(damage)
            
            return damages
            
        except Exception as e:
            raise StorageError(
                f"Failed to retrieve damages: {str(e)}",
                {"limit": limit}
            )
