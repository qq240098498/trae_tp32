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
}

export interface BatteryTypeInfo {
  type: BatteryType
  label: string
  defaultShelfLifeYears: number
}

export const BATTERY_TYPE_INFO: BatteryTypeInfo[] = [
  { type: 'aa', label: '5号电池(AA)', defaultShelfLifeYears: 7 },
  { type: 'aaa', label: '7号电池(AAA)', defaultShelfLifeYears: 7 },
  { type: 'button', label: '纽扣电池', defaultShelfLifeYears: 5 },
  { type: 'rechargeable_aa', label: '5号充电电池', defaultShelfLifeYears: 5 },
  { type: 'rechargeable_aaa', label: '7号充电电池', defaultShelfLifeYears: 5 },
  { type: '9v', label: '9V电池', defaultShelfLifeYears: 5 },
  { type: 'c', label: 'C型电池', defaultShelfLifeYears: 7 },
  { type: 'd', label: 'D型电池', defaultShelfLifeYears: 7 },
  { type: 'lithium', label: '锂电池', defaultShelfLifeYears: 10 },
  { type: 'other', label: '其他', defaultShelfLifeYears: 5 },
]

export function getTypeLabel(type: BatteryType): string {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.label ?? type
}

export function getDefaultShelfLife(type: BatteryType): number {
  return BATTERY_TYPE_INFO.find(t => t.type === type)?.defaultShelfLifeYears ?? 5
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
