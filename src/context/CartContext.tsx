import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  CartItem,
  FulfillmentType,
  HardwareId,
  OrderStatusInfo,
  OrderStage,
  SerializedBlueprint,
  StageHistoryEntry,
  VesselId,
} from '../types/terrarium';

interface AddCustomBlueprintParams {
  blueprint: SerializedBlueprint;
  name: string;
  vesselId: VesselId;
  price: number;
  fulfillmentType: FulfillmentType;
  thumbnailSvg?: string;
  hardwareIds: HardwareId[];
  botanicalCount: number;
  substrateCount: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addCustomBlueprint: (params: AddCustomBlueprintParams) => void;
  addStandardItem: (item: Omit<CartItem, 'quantity' | 'id'> & { id?: string }, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateItemFulfillment: (id: string, fulfillmentType: FulfillmentType) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;

  // Checkout Modal State
  isCheckoutModalOpen: boolean;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;

  // 5-Stage Live Workshop Assembly Tracker State
  isTrackerModalOpen: boolean;
  openTrackerModal: (order?: OrderStatusInfo) => void;
  closeTrackerModal: () => void;
  activeOrder: OrderStatusInfo | null;
  orders: OrderStatusInfo[];
  saveOrder: (order: OrderStatusInfo) => void;
  advanceOrderStage: (orderId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'terrascape_cart_v1';
const ORDERS_STORAGE_KEY = 'terrascape_orders_v1';

const STAGE_CONFIGS: Record<
  OrderStage,
  { next: OrderStage | null; title: string; defaultNote: string }
> = {
  BLUEPRINT_RECEIVED: {
    next: 'CIRCUIT_SOLDERING',
    title: 'Blueprint Received & Queued',
    defaultNote: 'BOM verified by engineering engine. Hardware PCBs and vessel placed in assembly tray.',
  },
  CIRCUIT_SOLDERING: {
    next: 'PLANTING',
    title: 'Circuits Soldered & Tested',
    defaultNote: 'Andrew soldered the PWM LED ring, ultrasonic piezo misting transducer, and I2C sensor bus. Oscilloscope test: PASS.',
  },
  PLANTING: {
    next: 'QUARANTINE',
    title: 'Substrates Contoured & Flora Planted',
    defaultNote: 'Substrate layers graded to wave spec. Live tropical specimens planted and rooted.',
  },
  QUARANTINE: {
    next: 'SHIPPED',
    title: '72h Micro-Climate Quarantine & Acclimation',
    defaultNote: 'Terrarium sealed inside incubation bay. Automated misting and circadian day/night lighting cycling cleanly.',
  },
  SHIPPED: {
    next: null,
    title: 'Packaged & Shipped',
    defaultNote: 'Crated in insulated shock-proof packaging with temperature pack. Courier/Shippo tracking generated.',
  },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderStatusInfo[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderStatusInfo | null>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed: OrderStatusInfo[] = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[0] : null;
    } catch {
      return null;
    }
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addCustomBlueprint = (params: AddCustomBlueprintParams) => {
    const newItem: CartItem = {
      id: `blueprint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'custom_blueprint',
      name: `Custom ${params.name} Terrarium`,
      sku: params.blueprint.vessel.sku,
      price: params.price,
      quantity: 1,
      fulfillmentType: params.fulfillmentType,
      blueprint: params.blueprint,
      vesselId: params.vesselId,
      thumbnailSvg: params.thumbnailSvg,
      hardwareIds: params.hardwareIds,
      botanicalCount: params.botanicalCount,
      substrateCount: params.substrateCount,
      description: `${params.substrateCount} Substrates · ${params.botanicalCount} Botanicals · ${params.hardwareIds.length} Smart Circuits`,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsOpen(true);
  };

  const addStandardItem = (
    item: Omit<CartItem, 'quantity' | 'id'> & { id?: string },
    quantity = 1
  ) => {
    const itemId = item.id || `item-${item.sku}-${Date.now()}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        {
          ...item,
          id: itemId,
          quantity,
        },
        ...prev,
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const updateItemFulfillment = (id: string, fulfillmentType: FulfillmentType) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Adjust price if toggling between assembled (+$25) and DIY ($0)
          const hadAssembly = item.fulfillmentType === 'assembled_local';
          const wantsAssembly = fulfillmentType === 'assembled_local';
          let priceAdj = item.price;
          if (!hadAssembly && wantsAssembly) priceAdj += 25;
          if (hadAssembly && !wantsAssembly) priceAdj -= 25;

          const updatedBlueprint = item.blueprint
            ? { ...item.blueprint, fulfillmentType, estimatedTotalUSD: priceAdj }
            : undefined;

          return {
            ...item,
            fulfillmentType,
            price: priceAdj,
            blueprint: updatedBlueprint,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const openCheckoutModal = () => {
    setIsOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const openTrackerModal = (order?: OrderStatusInfo) => {
    if (order) {
      setActiveOrder(order);
    } else if (!activeOrder && orders.length > 0) {
      setActiveOrder(orders[0]);
    }
    setIsTrackerModalOpen(true);
  };

  const closeTrackerModal = () => {
    setIsTrackerModalOpen(false);
  };

  const saveOrder = (order: OrderStatusInfo) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.orderId !== order.orderId)]);
    setActiveOrder(order);
    clearCart();
    setIsCheckoutModalOpen(false);
    setIsTrackerModalOpen(true);
  };

  const advanceOrderStage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== orderId) return order;
        const current = order.currentStage;
        const config = STAGE_CONFIGS[current];
        if (!config || !config.next) return order;

        const nextStage = config.next;
        const nextConfig = STAGE_CONFIGS[nextStage];
        const newEntry: StageHistoryEntry = {
          stage: nextStage,
          timestamp: new Date().toISOString(),
          title: nextConfig.title,
          notes: nextConfig.defaultNote,
          technician: 'Andrew Hung (Hardware & Vivarium Lead)',
        };

        const updated: OrderStatusInfo = {
          ...order,
          currentStage: nextStage,
          stageHistory: [newEntry, ...order.stageHistory],
        };

        if (activeOrder?.orderId === orderId) {
          setActiveOrder(updated);
        }
        return updated;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addCustomBlueprint,
        addStandardItem,
        removeItem,
        updateQuantity,
        updateItemFulfillment,
        clearCart,
        subtotal,
        itemCount,
        isCheckoutModalOpen,
        openCheckoutModal,
        closeCheckoutModal,
        isTrackerModalOpen,
        openTrackerModal,
        closeTrackerModal,
        activeOrder,
        orders,
        saveOrder,
        advanceOrderStage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
