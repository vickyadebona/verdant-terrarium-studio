import React, { useState } from 'react';
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  Truck,
  Wrench,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createStripeOrder, validateCartPricing } from '../utils/stripeCheckoutEngine';
import type { FulfillmentType } from '../types/terrarium';

export const StripeCheckoutModal: React.FC = () => {
  const { items, isCheckoutModalOpen, closeCheckoutModal, saveOrder } = useCart();
  const { user } = useAuth();

  const [deliveryMethod, setDeliveryMethod] = useState<FulfillmentType>('assembled_local');
  const [shippingOption, setShippingOption] = useState<'pickup' | 'courier' | 'shippo_ground'>('courier');

  // Customer & Shipping Form State
  const [fullName, setFullName] = useState(user?.name || 'Vicky Adebona');
  const [email, setEmail] = useState(user?.email || 'vicky@verdantstudio.com');

  React.useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  const [phone, setPhone] = useState('(310) 555-0199');
  const [street, setStreet] = useState('1420 Abbot Kinney Blvd');
  const [city, setCity] = useState('Venice');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('90291');
  const [deliveryNotes, setDeliveryNotes] = useState('Please leave by the courtyard gate. Ready for Andrew\'s assembly notes.');

  // Card & Payment Method State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('314');
  const [cardBrand, setCardBrand] = useState('Visa');

  // Processing & Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  if (!isCheckoutModalOpen) return null;

  // Compute pricing
  const validation = validateCartPricing(items, deliveryMethod);
  const actualShippingFee =
    shippingOption === 'pickup'
      ? 0
      : deliveryMethod === 'assembled_local'
      ? 18
      : validation.subtotal >= 150
      ? 0
      : 18;

  const actualTax = Math.round((validation.subtotal + actualShippingFee) * 0.095);
  const total = validation.subtotal + actualShippingFee + actualTax;
  const installmentAmount = (total / 4).toFixed(2);

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardBrand('Visa Test');
  };

  const handleProcessPayment = (walletType?: string) => {
    setIsProcessing(true);
    setProcessingStatus(walletType ? `Authenticating ${walletType}...` : 'Encrypting payment payload with Stripe...');

    setTimeout(() => {
      setProcessingStatus('Validating Blueprint Bill-of-Materials on server...');
    }, 700);

    setTimeout(() => {
      setProcessingStatus('Authorizing $ ' + total + '.00 with bank...');
    }, 1400);

    setTimeout(() => {
      setProcessingStatus('Locking Serialized Blueprint & Queuing in Andrew\'s Studio...');
    }, 2000);

    setTimeout(() => {
      const { order } = createStripeOrder({
        items,
        customer: { name: fullName, email, phone },
        shipping: {
          street,
          city,
          state,
          zip,
          deliveryMethod,
          deliveryOptionTitle:
            shippingOption === 'pickup'
              ? 'SoCal Studio Pickup (Complimentary)'
              : deliveryMethod === 'assembled_local'
              ? 'SoCal Climate Courier'
              : 'Nationwide Thermal Ground (Shippo)',
          deliveryNotes,
        },
        shippingFeeOverride: actualShippingFee,
        paymentMethod: {
          brand: walletType ? walletType : cardBrand,
          last4: walletType ? 'ApplePay' : cardNumber.slice(-4) || '4242',
          wallet: walletType,
        },
      });

      setIsProcessing(false);
      saveOrder(order);
    }, 2700);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-stone-100 flex items-center gap-2">
                Stripe Embedded Checkout
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  TLS 1.3 256-bit
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Direct in-app payment with zero external redirect
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckoutModal}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Express Checkout Wallets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Express 1-Click Checkout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleProcessPayment('Apple Pay')}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-black hover:bg-stone-950 text-white font-medium border border-stone-700 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-inner"
              >
                <Smartphone className="w-4 h-4" />
                <span>Apple Pay</span>
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment('Google Pay')}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium border border-stone-600 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Google Pay</span>
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment('Stripe Link')}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-medium border border-emerald-700/80 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Stripe Link</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-stone-800 flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
              Or Pay with Card &amp; Delivery Details
            </span>
            <div className="h-px bg-stone-800 flex-1" />
          </div>

          {/* Delivery & Assembly Options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              Fulfillment &amp; Studio Delivery
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod('assembled_local');
                  setShippingOption('courier');
                }}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  deliveryMethod === 'assembled_local'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'bg-stone-800/40 border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" /> Planted &amp; Soldered
                  </span>
                  <span className="text-xs bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                    Hand-Delivered
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                  Soldered &amp; planted in our SoCal studio. Available for local courier delivery or studio pickup.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod('diy_kit_shipped');
                  setShippingOption('shippo_ground');
                }}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  deliveryMethod === 'diy_kit_shipped'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'bg-stone-800/40 border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-400" /> Nationwide DIY Kit
                  </span>
                  <span className="text-xs bg-sky-950 px-2 py-0.5 rounded text-sky-300">
                    {validation.subtotal >= 150 ? 'Free Shipping' : '$18 Fee'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                  Pre-wired smart lid + individually insulated plants, substrates, and printed assembly diagram.
                </p>
              </button>
            </div>

            {/* Sub-option if assembled_local: Courier vs Studio Pickup */}
            {deliveryMethod === 'assembled_local' && (
              <div className="flex items-center gap-4 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 text-xs">
                <span className="text-stone-400">Select Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-200">
                  <input
                    type="radio"
                    name="shippingOption"
                    checked={shippingOption === 'courier'}
                    onChange={() => setShippingOption('courier')}
                    className="accent-emerald-500"
                  />
                  <span>SoCal Studio Courier (+$18)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-200">
                  <input
                    type="radio"
                    name="shippingOption"
                    checked={shippingOption === 'pickup'}
                    onChange={() => setShippingOption('pickup')}
                    className="accent-emerald-500"
                  />
                  <span>Studio Pickup (Free · Venice, CA)</span>
                </label>
              </div>
            )}
          </div>

          {/* Customer & Address Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                Customer &amp; Shipping Address
              </label>
              {user && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Authenticated as {user.email}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Email Address (Order Tracking)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <span className="text-[11px] text-stone-400 block mb-1">Street Address</span>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Phone Number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">State</span>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">ZIP Code</span>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block mb-1">
                Workshop Assembly Notes / Delivery Gate Codes
              </span>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Please place taller fern on the right; call upon arrival"
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-emerald-500 text-stone-100 outline-none text-xs"
              />
            </div>
          </div>

          {/* Embedded Stripe Payment Element Simulation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Stripe Payment Element (Card &amp; BNPL)
              </label>
              <button
                type="button"
                onClick={fillTestCard}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Auto-fill Stripe 4242 Test Card
              </button>
            </div>

            <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Card Number</span>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-stone-900 border border-stone-700/80 text-stone-100 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-bold text-emerald-400">
                    {cardBrand}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Expires (MM/YY)</span>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/80 text-stone-100 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">CVC</span>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/80 text-stone-100 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* BNPL Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-[11px] text-stone-400">
                <span className="flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Klarna / Affirm Eligible: 4 interest-free payments of ${installmentAmount}
                </span>
                <span className="text-stone-500">0% APR</span>
              </div>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-stone-300 pb-1 border-b border-stone-800 flex justify-between">
              <span>Order Summary ({items.length} unique builds/items)</span>
              <span>Subtotal</span>
            </div>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-stone-400">
                <span className="truncate pr-2">
                  {i.quantity}x {i.name}
                </span>
                <span className="font-mono text-stone-200">${i.price * i.quantity}.00</span>
              </div>
            ))}
            <div className="border-t border-stone-800 pt-2 space-y-1 text-stone-400">
              <div className="flex justify-between">
                <span>Shipping &amp; Fulfillment</span>
                <span className="font-mono text-stone-200">
                  {actualShippingFee === 0 ? 'Complimentary ($0)' : `$${actualShippingFee}.00`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (CA 9.5%)</span>
                <span className="font-mono text-stone-200">${actualTax}.00</span>
              </div>
              <div className="border-t border-stone-800 pt-2 flex justify-between text-base font-bold text-emerald-300">
                <span>Total Authorized</span>
                <span>${total}.00 USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Submit Button */}
        <div className="px-5 py-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Orders route directly to Andrew&apos;s workbench &amp; transition to the Live Assembly Tracker.
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleProcessPayment()}
            disabled={isProcessing}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>{processingStatus}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize &amp; Pay ${total}.00</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
