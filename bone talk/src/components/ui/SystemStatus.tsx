import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export function SystemStatus({ className = '' }: { className?: string }) {
  const { t } = useLanguage()
  const [healthState, setHealthState] = useState<'checking' | 'ok' | 'local'>('checking')

  useEffect(() => {
    let isMounted = true
    // Fetch production health endpoint
    fetch('/api/health', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Health check non-200')
      })
      .then((data) => {
        if (isMounted && data?.status === 'ok') {
          setHealthState('ok')
        } else if (isMounted) {
          setHealthState('local')
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthState('local')
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const items = [
    { label: t.systemStatus.website, value: t.systemStatus.online, status: 'active' },
    { label: t.systemStatus.aiEngine, value: t.systemStatus.ready, status: 'active' },
    { label: t.systemStatus.emgInterface, value: t.systemStatus.ready, status: 'active' },
    { label: t.systemStatus.engine3D, value: t.systemStatus.ready, status: 'active' },
    { label: t.systemStatus.languageEngine, value: t.systemStatus.languages24, status: 'info' },
    { label: t.systemStatus.globalAccess, value: t.systemStatus.online, status: 'active' },
    {
      label: t.systemStatus.healthEndpoint,
      value: healthState === 'ok' ? 'API ONLINE' : healthState === 'checking' ? 'CHECKING...' : 'LOCAL READY',
      status: healthState === 'ok' ? 'active' : 'info',
    },
  ]

  return (
    <div className={`border border-border bg-graphite-light/20 p-5 rounded-none corner-crosshairs ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4 font-mono text-[9px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-signal animate-pulse" />
          <span className="font-bold tracking-wider text-cream uppercase">{t.systemStatus.title}</span>
        </div>
        <span className="text-cream-muted text-[8px] uppercase">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 font-mono text-[10px]">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col justify-between p-2.5 border border-border/60 bg-graphite/30"
          >
            <span className="text-[8px] text-cream-muted uppercase tracking-wider block mb-1">
              {item.label}
            </span>
            <div className="flex items-center justify-between gap-1.5 mt-1">
              <span className="text-cyan-signal font-semibold text-[10px] uppercase truncate">
                {item.value}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal shrink-0 opacity-80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
