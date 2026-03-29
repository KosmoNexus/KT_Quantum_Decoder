import { DecoderMetrics } from "@/lib/simulation";
import { AlertTriangle, Activity } from "lucide-react";

interface StandardDecoderProps {
  metrics: DecoderMetrics;
}

const STRUCTURAL_FLOOR = 3.8e-3;

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-lg font-mono font-bold text-slate-200">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

export function StandardDecoder({ metrics }: StandardDecoderProps) {
  const errorRate = metrics.logicalErrorRate;
  const isAboveFloor = errorRate >= STRUCTURAL_FLOOR * 0.8;
  const successRate = metrics.correctionSuccessRate;

  // Get top syndromes
  const topSyndromes = metrics.syndromeHistogram
    .map((count, idx) => ({ idx, count }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalSyndromes = metrics.syndromeHistogram.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Standard Syndrome Decoder</h3>
          <p className="text-xs text-slate-500">Steane [[7,1,3]] stabilizer code</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-blue-500" />
      </div>

      {/* Error Rate */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Logical Error Rate</span>
          {isAboveFloor && (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <AlertTriangle size={12} />
              <span>At floor</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-mono font-bold text-blue-400">
          {errorRate === 0 ? "—" : errorRate.toExponential(2)}
        </div>
        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, errorRate / 0.1 * 100)}%`,
              background: errorRate > STRUCTURAL_FLOOR ? "#ef4444" : "#3b82f6",
            }}
          />
        </div>
      </div>

      {/* Structural floor indicator */}
      <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
        <div className="w-3 h-0.5 bg-red-500 border-dashed" style={{ borderTop: "2px dashed #ef4444", borderImage: "repeating-linear-gradient(90deg, #ef4444 0, #ef4444 6px, transparent 6px, transparent 10px) 1" }} />
        <span className="text-xs text-red-400 font-mono">Structural floor: 3.8 × 10⁻³</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700">
          <MetricRow
            label="Correction Success"
            value={successRate === 0 ? "—" : `${(successRate * 100).toFixed(1)}%`}
          />
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700">
          <MetricRow
            label="Depth"
            value={metrics.currentDepth.toString()}
          />
        </div>
      </div>

      {/* Syndrome histogram */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} className="text-slate-500" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">Syndrome Histogram</span>
        </div>
        {topSyndromes.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No syndromes yet...</p>
        ) : (
          <div className="space-y-1.5">
            {topSyndromes.map(({ idx, count }) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
                  s={idx.toString(2).padStart(6, "0")}
                </span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalSyndromes > 0 ? (count / totalSyndromes) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700">
        <p className="text-xs text-slate-400 leading-relaxed">
          {metrics.currentDepth === 0
            ? "Awaiting simulation..."
            : isAboveFloor
            ? "⚠ Syndrome decoder has plateaued at structural floor. History-dependent errors cannot be corrected."
            : "Decoder operating within bounds."}
        </p>
      </div>
    </div>
  );
}
