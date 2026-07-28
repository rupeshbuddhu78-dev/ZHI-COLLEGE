"""
ZHI College AI Engine — Real & Mock Inference FastAPI Server
------------------------------------------------------
This is a stub microservice hosting the trained XGBoost model for dropout prediction.
Other endpoints (CSP-based timetable optimiser, ResNet + FaceNet embedding, 
and AR / LSTM time-series) are currently returning mock JSON until their 
respective models are ready.

Run locally:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

from __future__ import annotations

import math
import random
import os
import joblib
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ZHI College AI Engine",
    version="0.2.0",
    description="Inference server for the ZHI College AI-Driven ERP."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
#  Pydantic Schemas                                                  #
# ------------------------------------------------------------------ #
class RiskFeatures(BaseModel):
    studentId: str
    attendancePct: float = Field(..., ge=0, le=100)
    avgMarks: float = Field(..., ge=0, le=100)
    feeDelayDays: int = Field(..., ge=0)
    leaveCount: int = Field(0, ge=0)


class TimetableSlot(BaseModel):
    course: str
    subject: str
    teacherId: str
    dayOfWeek: str
    startTime: str
    endTime: str
    roomNumber: str


class TimetableRequest(BaseModel):
    slots: List[TimetableSlot]
    rooms: Optional[List[str]] = None


class FaceVerifyRequest(BaseModel):
    studentId: str
    imageB64: Optional[str] = None  # base64 image (not used in mock)


class ForecastRequest(BaseModel):
    horizonMonths: int = 6
    seedRevenue: Optional[float] = None
    seedExpense: Optional[float] = None


# ------------------------------------------------------------------ #
#  Load ML Models                                                    #
# ------------------------------------------------------------------ #
# Adjust path to point to saved_models directory
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "saved_models", "risk_xgb.pkl")
try:
    xgb_model = joblib.load(MODEL_PATH)
    print("Real XGBoost model loaded successfully!")
except Exception as e:
    xgb_model = None
    print(f"Warning: Could not load real model. Error: {e}")


# ------------------------------------------------------------------ #
#  Predictors (Real & Mock)                                          #
# ------------------------------------------------------------------ #
def _predict_risk(f: RiskFeatures) -> dict:
    """
    Real inference using the trained Kaggle XGBoost model.
    """
    if xgb_model is None:
        return {"error": "Model not found. Please place risk_xgb.pkl in saved_models folder."}

    # Prepare the feature array exactly in the order we trained it
    # ['attendancePct', 'avgMarks', 'feeDelayDays', 'leaveCount']
    x_input = np.array([[f.attendancePct, f.avgMarks, f.feeDelayDays, f.leaveCount]])
    
    # Predict probability of dropout (class 1)
    p = float(xgb_model.predict_proba(x_input)[0, 1])
    
    # Determine risk band mathematically based on our threshold logic
    if p >= 0.66:
        band = "HIGH"
    elif p >= 0.33:
        band = "MEDIUM"
    else:
        band = "LOW"
        
    return {
        "studentId": f.studentId,
        "dropoutProbability": round(p, 4),
        "riskBand": band,
        "topFactors": [
            {"feature": "attendancePct", "impact": round(-0.04 * f.attendancePct, 3)},
            {"feature": "avgMarks",      "impact": round(-0.03 * f.avgMarks,      3)},
            {"feature": "feeDelayDays",  "impact": round( 0.02 * f.feeDelayDays,  3)},
        ],
        "model": "real-xgboost-v1",
    }


def _optimize_timetable(req: TimetableRequest) -> dict:
    """
    CSP / Graph Coloring stub.
    """
    conflicts_before = 0
    seen = {}
    for s in req.slots:
        keys = [
            ("teacher", s.teacherId, s.dayOfWeek, s.startTime),
            ("room",    s.roomNumber, s.dayOfWeek, s.startTime),
        ]
        for k in keys:
            if k in seen:
                conflicts_before += 1
            seen[k] = True

    optimised = []
    rooms_pool = req.rooms or ["Room 101", "Room 102", "Room 204", "Room 205",
                               "Room 301", "Lab 1", "Lab 2"]
    for i, s in enumerate(req.slots):
        optimised.append({
            **s.dict(),
            "assignedRoom": rooms_pool[i % len(rooms_pool)],
            "colorClass": i % 5,  # χ(G) bucket
        })
    return {
        "conflictsBefore": conflicts_before,
        "conflictsAfter": 0,
        "chromaticNumber": 5,
        "fitness": round(1.0 - conflicts_before / max(len(req.slots), 1), 4),
        "optimisedSchedule": optimised,
        "solver": "mock-csp-v0",
    }


def _verify_face(req: FaceVerifyRequest) -> dict:
    """
    128-d embedding stand-in.
    """
    rnd = random.Random(req.studentId)
    similarity = 0.65 + rnd.random() * 0.34
    return {
        "studentId": req.studentId,
        "matchConfidence": round(similarity * 100, 2),
        "cosineSimilarity": round(similarity, 4),
        "threshold": 0.72,
        "verified": similarity >= 0.72,
        "model": "mock-facenet-v0",
    }


def _financial_forecast(req: ForecastRequest) -> dict:
    """
    Autoregressive AR(2) toy model.
    """
    base_rev = req.seedRevenue or 850000.0
    base_exp = req.seedExpense or 620000.0
    revenue, expense = [], []
    today = datetime.utcnow().replace(day=1)
    for m in range(1, req.horizonMonths + 1):
        month = (today + timedelta(days=31 * m)).strftime("%Y-%m")
        r = base_rev * (1 + 0.04 * m) * (1 + 0.02 * math.sin(m))
        e = base_exp * (1 + 0.03 * m) * (1 + 0.015 * math.cos(m))
        revenue.append({"month": month, "value": round(r, 2)})
        expense.append({"month": month, "value": round(e, 2)})
    return {
        "horizonMonths": req.horizonMonths,
        "revenue": revenue,
        "expense": expense,
        "netProfit": [
            {"month": r["month"], "value": round(r["value"] - e["value"], 2)}
            for r, e in zip(revenue, expense)
        ],
        "model": "mock-ar2-v0",
    }


# ------------------------------------------------------------------ #
#  Routes                                                            #
# ------------------------------------------------------------------ #
@app.get("/")
def root():
    return {
        "service": "ZHI AI Engine",
        "endpoints": [
            "/health",
            "/predict/risk",
            "/optimize/timetable",
            "/verify/face",
            "/forecast/finance",
        ],
    }


@app.get("/health")
def health():
    return {"status": "ok", "mode": "mixed", "timestamp": datetime.utcnow().isoformat()}


@app.post("/predict/risk")
def predict_risk(features: RiskFeatures):
    return _predict_risk(features)


@app.post("/optimize/timetable")
def optimize_timetable(req: TimetableRequest):
    return _optimize_timetable(req)


@app.post("/verify/face")
def verify_face(req: FaceVerifyRequest):
    return _verify_face(req)


@app.post("/forecast/finance")
def forecast_finance(req: ForecastRequest):
    return _financial_forecast(req)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
