import { useState, useMemo, useEffect } from 'react'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { getRemainingDays, getBatteryStatus, getTypeLabel, getStatusLabel, getStatusColor, getAverageChargeCount, calculateRemainingLifePercent, getCycleLife, getChargeLevelLabel, getChargeLevelColor } from '@/utils/battery'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Plus, MapPin, Calendar, Zap, ChevronRight, Trash2, BatteryCharging, RefreshCw } from 'lucide-react'
import type { BatteryType, BatteryStatus } from '@/utils/battery'
import { BATTERY_TYPE_INFO } from '@/utils/battery'

function BatteryCard({ battery, onDelete }: { battery: ReturnType<typeof useBatteryStore.getState>['batteries'][0]; onDelete: () => void }) {
  const remaining = getRemainingDays(battery.expiryDate)
  const status = getBatteryStatus(remaining)
  const statusColor = getStatusColor(status)
  const totalDays = battery.shelfLifeYears * 365
  const progress = Math.max(0, Math.min(100, ((totalDays - Math.max(0, remaining)) / totalDays) * 100))

  const cycleLife = getCycleLife(battery.type)
  const avgCharge = getAverageChargeCount(battery.cells || [])
  const lifePercent = calculateRemainingLifePercent(avgCharge, cycleLife)

  const chargeCounts = useMemo(() => {
    if (!battery.cells || battery.cells.length === 0) return null
    const counts = { full: 0, partial: 0, empty: 0 }
    battery.cells.forEach(c => { counts[c.chargeLevel]++ })
    return counts
  }, [battery.cells])

  return (
    <Link
      to={`/batteries/${battery.id}`}
      className="block rounded-2xl border border-battery-border bg-battery-card/80 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-battery-accent/30 group"
    >
      <div className="h-1.5" style={{ backgroundColor: statusColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-lg truncate">{battery.model}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
              >
                {getStatusLabel(status)}
              </span>
              {battery.isRechargeable && battery.cells && battery.cells.length > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: lifePercent > 50 ? '#27ae6020' : lifePercent > 20 ? '#f39c1220' : '#e74c3c20',
                    color: lifePercent > 50 ? '#27ae60' : lifePercent > 20 ? '#f39c12' : '#e74c3c'
                  }}
                >
                  寿命 {Math.round(lifePercent)}%
                </span>
              )}
            </div>
            <p className="text-sm text-battery-muted mt-1">
              {getTypeLabel(battery.type)}
              {battery.isRechargeable && (
                <span className="inline-flex items-center gap-0.5 ml-1.5 text-battery-accent">
                  <BatteryCharging className="w-3 h-3 inline" />
                  可充电
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-battery-accent/15 text-battery-accent font-display font-bold text-sm">
              {battery.quantity}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm('确认删除此电池记录？')) onDelete()
              }}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-battery-muted hover:text-battery-danger hover:bg-battery-danger/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {chargeCounts && (
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1" style={{ color: getChargeLevelColor('full') }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChargeLevelColor('full') }} />
              满电 {chargeCounts.full}
            </span>
            <span className="flex items-center gap-1" style={{ color: getChargeLevelColor('partial') }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChargeLevelColor('partial') }} />
              部分 {chargeCounts.partial}
            </span>
            <span className="flex items-center gap-1" style={{ color: getChargeLevelColor('empty') }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChargeLevelColor('empty') }} />
              空电 {chargeCounts.empty}
            </span>
            {avgCharge > 0 && (
              <span className="ml-auto flex items-center gap-1 text-battery-muted">
                <RefreshCw className="w-3 h-3" />
                平均 {avgCharge} 次
              </span>
            )}
          </div>
        )}

        <div className="mt-4 h-1.5 rounded-full bg-battery-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: statusColor }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs text-battery-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {battery.location || '未设置'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {battery.purchaseDate}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: statusColor }}>
            <Zap className="w-3 h-3" />
            {remaining <= 0 ? '已过期' : `剩余${remaining}天`}
          </div>
        </div>
      </div>
    </Link>
  )
}

type StatusFilter = 'all' | BatteryStatus | 'disposed'

export default function BatteryList() {
  const batteries = useBatteryStore((s) => s.batteries)
  const deleteBattery = useBatteryStore((s) => s.deleteBattery)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<BatteryType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showDisposed, setShowDisposed] = useState(false)

  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'disposed') {
      setStatusFilter('disposed')
      setShowDisposed(true)
    }
  }, [searchParams])

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter)
    const shouldShowDisposed = filter === 'disposed'
    setShowDisposed(shouldShowDisposed)
    if (shouldShowDisposed) {
      setSearchParams({ filter: 'disposed' })
    } else {
      setSearchParams({})
    }
  }

  const sortedBatteries = useMemo(() => {
    return [...batteries]
      .map((b) => ({
        ...b,
        remaining: getRemainingDays(b.expiryDate),
        status: getBatteryStatus(getRemainingDays(b.expiryDate)),
      }))
      .filter((b) => {
        if (statusFilter === 'disposed') {
          if (!b.isDisposed) return false
        } else if (!showDisposed) {
          if (b.isDisposed) return false
        }
        if (search) {
          const s = search.toLowerCase()
          if (!b.model.toLowerCase().includes(s) && !b.location.toLowerCase().includes(s) && !getTypeLabel(b.type).includes(s)) return false
        }
        if (typeFilter !== 'all' && b.type !== typeFilter) return false
        if (statusFilter !== 'all' && statusFilter !== 'disposed' && b.status !== statusFilter) return false
        return true
      })
      .sort((a, b) => {
        if (a.isDisposed !== b.isDisposed) return a.isDisposed ? 1 : -1
        return a.remaining - b.remaining
      })
  }, [batteries, search, typeFilter, statusFilter, showDisposed])

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'normal', label: '正常' },
    { key: 'expiring', label: '即将过期' },
    { key: 'expired', label: '已过期' },
    { key: 'disposed', label: '已报废' },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">电池列表</h1>
          <p className="text-sm text-battery-muted mt-1">按保质期剩余天数排序</p>
        </div>
        <Link
          to="/batteries/add"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-battery-accent text-white text-sm font-medium hover:bg-battery-accentHover transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-battery-muted" />
        <input
          type="text"
          placeholder="搜索型号、位置..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted focus:outline-none focus:border-battery-accent/50 transition-colors"
        />
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilterChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === tab.key
                ? tab.key === 'disposed'
                  ? 'bg-battery-danger text-white'
                  : 'bg-battery-accent text-white'
                : 'bg-battery-card text-battery-muted hover:text-battery-text border border-battery-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            typeFilter === 'all'
              ? 'bg-battery-blue text-white'
              : 'bg-battery-card text-battery-muted border border-battery-border'
          }`}
        >
          全部类型
        </button>
        {BATTERY_TYPE_INFO.map((t) => (
          <button
            key={t.type}
            onClick={() => setTypeFilter(t.type)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              typeFilter === t.type
                ? 'bg-battery-blue text-white'
                : 'bg-battery-card text-battery-muted border border-battery-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sortedBatteries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBatteries.map((b) => (
            <BatteryCard key={b.id} battery={b} onDelete={() => deleteBattery(b.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-battery-muted mx-auto mb-3" />
          <p className="text-battery-muted">没有找到匹配的电池</p>
          {batteries.length === 0 && (
            <Link to="/batteries/add" className="inline-flex items-center gap-1 mt-3 text-battery-accent text-sm hover:underline">
              <Plus className="w-4 h-4" />
              添加第一块电池
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
