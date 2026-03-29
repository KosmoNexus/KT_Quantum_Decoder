import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

interface ErrorRateChartProps {
  standardHistory: { depth: number; rate: number }[];
  ktHistory: { depth: number; rate: number }[];
  noiseType: string;
}

const STRUCTURAL_FLOOR = 3.8e-3;
const CHART_FLOOR = 8e-5; // hard minimum for log scale
const CHART_CEIL  = 0.12; // hard maximum

// All axis ticks we might want to show — filter by domain at render time
const ALL_LOG_TICKS = [1e-4, 3e-4, 1e-3, 3.8e-3, 1e-2, 3e-2, 1e-1];

function mergeHistories(
  std: { depth: number; rate: number }[],
  kt: { depth: number; rate: number }[]
): { depth: number; standard: number; kt: number }[] {
  const map = new Map<number, { standard?: number; kt?: number }>();

  for (const p of std) {
    if (p.rate > 0) {
      const entry = map.get(p.depth) ?? {};
      entry.standard = Math.max(CHART_FLOOR, p.rate);
      map.set(p.depth, entry);
    }
  }
  for (const p of kt) {
    if (p.rate > 0) {
      const entry = map.get(p.depth) ?? {};
      entry.kt = Math.max(CHART_FLOOR, p.rate);
      map.set(p.depth, entry);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .filter(([, v]) => v.standard !== undefined || v.kt !== undefined)
    .map(([depth, v]) => ({
      depth,
      standard: v.standard ?? 0,
      kt: v.kt ?? 0,
    }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const std = payload.find((p: any) => p.dataKey === "standard");
  const kt  = payload.find((p: any) => p.dataKey === "kt");
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-[11px] shadow-xl">
      <p className="text-slate-400 mb-1.5 font-mono">depth = {label}</p>
      {std?.value > 0 && (
        <p className="text-blue-400 font-mono">Standard : {std.value.toExponential(2)}</p>
      )}
      {kt?.value > 0 && (
        <p className="text-orange-400 font-mono">KT       : {kt.value.toExponential(2)}</p>
      )}
      {std?.value > 0 && kt?.value > 0 && (
        <p className="text-slate-500 font-mono mt-1 border-t border-slate-700 pt-1">
          ratio    : ×{(std.value / kt.value).toFixed(1)}
        </p>
      )}
      <p className="text-red-400 font-mono">floor    : 3.80×10⁻³</p>
    </div>
  );
};

// Superscript digits for exponent display
const SUP = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
function toSuper(n: number): string {
  return String(Math.abs(n)).split("").map((d) => SUP[parseInt(d)]).join("");
}

function logTickFormatter(v: number): string {
  if (v <= 0) return "";
  // Special-case the structural floor label
  if (Math.abs(v - 3.8e-3) < 1e-4) return "3.8×10⁻³";
  const exp = Math.round(Math.log10(v));
  return `10⁻${toSuper(-exp)}`;
}

export function ErrorRateChart({ standardHistory, ktHistory }: ErrorRateChartProps) {
  const data = mergeHistories(standardHistory, ktHistory);

  if (data.length < 3) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600 text-xs font-mono">
          Run the simulation to see error rates...
        </p>
      </div>
    );
  }

  // Compute dynamic y-domain: round outward to nearest log-decade
  const allValues = data.flatMap((d) =>
    [d.standard, d.kt].filter((v) => v > 0)
  );
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  // Floor the minimum to the nearest decade below (but not below CHART_FLOOR)
  const domainMin = Math.max(CHART_FLOOR, Math.pow(10, Math.floor(Math.log10(rawMin))));
  // Ceil the maximum to the nearest decade above (but not above CHART_CEIL)
  const domainMax = Math.min(CHART_CEIL, Math.pow(10, Math.ceil(Math.log10(rawMax))));

  // Filter tick positions to those within the domain
  const visibleTicks = ALL_LOG_TICKS.filter(
    (t) => t >= domainMin * 0.9 && t <= domainMax * 1.1
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 72, left: 4, bottom: 18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

        <XAxis
          dataKey="depth"
          stroke="#334155"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Circuit Depth",
            position: "insideBottom",
            offset: -6,
            fill: "#64748b",
            fontSize: 10,
          }}
        />

        <YAxis
          scale="log"
          domain={[domainMin, domainMax]}
          ticks={visibleTicks}
          tickFormatter={logTickFormatter}
          stroke="#334155"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Shaded region below the structural floor — territory the KT decoder can enter */}
        <ReferenceArea
          y1={domainMin}
          y2={STRUCTURAL_FLOOR}
          fill="#0f172a"
          fillOpacity={0.85}
          stroke="none"
        />

        {/* Structural floor */}
        <ReferenceLine
          y={STRUCTURAL_FLOOR}
          stroke="#ef4444"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{
            value: "structural floor",
            position: "right",
            fill: "#ef4444",
            fontSize: 9,
            fontFamily: "monospace",
          }}
        />

        <Line
          type="monotone"
          dataKey="standard"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="kt"
          stroke="#fb923c"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
