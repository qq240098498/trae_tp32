import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { BATTERY_TYPE_INFO, getTypeLabel } from '@/utils/battery'
import type { BatteryType } from '@/utils/battery'
import { ArrowLeft, Save, Zap, Hash, FileText, Tv } from 'lucide-react'

export default function AddAppliancePairing() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const pairings = useBatteryStore((s) => s.appliancePairings)
  const addAppliancePairing = useBatteryStore((s) => s.addAppliancePairing)
  const updateAppliancePairing = useBatteryStore((s) => s.updateAppliancePairing)

  const isEditing = Boolean(id)
  const existingPairing = id ? pairings.find((p) => p.id === id) : null

  const [applianceName, setApplianceName] = useState('')
  const [batteryType, setBatteryType] = useState<BatteryType>('aa')
  const [batteryModel, setBatteryModel] = useState('')
  const [quantity, setQuantity] = useState(2)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (existingPairing) {
      setApplianceName(existingPairing.applianceName)
      setBatteryType(existingPairing.batteryType)
      setBatteryModel(existingPairing.batteryModel)
      setQuantity(existingPairing.quantity)
      setNotes(existingPairing.notes)
    }
  }, [existingPairing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applianceName.trim()) return

    if (isEditing && id) {
      updateAppliancePairing(id, {
        applianceName: applianceName.trim(),
        batteryType,
        batteryModel: batteryModel.trim(),
        quantity,
        notes: notes.trim(),
      })
    } else {
      addAppliancePairing({
        applianceName: applianceName.trim(),
        batteryType,
        batteryModel: batteryModel.trim(),
        quantity,
        notes: notes.trim(),
      })
    }
    navigate('/appliance-pairings')
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
          <h1 className="font-display font-bold text-2xl">
            {isEditing ? '编辑配对' : '添加配对'}
          </h1>
          <p className="text-sm text-battery-muted">
            {isEditing ? '修改电器电池配对信息' : '记录电器所需的电池型号与数量'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
            <Tv className="w-4 h-4" />
            电器名称 <span className="text-battery-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={applianceName}
            onChange={(e) => setApplianceName(e.target.value)}
            placeholder="例如: 电视遥控器、体重秤、空调遥控器"
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
          />
        </div>

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
                onClick={() => setBatteryType(t.type)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  batteryType === t.type
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
            电池型号说明
          </label>
          <input
            type="text"
            value={batteryModel}
            onChange={(e) => setBatteryModel(e.target.value)}
            placeholder="例如: 7号、CR2032纽扣、5号"
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
          />
          <p className="text-xs text-battery-muted mt-1">
            补充说明电池型号，如"7号""2032纽扣"等，方便快速识别
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
            <Hash className="w-4 h-4" />
            需要数量: <span className="text-battery-accent font-display font-bold text-lg">{quantity}</span> 节
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full accent-battery-accent"
          />
          <div className="flex justify-between text-xs text-battery-muted mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-battery-accent/10 border border-battery-accent/30">
          <p className="text-sm text-battery-accent font-medium">
            配对预览
          </p>
          <p className="text-sm text-battery-text mt-1">
            <span className="font-display font-bold">{applianceName || '电器名称'}</span>
            {' — '}
            <span className="text-battery-accent">{quantity}节</span>
            {' '}
            <span>{batteryModel || getTypeLabel(batteryType)}</span>
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
            placeholder="例如: 电池仓在背面、需要十字螺丝刀打开..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!applianceName.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
        >
          <Save className="w-5 h-5" />
          {isEditing ? '保存修改' : '保存配对记录'}
        </button>
      </form>
    </div>
  )
}
