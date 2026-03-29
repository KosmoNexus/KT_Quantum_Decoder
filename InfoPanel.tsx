import { X, ExternalLink, Mail } from "lucide-react";

interface InfoPanelProps {
  onClose: () => void;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-slate-100 mt-6 mb-2 pb-1 border-b border-slate-700 first:mt-0">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-slate-300 leading-relaxed mb-3">{children}</p>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[13px] text-slate-300 leading-relaxed mb-2">
      <span className="text-orange-400 shrink-0 mt-0.5">▸</span>
      <span>{children}</span>
    </li>
  );
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-1"
    >
      {children}
      <ExternalLink size={11} className="shrink-0" />
    </a>
  );
}

function ResourceRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-[13px] mb-1.5">
      <span className="text-slate-500 w-20 shrink-0">{label}</span>
      <span className="text-slate-300">{children}</span>
    </div>
  );
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[560px] max-w-full z-50 flex flex-col shadow-2xl"
        style={{ background: "#0d1520", borderLeft: "1px solid rgba(51,65,85,0.8)" }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-6 py-4 border-b border-slate-700/60 flex items-start justify-between gap-4"
          style={{ background: "#0a111a" }}
        >
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-snug">
              KT Walk-State Decoder vs Standard Syndrome Decoder
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Quantum Error Correction Simulation
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 text-xs transition-all"
          >
            <X size={12} />
            Close
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Section 1: What is Kosmoplex Theory? ── */}
          <H2>What is Kosmoplex Theory (KT)?</H2>
          <P>
            Kosmoplex Theory is a zero-free-parameter mathematical framework that derives the
            fundamental constants of physics from the geometry of an 8-dimensional octonionic
            substrate. It is not a metaphysical claim — it is a falsifiable, axiom-based
            computational model of physical reality grounded in the tradition of Hilbert,
            Heisenberg, and Yang.
          </P>
          <ul className="mb-4 space-y-0">
            <Bullet>
              The universe is a deterministic, reversible computation operating on an
              8-dimensional octonionic substrate projecting into the 4-dimensional spacetime
              we observe.
            </Bullet>
            <Bullet>
              Seven axioms — the five Peano axioms plus Triadic Closure and Total
              Computability — generate the entire framework with no free parameters.
            </Bullet>
            <Bullet>
              The Fano plane PG(2,𝔽₂) is the minimal projective geometry satisfying triadic
              closure. Its 7 points encode the octonionic multiplication table. This geometry
              is the computational substrate of physical reality.
            </Bullet>
            <Bullet>
              42 glyphs — the complete operator basis — emerge from oriented walks on the
              Fano plane: 7 lines × 3 Frobenius strides × 2 orientations = 42.
            </Bullet>
            <Bullet>
              Physical constants are geometric eigenvalues, not empirical inputs. The
              fine-structure constant α⁻¹ = 137.035999143 is derived with zero free
              parameters, agreeing with CODATA 2022 to 1.62σ.
            </Bullet>
            <Bullet>
              Five independent predictions confirmed by experiment: α⁻¹ (CODATA 2022), dark
              energy density Ω_DE = 0.786 (DESI 2025, 0% error), Hubble tension as geometric
              ratio 137/125, proton-electron mass ratio to 0.002%, chiral crossover
              temperature 155 MeV (lattice QCD).
            </Bullet>
            <Bullet>
              The Steane [[7,1,3]] code — the most celebrated quantum error correcting code —
              is organized by the Fano plane incidence matrix. Steane never used the words
              "Fano plane" or "octonions." The geometry is identical. KT explains why the
              code is optimal.
            </Bullet>
            <Bullet>
              <strong className="text-slate-200">Error correction reframed:</strong> In the
              KT framework, quantum noise is not random. It is the walk-state boundary
              condition of the 8D→4D projection. Managing boundary conditions is a tractable
              engineering problem. Suppressing random noise is not.
            </Bullet>
          </ul>

          {/* ── Section 2: About This Simulation ── */}
          <H2>About This Simulation</H2>
          <P>This simulation is a companion to the following paper:</P>
          <div
            className="border border-slate-700 rounded-lg px-4 py-3 mb-4"
            style={{ background: "rgba(15,23,42,0.6)" }}
          >
            <p className="text-[13px] text-slate-200 font-medium leading-snug mb-1">
              "The Octonionic Substrate: Non-Associative Memory Structure as the Missing
              Foundation for Fault-Tolerant Quantum Computing"
            </p>
            <p className="text-[12px] text-slate-500 leading-snug">
              Submitted to PAI26 — 2026 Conference on Physics and AI<br />
              Stanford Center for Decoding the Universe / American Physical Society / NeurIPS,
              June 2026
            </p>
          </div>
          <P>
            The simulation demonstrates the central empirical claim of that paper: quantum error
            correction schemes built on Markovian, associative assumptions hit a structural error
            floor near 3.8 × 10⁻³ that cannot be crossed by engineering improvements alone. The
            KT Walk-State Decoder manages walk-state boundary conditions on the Fano plane
            geometry and crosses that floor.
          </P>
          <div
            className="border-l-2 border-yellow-600/60 pl-4 py-1 mb-4"
            style={{ background: "rgba(113,63,18,0.12)" }}
          >
            <p className="text-[12px] text-yellow-300/80 leading-relaxed">
              <strong className="text-yellow-200">Important note:</strong> This simulation
              demonstrates the algebraic argument through structured noise models. It is not a
              claim of experimental measurement. The paper provides the theoretical derivation.
              The simulation makes the argument visible.
            </p>
          </div>

          {/* ── Section 3: Authorship ── */}
          <H2>Authorship and Acknowledgment</H2>
          <div
            className="border border-slate-700 rounded-lg px-4 py-3 mb-4"
            style={{ background: "rgba(15,23,42,0.4)" }}
          >
            <p className="text-[13px] text-slate-400 leading-relaxed italic">
              This software and related material was written by Christian R. Macedonia M.D. in
              full collaboration with Claude, and further assistance and debugging provided by
              Gemini, ChatGPT, and Grok. It is our collective hope that the material contained
              herein will be used for ethical and peaceful purposes for the advancement of all
              intelligent beings.
            </p>
          </div>

          {/* ── Section 4: Resources ── */}
          <H2>Resources</H2>
          <div className="space-y-0">
            <ResourceRow label="Author">
              Christian R. Macedonia, M.D. — University of Michigan
            </ResourceRow>
            <ResourceRow label="Email">
              <a
                href="mailto:macedoni@umich.edu"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
              >
                <Mail size={11} />
                macedoni@umich.edu
              </a>
            </ResourceRow>
            <ResourceRow label="KT Project">
              <Link href="https://thektproject.org">thektproject.org</Link>
            </ResourceRow>
            <ResourceRow label="GitHub">
              <span className="text-slate-500 text-[12px]">[link to repository]</span>
            </ResourceRow>
            <ResourceRow label="Zenodo">
              <Link href="https://doi.org/10.5281/zenodo.17861153">
                doi.org/10.5281/zenodo.17861153
              </Link>
            </ResourceRow>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}
