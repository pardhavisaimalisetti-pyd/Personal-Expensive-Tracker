"""
ml/service.py
Unified ML Service Facade.
Loads models into memory, exposes clean inference methods,
and handles auto-training if saved weights are not found.
"""

import os
from .nlp_classifier import CategoryClassifier
from .anomaly_detector import AnomalyDetector
from .forecaster import ExpenseForecaster
from .dataset import generate_training_data

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class MLService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.category_classifier = CategoryClassifier()
        self.anomaly_detector = AnomalyDetector()
        self.forecaster = ExpenseForecaster()
        self._load_or_train()

    def _get_path(self, filename: str) -> str:
        return os.path.join(MODEL_DIR, filename)

    def _load_or_train(self):
        cat_loaded = self.category_classifier.load(self._get_path("category_classifier.joblib"))
        anomaly_loaded = self.anomaly_detector.load(self._get_path("anomaly_detector.joblib"))
        forecaster_loaded = self.forecaster.load(self._get_path("forecaster.joblib"))

        if not (cat_loaded and anomaly_loaded and forecaster_loaded):
            print("[ML INFO] Pre-trained ML models not found. Bootstrapping initial training...")
            self.train_all()

    def train_all(self, custom_df=None):
        """Trains or re-trains all three ML models on synthetic + user data."""
        df = custom_df if custom_df is not None and len(custom_df) >= 30 else generate_training_data(1000)

        # 1. Train NLP Category Classifier
        cat_metrics = self.category_classifier.train(df["desc"].tolist(), df["category"].tolist())
        self.category_classifier.save(self._get_path("category_classifier.joblib"))

        # 2. Train Anomaly Detector
        anomaly_metrics = self.anomaly_detector.train(df)
        self.anomaly_detector.save(self._get_path("anomaly_detector.joblib"))

        # 3. Train Forecaster
        forecaster_metrics = self.forecaster.train(df)
        self.forecaster.save(self._get_path("forecaster.joblib"))

        return {
            "status": "success",
            "message": "All ML models trained and serialized successfully",
            "metrics": {
                "nlp_classifier": cat_metrics,
                "anomaly_detector": anomaly_metrics,
                "forecaster": forecaster_metrics
            }
        }

    def predict_category(self, desc: str) -> dict:
        return self.category_classifier.predict(desc)

    def check_anomaly(self, amount: float, category: str = "Food") -> dict:
        return self.anomaly_detector.check(amount, category)

    def forecast(self, transactions: list) -> dict:
        return self.forecaster.forecast_month(transactions)

    def get_metrics(self) -> dict:
        return {
            "nlp_classifier": self.category_classifier.metrics,
            "anomaly_detector": self.anomaly_detector.metrics,
            "forecaster": self.forecaster.metrics
        }
