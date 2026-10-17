import React, { useState, useEffect, useCallback, useMemo } from 'react';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Debit Card');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [anomalyWarning, setAnomalyWarning] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [txRes, fRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/ml/forecast')
      ]);
      if (txRes.ok) setTransactions(await txRes.json());
      if (fRes.ok) setForecast(await fRes.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time AI NLP Category Predictor
  useEffect(() => {
    if (!desc || desc.trim().length < 3) {
      setAiSuggestion(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/ml/predict-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desc })
        });
        if (res.ok) {
          const d = await res.json();
          if (d.confidence >= 0.45) setAiSuggestion(d);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [desc]);

  // Real-time Anomaly Detection
  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || type !== 'Expense') {
      setAnomalyWarning(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/ml/detect-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: val, category })
        });
        if (res.ok) {
          const d = await res.json();
          setAnomalyWarning(d.is_anomaly ? d.message : null);
        }
      } catch (err) {
        console.error(err);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [amount, category, type]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        desc,
        amount: parseFloat(amount),
        type,
        category,
        date,
        method
      })
    });

    setDesc('');
    setAmount('');
    setAiSuggestion(null);
    setAnomalyWarning(null);
    loadData();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions(prev => prev.filter(t => t.id !== id));
    loadData();
  };

  const totals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') inc += t.amount;
      else exp += t.amount;
    });
    return { inc, exp, balance: inc - exp };
  }, [transactions]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28 }}>
            <i className="fa-brands fa-react" style={{ color: '#00d2ff' }}></i>
            PyFin React SPA
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Vite + React 18 Frontend talking to Python Flask + Scikit-Learn API
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 15, marginBottom: 25 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total Income</p>
          <h2 style={{ color: 'var(--emerald-green)', marginTop: 5 }}>₹{totals.inc.toFixed(2)}</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total Expense</p>
          <h2 style={{ color: 'var(--neon-pink)', marginTop: 5 }}>₹{totals.exp.toFixed(2)}</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Remaining Balance</p>
          <h2 style={{ color: 'var(--neon-blue)', marginTop: 5 }}>₹{totals.balance.toFixed(2)}</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>AI Month Forecast</p>
          <h2 style={{ color: 'var(--orange-glow)', marginTop: 5 }}>
            ₹{forecast ? forecast.predicted_total.toFixed(2) : '0.00'}
          </h2>
          <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {forecast ? forecast.model_used : 'Ridge Regression'}
          </small>
        </div>
      </div>

      {/* Form & Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ marginBottom: 15 }}><i className="fa-solid fa-plus-circle"></i> Add Entry</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
              <input
                type="text"
                placeholder="e.g. Swiggy lunch, Uber, Grocery"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }}
                required
              />
              {aiSuggestion && (
                <div
                  onClick={() => setCategory(aiSuggestion.category)}
                  style={{ cursor: 'pointer', marginTop: 6, fontSize: 12, color: '#00f2fe', background: 'rgba(0, 242, 254, 0.12)', padding: '4px 8px', borderRadius: 12, display: 'inline-block' }}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i> AI Suggests: {aiSuggestion.category} ({(aiSuggestion.confidence * 100).toFixed(0)}%)
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }}
                required
              />
              {anomalyWarning && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b6b', background: 'rgba(255, 75, 43, 0.15)', padding: '6px 10px', borderRadius: 8 }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {anomalyWarning}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#1c2237', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#1c2237', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }}>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Salary">Salary</option>
                  <option value="Pocket Money">Pocket Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #00d2ff, #3a7bd5)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', maxHeight: 480, overflowY: 'auto' }}>
          <h3 style={{ marginBottom: 15 }}><i className="fa-solid fa-list"></i> History ({transactions.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>Desc</th>
                <th style={{ padding: '8px 4px' }}>Category</th>
                <th style={{ padding: '8px 4px' }}>Amount</th>
                <th style={{ padding: '8px 4px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice().reverse().map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 4px' }}>{t.desc}</td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-muted)' }}>{t.category}</td>
                  <td style={{ padding: '10px 4px', color: t.type === 'Income' ? 'var(--emerald-green)' : 'var(--neon-pink)' }}>
                    {t.type === 'Income' ? '+' : '-'}₹{parseFloat(t.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 4px' }}>
                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
