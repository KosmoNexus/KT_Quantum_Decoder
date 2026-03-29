// Octonionic Mathematics Module
// Implements the Fano plane structure and octonionic multiplication

// 7 points, 7 lines, 3 points per line
export const FANO_LINES: [number, number, number][] = [
  [1, 2, 4], // L0
  [2, 3, 5], // L1
  [3, 4, 6], // L2
  [4, 5, 0], // L3
  [5, 6, 1], // L4
  [6, 0, 2], // L5
  [0, 1, 3], // L6
];

// Octonionic multiplication table
// e_i * e_j = +e_k if (i,j,k) is an oriented Fano line
// e_i * e_j = -e_k if (i,k,j) is an oriented Fano line
// Build a sign table: OCT_MULT[i][j] = {index: k, sign: +1 or -1}
function buildMultiplicationTable(): { index: number; sign: number }[][] {
  const table: { index: number; sign: number }[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill({ index: 0, sign: 0 }));

  // e0 is the real unit — commutes with everything
  for (let i = 0; i < 8; i++) {
    table[0][i] = { index: i, sign: 1 };
    table[i][0] = { index: i, sign: 1 };
  }

  // e_i * e_i = -1 for i > 0
  for (let i = 1; i < 8; i++) {
    table[i][i] = { index: 0, sign: -1 };
  }

  // Fill in from Fano lines (1-indexed in the math, but we store as 1-7)
  for (const [a, b, c] of FANO_LINES) {
    const i = a + 1;
    const j = b + 1;
    const k = c + 1;
    // e_i * e_j = +e_k
    table[i][j] = { index: k, sign: 1 };
    // e_j * e_i = -e_k
    table[j][i] = { index: k, sign: -1 };
    // e_j * e_k = +e_i
    table[j][k] = { index: i, sign: 1 };
    // e_k * e_j = -e_i
    table[k][j] = { index: i, sign: -1 };
    // e_k * e_i = +e_j
    table[k][i] = { index: j, sign: 1 };
    // e_i * e_k = -e_j
    table[i][k] = { index: j, sign: -1 };
  }

  return table;
}

export const OCT_MULT = buildMultiplicationTable();

// 8-dimensional octonionic multiplication
export function octMultiply(a: number[], b: number[]): number[] {
  const result = new Array(8).fill(0);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (a[i] !== 0 && b[j] !== 0) {
        const { index, sign } = OCT_MULT[i][j];
        result[index] += sign * a[i] * b[j];
      }
    }
  }
  return result;
}

// Octonionic associator [A,B,C] = (AB)C - A(BC)
export function associator(a: number[], b: number[], c: number[]): number[] {
  const ab = octMultiply(a, b);
  const ab_c = octMultiply(ab, c);
  const bc = octMultiply(b, c);
  const a_bc = octMultiply(a, bc);
  return ab_c.map((v, i) => v - a_bc[i]);
}

// Convert associator result to an error magnitude [0,1]
export function associatorToError(assoc: number[]): number {
  const norm = Math.sqrt(assoc.reduce((sum, v) => sum + v * v, 0));
  // Normalize to [0, 1] range
  return Math.min(1, norm / 3);
}

// Frobenius strides
export const FROBENIUS_STRIDES = [1, 2, 4];

// Glyph: one of 42 walk operators
export interface Glyph {
  lineIdx: number;
  stride: number;
  orientation: 1 | -1;
  nextPoint: (pos: number) => number;
}

export function generateGlyphs(): Glyph[] {
  const glyphs: Glyph[] = [];
  for (let lineIdx = 0; lineIdx < FANO_LINES.length; lineIdx++) {
    for (const stride of FROBENIUS_STRIDES) {
      for (const orientation of [1, -1] as const) {
        const line = FANO_LINES[lineIdx];
        glyphs.push({
          lineIdx,
          stride,
          orientation,
          nextPoint: (pos: number) => {
            const idx = line.indexOf(pos);
            if (idx === -1) {
              // Not on this line, project to nearest
              return line[(stride * orientation + 3) % 3];
            }
            const nextIdx = ((idx + stride * orientation) % 3 + 3) % 3;
            return line[nextIdx];
          },
        });
      }
    }
  }
  return glyphs; // exactly 42
}

export const GLYPHS = generateGlyphs();

// Walk-state for KT decoder
export interface WalkState {
  position: number; // current Fano point (0-6)
  history: number[]; // ordered sequence of prior positions
  stride: number;
  orientation: 1 | -1;
  errorCount: number;
}

export function createWalkState(): WalkState {
  return {
    position: 0,
    history: [],
    stride: 1,
    orientation: 1,
    errorCount: 0,
  };
}

export function advanceWalkState(state: WalkState, glyph: Glyph): WalkState {
  return {
    ...state,
    history: [...state.history.slice(-10), state.position],
    position: glyph.nextPoint(state.position),
    stride: glyph.stride,
    orientation: glyph.orientation,
  };
}

// Check if walk state is on a valid Fano line
export function isOnFanoLine(position: number, prevPosition: number): boolean {
  for (const line of FANO_LINES) {
    if (line.includes(position) && line.includes(prevPosition)) {
      return true;
    }
  }
  return false;
}

// Get line index for two positions
export function getLineForPositions(
  p1: number,
  p2: number
): number | undefined {
  for (let i = 0; i < FANO_LINES.length; i++) {
    if (FANO_LINES[i].includes(p1) && FANO_LINES[i].includes(p2)) {
      return i;
    }
  }
  return undefined;
}
