import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { BATTERY_TYPE_INFO, getDefaultShelfLife, calculateExpiryDate } from '@/utils/battery'
import type { BatteryType } from '@/utils/battery'
import { ArrowLeft, Save, Zap, MapPin, Calendar, Clock, FileText, BatteryPlus } from 'lucide-react'

export default function AddBattery() {
  const navigate = useNavigate()
  const addBattery = useBatteryStore((s) => s.addBattery)

  const [model, setModel] = useState('')
  const [type, setType] = useState<BatteryType>('aa')
  const [quantity, setQuantity] = useState(1)
  const [location, setLocation] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [shelfLifeYears, setShelfLifeYears] = useState(getDefaultShelfLife('aa'))
  const [notes, setNotes] = useState('')

  const handleTypeChange = (t: BatteryType) => {
    setType(t)
    const defaultLife = getDefaultShelfLife(t)
    setShelfLifeYears(defaultLife)
  }

  const expiryDate = calculateExpiryDate(purchaseDate, shelfLifeYears)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!model.trim()) return
    addBattery({
      model: model.trim(),
      type,
      quantity,
      location: location.trim(),
      purchaseDate,
      expiryDate,
      shelfLifeYears,
      notes: notes.trim(),
    })
    navigate('/batteries')
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-battery-card border border-battery-border flex items-center justify-center text-battery-muted hover:text-battery-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl">添加电池</h1>
          <p className="text-sm text-battery-muted">录入新的电池记录</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-3">
            <Zap className="w-4 h-4" />
            电池类型
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {BATTERY_TYPE_INFO.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => handleTypeChange(t.type)}
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
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
            <BatteryPlus className="w-4 h-4" />
            电池型号 <span className="text-battery-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="例如: 南孚AA、CR2032、金霸王5号"
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-battery-muted mb-2 block">
            数量: <span className="text-battery-accent font-display font-bold text-lg">{quantity}</span> 节
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full accent-battery-accent"
          />
          <div className="flex justify-between text-xs text-battery-muted mt-1">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
            <MapPin className="w-4 h-4" />
            存放位置
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例如: 客厅抽屉、工具箱、遥控器旁"
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
              <Calendar className="w-4 h-4" />
              购买日期
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text focus:outline-none focus:border-battery-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
              <Clock className="w-4 h-4" />
              保质期（年）
            </label>
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

        <div className="p-4 rounded-xl bg-battery-card/50 border border-battery-border">
          <p className="text-sm text-battery-muted">
            预计过期日期: <span className="text-battery-accent font-display font-bold">{expiryDate}</span>
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
            <FileText className="w-4 h-4" />
            备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="可选备注信息..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!model.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
        >
          <Save className="w-5 h-5" />
          保存电池记录
        </button>
      </form>
    </div>
  )
}
