import { DecoderMetrics } from "@/lib/simulation";
import type { WalkState } from "@/lib/octonionic";
import { CheckCircle, TrendingDown, Cpu, Activity } from "lucide-react";

interface KTDecoderProps {
  metrics: DecoderMetrics;
  boundaryViolations: number;
  /** Per-qubit boundary violation flag for the current step (7 booleans) */
  violatingQubits?: boolean[];
  /** Current walk states for all 7 qubits */
  walkStates?: WalkState[];
}

export function KTDecoder({
  metrics,
  boundaryViolations,
  violatingQubits = new Array(7).fill(false),
  walkStates = [],
}: KTDecoderProps) {
  const errorRate = metrics.logicalErrorRate;
  const depth = metrics.currentDepth;

  const isImproving =
    metrics.errorHistory.length > 10 &&
    metrics.errorHistory.slice(-5).reduce((a, b) => a + b.rate, 0) <
      metrics.errorHistory.slice(-10, -5).reduce((a, b) => a + b.rate, 0);

  const belowFloor = errorRate > 0 && errorRate < 3.8e-3;

  // Top 8 most-active glyphs from accumulated histogram
  const glyphData = metrics.syndromeHistogram
    .map((v, i) => ({ i, v }))
    .filter((g) => g.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 8);

  // Compact 42-glyph activity grid
  const glyphGrid = metrics.syndromeHistogram.slice(0, 42);
  const gridMax = Math.max(0.001, ...glyphGrid);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">KT Walk-State Decoder</h3>
          <p className="text-xs text-slate-500">Fano plane boundary conditions</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
      </div>

      {/* Error Rate */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Logical Error Rate</span>
          {depth > 0 && isImproving && (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <TrendingDown size={12} />
              <span>Improving</span>
            </div>
          )}
        </div>
        <div
          className="text-2xl font-mono font-bold"
          style={{ color: belowFloor ? "#4ade80" : "#fb923c" }}
        >
          {errorRate === 0 ? "—" : errorRate.toExponential(2)}
        </div>
        {belowFloor && depth > 0 && (
          <div className="flex items-center gap-1 mt-1 text-green-400 text-[10px]">
            <CheckCircle size={10} />
            <span>Below structural floor — standard decoder cannot reach this</span>
          </div>
        )}
        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (errorRate / 0.1) * 100)}%`,
              background: belowFloor ? "#4ade80" : "#f97316",
            }}
          />
        </div>
      </div>

      {/* Memory-aware status */}
      <div className="flex items-center gap-2 bg-green-950/30 border border-green-900/50 rounded-lg px-3 py-2">
        <Activity size={11} className="text-green-400 shrink-0" />
        <span className="text-xs text-green-400">
          {depth > 0
            ? "Walk history encoding correlated noise structure"
            : "Memory-aware correction active"}
        </span>
      </div>

      {/* Boundary violations + depth */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-0.5">
            Violations
          </span>
          <span className="text-lg font-mono font-bold text-slate-200">{boundaryViolations}</span>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-0.5">
            Depth
          </span>
          <span className="text-lg font-mono font-bold text-slate-200">{depth}</span>
        </div>
      </div>

      {/* Walk-State Boundary Map — one cell per qubit (Q0–Q6) */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700 shrink-0">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-2">
          Walk-State Boundary Map
        </span>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const violating = violatingQubits[i] ?? false;
            const pos = walkStates[i]?.position ?? i;
            return (
              <div
                key={i}
                className="aspect-square rounded flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: violating
                    ? "rgba(239,68,68,0.28)"
                    : depth > 0
                    ? "rgba(249,115,22,0.10)"
                    : "rgba(30,41,59,0.7)",
                  border: violating
                    ? "1px solid rgba(239,68,68,0.75)"
                    : depth > 0
                    ? "1px solid rgba(249,115,22,0.30)"
                    : "1px solid rgba(71,85,105,0.4)",
                  boxShadow: violating ? "0 0 5px rgba(239,68,68,0.35)" : "none",
                  transition: "all 0.12s ease",
                }}
              >
                <span
                  className="text-[9px] font-mono font-bold leading-none"
                  style={{ color: violating ? "#f87171" : "#fb923c" }}
                >
                  Q{i}
                </span>
                {depth > 0 && (
                  <span
                    className="text-[8px] font-mono leading-none"
                    style={{ color: violating ? "#fca5a5" : "#475569" }}
                  >
                    P{pos}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {depth > 0 && (
          <p className="text-[9px] text-slate-600 mt-1.5 leading-tight">
            Red glow = violation this step · Pn = current Fano point
          </p>
        )}
      </div>

      {/* Active Glyphs */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={11} className="text-slate-500 shrink-0" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">
            Active Glyphs (42 total)
          </span>
        </div>

        {glyphData.length === 0 ? (
          <p className="text-xs text-slate-600 italic">Glyph activity will appear here...</p>
        ) : (
          <>
            {/* Top-8 bar chart */}
            <div className="space-y-1 mb-3">
              {glyphData.map(({ i, v }) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 w-8 shrink-0 text-right">
                    G{i.toString().padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${v * 100}%`,
                        background: `hsl(${25 + i * 8}, 90%, 60%)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-6 shrink-0">
                    {Math.round(v * 100)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Compact 42-cell activity grid */}
            <div
              className="grid gap-px"
              style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {glyphGrid.map((v, i) => {
                const intensity = v / gridMax;
                return (
                  <div
                    key={i}
                    title={`G${i.toString().padStart(2, "0")}: ${Math.round(intensity * 100)}%`}
                    className="aspect-square rounded-sm"
                    style={{
                      background:
                        intensity > 0.01
                          ? `rgba(249, 115, 22, ${0.15 + intensity * 0.85})`
                          : "rgba(30,41,59,0.7)",
                      border:
                        intensity > 0.3
                          ? "1px solid rgba(249,115,22,0.6)"
                          : "1px solid transparent",
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Status footer */}
      <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700 shrink-0">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {depth === 0
            ? "Awaiting simulation..."
            : "Walk history encodes noise memory. Boundary violations corrected via octonionic algebra."}
        </p>
      </div>
    </div>
  );
}
