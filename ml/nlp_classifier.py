"""
ml/nlp_classifier.py
Supervised Natural Language Processing (NLP) Classifier for Transaction Categorization.
Uses TF-IDF Vectorization with a Linear Classifier (Logistic Regression) to predict
the category and confidence score from a user's transaction description.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import joblib
import os

class CategoryClassifier:
    def __init__(self):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True
            )),
            ("clf", LogisticRegression(
                C=2.0,
                max_iter=1000,
                class_weight="balanced",
                random_state=42
            ))
        ])
        self.is_trained = False
        self.classes_ = []
        self.metrics = {}

    def train(self, texts, labels, test_size: float = 0.2):
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=test_size, random_state=42, stratify=labels
        )
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True
        self.classes_ = list(self.pipeline.classes_)

        # Evaluate performance
        y_pred = self.pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")
        
        self.metrics = {
            "accuracy": round(float(acc), 4),
            "f1_score": round(float(f1), 4),
            "samples": len(texts),
            "classes": self.classes_,
            "algorithm": "TF-IDF + Balanced Logistic Regression"
        }
        return self.metrics

    def predict(self, text: str) -> dict:
        if not self.is_trained or not text or not text.strip():
            return {"category": "Other", "confidence": 0.0, "probabilities": {}}
            
        probs = self.pipeline.predict_proba([text])[0]
        best_idx = probs.argmax()
        category = str(self.classes_[best_idx])
        confidence = round(float(probs[best_idx]), 4)
        
        prob_dict = {str(cls): round(float(prob), 3) for cls, prob in zip(self.classes_, probs)}
        return {
            "category": category,
            "confidence": confidence,
            "probabilities": prob_dict
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"pipeline": self.pipeline, "metrics": self.metrics, "classes": self.classes_}, filepath)

    def load(self, filepath: str):
        if not os.path.exists(filepath):
            return False
        data = joblib.load(filepath)
        self.pipeline = data["pipeline"]
        self.metrics = data.get("metrics", {})
        self.classes_ = data.get("classes", list(self.pipeline.classes_))
        self.is_trained = True
        return True
