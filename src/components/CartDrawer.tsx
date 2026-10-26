import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
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
import { ACCESSORY_PRODUCTS, ARRIVAL_GUARANTEE_DAYS } from '../catalog';
import { formatCents, formatCentsExact } from '../catalog/money';
import { TAX_RATE_LABEL } from '../catalog/delivery';
import { quoteOrder } from '../utils/stripeCheckoutEngine';
import { DeliveryOptionPicker } from './DeliveryOptionPicker';

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
    shippingOption,
    setShippingOption,
    itemCount,
    openCheckoutModal,
    addStandardItem,
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

  const copperLeds = ACCESSORY_PRODUCTS.copperMicroLeds;
  const handleAddCopperLeds = () => {
    addStandardItem({
      type: 'hardware',
      name: copperLeds.name,
      sku: copperLeds.sku,
      description: 'IP67 coated copper wire · Warm 2200K firefly glow',
    });
  };

  // Same pricing function and delivery choice the checkout uses.
  const estimate = quoteOrder(items, shippingOption);
  const customBuildCount = items
    .filter((item) => item.type === 'custom_blueprint')
    .reduce((sum, item) => sum + item.quantity, 0);

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
                  Keep browsing
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                role="group"
                aria-label={item.name}
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
                      {formatCents(item.unitPriceCents * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-[#546358]">
                        {formatCents(item.unitPriceCents)} ea
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Blueprint Specs */}
                {item.type === 'custom_blueprint' && (
                  <div className="space-y-2.5 pt-2 border-t border-[rgba(24,57,43,0.12)]">
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

          {items.length > 0 && (
            <div className="rounded-xl bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] p-3.5">
              <DeliveryOptionPicker
                name="cart-delivery"
                value={shippingOption}
                onChange={setShippingOption}
                subtotalCents={estimate.subtotalCents}
                customBuildCount={customBuildCount}
              />
            </div>
          )}

          {/* Quick-Add Accessories Bar */}
          {items.length > 0 && (
            <div className="rounded-xl bg-[rgba(184,194,161,0.18)] border border-[rgba(24,57,43,0.16)] p-3.5 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#18392b] block">
                Quick-Add Vivarium Accessories:
              </span>
              <div className="text-xs">
                <button
                  onClick={handleAddCopperLeds}
                  className="w-full p-2.5 rounded-lg bg-white hover:bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] text-left transition cursor-pointer shadow-2xs"
                >
                  <div className="font-semibold text-[#18392b] truncate">Copper Micro-LEDs</div>
                  <div className="text-[11px] text-[#546358] mt-0.5">
                    +{formatCents(copperLeds.priceCents)} · Firefly Ambient
                  </div>
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
                <span className="font-sans text-[#18392b] font-bold">
                  {formatCentsExact(estimate.subtotalCents)}
                </span>
              </div>
              {estimate.assemblyCents > 0 && (
                <div className="flex justify-between">
                  <span>Studio assembly ({customBuildCount} {customBuildCount === 1 ? 'build' : 'builds'})</span>
                  <span className="font-sans text-[#18392b] font-semibold">
                    {formatCentsExact(estimate.assemblyCents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-sans text-[#18392b]">
                  {estimate.shippingCents === 0 ? (
                    <span className="text-[#18392b] font-semibold bg-[rgba(184,194,161,0.35)] px-2 py-0.5 rounded text-[11px]">
                      Complimentary ($0)
                    </span>
                  ) : (
                    formatCentsExact(estimate.shippingCents)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (CA {TAX_RATE_LABEL})</span>
                <span className="font-sans text-[#18392b] font-semibold">
                  {formatCentsExact(estimate.taxCents)}
                </span>
              </div>
              <div className="border-t border-[rgba(24,57,43,0.14)] pt-2.5 flex justify-between items-baseline font-serif text-[#18392b]">
                <span className="text-base font-normal">Estimated Total</span>
                <span className="text-2xl font-normal font-serif">
                  {formatCentsExact(estimate.totalCents)} USD
                </span>
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
              <span>{ARRIVAL_GUARANTEE_DAYS}-Day Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
