import {
  FANO_NODES,
  FANO_VIZ_LINES,
  FANO_SVG_SIZE,
  getNodePos,
  lineLabelPos,
} from "@/lib/fanoLayout";
import { SimulationFrame } from "@/lib/simulation";

interface FanoPlaneProps {
  frame: SimulationFrame;
}

// Each Fano line is a triangle — return the 3 edges as pairs of points
function lineEdges(pts: [number, number, number]) {
  return [
    [pts[0], pts[1]],
    [pts[1], pts[2]],
    [pts[0], pts[2]],
  ] as [number, number][];
}

export function FanoPlane({ frame }: FanoPlaneProps) {
  const { width, height } = FANO_SVG_SIZE;
  const { errorNodes, syndromeLines, associatorLines, walkTrails, walkStates, depth } = frame;

  const nodeRadius = 17;
  const simRunning = depth > 0;

  // Count how many qubits currently occupy each of the 7 Fano points
  const qubitCount = new Array(7).fill(0);
  if (walkStates) {
    for (const ws of walkStates) {
      if (ws.position >= 0 && ws.position <= 6) qubitCount[ws.position]++;
    }
  }

  // A node is "bright" if ≥1 qubit is there, "dim" if sim is running but no qubit, "off" if not started
  function getNodeFill(id: number): string {
    if (errorNodes.includes(id)) return "#ef4444";
    if (qubitCount[id] >= 2) return "#f97316"; // hotspot: 2+ qubits
    if (qubitCount[id] === 1) return "#ea7c2b"; // normal active
    if (simRunning) return "#1e3a5f";            // dim — sim running, no qubit here right now
    return "#1e3a5f";
  }

  function getNodeStroke(id: number): string {
    if (errorNodes.includes(id)) return "#fca5a5";
    if (qubitCount[id] >= 2) return "#fde68a"; // bright amber for hotspot
    if (qubitCount[id] === 1) return "#fdba74"; // orange
    if (simRunning) return "#2563eb";            // blue — alive but unoccupied
    return "#3b82f6";
  }

  function getNodeStrokeOpacity(id: number): number {
    if (errorNodes.includes(id)) return 0.9;
    if (qubitCount[id] > 0) return 0.85;
    if (simRunning) return 0.5;
    return 0.7;
  }

  function getNodeFilter(id: number): string {
    if (errorNodes.includes(id)) return "url(#glow-red)";
    if (qubitCount[id] >= 2) return "url(#glow-orange-strong)";
    if (qubitCount[id] === 1) return "url(#glow-orange)";
    if (simRunning) return "url(#glow-blue)";
    return "none";
  }

  function getLineColor(lineId: number): string {
    if (associatorLines.includes(lineId)) return "#eab308";
    if (syndromeLines.includes(lineId)) return "#60a5fa";
    return "#334155";
  }

  function getLineOpacity(lineId: number): number {
    if (associatorLines.includes(lineId)) return 0.85;
    if (syndromeLines.includes(lineId)) return 0.7;
    return 0.45;
  }

  function getLineWidth(lineId: number): number {
    if (associatorLines.includes(lineId) || syndromeLines.includes(lineId)) return 2.5;
    return 1.5;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      <defs>
        <filter id="glow-orange" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-red" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-blue" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-orange-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Heptagon outline (subtle) */}
      <polygon
        points={FANO_NODES.map((n) => `${n.x},${n.y}`).join(" ")}
        fill="none"
        stroke="#1e293b"
        strokeWidth={1}
        strokeOpacity={0.6}
      />

      {/* Fano lines — each drawn as a triangle (3 edges) */}
      {FANO_VIZ_LINES.map((line) => {
        const color = getLineColor(line.id);
        const opacity = getLineOpacity(line.id);
        const strokeW = getLineWidth(line.id);
        const edges = lineEdges(line.points);

        return (
          <g key={`line-${line.id}`}>
            {edges.map(([a, b], ei) => {
              const pa = getNodePos(a);
              const pb = getNodePos(b);
              return (
                <line
                  key={`edge-${line.id}-${ei}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        );
      })}

      {/* Line labels — placed at triangle centroid */}
      {FANO_VIZ_LINES.map((line) => {
        const { x, y } = lineLabelPos(line);
        const active =
          syndromeLines.includes(line.id) || associatorLines.includes(line.id);
        return (
          <text
            key={`lbl-${line.id}`}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill={active ? "#94a3b8" : "#475569"}
            fontSize="10"
            fontFamily="monospace"
            fontWeight={active ? "bold" : "normal"}
          >
            {line.label}
          </text>
        );
      })}

      {/* Walk history trails */}
      {walkTrails.map((trail, i) => {
        const from = getNodePos(trail.from);
        const to = getNodePos(trail.to);
        return (
          <line
            key={`trail-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#f97316"
            strokeWidth={1.5}
            strokeOpacity={0.35}
            strokeDasharray="4 5"
          />
        );
      })}

      {/* Fano nodes */}
      {FANO_NODES.map((node) => (
        <g key={`node-${node.id}`} filter={getNodeFilter(node.id)}>
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius}
            fill={getNodeFill(node.id)}
            stroke={getNodeStroke(node.id)}
            strokeWidth={qubitCount[node.id] >= 2 ? 2.5 : 1.5}
            strokeOpacity={getNodeStrokeOpacity(node.id)}
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(8, 374)">
        <circle cx={8} cy={8} r={5} fill="#f97316" />
        <text x={17} y={12} fill="#94a3b8" fontSize="10">walk-state</text>
        <circle cx={88} cy={8} r={5} fill="#ef4444" />
        <text x={97} y={12} fill="#94a3b8" fontSize="10">error</text>
        <line x1={148} y1={8} x2={162} y2={8} stroke="#60a5fa" strokeWidth={2} />
        <text x={167} y={12} fill="#94a3b8" fontSize="10">syndrome</text>
        <line x1={232} y1={8} x2={246} y2={8} stroke="#eab308" strokeWidth={2} />
        <text x={251} y={12} fill="#94a3b8" fontSize="10">associator</text>
      </g>
    </svg>
  );
}
