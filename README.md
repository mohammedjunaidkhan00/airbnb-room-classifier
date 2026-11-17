# Airbnb Room Type Predictor

An end-to-end Machine Learning classification pipeline to predict Airbnb room types (e.g., *Entire home/apt*, *Private room*, *Shared room*) based on listing attributes, pricing, location coordinates, and host metrics.

---

## Overview

This project covers the complete machine learning lifecycle:
1. **Data Preprocessing:** Handling missing values, scaling numerical features, and encoding categorical variables using `ColumnTransformer` and `Pipeline`.
2. **Model Selection & Validation:** Evaluating multiple classifiers using 5-fold cross-validation (`accuracy` and `f1_macro`) with class balancing.
3. **Evaluation:** Assessing final model performance on unseen test data using accuracy, macro F1-score, and confusion matrices.
4. **API Readiness:** Validating incoming listing payloads using strict **Pydantic** data schemas for reliable inference.

---

## Tech Stack

* **Language:** Python 3.x
* **Machine Learning:** Scikit-learn, NumPy, Pandas
* **Data Validation & API:** Pydantic, FastAPI
* **Visualization:** Matplotlib

---

## Input Features

The model accepts the following listing features:

| Feature | Type | Description |
| :--- | :--- | :--- |
| `latitude` | `float` | Geographic latitude coordinate (`-90` to `90`) |
| `longitude` | `float` | Geographic longitude coordinate (`-180` to `180`) |
| `price` | `float` | Nightly listing price (`> 0`) |
| `minimum_nights` | `int` | Minimum number of nights required (`>= 1`) |
| `number_of_reviews` | `int` | Total number of reviews received |
| `reviews_per_month` | `float` | Average reviews per month |
| `calculated_host_listings_count` | `int` | Total listings managed by the host |
| `availability_365` | `int` | Number of available days in the next year (`0` to `365`) |

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com<your-username>/airbnb-room-type-predictor.git
   cd airbnb-room-type-predictor
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the notebook or API:**
   ```bash
   uvicorn app:app --reload
   ```

---

## Model Performance

Result: Test Accuracy of  and Test Macro F1-Score of 0.7422.

* **Cross-Validation:** 5-Fold Stratified Cross-Validation
* **Primary Metrics:** Accuracy & Macro F1-Score (`f1_macro`)
* **Test Accuracy:** `85.19% (0.8519)`
* **Test Macro F1:** `0.7422`
