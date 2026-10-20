import React, { useState } from 'react';
import {
  FileCode2,
  X,
  Wrench,
  Truck,
  Check,
  Copy,
  Download,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import type {
  BomSummary,
  FulfillmentType,
  HardwareId,
  PlacedItem,
  SerializedBlueprint,
  SubstrateLayer,
  VesselConfig,
} from '../types/terrarium';
import { CATALOG_ITEMS, HARDWARE_MODULES, SUBSTRATES } from '../data';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVessel: VesselConfig;
  equippedHardware: HardwareId[];
  substrates: SubstrateLayer[];
  items: PlacedItem[];
  fulfillmentType: FulfillmentType;
  onChangeFulfillmentType: (type: FulfillmentType) => void;
  bomSummary: BomSummary;
  serializedBlueprint: SerializedBlueprint;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({
  isOpen,
  onClose,
  currentVessel,
  equippedHardware,
  substrates,
  items,
  fulfillmentType,
  onChangeFulfillmentType,
  bomSummary,
  serializedBlueprint,
}) => {
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const { addCustomBlueprint, openCheckoutModal } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  if (!isOpen) return null;

  const copyBlueprintToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(serializedBlueprint, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const downloadBlueprintJson = () => {
    const blob = new Blob([JSON.stringify(serializedBlueprint, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terrascape-blueprint-${currentVessel.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCart = () => {
    addCustomBlueprint({
      blueprint: serializedBlueprint,
      name: currentVessel.name,
      vesselId: currentVessel.id,
      price: bomSummary.total,
      fulfillmentType,
      hardwareIds: equippedHardware,
      botanicalCount: items.length,
      substrateCount: substrates.length,
    });
    onClose();
  };

  const handleInstantCheckout = () => {
    const executeCheckout = () => {
      addCustomBlueprint({
        blueprint: serializedBlueprint,
        name: currentVessel.name,
        vesselId: currentVessel.id,
        price: bomSummary.total,
        fulfillmentType,
        hardwareIds: equippedHardware,
        botanicalCount: items.length,
        substrateCount: substrates.length,
      });
      onClose();
      openCheckoutModal();
    };

    if (!isAuthenticated) {
      openAuthModal({
        title: 'Save Blueprint Before Checkout',
        message:
          'Every TerraScape is an individually serialized living ecosystem. Please sign in or create an account so Andrew can link your coordinate blueprint to your workshop build tray.',
        onAuthenticated: executeCheckout,
      });
      return;
    }

    executeCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-stone-100 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              Custom Terrarium Blueprint &amp; BOM Quote
            </h2>
            <p className="text-xs text-stone-400">
              Serialized build recipe ready for Andrew&apos;s workshop &amp; Stripe Checkout
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Fulfillment Mode Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">
              Select Fulfillment &amp; Assembly Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onChangeFulfillmentType('assembled_local')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  fulfillmentType === 'assembled_local'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" /> Fully Planted &amp; Soldered
                  </span>
                  <span>+$25</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Hand-planted &amp; wired in our SoCal studio. Local pickup or courier delivery.
                </p>
              </button>

              <button
                onClick={() => onChangeFulfillmentType('diy_kit_shipped')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  fulfillmentType === 'diy_kit_shipped'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-400" /> Nationwide DIY Kit + Smart Lid
                  </span>
                  <span>$0 Fee</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Pre-soldered hardware lid + individually packaged plants, substrates &amp; printed build guide.
                </p>
              </button>
            </div>
          </div>

          {/* Itemized Bill of Materials */}
          <div className="rounded-xl bg-stone-950/80 border border-stone-800 p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <div>
                <span className="font-semibold text-stone-200">{currentVessel.name}</span>
                <span className="ml-2 text-xs font-mono text-stone-400">
                  ({currentVessel.sku})
                </span>
              </div>
              <span className="font-semibold">${bomSummary.vesselCost}</span>
            </div>

            {/* Hardware List */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                Smart Hardware &amp; Circuits ({equippedHardware.length})
              </div>
              {equippedHardware.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  No active circuits selected (passive glass enclosure)
                </p>
              ) : (
                equippedHardware.map((id) => {
                  const hw = HARDWARE_MODULES.find((h) => h.id === id)!;
                  return (
                    <div key={id} className="flex justify-between text-xs py-0.5 text-stone-300">
                      <span>
                        • {hw.name} <span className="font-mono text-stone-500">[{hw.sku}]</span>
                      </span>
                      <span>${hw.price}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Substrate List */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Substrate Layers ({substrates.length})
              </div>
              {substrates.map((s, i) => {
                const cfg = SUBSTRATES.find((sub) => sub.id === s.type)!;
                return (
                  <div key={s.uid} className="flex justify-between text-xs py-0.5 text-stone-300">
                    <span>
                      Layer {i + 1}: {cfg.name} ({s.depth}mm depth, slope {s.contour})
                    </span>
                    <span>${cfg.pricePerLayer}</span>
                  </div>
                );
              })}
            </div>

            {/* Flora & Hardscape List */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Botanicals &amp; Hardscape ({items.length})
              </div>
              {items.map((item) => {
                const cat = CATALOG_ITEMS.find((c) => c.id === item.itemId)!;
                return (
                  <div key={item.uid} className="flex justify-between text-xs py-0.5 text-stone-300">
                    <span>
                      • {cat.name} @ (x:{item.x}, y:{item.y}, scale:{item.scale}x)
                    </span>
                    <span>${cat.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-800 pt-3 flex justify-between items-center text-base font-bold text-emerald-300">
              <span>Estimated Build Total</span>
              <span>${bomSummary.total}.00 USD</span>
            </div>
          </div>

          {/* Developer JSON Blueprint Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase text-stone-400">
                Serialized Order Payload (PostgreSQL / Stripe Metadata)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyBlueprintToClipboard}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedJson ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedJson ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  onClick={downloadBlueprintJson}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .json
                </button>
              </div>
            </div>
            <pre className="bg-black/70 border border-stone-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300/90 max-h-40 overflow-y-auto">
              {JSON.stringify(serializedBlueprint, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Stripe checkout with live workshop tracking</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm border border-stone-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Add to Build Tray</span>
            </button>
            <button
              onClick={handleInstantCheckout}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Checkout (${bomSummary.total})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

