from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import joblib
import pandas as pd
from pydantic import BaseModel, Field

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

COLUMNS = [
    "latitude",
    "longitude",
    "price",
    "minimum_nights",
    "number_of_reviews",
    "reviews_per_month",
    "calculated_host_listings_count",
    "availability_365",
    "neighbourhood_group",
    "neighbourhood",
]


class FeaturesModel(BaseModel):
  latitude: float = Field(..., ge=-90, le=90, examples=[40.7128])
  longitude: float = Field(..., ge=-180, le=180, examples=[-74.0060])
  price: float = Field(..., gt=0, examples=[150.0])
  minimum_nights: int = Field(..., ge=1, examples=[2])
  number_of_reviews: int = Field(..., ge=0, examples=[125])
  reviews_per_month: float = Field(..., ge=0, examples=[3.5])
  calculated_host_listings_count: int = Field(..., ge=1, examples=[4])
  availability_365: int = Field(..., ge=0, le=365, examples=[180])
  neighbourhood_group: str = Field(..., min_length=1, examples=["Manhattan"])
  neighbourhood: str = Field(..., min_length=1, examples=["Midtown"])


model = joblib.load("model/Model_Pipeline.pkl")

if hasattr(model[-1], "n_jobs"):
  model[-1].n_jobs = 1


# Serve your frontend directly at https://onrender.com
@app.get("/")
def serve_home():
  return FileResponse("index.html")


@app.post("/predict")
def predict(features: FeaturesModel):
  try:
    row = pd.DataFrame([features.model_dump()], columns=COLUMNS)

    prediction = str(model.predict(row)[0])
    probabilities = model.predict_proba(row)[0]

    class_probabilities = {
        str(class_name): float(prob)
        for class_name, prob in zip(model.classes_, probabilities)
    }

    return {"prediction": prediction, "probability": class_probabilities}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Model Error: {str(e)}")


# Mount static files (style.css, script.js) so index.html can load them
app.mount("/", StaticFiles(directory="."), name="static")
