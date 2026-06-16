import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Battery, ChargeLevel, BatteryCell, AppliancePairing } from '@/utils/battery'
import { generateId, isRechargeableType, createDefaultCells } from '@/utils/battery'

interface BatteryStore {
  batteries: Battery[]
  addBattery: (battery: Omit<Battery, 'id' | 'createdAt' | 'updatedAt' | 'isRechargeable' | 'cells' | 'isDisposed'> & { isRechargeable?: boolean; cells?: BatteryCell[]; isDisposed?: boolean }) => void
  updateBattery: (id: string, updates: Partial<Battery>) => void
  deleteBattery: (id: string) => void
  markAsDisposed: (id: string) => void
  updateCellChargeLevel: (batteryId: string, cellId: string, level: ChargeLevel) => void
  incrementCellChargeCount: (batteryId: string, cellId: string) => void
  incrementAllChargeCounts: (batteryId: string) => void
  setAllCellsChargeLevel: (batteryId: string, level: ChargeLevel) => void
  appliancePairings: AppliancePairing[]
  addAppliancePairing: (pairing: Omit<AppliancePairing, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAppliancePairing: (id: string, updates: Partial<AppliancePairing>) => void
  deleteAppliancePairing: (id: string) => void
}

export const useBatteryStore = create<BatteryStore>()(
  persist(
    (set) => ({
      batteries: [],
      appliancePairings: [],
      addBattery: (battery) => {
        const now = new Date().toISOString()
        const rechargeable = battery.isRechargeable ?? isRechargeableType(battery.type)
        const defaultCells = rechargeable ? createDefaultCells(battery.quantity) : []
        set((state) => ({
          batteries: [
            ...state.batteries,
            {
              ...battery,
              id: generateId(),
              createdAt: now,
              updatedAt: now,
              isRechargeable: rechargeable,
              cells: battery.cells ?? defaultCells,
              isDisposed: battery.isDisposed ?? false,
            },
          ],
        }))
      },
      updateBattery: (id, updates) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }))
      },
      deleteBattery: (id) => {
        set((state) => ({
          batteries: state.batteries.filter((b) => b.id !== id),
        }))
      },
      markAsDisposed: (id) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === id
              ? { ...b, isDisposed: true, disposedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : b
          ),
        }))
      },
      updateCellChargeLevel: (batteryId, cellId, level) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === batteryId
              ? {
                  ...b,
                  cells: b.cells.map((c) => (c.id === cellId ? { ...c, chargeLevel: level } : c)),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }))
      },
      incrementCellChargeCount: (batteryId, cellId) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === batteryId
              ? {
                  ...b,
                  cells: b.cells.map((c) =>
                    c.id === cellId ? { ...c, chargeCount: c.chargeCount + 1, chargeLevel: 'full' } : c
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }))
      },
      incrementAllChargeCounts: (batteryId) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === batteryId
              ? {
                  ...b,
                  cells: b.cells.map((c) => ({ ...c, chargeCount: c.chargeCount + 1, chargeLevel: 'full' })),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }))
      },
      setAllCellsChargeLevel: (batteryId, level) => {
        set((state) => ({
          batteries: state.batteries.map((b) =>
            b.id === batteryId
              ? {
                  ...b,
                  cells: b.cells.map((c) => ({ ...c, chargeLevel: level })),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }))
      },
      addAppliancePairing: (pairing) => {
        const now = new Date().toISOString()
        set((state) => ({
          appliancePairings: [
            ...state.appliancePairings,
            {
              ...pairing,
              id: generateId(),
              createdAt: now,
              updatedAt: now,
            },
          ],
        }))
      },
      updateAppliancePairing: (id, updates) => {
        set((state) => ({
          appliancePairings: state.appliancePairings.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },
      deleteAppliancePairing: (id) => {
        set((state) => ({
          appliancePairings: state.appliancePairings.filter((p) => p.id !== id),
        }))
      },
    }),
    {
      name: 'battery-manager-storage',
    }
  )
)
