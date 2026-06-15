import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBatteryStore } from '@/hooks/useBatteryStore'
import { BATTERY_TYPE_INFO, getDefaultShelfLife, calculateExpiryDate, isRechargeableType, createDefaultCells } from '@/utils/battery'
import type { BatteryType, ChargeLevel } from '@/utils/battery'
import { ArrowLeft, Camera, X, Check, Zap, BatteryPlus, BatteryCharging, RefreshCw } from 'lucide-react'
import Quagga from '@ericblade/quagga2'

export default function ScanBattery() {
  const navigate = useNavigate()
  const addBattery = useBatteryStore((s) => s.addBattery)
  const videoRef = useRef<HTMLDivElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [error, setError] = useState('')
  const [model, setModel] = useState('')
  const [type, setType] = useState<BatteryType>('aa')
  const [quantity, setQuantity] = useState(1)
  const [location, setLocation] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [shelfLifeYears, setShelfLifeYears] = useState(7)
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [initialChargeLevel, setInitialChargeLevel] = useState<ChargeLevel>('full')

  const isRechargeable = useMemo(() => isRechargeableType(type), [type])

  const startScanner = useCallback(() => {
    if (!videoRef.current) return

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream' as const,
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader', 'upc_e_reader'],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          setError('无法启动摄像头，请检查权限设置')
          return
        }
        Quagga.start()
        setScanning(true)
      }
    )

    Quagga.onDetected((result) => {
      if (result.codeResult?.code) {
        const code = result.codeResult.code
        setScannedCode(code)
        setModel(code)
        Quagga.stop()
        setScanning(false)
        setShowForm(true)
      }
    })
  }, [])

  const stopScanner = useCallback(() => {
    Quagga.stop()
    setScanning(false)
  }, [])

  useEffect(() => {
    return () => {
      try { Quagga.stop() } catch {}
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!model.trim()) return
    const expiryDate = calculateExpiryDate(purchaseDate, shelfLifeYears)
    const rechargeable = isRechargeableType(type)
    let cells = rechargeable ? createDefaultCells(quantity) : []
    if (rechargeable && initialChargeLevel !== 'full') {
      cells = cells.map(c => ({ ...c, chargeLevel: initialChargeLevel }))
    }
    addBattery({
      model: model.trim(),
      type,
      quantity,
      location: location.trim(),
      purchaseDate,
      expiryDate,
      shelfLifeYears,
      notes: notes.trim(),
      isRechargeable: rechargeable,
      cells,
    })
    navigate('/batteries')
  }

  const handleTypeChange = (t: BatteryType) => {
    setType(t)
    setShelfLifeYears(getDefaultShelfLife(t))
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
          <h1 className="font-display font-bold text-2xl">扫码录入</h1>
          <p className="text-sm text-battery-muted">扫描电池包装上的条码</p>
        </div>
      </div>

      {!showForm && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-battery-border bg-battery-card aspect-video flex items-center justify-center">
            {scanning ? (
              <>
                <div ref={videoRef} className="absolute inset-0" />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-battery-accent/60 rounded-xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-battery-accent animate-scan-line" />
                  </div>
                </div>
                <button
                  onClick={stopScanner}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-battery-danger/80 flex items-center justify-center text-white hover:bg-battery-danger transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-battery-accent/15 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-battery-accent" />
                </div>
                <div>
                  <p className="text-battery-muted">点击下方按钮启动摄像头</p>
                  <p className="text-xs text-battery-muted/60 mt-1">支持 EAN、Code128、UPC 等常见条码</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-battery-danger/10 border border-battery-danger/30 text-sm text-battery-danger">
              {error}
            </div>
          )}

          <button
            onClick={startScanner}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors disabled:opacity-50 glow-accent"
          >
            <Camera className="w-5 h-5" />
            {scanning ? '扫描中...' : '启动摄像头扫码'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-battery-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-battery-bg text-battery-muted">或者</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-battery-muted mb-2">
              <BatteryPlus className="w-4 h-4" />
              手动输入条码号
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="输入条码号码..."
                className="flex-1 px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
              />
              <button
                onClick={() => {
                  if (scannedCode.trim()) {
                    setModel(scannedCode.trim())
                    setShowForm(true)
                  }
                }}
                disabled={!scannedCode.trim()}
                className="px-5 py-3 rounded-xl bg-battery-accent text-white text-sm font-medium hover:bg-battery-accentHover transition-colors disabled:opacity-40"
              >
                确认
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setShowForm(true)
            }}
            className="w-full text-center text-sm text-battery-accent hover:underline"
          >
            跳过扫码，直接手动录入
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 rounded-xl bg-battery-success/10 border border-battery-success/30 flex items-center gap-3">
            <Check className="w-5 h-5 text-battery-success" />
            <div>
              <p className="text-sm font-medium text-battery-success">条码识别成功</p>
              <p className="text-xs text-battery-muted">{scannedCode || '手动录入模式'}</p>
            </div>
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
            <label className="text-sm font-medium text-battery-muted mb-2 block">电池型号</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="输入或修改型号"
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
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
              placeholder="例如: 客厅抽屉、工具箱"
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors"
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

          <div className="p-4 rounded-xl bg-battery-card/50 border border-battery-border">
            <p className="text-sm text-battery-muted">
              预计过期日期: <span className="text-battery-accent font-display font-bold">{calculateExpiryDate(purchaseDate, shelfLifeYears)}</span>
            </p>
          </div>

          {isRechargeable && (
            <div className="p-4 rounded-xl bg-battery-accent/10 border border-battery-accent/30 space-y-4">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-battery-accent" />
                <div>
                  <p className="text-sm font-medium text-battery-accent">充电电池设置</p>
                  <p className="text-xs text-battery-muted">可在详情页中管理每节电池的充电记录</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-battery-muted mb-2 block flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  初始电量状态
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { level: 'full' as ChargeLevel, label: '满电', color: '#27ae60' },
                    { level: 'partial' as ChargeLevel, label: '部分', color: '#f39c12' },
                    { level: 'empty' as ChargeLevel, label: '空电', color: '#e74c3c' },
                  ]).map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setInitialChargeLevel(opt.level)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        initialChargeLevel === opt.level
                          ? 'text-white glow-accent'
                          : 'bg-battery-card text-battery-muted border border-battery-border hover:border-battery-accent/30'
                      }`}
                      style={initialChargeLevel === opt.level ? { backgroundColor: opt.color } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-battery-muted">
                共 {quantity} 节，每节充电次数初始为 0，预计循环寿命约 500 次
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-battery-muted mb-2 block">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-battery-card border border-battery-border text-sm text-battery-text placeholder-battery-muted/50 focus:outline-none focus:border-battery-accent/50 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!model.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-battery-accent text-white font-medium hover:bg-battery-accentHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
          >
            保存电池记录
          </button>
        </form>
      )}
    </div>
  )
}
