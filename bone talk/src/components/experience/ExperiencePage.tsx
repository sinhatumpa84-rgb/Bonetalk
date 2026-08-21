import { ArrowLeft } from 'lucide-react'

interface ExperiencePageProps {
  onNavigateHome: () => void
}

export function ExperiencePage({ onNavigateHome }: ExperiencePageProps) {
  return (
    <div className="relative min-h-screen w-full bg-white text-neutral-900">
      {/* Minimal navigation back to home */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="group inline-flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-900 cursor-pointer"
          aria-label="Return to Homepage"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>HOME</span>
        </button>
      </div>

      {/* Clean White Canvas Container for Future Custom Implementation */}
      <main className="flex min-h-screen w-full items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-300 select-none">
          SAAKANTHA EXPERIENCE
        </span>
      </main>
    </div>
  )
}
