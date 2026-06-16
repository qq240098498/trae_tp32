import { useState, useMemo } from 'react'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { getTypeLabel, BATTERY_TYPE_INFO } from '@/utils/battery'
import type { BatteryType, AppliancePairing } from '@/utils/battery'
import { Link } from 'react-router-dom'
import { Search, Plus, Trash2, Edit3, Zap, Package, FileText } from 'lucide-react'

function PairingCard({
  pairing,
  onDelete,
}: {
  pairing: AppliancePairing
  onDelete: () => void
}) {
  return (
    <div className="rounded-2xl border border-battery-border bg-battery-card/80 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-battery-accent/30 group">
      <div className="h-1.5 bg-battery-accent/60" />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-lg truncate">{pairing.applianceName}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-battery-accent/15 text-battery-accent">
                {pairing.quantity}节{pairing.batteryModel || getTypeLabel(pairing.batteryType)}
              </span>
            </div>
            <p className="text-sm text-battery-muted mt-1">
              {getTypeLabel(pairing.batteryType)}
              {pairing.batteryModel && (
                <span className="ml-1.5">· {pairing.batteryModel}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/appliance-pairings/edit/${pairing.id}`}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-battery-muted hover:text-battery-accent hover:bg-battery-accent/10 transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm('确认删除此配对记录？')) onDelete()
              }}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-battery-muted hover:text-battery-danger hover:bg-battery-danger/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-battery-muted">
            <Zap className="w-3 h-3 text-battery-accent" />
            <span>需要 {pairing.quantity} 节</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-battery-muted">
            <Package className="w-3 h-3 text-battery-blue" />
            <span>{pairing.batteryModel || getTypeLabel(pairing.batteryType)}</span>
          </div>
        </div>

        {pairing.notes && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-battery-muted">
            <FileText className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{pairing.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AppliancePairingList() {
  const pairings = useBatteryStore((s) => s.appliancePairings)
  const deleteAppliancePairing = useBatteryStore((s) => s.deleteAppliancePairing)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<BatteryType | 'all'>('all')

  const filteredPairings = useMemo(() => {
    return [...pairings]
      .filter((p) => {
        if (search) {
          const s = search.toLowerCase()
          const matchName = p.applianceName.toLowerCase().includes(s)
          const matchModel = p.batteryModel.toLowerCase().includes(s)
          const matchNotes = p.notes.toLowerCase().includes(s)
          const matchType = getTypeLabel(p.batteryType).includes(s)
          if (!matchName && !matchModel && !matchNotes && !matchType) return false
        }
        if (typeFilter !== 'all' && p.batteryType !== typeFilter) return false
        return true
      })
      .sort((a, b) => a.applianceName.localeCompare(b.applianceName, 'zh-CN'))
  }, [pairings, search, typeFilter])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">电器-电池配对</h1>
          <p className="text-sm text-battery-muted mt-1">记录电器所需电池型号与数量</p>
        </div>
        <Link
          to="/appliance-pairings/add"
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
          placeholder="搜索电器名称、电池型号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted focus:outline-none focus:border-battery-accent/50 transition-colors"
        />
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

      {filteredPairings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPairings.map((p) => (
            <PairingCard key={p.id} pairing={p} onDelete={() => deleteAppliancePairing(p.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-battery-muted mx-auto mb-3" />
          <p className="text-battery-muted">
            {pairings.length === 0 ? '还没有配对记录' : '没有找到匹配的配对记录'}
          </p>
          {pairings.length === 0 && (
            <Link to="/appliance-pairings/add" className="inline-flex items-center gap-1 mt-3 text-battery-accent text-sm hover:underline">
              <Plus className="w-4 h-4" />
              添加第一条配对
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
