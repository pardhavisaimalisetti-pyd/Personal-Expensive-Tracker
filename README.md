# 💰 PyFin - AI-Powered Personal Expense Tracker

A full-stack, AI/ML-driven personal finance and expense management platform built with **Python (Flask)**, **Scikit-Learn Machine Learning**, and **React.js**. Features an intelligent glassmorphism UI, real-time Natural Language Processing (NLP) for auto-categorization, unsupervised anomaly detection for overspending, and time-series spending forecasting.

![Python](https://img.shields.io/badge/Python-3.x-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-ML%20Pipelines-F7931E.svg?style=for-the-badge&logo=scikitlearn&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-2.x-000000.svg?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 📸 Preview

<div align="center">
  <img src="assets/images/dashboard_mockup.png" alt="PyFin Dashboard Mockup" width="85%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />
</div>

---

## 🧠 Machine Learning Architecture

This project incorporates three distinct production-ready machine learning models:

### 1. 📝 NLP Expense Categorizer (Supervised Learning)
- **Algorithm**: `TfidfVectorizer` (sublinear term frequency, unigrams + bigrams) + Balanced `LogisticRegression`.
- **Functionality**: Analyzes the natural language description entered by the user (e.g. *"Swiggy dinner biryani"*, *"Uber ride to airport"*) and predicts the spending category with probability confidence scores.
- **Inference**: Live debounce auto-suggestion in the UI as the user types.

### 2. 🚨 Outlier & Anomaly Detection (Unsupervised Learning)
- **Algorithm**: `IsolationForest` (100 estimators, 5% contamination factor) combined with per-category Z-Score statistical thresholds.
- **Functionality**: Flags unusually high or abnormal transaction amounts before submission (e.g. typing ₹15,000 for a lunch entry), preventing accidental typos and warning against impulsive spending.

### 3. 📈 Time-Series Monthly Expense Forecaster (Regression)
- **Algorithm**: `Ridge Regression` with calendar & lag features (Day of Month, Day of Week, Weekend indicator, 7-day rolling average).
- **Functionality**: Projects end-of-month financial expenditure and daily burn rate based on actual spending velocity, replacing naive mathematical daily averages.

### 4. 🔄 Dynamic Model Re-training Pipeline
- Triggered on-demand via `POST /api/ml/retrain` to incrementally adapt model weights as user transaction history grows.

---

## ⚛️ Dual Frontend Architecture

1. **React.js Dashboard (`/react` & `client/`)**:
   - Built with **React 18** functional components and modern hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
   - Real-time reactive AI suggestions and anomaly alerts.
   - Glassmorphism design system with responsive layouts.
2. **Classic Web Dashboard (`/` & `index.html`)**:
   - Lightweight Vanilla JavaScript + HTML5/CSS3 + Chart.js analytics.

---

## 🛠️ Tech Stack

- **Machine Learning**: `scikit-learn`, `pandas`, `numpy`, `joblib`
- **Backend**: `Python`, `Flask`, `SQLite3`
- **Frontend**: `React 18`, `Chart.js`, `Vanilla JavaScript (ES6+)`, `HTML5`, `CSS3` (Custom Glassmorphism)

---

## 📂 Project Structure

```plaintext
Personal-Expensive-Tracker/
│
├── ml/                                # Machine Learning Subsystem
│   ├── dataset.py                     # Synthetic financial transaction data generator
│   ├── nlp_classifier.py              # TF-IDF + Logistic Regression categorizer
│   ├── anomaly_detector.py            # Isolation Forest outlier detection
│   ├── forecaster.py                  # Ridge Regression time-series forecaster
│   ├── service.py                     # Unified ML Service facade
│   └── models/                        # Serialized .joblib trained model artifacts
│
├── client/                            # React.js Vite Project
│   ├── src/
│   │   ├── App.jsx                    # Main React application component
│   │   ├── main.jsx                   # React DOM root
│   │   └── index.css                  # Modern styles
│   ├── package.json
│   └── vite.config.js
│
├── assets/
│   └── images/                        # UI Mockups & graphics
├── app.py                             # Flask API & static file server
├── react-app.html                     # Standalone React 18 SPA served via Flask
├── index.html                         # Classic dashboard
├── home.html                          # Landing page
├── login.html                         # Authentication UI
├── script.js                          # Client-side logic & ML API hooks
├── style.css                          # Glassmorphism styling system
├── requirements.txt                   # Python dependencies
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.8+ and Node.js (v18+) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/pardhavisaimalisetti-pyd/Personal-Expensive-Tracker.git
cd Personal-Expensive-Tracker
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```
- Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** for the Landing Page & Classic Dashboard.
- Open **[http://127.0.0.1:5000/react](http://127.0.0.1:5000/react)** for the **React.js AI Dashboard**.

*(Optional)* Run the React Vite Dev Server:
```bash
cd client
npm install
npm run dev
```

---

## 🔌 REST & ML API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves Landing Page |
| `GET` | `/react` | Serves React.js AI Dashboard |
| `GET` | `/api/transactions` | Retrieve all transactions |
| `POST` | `/api/transactions` | Add a new transaction |
| `DELETE` | `/api/transactions/<id>` | Delete transaction by ID |
| `POST` | `/api/ml/predict-category` | **NLP**: Predicts category & confidence score from text |
| `POST` | `/api/ml/detect-anomaly` | **ML**: Detects abnormal spending using Isolation Forest |
| `GET` | `/api/ml/forecast` | **ML**: Time-series monthly spending projection |
| `GET` | `/api/ml/metrics` | Returns model evaluation metrics (Accuracy, F1, MAE) |
| `POST` | `/api/ml/retrain` | Triggers model re-training pipeline |

---

## 👤 Author

- **GitHub**: [@pardhavisaimalisetti-pyd](https://github.com/pardhavisaimalisetti-pyd)

---

## 📄 License

This project is licensed under the MIT License.
