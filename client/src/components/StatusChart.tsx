import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  Available: '#639922',
  Allocated: '#378ADD',
  Reserved: '#7F77DD',
  'Under Maintenance': '#BA7517',
  Lost: '#E24B4A',
  Retired: '#888780',
};

interface StatusChartProps {
  assets: { status: string }[];
}

export default function StatusChart({ assets }: StatusChartProps) {
  const counts: Record<string, number> = {};
  assets.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '0 12px 12px 12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(44,44,42,0.08)',
      border: '1px solid rgba(44,44,42,0.08)',
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Asset Status Breakdown</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} assets`, name]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid rgba(44,44,42,0.1)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-sans)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
