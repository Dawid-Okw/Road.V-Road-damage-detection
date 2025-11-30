from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List
import logging
import os
import uuid
from app.api.models import DamageResponse, ProcessingStatusResponse
from app.services.video_processor import VideoProcessor
from app.services.onnx_service import ONNXModelService
from app.services.detection_tracker import DetectionTracker
from app.services.storage_service import DamageStorageService
from app.services.supabase_client import SupabaseClientService
from app.config import settings
from app.utils.errors import VideoError, ModelError, StorageError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

# Initialize services
supabase_service = SupabaseClientService()
storage_service = DamageStorageService(supabase_service)

# Job status tracking (in-memory for simplicity)
job_status = {}


@router.post("/process-video")
async def process_video(video: UploadFile = File(...)):
    """Process uploaded video for road damage detection"""
    job_id = str(uuid.uuid4())
    
    try:
        # Validate file size
        file_size_mb = 0
        temp_path = f"./uploads/{job_id}_{video.filename}"
        
        os.makedirs("./uploads", exist_ok=True)
        
        # Save uploaded file
        with open(temp_path, "wb") as f:
            content = await video.read()
            file_size_mb = len(content) / (1024 * 1024)
            
            if file_size_mb > settings.max_video_size_mb:
                raise HTTPException(
                    status_code=400,
                    detail=f"Video size exceeds maximum allowed size of {settings.max_video_size_mb}MB"
                )
            
            f.write(content)
        
        # Initialize job status
        job_status[job_id] = {
            "status": "processing",
            "processed_frames": 0,
            "detections_found": 0,
            "error_message": None
        }
        
        # Process video (simplified synchronous version)
        try:
            await process_video_task(job_id, temp_path, video.filename)
        except Exception as e:
            logger.error(f"Video processing failed: {e}")
            job_status[job_id]["status"] = "failed"
            job_status[job_id]["error_message"] = str(e)
        
        return {"job_id": job_id, "status": job_status[job_id]["status"]}
        
    except Exception as e:
        logger.error(f"Video upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_video_task(job_id: str, video_path: str, video_filename: str):
    """Background task to process video"""
    try:
        # Initialize services
        model_service = ONNXModelService(settings.model_path)
        video_processor = VideoProcessor(video_path)
        tracker = DetectionTracker(
            window_size=settings.tracking_window_size,
            iou_threshold=settings.iou_threshold
        )
        
        # Validate video
        metadata = video_processor.validate_video()
        logger.info(f"Processing video: {metadata.dict()}")
        
        # Process frames
        for frame in video_processor.extract_frames():
            try:
                # Run inference
                detections = model_service.infer(frame.image)
                
                # Filter by confidence threshold
                filtered_detections = [
                    d for d in detections
                    if d.confidence > settings.confidence_threshold
                ]
                
                # Check for duplicates and store unique detections
                for detection in filtered_detections:
                    if not tracker.is_duplicate(detection, frame.frame_number):
                        # Store detection
                        await storage_service.store_detection(
                            detection,
                            frame.image,
                            frame.frame_number,
                            video_filename
                        )
                        
                        tracker.add_detection(detection, frame.frame_number)
                        job_status[job_id]["detections_found"] += 1
                
                job_status[job_id]["processed_frames"] += 1
                tracker.cleanup_old_frames(frame.frame_number)
                
            except Exception as e:
                logger.error(f"Frame {frame.frame_number} processing failed: {e}")
                continue
        
        video_processor.close()
        job_status[job_id]["status"] = "completed"
        
        # Cleanup temp file
        if os.path.exists(video_path):
            os.remove(video_path)
        
    except Exception as e:
        logger.error(f"Video processing task failed: {e}")
        job_status[job_id]["status"] = "failed"
        job_status[job_id]["error_message"] = str(e)


@router.get("/processing-status/{job_id}", response_model=ProcessingStatusResponse)
async def get_processing_status(job_id: str):
    """Get status of video processing job"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    return ProcessingStatusResponse(
        job_id=job_id,
        status=status["status"],
        processed_frames=status["processed_frames"],
        detections_found=status["detections_found"],
        error_message=status.get("error_message")
    )


@router.get("/damages/latest", response_model=List[DamageResponse])
async def get_latest_damages(limit: int = Query(default=10, ge=1, le=100)):
    """Retrieve latest N damage detection records"""
    try:
        damages = await storage_service.get_latest_damages(limit)
        return damages
    except StorageError as e:
        logger.error(f"Failed to retrieve damages: {e.message}")
        raise HTTPException(status_code=500, detail=e.message)
