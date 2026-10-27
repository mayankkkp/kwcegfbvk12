import { useState, useEffect, useCallback } from 'react';
import ForecastChart from './components/ForecastChart';
import ErrorMetrics from './components/ErrorMetrics';
import './App.css';

// Default range: a historical month with published data
const DEFAULT_START = '2025-01-01';
const DEFAULT_END = '2025-01-31';

function App() {
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/analysis?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  // Initial load
  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunClick = (e) => {
    e.preventDefault();
    runAnalysis();
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>UK Wind Generation Forecast Analysis</h1>
        <p className="subtitle">Day-Ahead Forecast Accuracy · Elexon FUELHH &amp; WINDFOR</p>
      </header>

      <form className="date-form" onSubmit={handleRunClick}>
        <div className="date-field">
          <label htmlFor="start">Start date</label>
          <input
            id="start"
            type="date"
            value={start}
            max={end}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="date-field">
          <label htmlFor="end">End date</label>
          <input
            id="end"
            type="date"
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Running…' : 'Run analysis'}
        </button>
      </form>

      {error && <div className="card error">Error: {error}</div>}

      {loading && !data && (
        <div className="loading">Loading analysis for {start} → {end}</div>
      )}

      {data && (
        <>
          <div className="card">
            <h2>Forecast Error Metrics</h2>
            <p className="range-note">
              Range: {data.range.start} → {data.range.end}
            </p>
            <ErrorMetrics metrics={data.metrics} />
          </div>

          <div className="card">
            <h2>Actual vs Forecast (sample)</h2>
            <ForecastChart data={data.chart_data} />
          </div>
        </>
      )}
      
      <footer style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
        Data source: Elexon BMRS (FUELHH, WINDFOR) · Built for day-ahead wind forecast analysis
      </footer>
    </div>
  );
}

export default App;