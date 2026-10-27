function severityForBias(bias) {
  const abs = Math.abs(bias);
  if (abs < 100) return 'good';
  if (abs < 500) return 'caution';
  return 'risk';
}

function severityForError(value, goodThreshold, cautionThreshold) {
  if (value < goodThreshold) return 'good';
  if (value < cautionThreshold) return 'caution';
  return 'risk';
}

export default function ErrorMetrics({ metrics }) {
  if (!metrics || !metrics.count) {
    return <p style={{ color: '#6b7280', margin: 0 }}>No valid data pairs found for this range.</p>;
  }

  return (
    <div className="metrics-grid">
      <div className="metric">
        <span className="label">Mean Absolute Error</span>
        <span className={`value ${severityForError(metrics.mae, 500, 1000)}`}>
          {metrics.mae.toFixed(0)}
          <span className="unit">MW</span>
        </span>
      </div>

      <div className="metric">
        <span className="label">RMSE</span>
        <span className={`value ${severityForError(metrics.rmse, 700, 1500)}`}>
          {metrics.rmse.toFixed(0)}
          <span className="unit">MW</span>
        </span>
      </div>

      <div className="metric">
        <span className="label">Bias (Forecast − Actual)</span>
        <span className={`value ${severityForBias(metrics.bias)}`}>
          {metrics.bias > 0 ? '+' : ''}{metrics.bias.toFixed(0)}
          <span className="unit">MW</span>
        </span>
      </div>

      <div className="metric">
        <span className="label">Aligned Periods</span>
        <span className="value">
          {metrics.count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}