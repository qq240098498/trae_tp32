import { useParams, useNavigate } from 'react-router-dom'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { getRemainingDays, getBatteryStatus, getTypeLabel, getStatusLabel, getStatusColor } from '@/utils/battery'
import { ArrowLeft, MapPin, Calendar, Clock, Zap, FileText, Trash2, Edit3, Battery, Hash } from 'lucide-react'
import { useState } from 'react'
import { BATTERY_TYPE_INFO, getDefaultShelfLife, calculateExpiryDate } from '@/utils/battery'
import type { BatteryType } from '@/utils/battery'

export default function BatteryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const batteries = useBatteryStore((s) => s.batteries)
  const updateBattery = useBatteryStore((s) => s.updateBattery)
  const deleteBattery = useBatteryStore((s) => s.deleteBattery)

  const battery = batteries.find((b) => b.id === id)
  const [editing, setEditing] = useState(false)
  const [model, setModel] = useState(battery?.model ?? '')
  const [type, setType] = useState<BatteryType>(battery?.type ?? 'aa')
  const [quantity, setQuantity] = useState(battery?.quantity ?? 1)
  const [location, setLocation] = useState(battery?.location ?? '')
  const [purchaseDate, setPurchaseDate] = useState(battery?.purchaseDate ?? '')
  const [shelfLifeYears, setShelfLifeYears] = useState(battery?.shelfLifeYears ?? 5)
  const [notes, setNotes] = useState(battery?.notes ?? '')

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
    updateBattery(battery.id, {
      model: model.trim(),
      type,
      quantity,
      location: location.trim(),
      purchaseDate,
      expiryDate,
      shelfLifeYears,
      notes: notes.trim(),
    })
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm('确认删除此电池记录？删除后无法恢复。')) {
      deleteBattery(battery.id)
      navigate('/batteries')
    }
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
        <button
          onClick={() => setEditing(true)}
          className="w-10 h-10 rounded-xl bg-battery-accent/15 flex items-center justify-center text-battery-accent hover:bg-battery-accent/25 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

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

      <button
        onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-battery-danger/30 text-battery-danger font-medium hover:bg-battery-danger/10 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
        删除此电池记录
      </button>
    </div>
  )
}
