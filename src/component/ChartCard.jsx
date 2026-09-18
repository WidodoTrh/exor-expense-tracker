import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles'

const DEFAULT_COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#06b6d4',
  '#22c55e', '#a855f7', '#ec4899', '#14b8a6',
];

const defaultFormatter = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num || 0);

// Custom label renderer for Pie: text + connector line drawn outside the arc.
// Sekarang nerima `theme` biar warnanya ngikut palette, bukan hardcode.
function renderPieLabel({ formatValue, theme }) {
  return function CustomLabel(props) {
    const { cx, cy, midAngle, outerRadius, value, name } = props;
    const RADIAN = Math.PI / 180;

    const sx = cx + (outerRadius + 4) * Math.cos(-midAngle * RADIAN);
    const sy = cy + (outerRadius + 4) * Math.sin(-midAngle * RADIAN);
    const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
    const ex = cx + (outerRadius + 30) * Math.cos(-midAngle * RADIAN);
    const ey = cy + (outerRadius + 30) * Math.sin(-midAngle * RADIAN);

    const textAnchor = mx > cx ? 'start' : 'end';
    const dx = textAnchor === 'start' ? 4 : -4;

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={theme.palette.divider} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={theme.palette.text.secondary} />
        <text
          x={ex + dx}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          fill={theme.palette.text.primary}
        >
          {name}
        </text>
        <text
          x={ex + dx}
          y={ey + 14}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={11}
          fill={theme.palette.text.secondary}
        >
          {formatValue(value)}
        </text>
      </g>
    );
  };
}

export default function ChartCard({
  type = 'line',
  data = [],
  title,
  height = 300,
  formatValue = defaultFormatter,
  emptyMessage = 'Belum ada data',
  colors = DEFAULT_COLORS,
  loading = false,
  nameKey = 'name',
  valueKey = 'value',
  innerRadius = 50,
  outerRadius = 80,
  xKey = 'x',
  series = [],
  barLayout = 'vertical',
}) {
  const isEmpty = !data || data.length === 0;
  const theme = useTheme()

  // dipakai berulang di banyak <Tooltip>, biar konsisten & gak nulis ulang tiap chart
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 8,
    },
    itemStyle: { color: theme.palette.text.primary },
    labelStyle: { color: theme.palette.text.primary },
  };

  const axisTickStyle = { fill: theme.palette.text.secondary };

  return (
    <Card sx={{borderRadius: 4}}>
      <CardContent>
        {title && (
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            {title}
          </Typography>
        )}

        {isEmpty && !loading ? (
          <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            )}
            <Box sx={{ opacity: loading ? 0.35 : 1, transition: 'opacity 0.2s ease', pointerEvents: loading ? 'none' : 'auto' }}>
              <ResponsiveContainer width="100%" height={height}>
                {type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey={valueKey}
                      nameKey={nameKey}
                      cx="50%"
                      cy="50%"
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      label={renderPieLabel({ formatValue, theme })}
                      labelLine={false}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatValue(value)} {...tooltipStyle} />
                  </PieChart>
                ) : type === 'bar' ? (
                  barLayout === 'horizontal' ? (
                    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                      <XAxis type="number" fontSize={12} tick={axisTickStyle} tickFormatter={(v) => formatValue(v)} />
                      <YAxis type="category" dataKey={xKey} fontSize={12} width={100} tick={axisTickStyle} />
                      <Tooltip formatter={(value) => formatValue(value)} {...tooltipStyle} />
                      {series.length > 1 && <Legend wrapperStyle={{ color: theme.palette.text.primary }} />}
                      {series.map((s, i) => (
                        <Bar key={s.key} dataKey={s.key} name={s.label || s.key} fill={s.color || colors[i % colors.length]} radius={[0, 4, 4, 0]}>
                          <LabelList dataKey={s.key} position="right" formatter={formatValue} fontSize={11} fill={theme.palette.text.primary} />
                        </Bar>
                      ))}
                    </BarChart>
                  ) : (
                    <BarChart data={data} margin={{ top: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey={xKey} fontSize={12} tick={axisTickStyle} />
                      <YAxis fontSize={12} tickFormatter={(v) => formatValue(v)} width={80} tick={axisTickStyle} />
                      <Tooltip formatter={(value) => formatValue(value)} {...tooltipStyle} />
                      {series.length > 1 && <Legend wrapperStyle={{ color: theme.palette.text.primary }} />}
                      {series.map((s, i) => (
                        <Bar key={s.key} dataKey={s.key} name={s.label || s.key} fill={s.color || colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                          <LabelList dataKey={s.key} position="top" formatter={formatValue} fontSize={11} fill={theme.palette.text.primary} />
                        </Bar>
                      ))}
                    </BarChart>
                  )
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey={xKey} fontSize={12} tick={axisTickStyle} />
                    <YAxis fontSize={12} tickFormatter={(v) => formatValue(v)} width={80} tick={axisTickStyle} />
                    <Tooltip formatter={(value) => formatValue(value)} {...tooltipStyle} />
                    {series.length > 1 && <Legend wrapperStyle={{ color: theme.palette.text.primary }} />}
                    {series.map((s, i) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label || s.key}
                        stroke={s.color || colors[i % colors.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}