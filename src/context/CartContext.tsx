import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  CartItem,
  OrderStatusInfo,
  OrderStage,
  SerializedBlueprint,
  StageHistoryEntry,
} from '../types/terrarium';
import { STUDIO_TEAM_LABEL, verifiedUnitPriceCents } from '../utils/stripeCheckoutEngine';
import { QUARANTINE_HOURS, isShippingOption, type ShippingOption } from '../catalog/delivery';

type StandardCartItemInput = Pick<CartItem, 'type' | 'sku' | 'name' | 'description'>;

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /** Adds a Studio design priced from the catalog. Returns false if it can't be priced. */
  addCustomBlueprint: (blueprint: SerializedBlueprint) => boolean;
  /** Adds an edition or hardware item priced from the catalog. Returns false for unknown SKUs. */
  addStandardItem: (item: StandardCartItemInput, quantity?: number) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  /** One delivery choice for the whole order; it decides assembly vs DIY kit for every build. */
  shippingOption: ShippingOption;
  setShippingOption: (option: ShippingOption) => void;
  clearCart: () => void;
  subtotalCents: number;
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

// v2: prices moved from dollars to integer cents. v1 data is ignored.
const CART_STORAGE_KEY = 'terrascape_cart_v2';
const ORDERS_STORAGE_KEY = 'terrascape_orders_v2';
const DELIVERY_STORAGE_KEY = 'terrascape_delivery_v1';

function loadShippingOption(): ShippingOption {
  try {
    const saved = localStorage.getItem(DELIVERY_STORAGE_KEY);
    return isShippingOption(saved) ? saved : 'courier';
  } catch {
    return 'courier';
  }
}

/**
 * Reprices saved items from the current catalog. Items saved before delivery became an
 * order-level choice carried their own fulfillment and an assembly-inclusive price.
 */
function repriceStoredItem(stored: CartItem & { fulfillmentType?: unknown }): CartItem {
  const { fulfillmentType: _legacyFulfillment, ...item } = stored;
  const unitPriceCents = verifiedUnitPriceCents(item);
  return unitPriceCents === null ? item : { ...item, unitPriceCents };
}

function loadStoredList<T>(key: string, isValid: (value: unknown) => boolean): T[] {
  try {
    const saved = localStorage.getItem(key);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? (parsed.filter(isValid) as T[]) : [];
  } catch {
    return [];
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStoredCartItem = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.sku === 'string' &&
  Number.isInteger(value.unitPriceCents) &&
  Number.isInteger(value.quantity);

const isStoredOrder = (value: unknown) =>
  isRecord(value) && typeof value.orderId === 'string' && Number.isInteger(value.totalCents);

function describeBlueprint(blueprint: SerializedBlueprint): string {
  const count = (skuPrefix: string) =>
    blueprint.elements
      .filter((line) => line.sku.startsWith(skuPrefix))
      .reduce((sum, line) => sum + line.quantity, 0);
  const flora = count('FLR-');
  const details = count('HRD-');
  return `${blueprint.foundation.name} · ${flora} ${flora === 1 ? 'plant' : 'plants'} · ${details} ${details === 1 ? 'detail' : 'details'}`;
}

/**
 * Orders saved by older builds credited a named team member in each stage entry.
 * Re-attribute them to the team and use the current stage notes.
 */
function anonymizeStoredOrder(order: OrderStatusInfo): OrderStatusInfo {
  if (!Array.isArray(order.stageHistory)) return order;
  return {
    ...order,
    stageHistory: order.stageHistory.map((entry) => ({
      ...entry,
      technician: STUDIO_TEAM_LABEL,
      notes: STAGE_CONFIGS[entry.stage]?.defaultNote ?? entry.notes,
    })),
  };
}

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
    defaultNote: 'Our team soldered the PWM LED ring, ultrasonic piezo misting transducer, and I2C sensor bus. Oscilloscope test: PASS.',
  },
  PLANTING: {
    next: 'QUARANTINE',
    title: 'Substrates Contoured & Flora Planted',
    defaultNote: 'Substrate layers graded to wave spec. Live tropical specimens planted and rooted.',
  },
  QUARANTINE: {
    next: 'SHIPPED',
    title: `${QUARANTINE_HOURS}-Hour Micro-Climate Quarantine & Acclimation`,
    defaultNote: 'Terrarium sealed inside incubation bay. Automated misting and circadian day/night lighting cycling cleanly.',
  },
  SHIPPED: {
    next: null,
    title: 'Packaged & Shipped',
    defaultNote: 'Crated in insulated shock-proof packaging with temperature pack. Courier/Shippo tracking generated.',
  },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() =>
    loadStoredList<CartItem>(CART_STORAGE_KEY, isStoredCartItem).map(repriceStoredItem)
  );
  const [shippingOption, setShippingOption] = useState<ShippingOption>(loadShippingOption);

  const [orders, setOrders] = useState<OrderStatusInfo[]>(() =>
    loadStoredList<OrderStatusInfo>(ORDERS_STORAGE_KEY, isStoredOrder).map(anonymizeStoredOrder)
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderStatusInfo | null>(() => orders[0] ?? null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, shippingOption);
    } catch (e) {
      console.warn('Failed to save delivery choice to localStorage', e);
    }
  }, [shippingOption]);

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

  const addCustomBlueprint = (blueprint: SerializedBlueprint) => {
    const unitPriceCents = verifiedUnitPriceCents({
      type: 'custom_blueprint',
      sku: 'CUSTOM-BUILD',
      blueprint,
    });
    if (unitPriceCents === null) {
      console.warn('Blueprint contains items that are not in the catalog', blueprint);
      return false;
    }

    const newItem: CartItem = {
      id: `blueprint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'custom_blueprint',
      name: `Custom ${blueprint.vessel.name}`,
      sku: 'CUSTOM-BUILD',
      unitPriceCents,
      quantity: 1,
      blueprint,
      description: describeBlueprint(blueprint),
    };

    setItems((prev) => [newItem, ...prev]);
    setIsOpen(true);
    return true;
  };

  const addStandardItem = (item: StandardCartItemInput, quantity = 1) => {
    const unitPriceCents = verifiedUnitPriceCents(item);
    if (unitPriceCents === null) {
      console.warn(`Unknown catalog SKU: ${item.sku}`);
      return false;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, unitPriceCents, quantity: i.quantity + quantity } : i
        );
      }
      return [
        {
          ...item,
          id: `item-${item.sku}-${Date.now()}`,
          unitPriceCents,
          quantity,
        },
        ...prev,
      ];
    });
    setIsOpen(true);
    return true;
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

  const clearCart = () => {
    setItems([]);
  };

  const subtotalCents = items.reduce((acc, item) => acc + item.unitPriceCents * item.quantity, 0);
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
          technician: STUDIO_TEAM_LABEL,
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
        shippingOption,
        setShippingOption,
        clearCart,
        subtotalCents,
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
