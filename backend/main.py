import sys
from pathlib import Path
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import numpy as np
import json
from datetime import datetime

# Add the backend and ml directories to sys.path
backend_dir = Path(__file__).resolve().parent
ml_dir = backend_dir.parent / "ml"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

from inference import BoneTalkInference

app = FastAPI(title="BoneTalk Backend API")

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the model on startup
MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"
inference_engine = BoneTalkInference(MODEL_DIR)

class PredictionRequest(BaseModel):
    emg_data: List[List[float]]
    sampling_rate: int = 1000

@app.get("/api/status")
async def get_status():
    if inference_engine.is_loaded():
        return {
            "model_loaded": True,
            "classes": inference_engine.classes,
            "feature_count": inference_engine.feature_count,
            "model_type": inference_engine.model_type
        }
    return {"model_loaded": False}

@app.post("/api/predict")
async def predict(request: PredictionRequest):
    if not inference_engine.is_loaded():
        return {"error": "Model not loaded"}

    emg_array = np.array(request.emg_data)
    result = inference_engine.predict(emg_array, request.sampling_rate)
    return result

@app.websocket("/ws/emg")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Simple buffering logic for streaming
    # Wait until we have enough data (e.g. 500 samples) to make a prediction
    buffer = []
    
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            
            # Assuming data is a single time step of 8 channels: [ch1, ch2, ..., ch8]
            buffer.append(data)
            
            if len(buffer) >= 500: # Example buffer size (0.5s at 1000Hz)
                emg_array = np.array(buffer)
                buffer = [] # Reset buffer
                
                if inference_engine.is_loaded():
                    result = inference_engine.predict(emg_array, 1000)
                    result["timestamp"] = datetime.now().isoformat()
                    await websocket.send_text(json.dumps(result))
                else:
                    await websocket.send_text(json.dumps({"error": "Model not loaded"}))
                    
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
