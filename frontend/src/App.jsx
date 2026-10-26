import { useState, useEffect } from 'react';
import ForecastChart from './components/ForecastChart';
import ErrorMetrics from './components/ErrorMetrics';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // When deployed on Vercel Services, the backend is routed to /api
    fetch('/api/analysis')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading analysis for January 2026...</div>;
  if (error) return <div className="container error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>UK Wind Generation Forecast Analysis</h1>
      <p className="subtitle">January 2026 | Day-Ahead Decision Accuracy</p>
      
      <div className="card">
        <h2>Forecast Error Metrics</h2>
        <ErrorMetrics metrics={data.metrics} />
      </div>

      <div className="card">
        <h2>Actual vs Forecast (Sample)</h2>
        <ForecastChart data={data.chart_data} />
      </div>
    </div>
  );
}

export default App;