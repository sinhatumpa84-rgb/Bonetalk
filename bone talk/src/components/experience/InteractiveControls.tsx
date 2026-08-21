import { RotateCw, Move, Focus, RotateCcw } from 'lucide-react'

interface InteractiveControlsProps {
  activeFocus: 'full' | 'module' | 'sensor' | 'strap'
  onChangeFocus: (focus: 'full' | 'module' | 'sensor' | 'strap') => void
  autoRotate: boolean
  onToggleAutoRotate: () => void
  onResetRotation: () => void
}

export function InteractiveControls({
  activeFocus,
  onChangeFocus,
  autoRotate,
  onToggleAutoRotate,
  onResetRotation,
}: InteractiveControlsProps) {
  const focusModes: { id: 'full' | 'module' | 'sensor' | 'strap'; label: string }[] = [
    { id: 'full', label: 'FULL VIEW' },
    { id: 'module', label: 'HUB MODULE' },
    { id: 'sensor', label: 'EMG ARRAY' },
    { id: 'strap', label: 'WEAVE STRAP' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-xl">
      {/* ── Macro Camera Focal Points ── */}
      <div className="flex items-center gap-1 p-1 rounded-sm border border-neutral-800/80 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-2 py-1 text-neutral-500 font-mono text-[9px] uppercase tracking-widest border-r border-neutral-800">
          <Focus size={11} />
          <span className="hidden sm:inline">FOCUS:</span>
        </div>
        {focusModes.map((m) => {
          const isActive = m.id === activeFocus
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeFocus(m.id)}
              className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer rounded-xs ${
                isActive
                  ? 'bg-neutral-800 text-cyan-300 font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* ── Orbit Tools ── */}
      <div className="flex items-center gap-2">
        {/* Drag Hint */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-neutral-800/60 bg-black/30 text-neutral-500 font-mono text-[9px] tracking-widest uppercase">
          <Move size={11} className="text-neutral-400" />
          <span>DRAG 360°</span>
        </div>

        {/* Auto Rotate Toggle */}
        <button
          type="button"
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-[9px] tracking-widest uppercase transition-all cursor-pointer backdrop-blur-md ${
            autoRotate
              ? 'border-cyan-400/80 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
              : 'border-neutral-800/80 bg-black/40 text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label={autoRotate ? 'Stop Auto Rotation' : 'Start Auto Rotation'}
        >
          <RotateCw size={11} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '8s' }} />
          <span>{autoRotate ? 'ROTATING' : 'AUTO ORBIT'}</span>
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={onResetRotation}
          className="p-1.5 rounded-sm border border-neutral-800/80 bg-black/40 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  )
}
