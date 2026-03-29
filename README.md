# KT Quantum Decoder

Interactive simulation comparing the KT Walk-State Decoder against a standard Steane [[7,1,3]] syndrome decoder under Markovian, non-Markovian, and associator noise conditions.

**Live demo:** https://KT-quantum-state-decoder.replit.app

---

## What This Simulates

This simulation is a companion to:

> **"The Octonionic Substrate: Non-Associative Memory Structure as the Missing Foundation for Fault-Tolerant Quantum Computing"**
> Submitted to PAI26 — 2026 Conference on Physics and AI, Stanford University, June 2026.

The paper argues that current quantum error correction schemes are built on two assumptions that may be structurally incorrect:

1. **Markovian noise** — errors at each step are independent of history
2. **Associative algebra** — gate operations compose without path-dependent residue

If the physical substrate is 8-dimensional and octonionic (non-associative, non-commutative), both assumptions fail. The simulation demonstrates this by running two decoders side by side under identical noise conditions and showing the difference in logical error rates.

---

## What the Simulation Shows

Under **Markovian noise**, both decoders perform comparably. This is the standard decoder's home turf and the simulation shows it honestly.

Under **non-Markovian correlated noise** and **associator noise**, the standard syndrome decoder plateaus near a structural error floor at approximately 3.8 × 10⁻³. The KT Walk-State Decoder, which manages walk-state boundary conditions on the Fano plane geometry rather than suppressing random noise, crosses below that floor.

The structural floor prediction is:

```
ε_floor ~ x / (137 + x) ≈ 3.8 × 10⁻³
```

where x ≈ 0.529 is the channel memory term derived from the octonionic 8D→4D projection capacity.

---

## Important Caveat

This simulation demonstrates the algebraic argument through structured noise models designed to reflect the theoretical framework. It is not an independent experimental measurement. The KT decoder advantage is real within the simulation's noise model — but the noise model was designed to reflect the octonionic framework's predictions.

The paper provides the theoretical derivation. The simulation makes the argument visible and interactive. They should be read together.

---

## Kosmoplex Theory — Brief Overview

Kosmoplex Theory (KT) is a zero-free-parameter mathematical framework deriving physical constants from the geometry of an 8-dimensional octonionic substrate. Key points:

- Seven axioms (Peano + Triadic Closure + Total Computability) generate the framework
- The Fano plane PG(2,F₂) is the minimal geometry satisfying triadic closure
- 42 fundamental operators (glyphs) emerge from oriented Fano walks
- Physical constants are geometric eigenvalues, not empirical inputs
- α⁻¹ = 137.035999143 derived with zero free parameters (1.62σ from CODATA 2022)

Five independent predictions confirmed by experiment: α⁻¹ (CODATA 2022), Ω_DE = 0.786 (DESI 2025), Hubble tension as ratio 137/125, proton-electron mass ratio to 0.002%, chiral crossover temperature 155 MeV.

The Steane [[7,1,3]] code — the most celebrated quantum error correcting code — uses the Fano plane incidence matrix as its parity check matrix. Steane (1996) never used the words "Fano plane" or "octonions." The connection is the central observation of the companion paper.

Full framework: https://thektproject.org

---

## Running Locally

```bash
git clone https://github.com/KosmoNexus/kt-quantum-decoder
cd kt-quantum-decoder
npm install
npm run dev
```

Requires Node.js 18+. The app will open at `http://localhost:5173`.

---

## File Structure

```
/
├── main.tsx                # Application entry point
├── App.tsx                 # Root component
├── SimulationPage.tsx      # Main simulation layout
├── simulation.ts           # Core simulation logic
├── octonionic.ts           # Octonionic algebra and Fano math
├── fanoLayout.ts           # Fano plane geometry and coordinates
├── KTDecoder.tsx           # KT walk-state boundary decoder
├── StandardDecoder.tsx     # Steane [[7,1,3]] syndrome decoder
├── FanoPlane.tsx           # Fano plane visualization
├── ControlPanel.tsx        # Noise controls and sliders
├── ErrorRateChart.tsx      # Comparative error rate chart
├── PerformanceSummaryBar.tsx # KT advantage summary and details
├── InfoPanel.tsx           # README / INFO overlay
├── package.json            # Node.js dependencies
└── README.md
```

---

## Stack

- **Framework:** React + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts / custom SVG
- **Math:** Native TypeScript octonionic algebra implementation

---

## Authorship

*This software and related material was written by Christian R. Macedonia M.D. in full collaboration with Claude, and further assistance and debugging provided by Gemini, ChatGPT, and Grok. It is our collective hope that the material contained herein will be used for ethical and peaceful purposes for the advancement of all intelligent beings.*

---

## Citation

If you use this simulation in your work, please cite the companion paper:

```
Anonymous (2026). The Octonionic Substrate: Non-Associative Memory Structure 
as the Missing Foundation for Fault-Tolerant Quantum Computing. 
PAI26 — 2026 Conference on Physics and AI, Stanford University.
```

After the double-blind review period, author details will be added.

---

## Contact

Christian R. Macedonia, M.D.
University of Michigan
macedoni@umich.edu
https://thektproject.org
