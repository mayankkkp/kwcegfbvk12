import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function ForecastChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#6b7280' }}>No chart data available for this range.</p>;
  }

  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.startTime).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          label={{
            value: 'Generation (MW)',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: '#6b7280' },
          }}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line
          type="monotone"
          dataKey="actual_mw"
          stroke="#0f766e"
          strokeWidth={2}
          name="Actual"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="forecast_mw"
          stroke="#d97706"
          strokeWidth={2}
          strokeDasharray="5 4"
          name="Forecast (12h ahead)"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}