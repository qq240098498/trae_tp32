import { useBatteryStore } from '@/hooks/useBatteryStore'
import { getRemainingDays, getBatteryStatus, getTypeLabel, getStatusLabel, getAverageChargeCount, calculateRemainingLifePercent, getCycleLife } from '@/utils/battery'
import { Link } from 'react-router-dom'
import { Battery, AlertTriangle, AlertCircle, Plus, ScanLine, ArrowRight, Zap, BatteryCharging, Ban, Plug, MapPin } from 'lucide-react'
import type { Battery as BatteryType } from '@/utils/battery'

function StatCard({ icon: Icon, label, value, color, glow, onClick }: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
  glow?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-battery-border bg-battery-card/80 p-5 transition-all duration-300 hover:scale-[1.02] ${glow ?? ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="card-shine absolute inset-0 pointer-events-none" />
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-battery-muted">{label}</p>
          <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function ExpiringItem({ battery }: { battery: BatteryType }) {
  const remaining = getRemainingDays(battery.expiryDate)
  const status = getBatteryStatus(remaining)
  const borderColor = status === 'expired' ? '#e74c3c' : '#f39c12'
  const totalDays = battery.shelfLifeYears * 365
  const progress = Math.max(0, Math.min(100, ((totalDays - remaining) / totalDays) * 100))

  const cycleLife = getCycleLife(battery.type)
  const avgCharge = getAverageChargeCount(battery.cells || [])
  const lifePercent = calculateRemainingLifePercent(avgCharge, cycleLife)

  return (
    <Link
      to={`/batteries/${battery.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-battery-card/50 hover:bg-battery-card transition-colors border-l-4"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-sm truncate">{battery.model}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${borderColor}20`, color: borderColor }}>
            {getStatusLabel(status)}
          </span>
          {battery.isRechargeable && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: lifePercent > 50 ? '#27ae6020' : lifePercent > 20 ? '#f39c1220' : '#e74c3c20',
                color: lifePercent > 50 ? '#27ae60' : lifePercent > 20 ? '#f39c12' : '#e74c3c'
              }}
            >
              <BatteryCharging className="w-3 h-3 inline mr-0.5" />
              寿命 {Math.round(lifePercent)}%
            </span>
          )}
        </div>
        <p className="text-xs text-battery-muted mt-1">
          {getTypeLabel(battery.type)} · {battery.location} · {battery.quantity}节
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-battery-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: borderColor }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-bold text-lg" style={{ color: borderColor }}>
          {remaining <= 0 ? '已过期' : `${remaining}天`}
        </p>
        <p className="text-xs text-battery-muted">剩余</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const batteries = useBatteryStore((s) => s.batteries)
  const appliancePairings = useBatteryStore((s) => s.appliancePairings)

  const activeBatteries = batteries.filter(b => !b.isDisposed)
  const disposedBatteries = batteries.filter(b => b.isDisposed)
  const rechargeableBatteries = activeBatteries.filter(b => b.isRechargeable)

  const totalCount = activeBatteries.reduce((acc, b) => acc + b.quantity, 0)
  const expiringBatteries = activeBatteries.filter((b) => {
    const remaining = getRemainingDays(b.expiryDate)
    return remaining > 0 && remaining <= 30
  })
  const expiredBatteries = activeBatteries.filter((b) => getRemainingDays(b.expiryDate) <= 0)
  const alertBatteries = [...expiredBatteries, ...expiringBatteries]
    .sort((a, b) => getRemainingDays(a.expiryDate) - getRemainingDays(b.expiryDate))

  const typeCount = new Set(activeBatteries.map((b) => b.type)).size

  const lowLifeBatteries = rechargeableBatteries.filter(b => {
    const cycleLife = getCycleLife(b.type)
    const avgCharge = getAverageChargeCount(b.cells || [])
    const lifePercent = calculateRemainingLifePercent(avgCharge, cycleLife)
    return lifePercent <= 20
  })

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="font-display font-bold text-3xl">
          <span className="text-gradient-accent">电池管家</span>
        </h1>
        <p className="text-battery-muted mt-1">家用电池管理，一目了然</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="电池总数" value={`${totalCount} 节`} color="#ff6b35" />
        <StatCard icon={Battery} label="类型数" value={typeCount} color="#0f3460" />
        <StatCard icon={AlertTriangle} label="即将过期" value={expiringBatteries.length} color="#f39c12" glow="animate-pulse-slow" />
        <StatCard icon={AlertCircle} label="已过期" value={expiredBatteries.length} color="#e74c3c" glow="animate-pulse-slow" />
      </div>

      {(rechargeableBatteries.length > 0 || disposedBatteries.length > 0 || appliancePairings.length > 0) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BatteryCharging} label="充电电池" value={`${rechargeableBatteries.length} 组`} color="#3498db" />
          <StatCard icon={Ban} label="已报废" value={disposedBatteries.length} color="#95a5a6" />
          {lowLifeBatteries.length > 0 && (
            <StatCard icon={AlertTriangle} label="低寿命电池" value={lowLifeBatteries.length} color="#e67e22" glow="animate-pulse-slow" />
          )}
          {appliancePairings.length > 0 && (
            <StatCard
              icon={Plug}
              label="电器配对"
              value={appliancePairings.length}
              color="#9b59b6"
              onClick={() => window.location.href = '/appliance-pairings'}
            />
          )}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Link
          to="/batteries/add"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors glow-accent"
        >
          <Plus className="w-5 h-5" />
          添加电池
        </Link>
        <Link
          to="/scan"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-battery-accent text-battery-accent font-medium hover:bg-battery-accent/10 transition-colors"
        >
          <ScanLine className="w-5 h-5" />
          扫码录入
        </Link>
        <Link
          to="/appliance-pairings/add"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#9b59b6] text-[#9b59b6] font-medium hover:bg-[#9b59b6]/10 transition-colors"
        >
          <Plug className="w-5 h-5" />
          添加配对
        </Link>
        {disposedBatteries.length > 0 && (
          <Link
            to="/batteries?filter=disposed"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-battery-border text-battery-muted font-medium hover:bg-battery-card transition-colors"
          >
            <Ban className="w-5 h-5" />
            查看报废
          </Link>
        )}
      </div>

      {alertBatteries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-battery-warning" />
              过期提醒
            </h2>
            <Link to="/batteries" className="text-sm text-battery-accent flex items-center gap-1 hover:underline">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {alertBatteries.slice(0, 5).map((b) => (
              <ExpiringItem key={b.id} battery={b} />
            ))}
          </div>
        </div>
      )}

      {lowLifeBatteries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-battery-warning" />
              充电电池寿命提醒
            </h2>
            <Link to="/batteries" className="text-sm text-battery-accent flex items-center gap-1 hover:underline">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {lowLifeBatteries.slice(0, 5).map((b) => (
              <ExpiringItem key={b.id} battery={b} />
            ))}
          </div>
        </div>
      )}

      {appliancePairings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Plug className="w-5 h-5 text-[#9b59b6]" />
              电器-电池配对
            </h2>
            <Link to="/appliance-pairings" className="text-sm text-battery-accent flex items-center gap-1 hover:underline">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {appliancePairings.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/appliance-pairings/edit/${p.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-battery-card/50 hover:bg-battery-card transition-colors border-l-4 border-[#9b59b6]"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#9b59b6]/20 text-[#9b59b6] shrink-0">
                  <Plug className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm truncate">{p.applianceName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-battery-accent/15 text-battery-accent">
                      {p.quantity}节{p.batteryModel || getTypeLabel(p.batteryType)}
                    </span>
                  </div>
                  <p className="text-xs text-battery-muted mt-0.5">
                    {getTypeLabel(p.batteryType)}{p.batteryModel ? ` · ${p.batteryModel}` : ''}
                  </p>
                </div>
                <div className="text-xs text-battery-muted shrink-0">
                  换电池时查看
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {batteries.length === 0 && appliancePairings.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-battery-card flex items-center justify-center mb-4">
            <Battery className="w-10 h-10 text-battery-muted" />
          </div>
          <h3 className="font-display font-bold text-lg text-battery-muted">还没有电池记录</h3>
          <p className="text-sm text-battery-muted mt-1">点击上方按钮添加你的第一块电池</p>
        </div>
      )}
    </div>
  )
}
