export default function ErrorMetrics({ metrics }) {
  if (!metrics || !metrics.count) return <p>No valid data pairs found.</p>;

  return (
    <div className="metrics-grid">
      <div className="metric">
        <span className="label">MAE (Mean Abs Error)</span>
        <span className="value">{metrics.mae.toFixed(2)} MW</span>
      </div>
      <div className="metric">
        <span className="label">RMSE</span>
        <span className="value">{metrics.rmse.toFixed(2)} MW</span>
      </div>
      <div className="metric">
        <span className="label">Bias (Forecast - Actual)</span>
        <span className="value" style={{ color: metrics.bias > 0 ? 'red' : 'green' }}>
          {metrics.bias > 0 ? '+' : ''}{metrics.bias.toFixed(2)} MW
        </span>
      </div>
      <div className="metric">
        <span className="label">Aligned Data Points</span>
        <span className="value">{metrics.count}</span>
      </div>
    </div>
  );
}