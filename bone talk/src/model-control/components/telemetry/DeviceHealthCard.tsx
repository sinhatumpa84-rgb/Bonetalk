import React from 'react'
import { Battery, Wifi, Gauge, Clock, ShieldCheck } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const DeviceHealthCard: React.FC = () => {
  const { deviceHealth, connectionStatus, settings } = useModelControl()

  const { battery, rssi, packetRate, lastPacketTime } = deviceHealth

  const getBatteryIcon = () => {
    return <Battery size={13} className="text-[#41634F]" />
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Device Health &amp; Link Telemetry
          </h4>
        </div>
        <span className="text-[11px] font-mono text-[#8C827A]">{settings.deviceId}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
        {/* Connection Status */}
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
            Link Status
          </span>
          <span
            className={`font-semibold text-[11px] block mt-0.5 ${
              connectionStatus === 'Connected'
                ? 'text-[#2B382D]'
                : connectionStatus === 'Connection Error'
                ? 'text-[#991B1B]'
                : 'text-[#8C827A]'
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        {/* Battery */}
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">Battery</span>
            {getBatteryIcon()}
          </div>
          <span className="font-semibold text-[#262220] block mt-0.5">
            {battery !== null ? `${battery}%` : '—'}
          </span>
        </div>

        {/* Signal RSSI */}
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">Signal RSSI</span>
            <Wifi size={13} className="text-[#41634F]" />
          </div>
          <span className="font-semibold text-[#262220] block mt-0.5">
            {rssi !== null ? `${rssi} dBm` : '—'}
          </span>
        </div>

        {/* Packet Rate */}
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">Packet Rate</span>
            <Gauge size={13} className="text-[#41634F]" />
          </div>
          <span className="font-semibold text-[#262220] block mt-0.5">
            {packetRate !== null ? `${packetRate} pkt/s` : '—'}
          </span>
        </div>

        {/* Last Packet */}
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">Last Packet</span>
            <Clock size={13} className="text-[#41634F]" />
          </div>
          <span className="font-semibold text-[#262220] block mt-0.5 truncate">
            {lastPacketTime !== null ? lastPacketTime : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
