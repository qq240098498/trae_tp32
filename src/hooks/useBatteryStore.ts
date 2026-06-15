import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Battery } from '@/utils/battery'
import { generateId } from '@/utils/battery'

interface BatteryStore {
  batteries: Battery[]
  addBattery: (battery: Omit<Battery, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBattery: (id: string, updates: Partial<Battery>) => void
  deleteBattery: (id: string) => void
}

export const useBatteryStore = create<BatteryStore>()(
  persist(
    (set) => ({
      batteries: [],
      addBattery: (battery) => {
        const now = new Date().toISOString()
        set((state) => ({
          batteries: [
            ...state.batteries,
            {
              ...battery,
              id: generateId(),
              createdAt: now,
              updatedAt: now,
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
    }),
    {
      name: 'battery-manager-storage',
    }
  )
)
