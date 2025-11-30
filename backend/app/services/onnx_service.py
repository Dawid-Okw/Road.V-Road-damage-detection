import onnxruntime as ort
import numpy as np
from typing import List
import logging
from app.api.models import Detection, BoundingBox, ModelMetadata
from app.utils.errors import ModelError

logger = logging.getLogger(__name__)


class ONNXModelService:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.session = None
        self.input_name = None
        self.output_names = None
        self._load_model()
    
    def _load_model(self):
        try:
            self.session = ort.InferenceSession(self.model_path)
            self.input_name = self.session.get_inputs()[0].name
            self.output_names = [output.name for output in self.session.get_outputs()]
            logger.info(f"ONNX model loaded successfully from {self.model_path}")
        except Exception as e:
            raise ModelError(f"Failed to load ONNX model: {str(e)}", {"model_path": self.model_path})
    
    def validate_model(self) -> ModelMetadata:
        if self.session is None:
            raise ModelError("Model not loaded", {})
        
        input_shape = tuple(self.session.get_inputs()[0].shape)
        output_shape = tuple(self.session.get_outputs()[0].shape)
        
        return ModelMetadata(
            input_shape=input_shape,
            output_shape=output_shape,
            input_name=self.input_name,
            output_names=self.output_names
        )
    
    def preprocess_input(self, frame: np.ndarray) -> np.ndarray:
        # Resize to model input size (typically 640x640 for YOLO)
        input_shape = self.session.get_inputs()[0].shape
        target_size = (input_shape[2], input_shape[3])
        
        # Resize frame
        resized = np.array(frame)
        if resized.shape[:2] != target_size:
            import cv2
            resized = cv2.resize(resized, target_size)
        
        # Convert BGR to RGB if needed
        if len(resized.shape) == 3 and resized.shape[2] == 3:
            resized = resized[:, :, ::-1]
        
        # Normalize to 0-1
        normalized = resized.astype(np.float32) / 255.0
        
        # Add batch dimension and transpose to NCHW format
        input_tensor = np.transpose(normalized, (2, 0, 1))
        input_tensor = np.expand_dims(input_tensor, axis=0)
        
        return input_tensor
    
    def postprocess_output(self, raw_output: np.ndarray) -> List[Detection]:
        detections = []
        
        # YOLO output format: [batch, num_detections, 6]
        # Each detection: [x1, y1, x2, y2, class_id, confidence]
        if len(raw_output.shape) == 3:
            raw_output = raw_output[0]  # Remove batch dimension
        
        for detection_data in raw_output:
            if len(detection_data) != 6:
                logger.warning(f"Invalid detection format: expected 6 values, got {len(detection_data)}")
                continue
            
            x1, y1, x2, y2, class_id, confidence = detection_data
            
            bbox = BoundingBox(
                x1=int(x1),
                y1=int(y1),
                x2=int(x2),
                y2=int(y2)
            )
            
            detection = Detection(
                bbox=bbox,
                class_id=int(class_id),
                confidence=float(confidence)
            )
            detections.append(detection)
        
        return detections
    
    def infer(self, frame: np.ndarray) -> List[Detection]:
        try:
            input_tensor = self.preprocess_input(frame)
            outputs = self.session.run(self.output_names, {self.input_name: input_tensor})
            detections = self.postprocess_output(outputs[0])
            return detections
        except Exception as e:
            logger.error(f"Inference failed: {e}")
            raise ModelError(f"Inference failed: {str(e)}", {})
