# 💰 PyFin - Personal Expense Tracker

A modern, full-stack personal finance and expense tracking web application with a sleek glassmorphism UI, real-time analytics, and persistent SQLite storage.

![Python](https://img.shields.io/badge/Python-3.x-blue.svg?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.x-black.svg?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

---

## 📸 Preview

<div align="center">
  <img src="assets/images/dashboard_mockup.png" alt="PyFin Dashboard Mockup" width="85%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />
</div>

---

## ✨ Features

- **🎨 Modern Glassmorphism UI**: High-contrast futuristic dark theme with animated glowing gradients, responsive layout, and smooth micro-interactions.
- **📊 Interactive Charts & Analytics**: Real-time spending visualizations powered by Chart.js (monthly trends, category breakdowns, income vs. expense).
- **💸 Transaction Management**:
  - Add, track, and delete income and expense records.
  - Categorization (Food, Shopping, Bills, Entertainment, Health, etc.).
  - Payment method tracking (UPI, Credit/Debit Card, Cash, Net Banking).
- **🗄️ Persistent Database**: Built with SQLite via Python's standard `sqlite3` library to store records safely and reliably.
- **⚡ RESTful API**: Clean backend routes providing CRUD functionality for transaction data.
- **📱 Responsive Layout**: Seamless experience across mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3** (Custom Glassmorphism design system)
- **Vanilla JavaScript (ES6+)**
- **[Chart.js](https://www.chartjs.org/)** for interactive data charts
- **FontAwesome 6** for iconography
- **Google Fonts** (Inter & Outfit)

### Backend
- **[Python](https://www.python.org/)**
- **[Flask](https://flask.palletsprojects.com/)** microframework
- **SQLite3** for lightweight relational database storage

---

## 📂 Project Structure

```plaintext
Personal-Expensive-Tracker/
│
├── assets/
│   └── images/
│       ├── dashboard_mockup.png       # Dashboard screenshot preview
│       └── wallet_illustration.png    # App graphic assets
│
├── app.py                             # Flask application & REST API routes
├── home.html                          # Landing page
├── index.html                         # Main dashboard & expense manager UI
├── login.html                         # Login & authentication page
├── script.js                          # Client-side logic & chart integrations
├── style.css                          # Modern glassmorphism styling
├── requirements.txt                   # Python dependencies
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.8+ installed on your computer.

### 2. Clone the Repository
```bash
git clone https://github.com/pardhavisaimalisetti-pyd/Personal-Expensive-Tracker.git
cd Personal-Expensive-Tracker
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

### 5. Open in Your Browser
Visit [http://127.0.0.1:5000](http://127.0.0.1:5000) to start managing your expenses!

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the landing page (`home.html`) |
| `GET` | `/api/transactions` | Fetches all stored transactions |
| `POST` | `/api/transactions` | Adds a new transaction entry |
| `DELETE` | `/api/transactions/<id>` | Deletes a transaction by ID |

---

## 👤 Author

- **GitHub**: [@pardhavisaimalisetti-pyd](https://github.com/pardhavisaimalisetti-pyd)

---

## 📄 License

This project is licensed under the MIT License - feel free to use and customize it!
