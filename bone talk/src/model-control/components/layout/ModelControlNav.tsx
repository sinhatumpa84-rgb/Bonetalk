import React from 'react'
import {
  LayoutDashboard,
  Activity,
  Cpu,
  History,
  ShieldCheck,
  Settings as SettingsIcon,
  Wifi,
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
  predictionCount: _predictionCount,
  hasSensorData: _hasSensorData,
  modelReady: _modelReady,
}) => {
  const navItems: Array<{
    id: ModelControlTab
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
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
    },
    {
      id: 'model',
      label: 'Model & Inference',
      icon: Cpu,
    },
    {
      id: 'history',
      label: 'Prediction History',
      icon: History,
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
    <nav className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none select-none">
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
              </button>
            </li>
          )
        })}

        <li>
          <a
            href="/connect-device"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-sm text-xs font-mono tracking-wide text-[#2B382D] bg-[#E8EFEA] hover:bg-[#D9E6DC] border border-[#41634F]/30 font-semibold transition-all ml-1"
            title="Connect physical BoneTalk Arduino UNO R4 hardware via Wi-Fi / MQTT"
          >
            <Wifi size={13} className="text-[#41634F]" />
            <span>Connect Arduino UNO R4Y5</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
