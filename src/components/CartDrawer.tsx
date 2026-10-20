import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Wrench,
  Truck,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../types/terrarium';
import { HARDWARE_MODULES, PRESETS, VESSELS } from '../data';

interface CartDrawerProps {
  onLoadCustomBlueprintToStudio?: (item: CartItem) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onLoadCustomBlueprintToStudio }) => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    updateItemFulfillment,
    subtotal,
    itemCount,
    openCheckoutModal,
    addStandardItem,
    addCustomBlueprint,
  } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [expandedBlueprintId, setExpandedBlueprintId] = useState<string | null>(null);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal({
        title: 'Sign In to Finalize Order',
        message:
          'Every TerraScape is an individually serialized living ecosystem. An account is required to link your custom terrarium blueprints, track your 5-stage workshop assembly, and securely process payment.',
        onAuthenticated: () => {
          openCheckoutModal();
        },
      });
      return;
    }
    openCheckoutModal();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const toggleExpandBlueprint = (id: string) => {
    setExpandedBlueprintId((prev) => (prev === id ? null : id));
  };

  const handleAddQuickHardware = (hwId: string) => {
    const hw = HARDWARE_MODULES.find((h) => h.id === hwId);
    if (!hw) return;
    addStandardItem({
      type: 'hardware',
      name: hw.name,
      sku: hw.sku,
      price: hw.price,
      description: hw.specs,
    });
  };

  const handleAddSignaturePreset = () => {
    const preset = PRESETS.rainforest;
    const vessel = VESSELS.find((v) => v.id === preset.vessel) || VESSELS[0];
    const unitPrice =
      vessel.price +
      preset.hardware.reduce((sum, hId) => {
        const h = HARDWARE_MODULES.find((m) => m.id === hId);
        return sum + (h ? h.price : 0);
      }, 0) +
      preset.substrates.length * 7 +
      preset.items.length * 12 +
      25; // assembled fee

    addCustomBlueprint({
      blueprint: {
        blueprintVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        fulfillmentType: 'assembled_local',
        estimatedTotalUSD: unitPrice,
        vessel: {
          id: vessel.id,
          sku: vessel.sku,
          name: vessel.name,
          price: vessel.price,
        },
        hardwareModules: preset.hardware.map((hId) => {
          const h = HARDWARE_MODULES.find((m) => m.id === hId)!;
          return { id: h.id, sku: h.sku, name: h.name, price: h.price };
        }),
        substrateStackBottomToTop: preset.substrates.map((s, idx) => ({
          layerOrder: idx + 1,
          sku: `SUB-${s.type.toUpperCase()}`,
          name: s.type,
          depthMm: s.depth,
          slopeWave: s.contour,
          price: 7,
        })),
        specimens: preset.items.map((i) => ({
          sku: `BOT-${i.itemId.toUpperCase()}`,
          name: i.itemId,
          coordinates: { x: i.x, y: i.y },
          scale: i.scale,
          rotationDeg: i.rotation,
          flippedHorizontally: i.flipX,
          zIndex: i.zIndex,
          price: 12,
        })),
      },
      name: "Andrew's Rainforest Wardian Case (Signature 1-of-1)",
      vesselId: vessel.id,
      price: unitPrice,
      fulfillmentType: 'assembled_local',
      hardwareIds: preset.hardware,
      botanicalCount: preset.items.length,
      substrateCount: preset.substrates.length,
    });
  };

  // Estimated shipping preview
  const estimatedShipping = subtotal >= 150 ? 0 : 18;
  const estimatedTax = Math.round(subtotal * 0.095);
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#18392b]/40 backdrop-blur-sm flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Your Jar · Studio Cart"
    >
      {/* Background click listener */}
      <div className="absolute inset-0 cursor-pointer" onClick={closeCart} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-[#f8f5ee] border-l border-[rgba(24,57,43,0.14)] text-[#18392b] flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(24,57,43,0.14)] flex items-center justify-between shrink-0 bg-[#f0ede3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(184,194,161,0.35)] border border-[rgba(24,57,43,0.16)] flex items-center justify-center text-[#18392b]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-normal font-serif text-[#18392b] flex items-center gap-2.5">
                Your Jar
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(184,194,161,0.3)] text-[#18392b] text-xs border border-[rgba(24,57,43,0.18)] font-sans font-semibold">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </h2>
              <p className="text-xs text-[#546358] mt-0.5">
                Custom terrarium compositions &amp; integrated climate vessels
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-[#546358] hover:text-[#18392b] border border-[rgba(24,57,43,0.14)] transition cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] flex items-center justify-center text-[#657a4e]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-normal font-serif text-[#18392b]">Your jar is currently empty</h3>
                <p className="text-xs text-[#546358] max-w-sm mx-auto leading-relaxed">
                  Design a miniature living world in our Studio, or begin with one of our curated studio editions.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-medium text-xs transition cursor-pointer shadow-xs"
                >
                  Return to Studio
                </button>
                <button
                  onClick={handleAddSignaturePreset}
                  className="px-5 py-2.5 rounded-xl bg-[#f0ede3] hover:bg-[#e6e2d6] text-[#18392b] text-xs border border-[rgba(24,57,43,0.2)] font-medium transition cursor-pointer"
                >
                  Load Signature 1-of-1 Build
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] p-4 sm:p-5 space-y-3.5 transition hover:border-[rgba(24,57,43,0.28)]"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(24,57,43,0.15)] flex items-center justify-center text-[#18392b] shrink-0 shadow-xs">
                      {item.type === 'custom_blueprint' ? (
                        <Sparkles className="w-4 h-4 text-[#657a4e]" />
                      ) : item.type === 'hardware' ? (
                        <Cpu className="w-4 h-4 text-[#18392b]" />
                      ) : (
                        <Layers className="w-4 h-4 text-[#b96d4b]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-normal font-serif text-[#18392b] truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 text-[#546358] border border-[rgba(24,57,43,0.15)]">
                          {item.sku}
                        </span>
                      </div>
                      <p className="text-xs text-[#546358] mt-0.5 line-clamp-1">
                        {item.description || 'Custom TerraScape composition specification'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-[#18392b]">
                      ${item.price * item.quantity}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-[#546358]">${item.price} ea</div>
                    )}
                  </div>
                </div>

                {/* Custom Blueprint Badges & Fulfillment Selector */}
                {item.type === 'custom_blueprint' && (
                  <div className="space-y-2.5 pt-2 border-t border-[rgba(24,57,43,0.12)]">
                    {/* Fulfillment Toggle */}
                    <div className="flex items-center justify-between text-xs gap-2 bg-[#f8f5ee] p-2.5 rounded-lg border border-[rgba(24,57,43,0.14)]">
                      <span className="text-[#546358] flex items-center gap-1.5 shrink-0 font-medium">
                        {item.fulfillmentType === 'assembled_local' ? (
                          <Wrench className="w-3.5 h-3.5 text-[#18392b]" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-[#657a4e]" />
                        )}
                        Fulfillment:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateItemFulfillment(
                              item.id,
                              item.fulfillmentType === 'assembled_local'
                                ? 'diy_kit_shipped'
                                : 'assembled_local'
                            )
                          }
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-[#f0ede3] text-[#18392b] border border-[rgba(24,57,43,0.2)] transition cursor-pointer"
                        >
                          {item.fulfillmentType === 'assembled_local'
                            ? 'Planted & Soldered (+$25)'
                            : 'Nationwide DIY Kit ($0)'}
                          <span className="ml-1 text-[#657a4e] underline">Change</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Blueprint JSON & Re-load Actions */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <button
                        onClick={() => toggleExpandBlueprint(item.id)}
                        className="text-[#546358] hover:text-[#18392b] flex items-center gap-1 transition cursor-pointer font-medium"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-[#18392b]" />
                        <span>{expandedBlueprintId === item.id ? 'Hide Specs' : 'View Blueprint Specs'}</span>
                        {expandedBlueprintId === item.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {onLoadCustomBlueprintToStudio && (
                        <button
                          onClick={() => {
                            onLoadCustomBlueprintToStudio(item);
                            closeCart();
                          }}
                          className="text-[#18392b] hover:text-[#11291f] font-semibold text-xs transition cursor-pointer underline"
                        >
                          Edit in Studio ↗
                        </button>
                      )}
                    </div>

                    {/* Collapsible Blueprint Code View */}
                    {expandedBlueprintId === item.id && item.blueprint && (
                      <pre className="bg-[#18392b] text-[#f8f5ee] border border-[#11291f] rounded-lg p-3 text-[10px] font-mono max-h-36 overflow-y-auto leading-relaxed">
                        {JSON.stringify(item.blueprint, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(24,57,43,0.12)] text-xs">
                  <div className="flex items-center gap-2 bg-white border border-[rgba(24,57,43,0.2)] rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded hover:bg-[#f0ede3] text-[#546358] hover:text-[#18392b] transition cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-semibold text-[#18392b] text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded hover:bg-[#f0ede3] text-[#546358] hover:text-[#18392b] transition cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-[#b96d4b] hover:bg-[#b96d4b]/10 rounded-md transition cursor-pointer flex items-center gap-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Quick-Add Accessories Bar */}
          {items.length > 0 && (
            <div className="rounded-xl bg-[rgba(184,194,161,0.18)] border border-[rgba(24,57,43,0.16)] p-3.5 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#18392b] block">
                Quick-Add Vivarium Accessories:
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <button
                  onClick={() => handleAddQuickHardware('copper_fairy')}
                  className="p-2.5 rounded-lg bg-white hover:bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] text-left transition cursor-pointer shadow-2xs"
                >
                  <div className="font-semibold text-[#18392b] truncate">Copper Micro-LEDs</div>
                  <div className="text-[11px] text-[#657a4e] mt-0.5">+$18 · Firefly Ambient</div>
                </button>
                <button
                  onClick={() => handleAddQuickHardware('hygro_controller')}
                  className="p-2.5 rounded-lg bg-white hover:bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] text-left transition cursor-pointer shadow-2xs"
                >
                  <div className="font-semibold text-[#18392b] truncate">Micro Fan &amp; Sensor</div>
                  <div className="text-[11px] text-[#657a4e] mt-0.5">Included ($0) · Standard</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[rgba(24,57,43,0.14)] bg-[#f0ede3] space-y-3.5 shrink-0">
            <div className="space-y-1.5 text-xs text-[#546358]">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className="font-sans text-[#18392b] font-bold">${subtotal}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-sans text-[#18392b]">
                  {estimatedShipping === 0 ? (
                    <span className="text-[#18392b] font-semibold bg-[rgba(184,194,161,0.35)] px-2 py-0.5 rounded text-[11px]">
                      Complimentary ($0)
                    </span>
                  ) : (
                    `$${estimatedShipping}.00`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (CA 9.5%)</span>
                <span className="font-sans text-[#18392b] font-semibold">${estimatedTax}.00</span>
              </div>
              <div className="border-t border-[rgba(24,57,43,0.14)] pt-2.5 flex justify-between items-baseline font-serif text-[#18392b]">
                <span className="text-base font-normal">Estimated Total</span>
                <span className="text-2xl font-normal font-serif">${estimatedTotal}.00 USD</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer tracking-wide"
            >
              <Lock className="w-4 h-4 opacity-80" />
              <span>Proceed to Stripe Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-[#546358] flex items-center justify-center gap-2">
              <span>Secure 256-bit Checkout</span>
              <span>•</span>
              <span>Apple Pay</span>
              <span>•</span>
              <span>Google Pay</span>
              <span>•</span>
              <span>30-Day Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
