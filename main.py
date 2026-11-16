from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi import FastAPI
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Development only
    allow_methods=["*"],
    allow_headers=["*"],
)


COLUMNS = ["latitude", "longitude", "price", "minimum_nights", "number_of_reviews", "reviews_per_month", "calculated_host_listings_count", "availability_365", "neighbourhood_group", "neighbourhood"]

# pydantic model
class FeaturesModel(BaseModel):
    latitude:           float = Field(..., ge=-90, le=90, examples=[40.7128], description="Latitude coordinate")
    longitude:          float = Field(..., ge=-180, le=180, examples=[-74.0060], description="Longitude coordinate")
    price:              float = Field(..., gt=0, examples=[150.0], description="Price per night")
    minimum_nights:     int   = Field(..., ge=1, examples=[2], description="Minimum nights required")
    number_of_reviews:  int   = Field(..., ge=0, examples=[125], description="Total reviews")
    reviews_per_month:  float = Field(..., ge=0, examples=[3.5], description="Average reviews per month")
    calculated_host_listings_count: int = Field(..., ge=1, examples=[4], description="Number of listings owned by host")
    availability_365:   int   = Field(..., ge=0, le=365, examples=[180], description="Available days in a year")
    neighbourhood_group:str   = Field(..., min_length=1, description="Borough or neighbourhood group", examples=["Manhattan"])
    neighbourhood:      str   = Field(..., min_length=1, description="Specific neighbourhood name", examples=["Kensington"]) 
    
    
model = joblib.load("model/Model_Pipeline.pkl")


@app.get("/")
def greet():
    return{"Message": "Hello Guyss"}


@app.post("/predict")
def predict(features: FeaturesModel):
    row = pd.DataFrame([features.model_dump()], columns=COLUMNS)


    prediction = model.predict(row)[0]
    probabilities = model.predict_proba(row)[0]

    class_probabilities = {
        class_name: float(prob)
        for class_name, prob in zip(model.classes_, probabilities)
    }

    return {
        "prediction": prediction,
        "probability": class_probabilities
    }