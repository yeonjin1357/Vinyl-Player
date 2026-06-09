/**
 * M0 placeholder. Proves the build pipeline: React 19 + Vite 8 + Tailwind v4
 * token bridge + fonts + reduced-motion-aware CSS spin. Replaced by the real
 * Library/Player views in later milestones.
 */
export default function App() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-text">
      <section className="flex flex-col items-center gap-10 text-center">
        {/* Vinyl teaser — decorative */}
        <div
          className="relative grid h-56 w-56 place-items-center rounded-full bg-[#0d0d12] shadow-card"
          aria-hidden="true"
        >
          <div className="animate-spin-vinyl absolute inset-0 grid place-items-center rounded-full">
            <span className="absolute inset-2 rounded-full border border-white/5" />
            <span className="absolute inset-7 rounded-full border border-white/5" />
            <span className="absolute inset-14 rounded-full border border-white/5" />
            <span className="grid h-20 w-20 place-items-center rounded-full bg-accent">
              <span className="h-3 w-3 rounded-full bg-[#0d0d12]" />
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            Vinyl Player
          </p>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            LP Record Player
          </h1>
          <p className="mx-auto max-w-md text-muted">
            Dual-theme vinyl music player — scaffold ready. Switch{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 text-accent-2">data-theme</code> on
            the <code className="rounded bg-surface px-1.5 py-0.5 text-accent-2">&lt;html&gt;</code>{' '}
            element to preview Dark Neon ⇄ Light Minimal.
          </p>
        </div>
      </section>
    </main>
  );
}
