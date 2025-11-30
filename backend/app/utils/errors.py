class ProcessingError(Exception):
    """Base exception for processing errors"""
    def __init__(self, message: str, context: dict = None):
        self.message = message
        self.context = context or {}
        super().__init__(self.message)


class ModelError(ProcessingError):
    """Model loading or inference errors"""
    pass


class VideoError(ProcessingError):
    """Video file or frame extraction errors"""
    pass


class StorageError(ProcessingError):
    """Supabase storage or database errors"""
    pass
