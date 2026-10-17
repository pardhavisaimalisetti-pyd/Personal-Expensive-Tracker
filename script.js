// Global State
let transactions = [];

// Chart Instances
let lineChartInstance = null;
let doughnutChartInstance = null;
let barChartInstance = null;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', async function() {
    
    // Set Current Date in Header
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Set today's date in form by default
    document.getElementById('date').valueAsDate = new Date();

    // Set common Chart.js defaults for dark theme
    Chart.defaults.color = '#a0aab2';
    Chart.defaults.font.family = "'Inter', sans-serif";

    initCharts();
    
    // Load Data (From Python Flask API, fallback to localStorage)
    await loadData();

    // AI Real-time Category Suggestion as User Types
    const descInput = document.getElementById('desc');
    let aiTimeout = null;
    if (descInput) {
        descInput.addEventListener('input', function() {
            clearTimeout(aiTimeout);
            const query = descInput.value.trim();
            if (query.length >= 3) {
                aiTimeout = setTimeout(async () => {
                    try {
                        const res = await fetch('/api/ml/predict-category', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ desc: query })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.confidence >= 0.45) {
                                const catSelect = document.getElementById('category');
                                if (catSelect) {
                                    catSelect.value = data.category;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('NLP Auto-predict error:', e);
                    }
                }, 300);
            }
        });
    }

    // Form Submit Handler
    document.getElementById('expenseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const desc = document.getElementById('desc').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const method = document.getElementById('payment-method').value;

        const transaction = { desc, amount, type, category, date, method };

        // Save to Database via Flask API
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });
            if(response.ok) {
                const savedTx = await response.json();
                transactions.push(savedTx);
            } else {
                throw new Error("API Error");
            }
        } catch (error) {
            console.log("Python Backend not found. Using local storage fallback.");
            transaction.id = Date.now();
            transactions.push(transaction);
            localStorage.setItem('pyfin_transactions', JSON.stringify(transactions));
        }
        
        // Reset form except date
        document.getElementById('desc').value = '';
        document.getElementById('amount').value = '';
        
        // Show success animation on button
        const btn = this.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        btn.style.background = 'linear-gradient(45deg, #43e97b, #38f9d7)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            showSection('dashboard-view'); // Redirect to dashboard after adding
        }, 1000);

        updateDashboard();
    });

    // Interactive element animations for cards
    animateCards();
});

async function loadData() {
    try {
        const response = await fetch('/api/transactions');
        if(response.ok) {
            transactions = await response.json();
        } else {
            throw new Error("API Error");
        }
    } catch (error) {
        console.log("Python Backend not found. Loading from local storage fallback.");
        const storedData = localStorage.getItem('pyfin_transactions');
        if(storedData) {
            transactions = JSON.parse(storedData);
        }
    }
    updateDashboard();
}

async function deleteTransaction(id) {
    // Delete from Database via Flask API
    try {
        const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error("API Error");
    } catch (error) {
        console.log("Python Backend not found. Using local storage fallback.");
    }

    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('pyfin_transactions', JSON.stringify(transactions)); // Sync fallback
    updateDashboard();
}

function animateCards() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease ' + (index * 0.1) + 's';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });
}

function showSection(sectionId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });
    
    // Show target section
    const target = document.getElementById(sectionId);
    if(target) {
        target.style.display = 'block';
        setTimeout(() => {
            target.classList.add('active');
            animateCards();
        }, 10);
    }
    
    // Update active state on sidebar
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.parentElement.classList.add('active');
}

function initCharts() {
    // Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const incomeGradient = lineCtx.createLinearGradient(0, 0, 0, 400);
    incomeGradient.addColorStop(0, 'rgba(67, 233, 123, 0.5)');
    incomeGradient.addColorStop(1, 'rgba(67, 233, 123, 0.0)');
    
    const expenseGradient = lineCtx.createLinearGradient(0, 0, 0, 400);
    expenseGradient.addColorStop(0, 'rgba(245, 87, 108, 0.5)');
    expenseGradient.addColorStop(1, 'rgba(245, 87, 108, 0.0)');

    lineChartInstance = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Income', data: [], borderColor: '#43e97b', backgroundColor: incomeGradient, fill: true, tension: 0.4 },
            { label: 'Expenses', data: [], borderColor: '#f5576c', backgroundColor: expenseGradient, fill: true, tension: 0.4 }
        ]},
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Doughnut Chart
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    doughnutChartInstance = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Travel', 'Bills', 'Shopping', 'Pocket Money', 'Other'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: ['#fa709a', '#00f2fe', '#f093fb', '#f5576c', '#43e97b', '#a0aab2'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
    });

    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Expenses', data: [], backgroundColor: '#00f2fe', borderRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate totals
    transactions.forEach(t => {
        if (t.type === 'Income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    let savingsPct = 0;
    if (totalIncome > 0) {
        savingsPct = Math.max(0, Math.round((balance / totalIncome) * 100));
    }

    // Update DOM
    document.getElementById('total-income').innerText = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `₹${totalExpense.toFixed(2)}`;
    document.getElementById('remaining-balance').innerText = `₹${balance.toFixed(2)}`;
    document.getElementById('savings-percentage').innerText = `${savingsPct}%`;
    document.getElementById('savings-progress').style.width = `${savingsPct}%`;

    calculatePrediction();

    renderTable();
    updateCharts();
}

async function calculatePrediction() {
    const predictedEl = document.getElementById('predicted-expenses');
    try {
        const res = await fetch('/api/ml/forecast');
        if (res.ok) {
            const data = await res.json();
            if (predictedEl && data && typeof data.predicted_total === 'number') {
                predictedEl.innerText = `₹${data.predicted_total.toFixed(2)}`;
                return;
            }
        }
    } catch (err) {
        console.warn('ML Forecast endpoint fallback to local math:', err);
    }

    const now = new Date();
    let currentMonthExpense = 0;
    
    transactions.forEach(t => {
        if(t.type === 'Expense') {
            const d = new Date(t.date);
            if(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                currentMonthExpense += t.amount;
            }
        }
    });

    let currentDay = now.getDate();
    let predicted = 0;
    if (currentDay > 0) {
        predicted = (currentMonthExpense / currentDay) * 30;
    }
    
    // Fallback if no transactions this month
    if (currentMonthExpense === 0 && transactions.length > 0) {
        let totalExp = 0;
        let minDate = now;
        transactions.forEach(t => {
            if(t.type === 'Expense') {
                totalExp += t.amount;
                const d = new Date(t.date);
                if (d < minDate) minDate = d;
            }
        });
        const msDiff = now - minDate;
        let daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
        if (daysDiff <= 0) daysDiff = 1;
        predicted = (totalExp / daysDiff) * 30;
    }

    if(predictedEl) {
        predictedEl.innerText = `₹${predicted.toFixed(2)}`;
    }
}

function renderTable() {
    const tbody = document.getElementById('transactionList');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        emptyState.style.display = 'flex';
        document.getElementById('transactionsTable').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        document.getElementById('transactionsTable').style.display = 'table';
        
        // Sort by date descending
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach((t) => {
            const tr = document.createElement('tr');
            
            let iconClass = 'other';
            let catLower = t.category.toLowerCase();
            if(catLower.includes('food')) iconClass = 'food';
            else if(catLower.includes('travel')) iconClass = 'travel';
            else if(catLower.includes('bills')) iconClass = 'bills';
            else if(catLower.includes('shopping')) iconClass = 'shopping';
            else if(catLower.includes('salary')) iconClass = 'salary';
            else if(catLower.includes('pocket money')) iconClass = 'pocket';

            let faIcon = 'fa-tag';
            if(iconClass === 'food') faIcon = 'fa-utensils';
            if(iconClass === 'travel') faIcon = 'fa-plane';
            if(iconClass === 'bills') faIcon = 'fa-bolt';
            if(iconClass === 'shopping') faIcon = 'fa-bag-shopping';
            if(iconClass === 'salary') faIcon = 'fa-money-bill-wave';
            if(iconClass === 'pocket') faIcon = 'fa-coins';

            const amountClass = t.type === 'Income' ? 'income' : 'expense';
            const sign = t.type === 'Income' ? '+' : '-';
            
            tr.innerHTML = `
                <td>
                    <div class="td-flex">
                        <div class="icon-box ${iconClass}"><i class="fa-solid ${faIcon}"></i></div>
                        <span>${t.desc}</span>
                    </div>
                </td>
                <td>${t.category}</td>
                <td>${new Date(t.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year:'numeric'})}</td>
                <td><span style="color: var(--text-muted);">${t.method}</span></td>
                <td class="amount ${amountClass}">${sign}₹${t.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Chart filtering logic
function updateCharts() {
    const lineFilter = document.getElementById('lineChartFilter').value;
    const pieFilter = document.getElementById('pieChartFilter').value;
    const barFilter = document.getElementById('barChartFilter').value;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // ---- 1. Pie Chart ----
    const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Pocket Money', 'Other'];
    const catData = [0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
        if(t.type === 'Expense') {
            const d = new Date(t.date);
            if(pieFilter === 'monthly' && (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear)) return;

            const index = categories.indexOf(t.category);
            if(index !== -1) catData[index] += t.amount;
            else catData[5] += t.amount;
        }
    });
    doughnutChartInstance.data.datasets[0].data = catData;
    doughnutChartInstance.update();

    // ---- 2. Bar Chart ----
    let barLabels = [];
    let barData = [];
    
    if(barFilter === 'monthly') {
        barLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        barData = Array(12).fill(0);
        transactions.forEach(t => {
            if(t.type === 'Expense') {
                const d = new Date(t.date);
                if(d.getFullYear() === currentYear) {
                    barData[d.getMonth()] += t.amount;
                }
            }
        });
    } else if (barFilter === 'daily') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for(let i=1; i<=daysInMonth; i++) barLabels.push(i.toString());
        barData = Array(daysInMonth).fill(0);
        transactions.forEach(t => {
            if(t.type === 'Expense') {
                const d = new Date(t.date);
                if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    barData[d.getDate()-1] += t.amount;
                }
            }
        });
    }
    barChartInstance.data.labels = barLabels;
    barChartInstance.data.datasets[0].data = barData;
    barChartInstance.update();

    // ---- 3. Line Chart ----
    const dateMap = {};
    transactions.forEach(t => {
        const d = new Date(t.date);
        let key = t.date;
        
        if (lineFilter === 'monthly') {
            key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else if (lineFilter === 'yearly') {
            key = d.getFullYear().toString();
        }

        if(!dateMap[key]) dateMap[key] = { inc: 0, exp: 0, timestamp: d.getTime() };
        
        if(t.type === 'Income') dateMap[key].inc += t.amount;
        else dateMap[key].exp += t.amount;
    });

    const sortedKeys = Object.keys(dateMap).sort((a,b) => dateMap[a].timestamp - dateMap[b].timestamp);
    const incLine = [];
    const expLine = [];

    if(sortedKeys.length === 0) {
        sortedKeys.push(''); incLine.push(0); expLine.push(0);
    } else {
        sortedKeys.forEach(k => {
            incLine.push(dateMap[k].inc);
            expLine.push(dateMap[k].exp);
        });
    }

    lineChartInstance.data.labels = sortedKeys;
    lineChartInstance.data.datasets[0].data = incLine;
    lineChartInstance.data.datasets[1].data = expLine;
    lineChartInstance.update();
}

// Notification Alert Logic
function showBalanceAlert() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'Income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    alert(`💳 BALANCE NOTIFICATION\n\nYou currently have ₹${balance.toFixed(2)} left in your account.`);
}
