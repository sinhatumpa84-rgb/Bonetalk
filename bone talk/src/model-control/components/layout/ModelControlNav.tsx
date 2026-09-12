import React from 'react'
import {
  LayoutDashboard,
  Activity,
  Cpu,
  History,
  ShieldCheck,
  Settings as SettingsIcon,
} from 'lucide-react'

export type ModelControlTab =
  | 'dashboard'
  | 'telemetry'
  | 'model'
  | 'history'
  | 'system'
  | 'settings'

interface ModelControlNavProps {
  activeTab: ModelControlTab
  onSelectTab: (tab: ModelControlTab) => void
  predictionCount: number
  hasSensorData: boolean
  modelReady: boolean
}

export const ModelControlNav: React.FC<ModelControlNavProps> = ({
  activeTab,
  onSelectTab,
  predictionCount,
  hasSensorData,
  modelReady,
}) => {
  const navItems: Array<{
    id: ModelControlTab
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: string | number | null
  }> = [
    {
      id: 'dashboard',
      label: 'Operations Console',
      icon: LayoutDashboard,
    },
    {
      id: 'telemetry',
      label: 'Live Telemetry',
      icon: Activity,
      badge: hasSensorData ? 'LIVE' : null,
    },
    {
      id: 'model',
      label: 'Model & Inference',
      icon: Cpu,
      badge: modelReady ? 'READY' : null,
    },
    {
      id: 'history',
      label: 'Prediction History',
      icon: History,
      badge: predictionCount > 0 ? predictionCount : null,
    },
    {
      id: 'system',
      label: 'System Status',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ]

  return (
    <nav className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none">
      <ul className="flex items-center gap-1 sm:gap-2 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm text-xs font-mono tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#2B382D] text-[#FFFFFF] font-semibold shadow-xs'
                    : 'text-[#5C554E] hover:text-[#262220] hover:bg-[#F5F2EB]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#A3B899]' : 'text-[#8C827A]'} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]'
                        : item.badge === 'LIVE' || item.badge === 'READY'
                        ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                        : 'bg-[#E5E0D8] text-[#5C554E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
