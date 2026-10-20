import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ActiveTab,
  CartItem,
  CatalogItem,
  FulfillmentType,
  HardwareId,
  LightingMode,
  PlacedItem,
  SubstrateId,
  SubstrateLayer,
  VesselId,
} from './types/terrarium';
import { CATALOG_ITEMS, PRESETS, SUBSTRATES, VESSELS } from './data';
import { sfx } from './utils/soundEffects';
import { calculateBomSummary, serializeBlueprint } from './utils/pricingAndBlueprint';
import { TopNavBar } from './components/TopNavBar';
import { TerrariumCanvas } from './components/TerrariumCanvas';
import { BuilderDrawer } from './components/BuilderDrawer';
import { BlueprintModal } from './components/BlueprintModal';
import { CartDrawer } from './components/CartDrawer';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AuthModal } from './components/AuthModal';

export default function TerrariumBuilder() {
  // Core Terrarium State
  const [vesselId, setVesselId] = useState<VesselId>('wardian');
  const [substrates, setSubstrates] = useState<SubstrateLayer[]>(PRESETS.rainforest.substrates);
  const [items, setItems] = useState<PlacedItem[]>(PRESETS.rainforest.items);
  const [equippedHardware, setEquippedHardware] = useState<HardwareId[]>(PRESETS.rainforest.hardware);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // Environment & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('hardware');
  const [lighting, setLighting] = useState<LightingMode>('day');
  const [isMisting, setIsMisting] = useState<boolean>(false);
  const [humidity, setHumidity] = useState<number>(76);
  const [muted, setMuted] = useState<boolean>(false);

  // Checkout / Blueprint Spec Modal State
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('assembled_local');

  // Mobile-Specific UI State
  const [mobileDrawerMinimized, setMobileDrawerMinimized] = useState<boolean>(false);
  const [showMobilePresets, setShowMobilePresets] = useState<boolean>(false);

  const currentVessel = VESSELS.find((v) => v.id === vesselId) || VESSELS[0];

  // Live Bill of Materials (BOM) Pricing Engine
  const bomSummary = useMemo(
    () =>
      calculateBomSummary(
        currentVessel,
        substrates,
        items,
        equippedHardware,
        fulfillmentType
      ),
    [currentVessel, substrates, items, equippedHardware, fulfillmentType]
  );

  // Serialized Blueprint JSON for Order / Fulfillment Engine
  const serializedBlueprint = useMemo(
    () =>
      serializeBlueprint(
        currentVessel,
        equippedHardware,
        substrates,
        items,
        fulfillmentType,
        bomSummary.total
      ),
    [currentVessel, equippedHardware, substrates, items, fulfillmentType, bomSummary.total]
  );

  // Toggle Hardware Module
  const toggleHardware = (hwId: HardwareId) => {
    sfx.playPop(1.2);
    setEquippedHardware((prev) =>
      prev.includes(hwId) ? prev.filter((id) => id !== hwId) : [...prev, hwId]
    );
  };

  // Toggle sound mute
  const toggleMute = () => {
    sfx.muted = !muted;
    setMuted(!muted);
  };

  // Trigger misting spray animation
  const triggerMist = () => {
    sfx.playMist();
    setIsMisting(true);
    setHumidity((h) => Math.min(99, h + 8));
    setTimeout(() => setIsMisting(false), 1800);
  };

  // Load a curated preset
  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    sfx.playPop(1.1);
    setVesselId(preset.vessel);
    setLighting(preset.lighting);
    setEquippedHardware(preset.hardware);
    setSubstrates(preset.substrates.map((s) => ({ ...s, uid: `${s.uid}-${Date.now()}` })));
    setItems(preset.items.map((i) => ({ ...i, uid: `${i.uid}-${Date.now()}` })));
    setSelectedUid(null);
    setShowMobilePresets(false);
  };

  // Randomize ecosystem
  const randomizeTerrarium = () => {
    sfx.playPop(1.25);
    const randomVessel = VESSELS[Math.floor(Math.random() * VESSELS.length)];
    setVesselId(randomVessel.id);

    const randomSubstrates: SubstrateLayer[] = [
      { uid: `sub-1-${Date.now()}`, type: 'gravel', depth: 25, contour: -8 },
      { uid: `sub-2-${Date.now()}`, type: 'humus', depth: 45, contour: 12 },
      { uid: `sub-3-${Date.now()}`, type: 'moss', depth: 25, contour: -6 },
    ];
    setSubstrates(randomSubstrates);

    const shuffled = [...CATALOG_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 5);
    const newItems: PlacedItem[] = shuffled.map((cat, idx) => ({
      uid: `rnd-${idx}-${Date.now()}`,
      itemId: cat.id,
      x: 130 + idx * 35 + Math.round(Math.random() * 20 - 10),
      y: 315 + Math.round(Math.random() * 30 - 15),
      scale: +(cat.defaultScale * (0.9 + Math.random() * 0.3)).toFixed(2),
      rotation: Math.round(Math.random() * 24 - 12),
      flipX: Math.random() > 0.5,
      zIndex: idx + 1,
    }));
    setItems(newItems);
    setSelectedUid(null);
    setShowMobilePresets(false);
  };

  // Add a substrate layer
  const addSubstrateLayer = (type: SubstrateId) => {
    if (substrates.length >= 6) return;
    sfx.playSand();
    setSubstrates((prev) => [
      ...prev,
      {
        uid: `sub-${Date.now()}-${Math.random()}`,
        type,
        depth: 28,
        contour: Math.round(Math.random() * 20 - 10),
      },
    ]);
  };

  // Update a substrate layer
  const updateSubstrate = (uid: string, patch: Partial<SubstrateLayer>) => {
    setSubstrates((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  };

  // Reorder substrate layer
  const moveSubstrate = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= substrates.length) return;
    sfx.playSand();
    const copy = [...substrates];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setSubstrates(copy);
  };

  // Delete substrate layer
  const removeSubstrate = (uid: string) => {
    sfx.playSand();
    setSubstrates((prev) => prev.filter((s) => s.uid !== uid));
  };

  // Calculate top surface Y of substrate stack so new items plant naturally on top
  const getTopSubstrateY = useCallback(() => {
    const totalDepth = substrates.reduce((acc, s) => acc + s.depth, 0);
    return Math.max(180, 440 - totalDepth + 12);
  }, [substrates]);

  // Add a botanical or hardscape item
  const addItem = (catItem: CatalogItem) => {
    sfx.playPop(1.0);
    const uid = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const newItem: PlacedItem = {
      uid,
      itemId: catItem.id,
      x: 200 + Math.round(Math.random() * 44 - 22),
      y: getTopSubstrateY(),
      scale: catItem.defaultScale,
      rotation: 0,
      flipX: false,
      zIndex: maxZ + 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedUid(uid);
  };

  // Update placed item properties
  const updateItem = (uid: string, patch: Partial<PlacedItem>) => {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  };

  // Duplicate selected item
  const duplicateItem = (uid: string) => {
    const orig = items.find((i) => i.uid === uid);
    if (!orig) return;
    sfx.playPop(1.15);
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const copy: PlacedItem = {
      ...orig,
      uid: `item-${Date.now()}`,
      x: Math.min(320, orig.x + 22),
      y: orig.y + 6,
      zIndex: maxZ + 1,
    };
    setItems((prev) => [...prev, copy]);
    setSelectedUid(copy.uid);
  };

  // Delete item
  const deleteItem = useCallback(
    (uid: string) => {
      sfx.playPop(0.75);
      setItems((prev) => prev.filter((i) => i.uid !== uid));
      if (selectedUid === uid) setSelectedUid(null);
    },
    [selectedUid]
  );

  // Keyboard shortcuts for selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedUid) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteItem(selectedUid);
      } else if (e.key === 'Escape') {
        setSelectedUid(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUid, deleteItem]);

  // Load a custom blueprint from the Cart Drawer back into the studio canvas
  const loadCustomBlueprint = (cartItem: CartItem) => {
    if (!cartItem.blueprint) return;
    const bp = cartItem.blueprint;
    sfx.playPop(1.2);
    setVesselId(bp.vessel.id);
    setEquippedHardware(bp.hardwareModules.map((h) => h.id));
    setFulfillmentType(bp.fulfillmentType);

    const reconstructedSubstrates: SubstrateLayer[] = bp.substrateStackBottomToTop.map((s, idx) => {
      const found = SUBSTRATES.find((sub) => sub.sku === s.sku) || SUBSTRATES[0];
      return {
        uid: `cart-sub-${idx}-${Date.now()}`,
        type: found.id,
        depth: s.depthMm,
        contour: s.slopeWave,
      };
    });
    setSubstrates(reconstructedSubstrates);

    const reconstructedItems: PlacedItem[] = bp.specimens.map((spec, idx) => {
      const foundCat = CATALOG_ITEMS.find((c) => c.sku === spec.sku) || CATALOG_ITEMS[0];
      return {
        uid: `cart-item-${idx}-${Date.now()}`,
        itemId: foundCat.id,
        x: spec.coordinates.x,
        y: spec.coordinates.y,
        scale: spec.scale,
        rotation: spec.rotationDeg,
        flipX: spec.flippedHorizontally,
        zIndex: spec.zIndex,
      };
    });
    setItems(reconstructedItems);
    setSelectedUid(null);
  };

  return (
    <div className="h-[100dvh] w-full bg-stone-950 text-stone-100 flex flex-col font-sans select-none overflow-hidden">
      <TopNavBar
        lighting={lighting}
        onSetLighting={setLighting}
        humidity={humidity}
        onTriggerMist={triggerMist}
        muted={muted}
        onToggleMute={toggleMute}
        totalPrice={bomSummary.total}
        onOpenBlueprintModal={() => {
          sfx.playPop(1.3);
          setIsBlueprintModalOpen(true);
        }}
        onLoadPreset={loadPreset}
        onRandomize={randomizeTerrarium}
        showMobilePresets={showMobilePresets}
        onToggleMobilePresets={() => setShowMobilePresets((v) => !v)}
      />

      {/* Main Workspace (Responsive Split View) */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden relative">
        <TerrariumCanvas
          currentVessel={currentVessel}
          substrates={substrates}
          items={items}
          equippedHardware={equippedHardware}
          lighting={lighting}
          isMisting={isMisting}
          selectedUid={selectedUid}
          onSelectUid={setSelectedUid}
          onUpdateItem={updateItem}
          onDuplicateItem={duplicateItem}
          onDeleteItem={deleteItem}
          bomSummary={bomSummary}
        />

        <BuilderDrawer
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileDrawerMinimized(false);
          }}
          mobileDrawerMinimized={mobileDrawerMinimized}
          onToggleMinimize={() => setMobileDrawerMinimized((m) => !m)}
          vesselId={vesselId}
          onSelectVessel={(id) => {
            sfx.playPop(0.95);
            setVesselId(id);
          }}
          substrates={substrates}
          onAddSubstrate={addSubstrateLayer}
          onUpdateSubstrate={updateSubstrate}
          onMoveSubstrate={moveSubstrate}
          onRemoveSubstrate={removeSubstrate}
          lighting={lighting}
          onAddItem={addItem}
          equippedHardware={equippedHardware}
          onToggleHardware={toggleHardware}
        />
      </div>

      <BlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        currentVessel={currentVessel}
        equippedHardware={equippedHardware}
        substrates={substrates}
        items={items}
        fulfillmentType={fulfillmentType}
        onChangeFulfillmentType={setFulfillmentType}
        bomSummary={bomSummary}
        serializedBlueprint={serializedBlueprint}
      />

      {/* Slide-over Multi-Item Cart Drawer */}
      <CartDrawer onLoadCustomBlueprintToStudio={loadCustomBlueprint} />

      {/* Embedded Stripe Checkout Modal */}
      <StripeCheckoutModal />

      {/* 5-Stage Live Workshop Assembly Tracker */}
      <OrderTrackerModal />

      {/* Guest Intercept Auth Modal */}
      <AuthModal />
    </div>
  );
}

