import { useParams, useNavigate } from 'react-router-dom'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import {
  getRemainingDays, getBatteryStatus, getTypeLabel, getStatusLabel, getStatusColor,
  getCycleLife, getChargeLevelLabel, getChargeLevelColor, calculateRemainingLifePercent,
  getRemainingLifeLabel, getAverageChargeCount, isRechargeableType, createDefaultCells,
  BATTERY_TYPE_INFO, getDefaultShelfLife, calculateExpiryDate
} from '@/utils/battery'
import type { BatteryType, ChargeLevel, BatteryCell } from '@/utils/battery'
import { ArrowLeft, MapPin, Calendar, Clock, Zap, FileText, Trash2, Edit3, Battery, Hash, BatteryCharging, RefreshCw, Ban, Plus, Minus, Check, AlertTriangle } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function BatteryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const batteries = useBatteryStore((s) => s.batteries)
  const updateBattery = useBatteryStore((s) => s.updateBattery)
  const deleteBattery = useBatteryStore((s) => s.deleteBattery)
  const markAsDisposed = useBatteryStore((s) => s.markAsDisposed)
  const updateCellChargeLevel = useBatteryStore((s) => s.updateCellChargeLevel)
  const incrementCellChargeCount = useBatteryStore((s) => s.incrementCellChargeCount)
  const incrementAllChargeCounts = useBatteryStore((s) => s.incrementAllChargeCounts)
  const setAllCellsChargeLevel = useBatteryStore((s) => s.setAllCellsChargeLevel)

  const battery = batteries.find((b) => b.id === id)
  const [editing, setEditing] = useState(false)
  const [model, setModel] = useState(battery?.model ?? '')
  const [type, setType] = useState<BatteryType>(battery?.type ?? 'aa')
  const [quantity, setQuantity] = useState(battery?.quantity ?? 1)
  const [location, setLocation] = useState(battery?.location ?? '')
  const [purchaseDate, setPurchaseDate] = useState(battery?.purchaseDate ?? '')
  const [shelfLifeYears, setShelfLifeYears] = useState(battery?.shelfLifeYears ?? 5)
  const [notes, setNotes] = useState(battery?.notes ?? '')

  const isRechargeable = useMemo(() => {
    if (editing) return isRechargeableType(type)
    return battery?.isRechargeable ?? isRechargeableType(battery?.type ?? 'aa')
  }, [editing, type, battery])

  const cycleLife = useMemo(() => {
    if (editing) return getCycleLife(type)
    return getCycleLife(battery?.type ?? 'aa')
  }, [editing, type, battery])

  const avgChargeCount = useMemo(() => {
    if (!battery?.cells) return 0
    return getAverageChargeCount(battery.cells)
  }, [battery])

  const remainingLifePercent = useMemo(() => {
    return calculateRemainingLifePercent(avgChargeCount, cycleLife)
  }, [avgChargeCount, cycleLife])

  if (!battery) {
    return (
      <div className="text-center py-16">
        <Battery className="w-12 h-12 text-battery-muted mx-auto mb-3" />
        <p className="text-battery-muted">未找到此电池记录</p>
        <button onClick={() => navigate('/batteries')} className="mt-3 text-battery-accent text-sm hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  const remaining = getRemainingDays(battery.expiryDate)
  const status = getBatteryStatus(remaining)
  const statusColor = getStatusColor(status)
  const totalDays = battery.shelfLifeYears * 365
  const progress = Math.max(0, Math.min(100, ((totalDays - Math.max(0, remaining)) / totalDays) * 100))

  const handleSave = () => {
    const expiryDate = calculateExpiryDate(purchaseDate, shelfLifeYears)
    const rechargeable = isRechargeableType(type)
    let newCells = battery.cells
    if (rechargeable && battery.cells.length !== quantity) {
      if (quantity > battery.cells.length) {
        const additional = createDefaultCells(quantity - battery.cells.length)
        newCells = [...battery.cells, ...additional]
      } else {
        newCells = battery.cells.slice(0, quantity)
      }
    } else if (!rechargeable) {
      newCells = []
    }
    updateBattery(battery.id, {
      model: model.trim(),
      type,
      quantity,
      location: location.trim(),
      purchaseDate,
      expiryDate,
      shelfLifeYears,
      notes: notes.trim(),
      isRechargeable: rechargeable,
      cells: newCells,
    })
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm('确认删除此电池记录？删除后无法恢复。')) {
      deleteBattery(battery.id)
      navigate('/batteries')
    }
  }

  const handleDispose = () => {
    if (confirm('确认标记此电池为已报废？报废后将从库存中移除。')) {
      markAsDisposed(battery.id)
      navigate('/batteries')
    }
  }

  const handleChargeAll = () => {
    if (confirm(`确认记录全部 ${battery.cells.length} 节电池充电完成？充电次数 +1`)) {
      incrementAllChargeCounts(battery.id)
    }
  }

  const handleSetAllLevel = (level: ChargeLevel) => {
    setAllCellsChargeLevel(battery.id, level)
  }

  if (editing) {
    return (
      <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(false)}
            className="w-10 h-10 rounded-xl bg-battery-card border border-battery-border flex items-center justify-center text-battery-muted hover:text-battery-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-2xl">编辑电池</h1>
        </div>

        {battery.isDisposed && (
          <div className="p-4 rounded-xl bg-battery-danger/10 border border-battery-danger/30 flex items-center gap-3">
            <Ban className="w-5 h-5 text-battery-danger" />
            <div>
              <p className="text-sm font-medium text-battery-danger">此电池已报废</p>
              <p className="text-xs text-battery-muted">报废时间: {battery.disposedAt?.split('T')[0]}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-battery-muted mb-3 block">电池类型</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BATTERY_TYPE_INFO.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => { setType(t.type); setShelfLifeYears(getDefaultShelfLife(t.type)) }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    type === t.type
                      ? 'bg-battery-accent text-white glow-accent'
                      : 'bg-battery-card text-battery-muted border border-battery-border hover:border-battery-accent/30'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-battery-muted mb-2 block">电池型号</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-battery-muted mb-2 block">数量: {quantity} 节</label>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full accent-battery-accent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-battery-muted mb-2 block">存放位置</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-battery-muted mb-2 block">购买日期</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-battery-muted mb-2 block">保质期（年）</label>
              <select
                value={shelfLifeYears}
                onChange={(e) => setShelfLifeYears(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors"
              >
                {[3, 5, 7, 8, 10, 15].map((y) => (
                  <option key={y} value={y}>{y} 年</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-battery-muted mb-2 block">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors glow-accent"
          >
            保存修改
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/batteries')}
          className="w-10 h-10 rounded-xl bg-battery-card border border-battery-border flex items-center justify-center text-battery-muted hover:text-battery-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">{battery.model}</h1>
          <p className="text-sm text-battery-muted">{getTypeLabel(battery.type)}</p>
        </div>
        {!battery.isDisposed && (
          <button
            onClick={() => setEditing(true)}
            className="w-10 h-10 rounded-xl bg-battery-accent/15 flex items-center justify-center text-battery-accent hover:bg-battery-accent/25 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>

      {battery.isDisposed && (
        <div className="p-4 rounded-xl bg-battery-danger/10 border border-battery-danger/30 flex items-center gap-3">
          <Ban className="w-6 h-6 text-battery-danger" />
          <div>
            <p className="text-sm font-medium text-battery-danger">已报废</p>
            <p className="text-xs text-battery-muted">报废日期: {battery.disposedAt?.split('T')[0]}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-battery-border bg-battery-card/80 overflow-hidden">
        <div className="h-2" style={{ backgroundColor: statusColor }} />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-battery-muted">状态</p>
              <p className="font-display font-bold text-lg" style={{ color: statusColor }}>
                {getStatusLabel(status)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-battery-muted">剩余天数</p>
              <p className="font-display font-bold text-2xl" style={{ color: statusColor }}>
                {remaining <= 0 ? '已过期' : remaining}
              </p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-battery-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: statusColor }}
            />
          </div>
          <p className="text-xs text-battery-muted text-center">
            保质期已过 {Math.round(progress)}%
          </p>
        </div>
      </div>

      {battery.isRechargeable && !battery.isDisposed && battery.cells.length > 0 && (
        <div className="rounded-2xl border border-battery-accent/30 bg-battery-card/80 overflow-hidden">
          <div className="h-2 bg-battery-accent" />
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-battery-accent" />
                <p className="font-display font-bold text-lg">充电电池信息</p>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: remainingLifePercent > 50 ? '#27ae6020' : remainingLifePercent > 20 ? '#f39c1220' : '#e74c3c20',
                  color: remainingLifePercent > 50 ? '#27ae60' : remainingLifePercent > 20 ? '#f39c12' : '#e74c3c'
                }}
              >
                {getRemainingLifeLabel(remainingLifePercent)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-battery-border/30">
                <p className="text-xs text-battery-muted mb-1">平均充电</p>
                <p className="font-display font-bold text-xl text-battery-text">{avgChargeCount}</p>
                <p className="text-xs text-battery-muted">次</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-battery-border/30">
                <p className="text-xs text-battery-muted mb-1">循环寿命</p>
                <p className="font-display font-bold text-xl text-battery-text">{cycleLife}</p>
                <p className="text-xs text-battery-muted">次</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-battery-border/30">
                <p className="text-xs text-battery-muted mb-1">剩余寿命</p>
                <p className="font-display font-bold text-xl text-battery-text">{Math.round(remainingLifePercent)}%</p>
                <p className="text-xs text-battery-muted">估算</p>
              </div>
            </div>

            <div className="h-3 rounded-full bg-battery-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${remainingLifePercent}%`,
                  backgroundColor: remainingLifePercent > 50 ? '#27ae60' : remainingLifePercent > 20 ? '#f39c12' : '#e74c3c'
                }}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleChargeAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-battery-accent text-white text-sm font-medium hover:bg-battery-accentHover transition-colors glow-accent"
              >
                <RefreshCw className="w-4 h-4" />
                全部充电 +1
              </button>
              <div className="flex gap-1">
                {([
                  { level: 'full' as ChargeLevel, label: '全满电', color: '#27ae60' },
                  { level: 'partial' as ChargeLevel, label: '全部分', color: '#f39c12' },
                  { level: 'empty' as ChargeLevel, label: '全空电', color: '#e74c3c' },
                ]).map((opt) => (
                  <button
                    key={opt.level}
                    onClick={() => handleSetAllLevel(opt.level)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all bg-battery-card border border-battery-border hover:border-battery-accent/30 text-battery-muted hover:text-battery-text"
                    style={{ borderLeftWidth: 3, borderLeftColor: opt.color }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {battery.isRechargeable && !battery.isDisposed && battery.cells.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Battery className="w-5 h-5 text-battery-muted" />
              单节电池管理
            </h2>
            <span className="text-xs text-battery-muted">共 {battery.cells.length} 节</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {battery.cells.map((cell, index) => (
              <CellCard
                key={cell.id}
                cell={cell}
                index={index}
                cycleLife={cycleLife}
                onUpdateLevel={(level) => updateCellChargeLevel(battery.id, cell.id, level)}
                onIncrementCharge={() => incrementCellChargeCount(battery.id, cell.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
          <div className="flex items-center gap-2 text-battery-muted mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-xs">数量</span>
          </div>
          <p className="font-display font-bold text-lg">{battery.quantity} 节</p>
        </div>
        <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
          <div className="flex items-center gap-2 text-battery-muted mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">位置</span>
          </div>
          <p className="font-display font-bold text-lg">{battery.location || '未设置'}</p>
        </div>
        <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
          <div className="flex items-center gap-2 text-battery-muted mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">购买日期</span>
          </div>
          <p className="font-display font-bold text-sm">{battery.purchaseDate}</p>
        </div>
        <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
          <div className="flex items-center gap-2 text-battery-muted mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">过期日期</span>
          </div>
          <p className="font-display font-bold text-sm">{battery.expiryDate}</p>
        </div>
      </div>

      {battery.notes && (
        <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
          <div className="flex items-center gap-2 text-battery-muted mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs">备注</span>
          </div>
          <p className="text-sm text-battery-text">{battery.notes}</p>
        </div>
      )}

      {!battery.isDisposed ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDispose}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-battery-warning/30 text-battery-warning font-medium hover:bg-battery-warning/10 transition-colors"
          >
            <Ban className="w-5 h-5" />
            标记报废
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-battery-danger/30 text-battery-danger font-medium hover:bg-battery-danger/10 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            删除记录
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-battery-danger/30 text-battery-danger font-medium hover:bg-battery-danger/10 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          删除此报废记录
        </button>
      )}
    </div>
  )
}

function CellCard({
  cell,
  index,
  cycleLife,
  onUpdateLevel,
  onIncrementCharge,
}: {
  cell: BatteryCell
  index: number
  cycleLife: number
  onUpdateLevel: (level: ChargeLevel) => void
  onIncrementCharge: () => void
}) {
  const lifePercent = calculateRemainingLifePercent(cell.chargeCount, cycleLife)
  const lifeLabel = getRemainingLifeLabel(lifePercent)
  const lifeColor = lifePercent > 50 ? '#27ae60' : lifePercent > 20 ? '#f39c12' : '#e74c3c'
  const chargeColor = getChargeLevelColor(cell.chargeLevel)

  return (
    <div className="rounded-xl bg-battery-card/80 border border-battery-border p-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0"
          style={{ backgroundColor: `${chargeColor}20`, color: chargeColor }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium">第 {index + 1} 节</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${chargeColor}20`, color: chargeColor }}
            >
              {getChargeLevelLabel(cell.chargeLevel)}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${lifeColor}20`, color: lifeColor }}
            >
              {lifeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-battery-muted">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              充电 {cell.chargeCount}/{cycleLife} 次
            </span>
            <span>剩余 {Math.round(lifePercent)}%</span>
          </div>

          <div className="mt-2 h-1.5 rounded-full bg-battery-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${lifePercent}%`, backgroundColor: lifeColor }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onIncrementCharge}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-battery-accent text-white text-xs font-medium hover:bg-battery-accentHover transition-colors"
          >
            <Plus className="w-3 h-3" />
            充电
          </button>
          <div className="flex gap-1">
            {(['full', 'partial', 'empty'] as ChargeLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateLevel(level)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  cell.chargeLevel === level
                    ? 'text-white'
                    : 'bg-battery-border/50 text-battery-muted hover:bg-battery-border'
                }`}
                style={cell.chargeLevel === level ? { backgroundColor: getChargeLevelColor(level) } : {}}
                title={getChargeLevelLabel(level)}
              >
                {level === 'full' ? <Check className="w-3.5 h-3.5" /> : level === 'partial' ? '~' : '0'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}