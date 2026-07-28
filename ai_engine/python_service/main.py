"""
ZHI College AI Engine — Mock Inference FastAPI Server
------------------------------------------------------
This is a stub microservice that will later host the trained models produced by
the ML Engineer (XGBoost dropout classifier, CSP-based timetable optimiser,
ResNet + FaceNet embedding for face verification, and an AR / LSTM time-series
model for financial forecasting).

For now every endpoint returns deterministic mock JSON in the exact shape the
Node.js Express bridge (`src/routes/aiRoutes.js`) expects. Once the teammate
drops `.onnx` / `.pkl` artefacts into `../saved_models/`, we swap the mock
`_predict_*` functions with real inference.

Run locally:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

from __future__ import annotations

import math
import random
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ZHI College AI Engine",
    version="0.1.0-mock",
    description="Mock inference server for the ZHI College AI-Driven ERP."
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
#  Mock predictors — replace with real model.predict() later          #
# ------------------------------------------------------------------ #
def _predict_risk(f: RiskFeatures) -> dict:
    """
    Toy XGBoost stand-in.  Real model will output P(dropout) from a
    128-tree gradient boosted ensemble trained on our historical CSV.
    """
    logit = (
        -0.04 * f.attendancePct
        + -0.03 * f.avgMarks
        + 0.02 * f.feeDelayDays
        + 0.15 * f.leaveCount
        + 3.0
    )
    p = 1.0 / (1.0 + math.exp(-logit))
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
        "model": "mock-xgboost-v0",
    }


def _optimize_timetable(req: TimetableRequest) -> dict:
    """
    CSP / Graph Coloring stub.  Real version = OR-Tools CP-SAT solver on the
    constraint graph G = (V, E) where V = classes and edges join classes that
    share teacher, room, or student group.
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

    # Fake "solved" schedule = re-emit input with a synthetic tag
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
    128-d embedding stand-in.  Real model = FaceNet / dlib ResNet + cosine.
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
    Autoregressive AR(2) toy model.  Real version = statsmodels SARIMAX or
    an LSTM on 24 months of historical revenue / expense series.
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
        "service": "ZHI AI Engine (mock)",
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
    return {"status": "ok", "mode": "mock", "timestamp": datetime.utcnow().isoformat()}


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
