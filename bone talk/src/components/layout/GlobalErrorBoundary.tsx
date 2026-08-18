import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log structured error to console (in production, would route to secure log aggregator)
    if (import.meta.env.DEV) {
      console.error('[BoneTalk Global Error Boundary Caught]:', error, errorInfo)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-graphite text-cream px-6 py-12">
          <div className="max-w-md w-full rounded-sm border border-border bg-graphite-light p-8 text-center surface-panel shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
              <AlertTriangle size={24} />
            </div>
            
            <h1 className="font-display text-xl font-bold tracking-wide uppercase mb-2">
              System Interface Recovery
            </h1>
            
            <p className="font-mono text-xs text-cream-muted leading-relaxed mb-6">
              A temporary runtime interruption occurred in the interface subsystem. The biopotential core has prevented further cascade.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full rounded-sm border border-cyan-signal/40 bg-cyan-signal/[0.12] px-4 py-2.5 font-mono text-xs text-cyan-signal font-bold uppercase tracking-wider hover:bg-cyan-signal/[0.22] transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw size={14} /> Reload Interface
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
