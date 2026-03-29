import { useState, useEffect, useRef, useCallback } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { StandardDecoder } from "@/components/StandardDecoder";
import { KTDecoder } from "@/components/KTDecoder";
import { FanoPlane } from "@/components/FanoPlane";
import { ErrorRateChart } from "@/components/ErrorRateChart";
import { PerformanceSummaryBar } from "@/components/PerformanceSummaryBar";
import { InfoPanel } from "@/components/InfoPanel";
import {
  SimParams,
  SimulationState,
  createInitialState,
  createEmptyFrame,
  stepSimulation,
} from "@/lib/simulation";

const DEFAULT_PARAMS: SimParams = {
  noiseType: "non-markovian",
  noiseLevel: 0.05,
  correlationLength: 5,
  gateDepth: 100,
  qubits: 7,
};

const SCENARIO_PARAMS: Record<1 | 2 | 3, Partial<SimParams>> = {
  1: { noiseType: "markovian",     noiseLevel: 0.05, correlationLength: 5,  gateDepth: 200 },
  2: { noiseType: "non-markovian", noiseLevel: 0.05, correlationLength: 10, gateDepth: 200 },
  3: { noiseType: "associator",    noiseLevel: 0.05, correlationLength: 5,  gateDepth: 300 },
};

const SCENARIO_MESSAGES: Record<1 | 2 | 3, string> = {
  1: "\"On Markovian noise, the standard decoder works. This is what it was designed for.\"",
  2: "\"When noise has memory, the Markovian assumption breaks. The KT decoder's walk history compensates.\"",
  3: "\"Standard decoder cannot improve regardless of circuit depth. KT decoder identifies associator residue as known algebraic structure and corrects it.\"",
};

// ms per simulation step
const STEP_INTERVAL = 80;

export default function SimulationPage() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [simState, setSimState] = useState<SimulationState>(() =>
    createInitialState(DEFAULT_PARAMS)
  );
  const [scenarioMsg, setScenarioMsg] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const runLoop = useCallback((state: SimulationState) => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setSimState((prev) => {
        if (prev.isPaused) return prev;
        if (prev.depth >= prev.params.gateDepth) {
          stopInterval();
          return { ...prev, isRunning: false };
        }
        return stepSimulation(prev);
      });
    }, STEP_INTERVAL);
  }, []);

  const handleRun = useCallback(() => {
    setSimState((prev) => {
      if (prev.isRunning && prev.isPaused) {
        const resumed = { ...prev, isPaused: false };
        runLoop(resumed);
        return resumed;
      }
      if (prev.isRunning) return prev; // already running
      // Fresh start
      const fresh: SimulationState = {
        ...createInitialState(prev.params),
        isRunning: true,
        isPaused: false,
      };
      runLoop(fresh);
      return fresh;
    });
  }, [runLoop]);

  const handlePause = useCallback(() => {
    setSimState((prev) => {
      if (prev.isPaused) {
        // Resume
        const resumed = { ...prev, isPaused: false };
        runLoop(resumed);
        return resumed;
      }
      stopInterval();
      return { ...prev, isPaused: true };
    });
  }, [runLoop]);

  const handleReset = useCallback(() => {
    stopInterval();
    setSimState(createInitialState(params));
    setScenarioMsg("");
  }, [params]);

  const handleParamsChange = useCallback((updates: Partial<SimParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
    // Also update params on the current sim state so Run uses the new values
    setSimState((prev) => ({ ...prev, params: { ...prev.params, ...updates } }));
  }, []);

  const handleScenario = useCallback(
    (id: 1 | 2 | 3) => {
      stopInterval();
      const newParams = { ...params, ...SCENARIO_PARAMS[id] };
      setParams(newParams);
      setScenarioMsg(SCENARIO_MESSAGES[id]);
      const fresh: SimulationState = {
        ...createInitialState(newParams),
        isRunning: true,
        isPaused: false,
      };
      setSimState(fresh);
      runLoop(fresh);
    },
    [params, runLoop]
  );

  const handleExport = useCallback(() => {
    const { standardErrorHistory, ktErrorHistory } = simState;
    const depthSet = new Set([
      ...standardErrorHistory.map((p) => p.depth),
      ...ktErrorHistory.map((p) => p.depth),
    ]);
    const stdMap = new Map(standardErrorHistory.map((p) => [p.depth, p.rate]));
    const ktMap  = new Map(ktErrorHistory.map((p) => [p.depth, p.rate]));

    const rows = ["depth,standard_error_rate,kt_error_rate"];
    for (const depth of Array.from(depthSet).sort((a, b) => a - b)) {
      const std = stdMap.get(depth)?.toFixed(8) ?? "";
      const kt  = ktMap.get(depth)?.toFixed(8) ?? "";
      rows.push(`${depth},${std},${kt}`);
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `decoder_comparison_${params.noiseType}_p${params.noiseLevel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [simState, params]);

  useEffect(() => () => stopInterval(), []);

  const { frame, standardErrorHistory, ktErrorHistory } = simState;
  const stdMetrics = frame.standardMetrics;
  const ktMetrics  = frame.ktMetrics;

  const statusLabel = simState.isRunning
    ? simState.isPaused
      ? `⏸ Paused — depth ${simState.depth}`
      : `▶ Running — depth ${simState.depth}`
    : simState.depth > 0
    ? `Completed — depth ${simState.depth}`
    : "Ready";

  const statusColor = simState.isRunning && !simState.isPaused
    ? "text-green-400"
    : simState.isPaused
    ? "text-yellow-400"
    : "text-slate-500";

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden select-none">

      {/* ── Header ── */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-700/50 px-5 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight">
            KT Walk-State Decoder{" "}
            <span className="text-slate-500 font-normal">vs</span>{" "}
            Standard Syndrome Decoder
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Quantum Error Correction Simulation · Steane [[7,1,3]] · Fano Plane Geometry · Octonionic Substrate
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-mono ${statusColor}`}>{statusLabel}</span>
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-all"
            style={{
              background: showInfo ? "rgba(59,130,246,0.15)" : "rgba(30,41,59,0.7)",
              borderColor: showInfo ? "#3b82f6" : "#334155",
              color: showInfo ? "#60a5fa" : "#94a3b8",
            }}
          >
            ℹ INFO
          </button>
        </div>
      </div>

      {/* ── Info Panel (overlay) ── */}
      {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}

      {/* ── Control Panel ── */}
      <div className="shrink-0">
        <ControlPanel
          params={params}
          isRunning={simState.isRunning}
          isPaused={simState.isPaused}
          onParamsChange={handleParamsChange}
          onRun={handleRun}
          onReset={handleReset}
          onPause={handlePause}
          onExport={handleExport}
          onScenario={handleScenario}
        />
      </div>

      {/* ── Scenario message ── */}
      {scenarioMsg && (
        <div className="shrink-0 bg-slate-800/40 border-b border-slate-700/30 px-5 py-1.5">
          <p className="text-[11px] text-orange-300/80 italic">{scenarioMsg}</p>
        </div>
      )}

      {/* ── Three-panel main area ── */}
      <div className="flex-1 flex min-h-0">

        {/* Left: Standard Decoder */}
        <div className="w-60 shrink-0 border-r border-slate-700/50 overflow-y-auto p-3">
          <StandardDecoder metrics={stdMetrics} />
        </div>

        {/* Center: Fano plane */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-700/50">
          <div className="flex-1 flex items-center justify-center p-3 min-h-0">
            <div style={{ width: "min(100%, 420px)", aspectRatio: "1" }}>
              <FanoPlane frame={frame} />
            </div>
          </div>
          <div className="shrink-0 px-6 pb-3">
            <p className="text-[11px] text-slate-500 text-center leading-relaxed italic">
              "The Steane [[7,1,3]] parity check matrix is the incidence matrix of this geometry.
              The Standard Decoder uses it without knowing why it works.{" "}
              <span className="text-orange-400 not-italic font-medium">The KT Decoder knows why.</span>"
            </p>
          </div>
        </div>

        {/* Right: KT Decoder */}
        <div className="w-60 shrink-0 overflow-y-auto p-3">
          <KTDecoder
            metrics={ktMetrics}
            boundaryViolations={simState.ktBoundaryViolations}
            violatingQubits={simState.ktViolatingQubits}
            walkStates={simState.walkStates}
          />
        </div>
      </div>

      {/* ── Performance Summary Bar ── */}
      <PerformanceSummaryBar
        stdMetrics={stdMetrics}
        ktMetrics={ktMetrics}
        params={params}
        boundaryViolations={simState.ktBoundaryViolations}
        depth={simState.depth}
      />

      {/* ── Comparative chart ── */}
      <div className="shrink-0 h-52 border-t border-slate-700/50 bg-slate-900 px-4 pt-2 pb-1">
        <div className="flex items-center gap-6 mb-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Logical Error Rate vs Circuit Depth
          </span>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-5 h-0.5 bg-blue-400 inline-block rounded" />
              Standard Decoder
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-5 h-0.5 bg-orange-400 inline-block rounded" />
              KT Walk-State Decoder
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-5 h-0 border-t border-dashed border-red-500 inline-block" />
              Structural Floor 3.8×10⁻³
            </span>
          </div>
        </div>
        <div className="h-40">
          <ErrorRateChart
            standardHistory={standardErrorHistory}
            ktHistory={ktErrorHistory}
            noiseType={params.noiseType}
          />
        </div>
      </div>
    </div>
  );
}
