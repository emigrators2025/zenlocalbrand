import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions: string[];
  baseCost: number;
  freeShippingThreshold: number;
  estimatedDays: string;
  isActive: boolean;
}

interface ShippingState {
  zones: ShippingZone[];
  addZone: (zone: Omit<ShippingZone, 'id'>) => void;
  updateZone: (id: string, data: Partial<ShippingZone>) => void;
  deleteZone: (id: string) => void;
  toggleZone: (id: string) => void;
}

export const useShippingStore = create<ShippingState>()(
  persist(
    (set) => ({
      zones: [],
      
      addZone: (zone) => {
        const newZone: ShippingZone = {
          ...zone,
          id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({ zones: [...state.zones, newZone] }));
      },
      
      updateZone: (id, data) => {
        set((state) => ({
          zones: state.zones.map((z) => (z.id === id ? { ...z, ...data } : z)),
        }));
      },
      
      deleteZone: (id) => {
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
        }));
      },
      
      toggleZone: (id) => {
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === id ? { ...z, isActive: !z.isActive } : z
          ),
        }));
      },
    }),
    {
      name: 'zen-shipping-storage',
    }
  )
);
