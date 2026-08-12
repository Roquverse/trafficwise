import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Conditionally import tensorflow to avoid crash if not installed
try:
    from tensorflow.keras.models import load_model
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

app = FastAPI(title="TrafficWise ML Service", version="1.0.0")

# Load models at startup
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
scaler = None
rf_model = None
lstm_model = None

try:
    if os.path.exists(os.path.join(MODEL_DIR, 'scaler.pkl')):
        scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    if os.path.exists(os.path.join(MODEL_DIR, 'rf_model.pkl')):
        rf_model = joblib.load(os.path.join(MODEL_DIR, 'rf_model.pkl'))
    if TF_AVAILABLE and os.path.exists(os.path.join(MODEL_DIR, 'lstm_model.h5')):
        lstm_model = load_model(os.path.join(MODEL_DIR, 'lstm_model.h5'))
    print("Models loaded successfully.")
except Exception as e:
    print(f"Warning: Could not load models. Proceeding in mock mode. Error: {e}")

class TrafficReadingInput(BaseModel):
    avg_speed: float
    vehicle_count: int
    occupancy: float
    hour: int
    is_weekend: int

class PredictionRequest(BaseModel):
    segment_ids: List[str]
    readings: List[TrafficReadingInput] # Must match segment_ids length

class PredictionResponse(BaseModel):
    segment_id: str
    predicted_congestion: str # Low, Medium, High
    confidence: float
    horizon_minutes: int
    model_version: str

def map_to_congestion_class(speed, speed_limit=80):
    ratio = speed / speed_limit
    if ratio > 0.7:
        return "Low"
    elif ratio > 0.4:
        return "Medium"
    else:
        return "High"

@app.get("/health")
def health_check():
    status = "healthy" if (rf_model is not None and lstm_model is not None) else "mock-mode"
    return {"status": status, "model_version": "ensemble-v1" if status == "healthy" else "mock-v1"}

@app.post("/predict", response_model=List[PredictionResponse])
def predict_congestion(request: PredictionRequest):
    if len(request.segment_ids) != len(request.readings):
        raise HTTPException(status_code=400, detail="segment_ids and readings length mismatch")
        
    responses = []
    
    for seg_id, reading in zip(request.segment_ids, request.readings):
        if scaler and rf_model and lstm_model:
            # Feature engineering (replicated from training)
            flow_rate_hr = reading.vehicle_count * 4
            density = flow_rate_hr / (reading.avg_speed if reading.avg_speed > 0 else 1)
            rho_proxy = flow_rate_hr / 2000.0
            
            features = np.array([[
                reading.avg_speed, reading.vehicle_count, reading.occupancy,
                flow_rate_hr, density, rho_proxy, reading.hour, reading.is_weekend
            ]])
            
            scaled_features = scaler.transform(features)
            
            rf_pred = rf_model.predict(scaled_features)[0]
            
            lstm_features = scaled_features.reshape((1, 1, scaled_features.shape[1]))
            lstm_pred = lstm_model.predict(lstm_features, verbose=0)[0][0]
            
            # Ensemble average
            final_pred_speed = (rf_pred + lstm_pred) / 2.0
            
            # Simplified confidence based on agreement between models
            diff = abs(rf_pred - lstm_pred)
            confidence = max(0.1, 1.0 - (diff / max(reading.avg_speed, 1.0)))
            
            congestion = map_to_congestion_class(final_pred_speed)
            
            responses.append(PredictionResponse(
                segment_id=seg_id,
                predicted_congestion=congestion,
                confidence=float(confidence),
                horizon_minutes=15,
                model_version="ensemble-v1"
            ))
        else:
            # Fallback mock prediction
            responses.append(PredictionResponse(
                segment_id=seg_id,
                predicted_congestion="Low",
                confidence=0.85,
                horizon_minutes=15,
                model_version="mock-v1"
            ))
            
    return responses
