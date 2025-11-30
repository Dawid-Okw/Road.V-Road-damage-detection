from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    model_path: str = "./models/road_damage_yolo.onnx"
    confidence_threshold: float = 0.5
    iou_threshold: float = 0.5
    tracking_window_size: int = 30
    max_video_size_mb: int = 500
    cors_origins: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
