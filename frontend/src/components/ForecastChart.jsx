import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ data }) {
  if (!data || data.length === 0) return <p>No chart data available.</p>;

  // Format the date for the X-axis
  const formattedData = data.map(d => ({
    ...d,
    time: new Date(d.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="actual_mw" stroke="#8884d8" name="Actual" dot={false} />
        <Line type="monotone" dataKey="forecast_mw" stroke="#82ca9d" name="Forecast" dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}