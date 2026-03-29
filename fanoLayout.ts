// Fano plane node positions — heptagonal layout
// All 7 nodes equally spaced on a circle; each line is a chord triangle

export interface FanoNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

export interface FanoLine {
  id: number;
  label: string;
  points: [number, number, number];
}

const CX = 200;
const CY = 200;
const R = 162;

// Place nodes 0–6 equally around a circle, starting from the top
function heptPoint(k: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (k * 2 * Math.PI) / 7;
  return {
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  };
}

export const FANO_NODES: FanoNode[] = Array.from({ length: 7 }, (_, k) => ({
  id: k,
  ...heptPoint(k),
  label: String(k),
}));

// FANO_LINES = [(1,2,4),(2,3,5),(3,4,6),(4,5,0),(5,6,1),(6,0,2),(0,1,3)]
// Each line is drawn as a triangle connecting its 3 points
export const FANO_VIZ_LINES: FanoLine[] = [
  { id: 0, label: "L₀", points: [1, 2, 4] },
  { id: 1, label: "L₁", points: [2, 3, 5] },
  { id: 2, label: "L₂", points: [3, 4, 6] },
  { id: 3, label: "L₃", points: [4, 5, 0] },
  { id: 4, label: "L₄", points: [5, 6, 1] },
  { id: 5, label: "L₅", points: [6, 0, 2] },
  { id: 6, label: "L₆", points: [0, 1, 3] },
];

export function getNodePos(id: number): { x: number; y: number } {
  return FANO_NODES[id] ?? { x: CX, y: CY };
}

// Midpoint of the triangle formed by a line's 3 points — for label placement
export function lineLabelPos(line: FanoLine): { x: number; y: number } {
  const pts = line.points.map(getNodePos);
  return {
    x: (pts[0].x + pts[1].x + pts[2].x) / 3,
    y: (pts[0].y + pts[1].y + pts[2].y) / 3,
  };
}

export const FANO_SVG_SIZE = { width: 400, height: 400 };
