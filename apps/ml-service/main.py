from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="TrafficWise ML Service", version="1.0.0")

class PredictionRequest(BaseModel):
    segment_ids: List[str]
    timestamp: str

class PredictionResponse(BaseModel):
    segment_id: str
    predicted_congestion: str # Low, Medium, High
    confidence: float
    horizon_minutes: int
    model_version: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_version": "mock-v1"}

@app.post("/predict", response_model=List[PredictionResponse])
def predict_congestion(request: PredictionRequest):
    # Mock implementation for now
    responses = []
    for seg_id in request.segment_ids:
        responses.append(PredictionResponse(
            segment_id=seg_id,
            predicted_congestion="Low",
            confidence=0.85,
            horizon_minutes=15,
            model_version="mock-v1"
        ))
    return responses
