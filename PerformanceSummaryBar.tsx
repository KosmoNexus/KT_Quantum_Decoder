import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DecoderMetrics, SimParams } from "@/lib/simulation";

interface PerformanceSummaryBarProps {
  stdMetrics: DecoderMetrics;
  ktMetrics: DecoderMetrics;
  params: SimParams;
  boundaryViolations: number;
  depth: number;
}

const STRUCTURAL_FLOOR = 3.8e-3;

function pct(v: number): string {
  return v.toFixed(1) + "%";
}

function fmtRate(v: number): string {
  if (v === 0) return "—";
  return v.toExponential(2);
}

function floorStatus(rate: number): { label: string; color: string } {
  if (rate === 0) return { label: "—", color: "#64748b" };
  if (rate < STRUCTURAL_FLOOR * 0.98)
    return { label: "Below structural floor", color: "#4ade80" };
  if (rate < STRUCTURAL_FLOOR * 1.05)
    return { label: "At structural floor", color: "#facc15" };
  return { label: "Above structural floor", color: "#f87171" };
}

function ktStatusLabel(metrics: DecoderMetrics): { label: string; color: string } {
  const hist = metrics.errorHistory;
  if (hist.length < 10) return { label: "Initialising…", color: "#64748b" };
  const recent = hist.slice(-5).reduce((a, b) => a + b.rate, 0) / 5;
  const prev   = hist.slice(-10, -5).reduce((a, b) => a + b.rate, 0) / 5;
  const delta  = (prev - recent) / (prev || 1);
  if (delta > 0.01)  return { label: "Improving", color: "#4ade80" };
  if (delta < -0.01) return { label: "Degrading", color: "#f87171" };
  return { label: "Stable", color: "#94a3b8" };
}

function stdStatusLabel(rate: number): { label: string; color: string } {
  if (rate === 0) return { label: "—", color: "#64748b" };
  return floorStatus(rate);
}

function noiseTypeLabel(n: string): string {
  switch (n) {
    case "markovian":     return "Markovian Depolarizing";
    case "non-markovian": return "Non-Markovian Correlated";
    case "associator":    return "Associator Noise";
    case "mixed":         return "Mixed";
    default:              return n;
  }
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <span className="text-slate-500 text-[11px] font-mono shrink-0">{label}</span>
      <span
        className="text-[11px] font-mono text-right"
        style={{ color: valueColor ?? "#94a3b8" }}
      >
        {value}
      </span>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mt-3 mb-1 border-t border-slate-800 pt-2 first:mt-0 first:border-0">
      {title}
    </div>
  );
}

export function PerformanceSummaryBar({
  stdMetrics,
  ktMetrics,
  params,
  boundaryViolations,
  depth,
}: PerformanceSummaryBarProps) {
  const [open, setOpen] = useState(false);

  const stdRate = stdMetrics.logicalErrorRate;
  const ktRate  = ktMetrics.logicalErrorRate;

  // Advantage: (std - kt) / std × 100
  const advantage =
    stdRate > 0 && ktRate > 0
      ? ((stdRate - ktRate) / stdRate) * 100
      : null;

  // Active glyphs = non-zero entries in the 42-glyph histogram
  const activeGlyphs = ktMetrics.syndromeHistogram.filter((v) => v > 0).length;

  // Colour thresholds — honest: small advantage on Markovian is correct
  let advColor = "#64748b";
  let advBg    = "rgba(30,41,59,0.6)";
  let advLabel = "No data yet — run the simulation";
  if (advantage !== null) {
    if (advantage > 20) {
      advColor = "#4ade80";
      advBg    = "rgba(20,83,45,0.25)";
      advLabel = `KT Decoder advantage this run: ${pct(advantage)} lower logical error rate`;
    } else if (advantage > 5) {
      advColor = "#facc15";
      advBg    = "rgba(113,63,18,0.25)";
      advLabel = `KT Decoder advantage this run: ${pct(advantage)} lower logical error rate`;
    } else if (advantage >= 0) {
      advColor = "#94a3b8";
      advBg    = "rgba(30,41,59,0.6)";
      advLabel = `KT Decoder advantage this run: ${pct(advantage)} lower logical error rate`;
    } else {
      // Negative: standard is actually better this step (expected on some Markovian runs)
      advColor = "#94a3b8";
      advBg    = "rgba(30,41,59,0.6)";
      advLabel = `KT Decoder advantage this run: ${pct(Math.abs(advantage))} higher logical error rate`;
    }
  }

  // Floor comparisons
  const ktVsFloorPct =
    ktRate > 0
      ? ((STRUCTURAL_FLOOR - ktRate) / STRUCTURAL_FLOOR) * 100
      : null;
  const stdVsFloorPct =
    stdRate > 0
      ? ((STRUCTURAL_FLOOR - stdRate) / STRUCTURAL_FLOOR) * 100
      : null;

  function floorCmp(pctVal: number | null, rate: number): string {
    if (pctVal === null || rate === 0) return "—";
    const abs = Math.abs(pctVal).toFixed(1);
    if (pctVal > 1)  return `${fmtRate(rate)} — ${abs}% below floor`;
    if (pctVal < -1) return `${fmtRate(rate)} — ${abs}% above floor`;
    return `${fmtRate(rate)} — at floor`;
  }

  function floorCmpColor(pctVal: number | null): string {
    if (pctVal === null) return "#64748b";
    if (pctVal > 1)  return "#4ade80";
    if (pctVal < -1) return "#f87171";
    return "#facc15";
  }

  const stdStatus = stdStatusLabel(stdRate);
  const ktStatus  = ktStatusLabel(ktMetrics);

  return (
    <div
      className="shrink-0 border-t border-slate-700/50"
      style={{ background: "#0d1520" }}
    >
      {/* ── Always-visible headline ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2 cursor-pointer hover:bg-slate-800/30 transition-colors"
        style={{ background: advBg }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: advColor, boxShadow: `0 0 6px ${advColor}` }}
          />
          <span
            className="text-sm font-mono font-semibold tracking-tight"
            style={{ color: advColor }}
          >
            {advLabel}
          </span>
          {advantage !== null && depth > 0 && (
            <span className="text-[10px] text-slate-600 font-mono">
              depth {depth}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[10px] uppercase tracking-wider">
            {open ? "Hide details" : "Show details"}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* ── Expandable details ── */}
      {open && (
        <div className="px-5 pb-4 pt-1 grid grid-cols-3 gap-x-8 gap-y-0 border-t border-slate-800">

          {/* Column 1: Standard Decoder */}
          <div>
            <Section title="Standard Decoder" />
            <Row label="Logical error rate"
              value={fmtRate(stdRate)}
              valueColor="#60a5fa" />
            <Row label="Status"
              value={stdStatus.label}
              valueColor={stdStatus.color} />
            <Row label="Correction success"
              value={stdRate > 0 ? pct(stdMetrics.correctionSuccessRate * 100) : "—"} />
          </div>

          {/* Column 2: KT Decoder */}
          <div>
            <Section title="KT Walk-State Decoder" />
            <Row label="Logical error rate"
              value={fmtRate(ktRate)}
              valueColor="#fb923c" />
            <Row label="Status"
              value={ktStatus.label}
              valueColor={ktStatus.color} />
            <Row label="Active glyphs"
              value={depth > 0 ? `${activeGlyphs} of 42` : "—"} />
            <Row label="Boundary violations"
              value={depth > 0 ? boundaryViolations.toString() : "—"} />
            <Row label="Memory depth used"
              value={`${params.correlationLength} steps`} />
          </div>

          {/* Column 3: Run Parameters + Floor */}
          <div>
            <Section title="Run Parameters" />
            <Row label="Noise type"     value={noiseTypeLabel(params.noiseType)} />
            <Row label="Noise level p"  value={params.noiseLevel.toFixed(3)} />
            <Row label="Correlation τ"  value={params.correlationLength.toString()} />
            <Row label="Circuit depth"  value={depth > 0 ? `${depth} / ${params.gateDepth}` : params.gateDepth.toString()} />
            <Row label="Qubits"         value={params.qubits.toString()} />

            <Section title="vs Structural Floor  3.8×10⁻³" />
            <Row
              label="KT vs floor"
              value={floorCmp(ktVsFloorPct, ktRate)}
              valueColor={floorCmpColor(ktVsFloorPct)}
            />
            <Row
              label="Standard vs floor"
              value={floorCmp(stdVsFloorPct, stdRate)}
              valueColor={floorCmpColor(stdVsFloorPct)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
