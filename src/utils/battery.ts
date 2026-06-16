export type BatteryType =
  | 'aa'
  | 'aaa'
  | 'button'
  | 'rechargeable_aa'
  | 'rechargeable_aaa'
  | '9v'
  | 'c'
  | 'd'
  | 'lithium'
  | 'other'

export type BatteryStatus = 'expired' | 'expiring' | 'normal'

export type ChargeLevel = 'full' | 'partial' | 'empty'

export type BatteryCell = {
  id: string
  chargeLevel: ChargeLevel
  chargeCount: number
}

export interface AppliancePairing {
  id: string
  applianceName: string
  batteryType: BatteryType
  batteryModel: string
  quantity: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Battery {
  id: string
  model: string
  type: BatteryType
  quantity: number
  location: string
  purchaseDate: string
  expiryDate: string
  shelfLifeYears: number
  notes: string
  createdAt: string
  updatedAt: string
  isRechargeable: boolean
  cells: BatteryCell[]
  isDisposed: boolean
  disposedAt?: string
}

export interface BatteryTypeInfo {
  type: BatteryType
  label: string
  defaultShelfLifeYears: number
  rechargeable: boolean
  cycleLife: number
}

export const DEFAULT_LITHIUM_CYCLE_LIFE = 500

export const BATTERY_TYPE_INFO: BatteryTypeInfo[] = [
  { type: 'aa', label: '5号电池(AA)', defaultShelfLifeYears: 7, rechargeable: false, cycleLife: 0 },
  { type: 'aaa', label: '7号电池(AAA)', defaultShelfLifeYears: 7, rechargeable: false, cycleLife: 0 },
  { type: 'button', label: '纽扣电池', defaultShelfLifeYears: 5, rechargeable: false, cycleLife: 0 },
  { type: 'rechargeable_aa', label: '5号充电电池', defaultShelfLifeYears: 5, rechargeable: true, cycleLife: DEFAULT_LITHIUM_CYCLE_LIFE },
  { type: 'rechargeable_aaa', label: '7号充电电池', defaultShelfLifeYears: 5, rechargeable: true, cycleLife: DEFAULT_LITHIUM_CYCLE_LIFE },
  { type: '9v', label: '9V电池', defaultShelfLifeYears: 5, rechargeable: false, cycleLife: 0 },
  { type: 'c', label: 'C型电池', defaultShelfLifeYears: 7, rechargeable: false, cycleLife: 0 },
  { type: 'd', label: 'D型电池', defaultShelfLifeYears: 7, rechargeable: false, cycleLife: 0 },
  { type: 'lithium', label: '锂电池', defaultShelfLifeYears: 10, rechargeable: true, cycleLife: DEFAULT_LITHIUM_CYCLE_LIFE },
  { type: 'other', label: '其他', defaultShelfLifeYears: 5, rechargeable: false, cycleLife: 0 },
]

export function isRechargeableType(type: BatteryType): boolean {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.rechargeable ?? false
}

export function getCycleLife(type: BatteryType): number {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.cycleLife ?? 0
}

export function getTypeLabel(type: BatteryType): string {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.label ?? type
}

export function getDefaultShelfLife(type: BatteryType): number {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.defaultShelfLifeYears ?? 5
}

export function getChargeLevelLabel(level: ChargeLevel): string {
  switch (level) {
    case 'full': return '满电'
    case 'partial': return '部分'
    case 'empty': return '空电'
  }
}

export function getChargeLevelColor(level: ChargeLevel): string {
  switch (level) {
    case 'full': return '#27ae60'
    case 'partial': return '#f39c12'
    case 'empty': return '#e74c3c'
  }
}

export function calculateRemainingLifePercent(chargeCount: number, cycleLife: number): number {
  if (cycleLife <= 0) return 100
  return Math.max(0, Math.min(100, ((cycleLife - chargeCount) / cycleLife) * 100))
}

export function getRemainingLifeLabel(percent: number): string {
  if (percent >= 80) return '优秀'
  if (percent >= 50) return '良好'
  if (percent >= 20) return '一般'
  if (percent > 0) return '较差'
  return '建议报废'
}

export function createDefaultCells(quantity: number): BatteryCell[] {
  const cells: BatteryCell[] = []
  for (let i = 0; i < quantity; i++) {
    cells.push({
      id: generateId(),
      chargeLevel: 'full',
      chargeCount: 0,
    })
  }
  return cells
}

export function getAverageChargeCount(cells: BatteryCell[]): number {
  if (cells.length === 0) return 0
  const total = cells.reduce((sum, c) => sum + c.chargeCount, 0)
  return Math.round(total / cells.length)
}

export function getRemainingDays(expiryDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getBatteryStatus(remainingDays: number): BatteryStatus {
  if (remainingDays <= 0) return 'expired'
  if (remainingDays <= 30) return 'expiring'
  return 'normal'
}

export function calculateExpiryDate(purchaseDate: string, shelfLifeYears: number): string {
  const d = new Date(purchaseDate)
  d.setFullYear(d.getFullYear() + shelfLifeYears)
  return d.toISOString().split('T')[0]
}

export function getStatusColor(status: BatteryStatus): string {
  switch (status) {
    case 'expired': return '#e74c3c'
    case 'expiring': return '#f39c12'
    case 'normal': return '#27ae60'
  }
}

export function getStatusLabel(status: BatteryStatus): string {
  switch (status) {
    case 'expired': return '已过期'
    case 'expiring': return '即将过期'
    case 'normal': return '正常'
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
