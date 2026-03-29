import { SimParams, NoiseType } from "@/lib/simulation";
import { Play, Pause, RotateCcw, Download, Zap } from "lucide-react";

interface ControlPanelProps {
  params: SimParams;
  isRunning: boolean;
  isPaused: boolean;
  onParamsChange: (params: Partial<SimParams>) => void;
  onRun: () => void;
  onReset: () => void;
  onPause: () => void;
  onExport: () => void;
  onScenario: (scenario: 1 | 2 | 3) => void;
}

const NOISE_OPTIONS: { value: NoiseType; label: string }[] = [
  { value: "markovian",     label: "Markovian Depolarizing" },
  { value: "non-markovian", label: "Non-Markovian Correlated" },
  { value: "associator",    label: "Associator Noise" },
  { value: "mixed",         label: "Mixed" },
];

const QUBIT_OPTIONS = [7, 17, 49] as const;

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, format, onChange }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide leading-none">{label}</span>
        <span className="text-[10px] font-mono text-slate-300">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right,#f97316 0%,#f97316 ${pct}%,#1e293b ${pct}%,#1e293b 100%)`,
          outline: "none",
        }}
      />
    </div>
  );
}

const SCENARIOS: { id: 1 | 2 | 3; label: string; color: string }[] = [
  { id: 1, label: "Home Turf",        color: "#22c55e" },
  { id: 2, label: "Memory Problem",   color: "#f97316" },
  { id: 3, label: "Associator Wall",  color: "#ef4444" },
];

export function ControlPanel({
  params,
  isRunning,
  isPaused,
  onParamsChange,
  onRun,
  onReset,
  onPause,
  onExport,
  onScenario,
}: ControlPanelProps) {
  const handleRunPause = () => {
    if (isRunning && !isPaused) {
      onPause();
    } else {
      onRun();
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700/50 px-4 py-2.5">
      {/* Row 1: Presets + action buttons — always on one line, no wrapping */}
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest shrink-0">
          Presets
        </span>
        <div className="flex gap-1.5 shrink-0">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onScenario(s.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-75"
              style={{
                background: `${s.color}18`,
                borderColor: `${s.color}45`,
                color: s.color,
              }}
            >
              <Zap size={10} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunPause}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-semibold transition-all"
            style={{
              background: isRunning && !isPaused ? "#78350f" : "#431407",
              color: isRunning && !isPaused ? "#fbbf24" : "#fb923c",
              border: `1px solid ${isRunning && !isPaused ? "#92400e" : "#7c2d12"}`,
            }}
          >
            {isRunning && !isPaused ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Run</>}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
          >
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Row 2: Controls — all on one line */}
      <div className="flex items-end gap-4">
        {/* Noise type */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Noise Type</span>
          <select
            value={params.noiseType}
            onChange={(e) => onParamsChange({ noiseType: e.target.value as NoiseType })}
            className="bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 px-2 py-1 cursor-pointer h-7"
          >
            {NOISE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Sliders */}
        <SliderField
          label="Noise Level p"
          value={params.noiseLevel}
          min={0.001}
          max={0.15}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(v) => onParamsChange({ noiseLevel: v })}
        />
        <SliderField
          label="Correlation τ"
          value={params.correlationLength}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onParamsChange({ correlationLength: v })}
        />
        <SliderField
          label="Gate Depth"
          value={params.gateDepth}
          min={10}
          max={500}
          step={10}
          onChange={(v) => onParamsChange({ gateDepth: v })}
        />

        {/* Qubits */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Qubits</span>
          <div className="flex gap-1">
            {QUBIT_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => onParamsChange({ qubits: q })}
                className="w-9 h-7 rounded text-xs font-mono font-semibold border transition-all"
                style={{
                  background: params.qubits === q ? "#f9731618" : "#1e293b",
                  borderColor: params.qubits === q ? "#f97316" : "#334155",
                  color: params.qubits === q ? "#fb923c" : "#64748b",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
