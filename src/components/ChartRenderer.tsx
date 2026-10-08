import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ChartDataPayload {
  type?: 'pie' | 'bar' | 'line' | string;
  title?: string;
  data: Array<{ name: string; value: number; [key: string]: any }>;
  xAxisKey?: string;
  dataKeys?: string[];
}

const COLORS = [
  '#EAB308', // Gold / Yellow
  '#0284C7', // Sky / Cyan
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#D946EF', // Magenta
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

interface ChartRendererProps {
  dataPayload: ChartDataPayload;
}

// Custom Tooltip component with dynamic theme support
const CustomTooltip = ({ active, payload, totalValue, isDark }: any) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0];
    const name = dataItem.name || dataItem.payload?.name || 'Item';
    const val = Number(dataItem.value || 0);
    const percent = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
    const color = dataItem.color || dataItem.fill || '#EAB308';

    return (
      <div
        className="px-3.5 py-2.5 rounded-xl border shadow-xl text-xs font-sans z-50 pointer-events-none transition-colors"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span
            className="font-bold text-xs max-w-[220px] truncate"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {name}
          </span>
        </div>
        <div className="font-bold text-sm flex items-baseline gap-1.5" style={{ color: isDark ? '#FACC15' : '#CA8A04' }}>
          <span>{val.toLocaleString()}</span>
          <span className="text-xs font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            ({percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Line Dot component to match each data point dot color with its category color
const CustomLineDot = (props: any) => {
  const { cx, cy, index } = props;
  if (cx === undefined || cy === undefined) return null;
  const color = COLORS[index % COLORS.length];

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#ffffff"
      strokeWidth={1.5}
    />
  );
};

// Custom Active Dot component on hover
const CustomActiveDot = (props: any) => {
  const { cx, cy, index } = props;
  if (cx === undefined || cy === undefined) return null;
  const color = COLORS[index % COLORS.length];

  return (
    <circle
      cx={cx}
      cy={cy}
      r={7.5}
      fill={color}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ dataPayload }) => {
  let isDark = true;
  try {
    const themeCtx = useTheme();
    isDark = themeCtx.theme === 'dark';
  } catch (e) {
    isDark = true;
  }

  const initialType = (dataPayload.type || 'pie').toLowerCase();
  const [activeType, setActiveType] = useState<'pie' | 'bar' | 'line'>(
    initialType === 'bar' ? 'bar' : initialType === 'line' ? 'line' : 'pie'
  );

  const title = dataPayload.title || 'Data Visualization';
  const rawData = Array.isArray(dataPayload.data) ? dataPayload.data : [];

  // Ensure data items have numeric values
  const data = rawData.map((item, idx) => {
    const name = item.name ?? item.label ?? item.category ?? `Item ${idx + 1}`;
    const value = typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0;
    return { ...item, name: String(name), value };
  });

  if (data.length === 0) {
    return null;
  }

  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Dynamic style tokens based on active theme
  const containerBg = isDark ? '#111827' : '#ffffff';
  const containerBorder = isDark ? '#1f2937' : '#e5e7eb';
  const titleColor = isDark ? '#ffffff' : '#111827';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const accentGold = isDark ? '#facc15' : '#ca8a04';
  const cardBg = isDark ? '#1f2937' : '#f9fafb';
  const cardBorder = isDark ? '#374151' : '#e5e7eb';
  const cardTextColor = isDark ? '#e5e7eb' : '#1f2937';
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const axisTickColor = isDark ? '#e5e7eb' : '#374151';

  return (
    <div
      className="my-4 p-4 rounded-xl border shadow-md transition-colors not-prose overflow-hidden"
      style={{
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
    >
      {/* Header with Title and Toggle Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b mb-4" style={{ borderColor: containerBorder }}>
        <div>
          <h4 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: titleColor }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: accentGold }}></span>
            {title}
          </h4>
          <p className="text-xs font-medium mt-1" style={{ color: subtitleColor }}>
            {data.length} categories • Total:{' '}
            <span className="font-semibold" style={{ color: accentGold }}>
              {totalValue.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg border self-start sm:self-auto shrink-0" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <button
            onClick={() => setActiveType('pie')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeType === 'pie' ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: activeType === 'pie' ? accentGold : 'transparent',
              color: activeType === 'pie' ? (isDark ? '#111827' : '#ffffff') : subtitleColor,
            }}
            title="Pie Chart"
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Pie</span>
          </button>
          <button
            onClick={() => setActiveType('bar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeType === 'bar' ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: activeType === 'bar' ? accentGold : 'transparent',
              color: activeType === 'bar' ? (isDark ? '#111827' : '#ffffff') : subtitleColor,
            }}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
          <button
            onClick={() => setActiveType('line')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeType === 'line' ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: activeType === 'line' ? accentGold : 'transparent',
              color: activeType === 'line' ? (isDark ? '#111827' : '#ffffff') : subtitleColor,
            }}
            title="Line Chart"
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="w-full h-72 sm:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          {activeType === 'pie' ? (
            <PieChart margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
              <Tooltip content={<CustomTooltip totalValue={totalValue} isDark={isDark} />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={40}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name?: string; percent?: number }) => {
                  const pct = (percent || 0) * 100;
                  // Hide label text on tiny (< 3%) or 0% slices to avoid label text collisions
                  if (pct < 3) return '';
                  const labelName = name ?? '';
                  const shortName = labelName.length > 12 ? labelName.substring(0, 10) + '...' : labelName;
                  return `${shortName} (${pct.toFixed(0)}%)`;
                }}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : activeType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 20, left: 5, bottom: 65 }} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                stroke={axisColor}
                tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 500 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                tickFormatter={(val: string) => (val.length > 13 ? val.substring(0, 11) + '...' : val)}
              />
              <YAxis stroke={axisColor} tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip totalValue={totalValue} isDark={isDark} />} />
              <Bar dataKey="value" maxBarSize={45} radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 20, left: 5, bottom: 65 }}>
              <XAxis
                dataKey="name"
                stroke={axisColor}
                tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 500 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                tickFormatter={(val: string) => (val.length > 13 ? val.substring(0, 11) + '...' : val)}
              />
              <YAxis stroke={axisColor} tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip totalValue={totalValue} isDark={isDark} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={accentGold}
                strokeWidth={3}
                dot={<CustomLineDot />}
                activeDot={<CustomActiveDot />}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clean Scrollable Summary Cards Grid */}
      <div
        className="mt-4 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs max-h-48 overflow-y-auto"
        style={{ borderColor: containerBorder }}
      >
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg border transition-colors shadow-sm"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            title={`${item.name}: ${Number(item.value).toLocaleString()}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="truncate font-medium text-xs" style={{ color: cardTextColor }}>
              {item.name}
            </span>
            <span className="ml-auto font-bold text-xs shrink-0" style={{ color: accentGold }}>
              {Number(item.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
