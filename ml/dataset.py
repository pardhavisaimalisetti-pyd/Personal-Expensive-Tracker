"""
ml/dataset.py
Generates a realistic financial transaction dataset for training:
1. NLP Category Classifier
2. Anomaly Detection (Isolation Forest)
3. Time-Series Expense Forecaster
"""

import random
from datetime import datetime, timedelta
import pandas as pd

CATEGORY_TEMPLATES = {
    "Food": [
        "Swiggy lunch order", "Zomato dinner biryani", "McDonald's burger meal",
        "Starbucks iced caramel macchiato", "Domino's pizza delivery", "Grocery veggies & fruits",
        "Supermarket grocery essentials", "KFC chicken bucket", "Cafe Coffee Day latte",
        "Bakery fresh bread and cake", "Subway salad sandwich", "Street food evening snacks",
        "Tea stall chai and samosa", "Fine dining restaurant dinner", "Milk and daily dairy supply",
        "Blinkit instant groceries", "Zepto vegetables delivery", "Ice cream parlour dessert"
    ],
    "Travel": [
        "Uber ride to tech park", "Ola cab to airport", "Metro card balance recharge",
        "Petrol pump fuel filling", "Diesel for car", "IRCTC railway train ticket",
        "IndiGo flight ticket booking", "Auto rickshaw ride fare", "Monthly city bus pass",
        "Highway toll plaza FASTag recharge", "Rapido bike taxi ride", "Car maintenance servicing",
        "Airport parking fee", "EV bike charging fee"
    ],
    "Bills": [
        "Electricity power bill payment", "Airtel fiber broadband wifi bill", "Jio 5G prepaid mobile recharge",
        "House monthly rent transfer", "LPG cooking gas cylinder booking", "Municipal corporation water bill",
        "Netflix 4K UHD subscription", "Amazon Prime annual membership", "Spotify premium music subscription",
        "Credit card statement repayment", "Maintenance charges for apartment", "DTH satellite TV recharge"
    ],
    "Shopping": [
        "Amazon online purchase wireless earbuds", "Myntra fashion clothing t-shirt", "Flipkart electronics sale monitor",
        "Zara autumn collection jacket", "Nike running sneakers shoe store", "H&M cotton casual shirt",
        "IKEA desk and ergonomic chair", "Local apparel retail showroom", "Online book store paperback order",
        "Skin care and cosmetics cosmetics shop", "Sunglasses and eyewear frame"
    ],
    "Salary": [
        "Monthly software engineer salary credited", "Company payroll direct deposit",
        "Freelance web development milestone payout", "Technical consulting retainer fee",
        "Performance annual bonus credit", "Overtime stipend payout"
    ],
    "Pocket Money": [
        "Monthly pocket money allowance from dad", "Pocket money from mom", "Weekend spending allowance",
        "College pocket money transfer", "Family allowance deposit"
    ],
    "Other": [
        "PVR cinemas IMAX movie ticket", "Anytime Fitness gym membership", "General hospital doctor consultation",
        "Apollo pharmacy prescription medicine", "Dentist teeth cleaning clinic", "Pet food and veterinary clinic",
        "Charity NGO donation", "Gift for friend birthday", "Laundry and dry cleaning service"
    ]
}

CATEGORY_AMOUNT_RANGES = {
    "Food": (50, 1800),
    "Travel": (40, 3500),
    "Bills": (299, 15000),
    "Shopping": (300, 12000),
    "Salary": (35000, 125000),
    "Pocket Money": (1000, 10000),
    "Other": (100, 4500)
}

PAYMENT_METHODS = ["Credit Card", "Debit Card", "Cash", "Bank Transfer"]

def generate_training_data(n_samples: int = 800) -> pd.DataFrame:
    """Generates synthetic historical transactions for training models."""
    random.seed(42)
    records = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=120)
    
    categories = list(CATEGORY_TEMPLATES.keys())
    
    for _ in range(n_samples):
        cat = random.choice(categories)
        tx_type = "Income" if cat in ["Salary", "Pocket Money"] else "Expense"
        
        # Pick random description template
        desc = random.choice(CATEGORY_TEMPLATES[cat])
        
        # Add slight variation in phrasing
        prefixes = ["", "Paid for ", "Payment: ", "Expense on ", "Quick "]
        if random.random() > 0.6 and tx_type == "Expense":
            desc = random.choice(prefixes) + desc
            
        low, high = CATEGORY_AMOUNT_RANGES[cat]
        amount = round(random.uniform(low, high), 2)
        
        # Inject occasional rare outliers / anomalies (3% probability for expenses)
        if tx_type == "Expense" and random.random() < 0.03:
            amount = round(amount * random.uniform(4.0, 9.0), 2)
            
        # Random date within last 120 days
        random_days = random.randint(0, 120)
        tx_date = (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")
        method = random.choice(PAYMENT_METHODS)
        
        records.append({
            "desc": desc,
            "amount": amount,
            "type": tx_type,
            "category": cat,
            "date": tx_date,
            "method": method
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_training_data(100)
    print(f"Generated {len(df)} sample transactions across categories:")
    print(df["category"].value_counts())
