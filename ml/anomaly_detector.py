"""
ml/anomaly_detector.py
Unsupervised Anomaly Detection using Isolation Forest & Z-Score Baselines.
Detects unusually high transactions and outliers to warn users about potential overspending
or input typos in real-time.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

class AnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        self.category_stats = {}
        self.is_trained = False
        self.metrics = {}

    def train(self, df: pd.DataFrame):
        """Train Isolation Forest on expense transaction amounts and categories."""
        expenses = df[df["type"] == "Expense"].copy()
        if len(expenses) < 10:
            return {"error": "Not enough data to train anomaly detector"}

        # Calculate per-category statistics for hybrid rule + ML scoring
        for cat, group in expenses.groupby("category"):
            amounts = group["amount"].values
            self.category_stats[cat] = {
                "mean": float(np.mean(amounts)),
                "std": float(np.std(amounts)) if len(amounts) > 1 else 100.0,
                "median": float(np.median(amounts)),
                "p95": float(np.percentile(amounts, 95))
            }

        # Features: amount and log-transformed amount
        X = expenses[["amount"]].copy()
        X["log_amount"] = np.log1p(X["amount"])

        self.model.fit(X.values)
        self.is_trained = True

        self.metrics = {
            "algorithm": "Isolation Forest (100 Trees)",
            "contamination": 0.05,
            "training_samples": len(expenses),
            "categories_profiled": list(self.category_stats.keys())
        }
        return self.metrics

    def check(self, amount: float, category: str = "Food") -> dict:
        """Evaluates whether a given transaction amount is an anomaly for its category."""
        if not self.is_trained or amount <= 0:
            return {"is_anomaly": False, "score": 0.0, "message": "Normal transaction"}

        features = np.array([[amount, np.log1p(amount)]])
        # IsolationForest decision_function: lower score = more abnormal
        raw_score = float(self.model.decision_function(features)[0])
        pred = int(self.model.predict(features)[0])  # -1 for anomaly, 1 for normal

        cat_stat = self.category_stats.get(category, {
            "mean": 500.0, "std": 300.0, "p95": 1500.0
        })

        is_high = amount > (cat_stat["mean"] + 2.5 * max(cat_stat["std"], 50.0))
        is_anomaly = (pred == -1 and amount > cat_stat["mean"]) or is_high

        # Format message
        if is_anomaly:
            times_higher = round(amount / max(cat_stat["mean"], 1.0), 1)
            message = f"Unusual amount! This is {times_higher}x higher than your average {category} expense."
        else:
            message = "Within standard spending range."

        return {
            "is_anomaly": bool(is_anomaly),
            "score": round(raw_score, 3),
            "category_average": round(cat_stat["mean"], 2),
            "message": message
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "model": self.model,
            "category_stats": self.category_stats,
            "metrics": self.metrics,
            "is_trained": self.is_trained
        }, filepath)

    def load(self, filepath: str):
        if not os.path.exists(filepath):
            return False
        data = joblib.load(filepath)
        self.model = data["model"]
        self.category_stats = data["category_stats"]
        self.metrics = data.get("metrics", {})
        self.is_trained = data.get("is_trained", True)
        return True
