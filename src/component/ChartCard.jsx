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
function renderPieLabel({ formatValue }) {
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
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#999" fill="none" />
        <circle cx={ex} cy={ey} r={2} fill="#999" />
        <text x={ex + dx} y={ey} textAnchor={textAnchor} dominantBaseline="central" fontSize={12} fontWeight={600}>
          {name}
        </text>
        <text x={ex + dx} y={ey + 14} textAnchor={textAnchor} dominantBaseline="central" fontSize={11} fill="#666">
          {formatValue(value)}
        </text>
      </g>
    );
  };
}

/**
 * Generic chart card. Pass `type` + `data` + a few config props, get a styled
 * card with the chart inside. Built on Recharts so behavior is consistent
 * across pie/line/bar.
 *
 * PIE props:
 *   data: [{ [nameKey]: string, [valueKey]: number }, ...]
 *   nameKey, valueKey (default 'name'/'value')
 *
 * LINE / BAR props:
 *   data: [{ [xKey]: string|number, seriesA: number, seriesB: number, ... }, ...]
 *   xKey (default 'x')
 *   series: [{ key: 'seriesA', label: 'Series A', color: '#...' }, ...]
 *
 * Common props:
 *   title: string
 *   height: number (default 300)
 *   formatValue: (num) => string  (tooltip/label formatter, default Rupiah)
 *   emptyMessage: string
 *   loading: boolean (shows a centered spinner over a faded chart while true)
 */
export default function ChartCard({
  type = 'line',
  data = [],
  title,
  height = 300,
  formatValue = defaultFormatter,
  emptyMessage = 'Belum ada data',
  colors = DEFAULT_COLORS,
  loading = false,
  // pie-specific
  nameKey = 'name',
  valueKey = 'value',
  innerRadius = 50,
  outerRadius = 80,
  // line/bar-specific
  xKey = 'x',
  series = [],
  barLayout = 'vertical', // 'vertical' (default, bars go up) | 'horizontal' (bars go sideways)
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <Card>
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
                  label={renderPieLabel({ formatValue })}
                  labelLine={false}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatValue(value)} />
              </PieChart>
            ) : type === 'bar' ? (
              barLayout === 'horizontal' ? (
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} tickFormatter={(v) => formatValue(v)} />
                  <YAxis type="category" dataKey={xKey} fontSize={12} width={100} />
                  <Tooltip formatter={(value) => formatValue(value)} />
                  {series.length > 1 && <Legend />}
                  {series.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} name={s.label || s.key} fill={s.color || colors[i % colors.length]} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey={s.key} position="right" formatter={formatValue} fontSize={11} />
                    </Bar>
                  ))}
                </BarChart>
              ) : (
                <BarChart data={data} margin={{ top: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey={xKey} fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => formatValue(v)} width={80} />
                  <Tooltip formatter={(value) => formatValue(value)} />
                  {series.length > 1 && <Legend />}
                  {series.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} name={s.label || s.key} fill={s.color || colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey={s.key} position="top" formatter={formatValue} fontSize={11} />
                    </Bar>
                  ))}
                </BarChart>
              )
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey={xKey} fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => formatValue(v)} width={80} />
                <Tooltip formatter={(value) => formatValue(value)} />
                {series.length > 1 && <Legend />}
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