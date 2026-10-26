import React, { useState } from 'react';
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { INSTALLMENT_COUNT } from '../catalog';
import { formatCentsExact } from '../catalog/money';
import { TAX_RATE_LABEL } from '../catalog/delivery';
import { createStripeOrder, quoteOrder } from '../utils/stripeCheckoutEngine';
import { DeliveryOptionPicker } from './DeliveryOptionPicker';

export const StripeCheckoutModal: React.FC = () => {
  const { items, isCheckoutModalOpen, closeCheckoutModal, saveOrder, shippingOption, setShippingOption } =
    useCart();
  const { user } = useAuth();


  // Customer & Shipping Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  React.useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Card & Payment Method State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  // Processing & Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isCheckoutModalOpen) return null;

  const quote = quoteOrder(items, shippingOption);
  const customBuildCount = items
    .filter((item) => item.type === 'custom_blueprint')
    .reduce((sum, item) => sum + item.quantity, 0);
  const total = formatCentsExact(quote.totalCents);
  const installmentAmount = formatCentsExact(Math.ceil(quote.totalCents / INSTALLMENT_COUNT));
  const canPay = quote.valid && !isProcessing;
  const checkoutProblem = !quote.valid
    ? items.length === 0
      ? 'Your jar is empty. Add a design or an edition before checking out.'
      : `Some items in your jar are no longer available (${quote.unknownSkus.join(', ')}). Remove them to continue.`
    : paymentError;

  const cardDigits = cardNumber.replace(/\D/g, '');

  // Returns what the shopper still has to fill in before we can take payment.
  const missingDetails = (walletType?: string): string[] => {
    const missing: string[] = [];
    if (!fullName.trim()) missing.push('full name');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) missing.push('email address');
    if (shippingOption !== 'pickup') {
      if (!street.trim()) missing.push('street address');
      if (!city.trim()) missing.push('city');
      if (!state.trim()) missing.push('state');
      if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) missing.push('ZIP code');
    }
    if (!walletType) {
      if (cardDigits.length < 13 || cardDigits.length > 19) missing.push('card number');
      if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(cardExpiry.trim())) missing.push('card expiry (MM/YY)');
      if (!/^\d{3,4}$/.test(cardCvc.trim())) missing.push('CVC');
    }
    return missing;
  };

  // Development builds only: fills Stripe's published test card.
  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardBrand('Visa Test');
  };

  const handleProcessPayment = (walletType?: string) => {
    if (!quote.valid) return;
    const missing = missingDetails(walletType);
    if (missing.length > 0) {
      setPaymentError(`Please add your ${missing.join(', ')}.`);
      return;
    }
    setPaymentError(null);
    setIsProcessing(true);
    setProcessingStatus(walletType ? `Authenticating ${walletType}...` : 'Encrypting payment payload with Stripe...');

    setTimeout(() => {
      setProcessingStatus('Validating Blueprint Bill-of-Materials on server...');
    }, 700);

    setTimeout(() => {
      setProcessingStatus(`Authorizing ${total} with bank...`);
    }, 1400);

    setTimeout(() => {
      setProcessingStatus('Locking Serialized Blueprint & Queuing with Our Team...');
    }, 2000);

    setTimeout(() => {
      try {
        const { order } = createStripeOrder({
          items,
          customer: { name: fullName, email, phone },
          shipping: {
            street,
            city,
            state,
            zip,
            shippingOption,
            deliveryNotes,
          },
          paymentMethod: {
            brand: walletType ? walletType : cardBrand || 'Card',
            last4: walletType ? walletType : cardDigits.slice(-4),
            wallet: walletType,
          },
        });
        saveOrder(order);
      } catch (err) {
        setPaymentError(err instanceof Error ? err.message : 'Payment could not be completed.');
      } finally {
        setIsProcessing(false);
      }
    }, 2700);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#18392b]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl text-[#18392b]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[rgba(24,57,43,0.14)] bg-[#f0ede3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(184,194,161,0.35)] border border-[rgba(24,57,43,0.16)] flex items-center justify-center text-[#18392b]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-base sm:text-lg font-serif font-normal text-[#18392b] flex items-center gap-2">
                Stripe Embedded Checkout
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-[rgba(184,194,161,0.3)] text-[#18392b] border border-[rgba(24,57,43,0.18)]">
                  TLS 1.3 256-bit
                </span>
              </h2>
              <p className="text-xs text-[#546358]">
                Direct in-app payment with zero external redirect
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckoutModal}
            disabled={isProcessing}
            aria-label="Close checkout"
            className="p-2 rounded-xl text-[#546358] hover:text-[#18392b] hover:bg-[rgba(24,57,43,0.06)] transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Express Checkout Wallets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#546358] mb-2 font-sans">
              Express 1-Click Checkout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleProcessPayment('Apple Pay')}
                disabled={!canPay}
                className="py-2.5 px-4 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-medium flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Apple Pay</span>
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment('Google Pay')}
                disabled={!canPay}
                className="py-2.5 px-4 rounded-xl bg-[#f0ede3] hover:bg-[#eae5d8] text-[#18392b] font-medium border border-[rgba(24,57,43,0.18)] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#657a4e]" />
                <span>Google Pay</span>
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment('Stripe Link')}
                disabled={!canPay}
                className="py-2.5 px-4 rounded-xl bg-[rgba(184,194,161,0.3)] hover:bg-[rgba(184,194,161,0.5)] text-[#18392b] font-medium border border-[rgba(24,57,43,0.2)] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-[#657a4e]" />
                <span>Stripe Link</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-[rgba(24,57,43,0.14)] flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-[#546358] font-mono">
              Or Pay with Card &amp; Delivery Details
            </span>
            <div className="h-px bg-[rgba(24,57,43,0.14)] flex-1" />
          </div>

          {/* One delivery choice for the whole order, shared with the cart */}
          <DeliveryOptionPicker
            name="checkout-delivery"
            value={shippingOption}
            onChange={setShippingOption}
            subtotalCents={quote.subtotalCents}
            customBuildCount={customBuildCount}
          />

          {/* Customer & Address Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#546358] font-sans">
                Customer &amp; Shipping Address
              </label>
              {user && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(184,194,161,0.3)] text-[#18392b] border border-[rgba(24,57,43,0.16)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#657a4e]" />
                  <span>Authenticated as {user.email}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="checkout-name" className="text-[11px] text-[#546358] block mb-1">Full Name</label>
                <input
                  id="checkout-name"
                  autoComplete="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
              <div>
                <label htmlFor="checkout-email" className="text-[11px] text-[#546358] block mb-1">Email Address (Order Tracking)</label>
                <input
                  id="checkout-email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-street" className="text-[11px] text-[#546358] block mb-1">Street Address</label>
                <input
                  id="checkout-street"
                  autoComplete="street-address"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
              <div>
                <label htmlFor="checkout-phone" className="text-[11px] text-[#546358] block mb-1">Phone Number</label>
                <input
                  id="checkout-phone"
                  autoComplete="tel"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="checkout-city" className="text-[11px] text-[#546358] block mb-1">City</label>
                <input
                  id="checkout-city"
                  autoComplete="address-level2"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
              <div>
                <label htmlFor="checkout-state" className="text-[11px] text-[#546358] block mb-1">State</label>
                <input
                  id="checkout-state"
                  autoComplete="address-level1"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
              <div>
                <label htmlFor="checkout-zip" className="text-[11px] text-[#546358] block mb-1">ZIP Code</label>
                <input
                  id="checkout-zip"
                  autoComplete="postal-code"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout-notes" className="text-[11px] text-[#546358] block mb-1">
                Workshop Assembly Notes / Delivery Gate Codes
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Please place taller fern on the right; call upon arrival"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(24,57,43,0.18)] focus:border-[#18392b] text-[#18392b] outline-none text-xs"
              />
            </div>
          </div>

          {/* Embedded Stripe Payment Element Simulation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#546358] flex items-center gap-1.5 font-sans">
                <CreditCard className="w-4 h-4 text-[#657a4e]" />
                Stripe Payment Element (Card &amp; BNPL)
              </label>
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="text-[11px] text-[#18392b] font-medium hover:underline cursor-pointer"
                >
                  Auto-fill Stripe 4242 Test Card
                </button>
              )}
            </div>

            <div className="bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] rounded-xl p-4 space-y-3">
              <div>
                <label htmlFor="checkout-card-number" className="text-[11px] text-[#546358] block mb-1">Card Number</label>
                <div className="relative">
                  <input
                    id="checkout-card-number"
                    autoComplete="cc-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 1234 1234 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-white border border-[rgba(24,57,43,0.18)] text-[#18392b] font-mono text-xs outline-none focus:border-[#18392b]"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-bold text-[#657a4e]">
                    {cardBrand}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-card-expiry" className="text-[11px] text-[#546358] block mb-1">Expires (MM/YY)</label>
                  <input
                    id="checkout-card-expiry"
                    autoComplete="cc-exp"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[rgba(24,57,43,0.18)] text-[#18392b] font-mono text-xs outline-none focus:border-[#18392b]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-card-cvc" className="text-[11px] text-[#546358] block mb-1">CVC</label>
                  <input
                    id="checkout-card-cvc"
                    autoComplete="cc-csc"
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[rgba(24,57,43,0.18)] text-[#18392b] font-mono text-xs outline-none focus:border-[#18392b]"
                  />
                </div>
              </div>

              {/* BNPL Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-[rgba(24,57,43,0.14)] text-[11px] text-[#546358]">
                <span className="flex items-center gap-1 text-[#18392b] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#657a4e]" />
                  Klarna / Affirm Eligible: {INSTALLMENT_COUNT} interest-free payments of {installmentAmount}
                </span>
                <span className="text-[#546358]">0% APR</span>
              </div>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-[#18392b] pb-1 border-b border-[rgba(24,57,43,0.14)] flex justify-between">
              <span>Order Summary ({items.length} unique builds/items)</span>
              <span>Subtotal</span>
            </div>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-[#546358]">
                <span className="truncate pr-2">
                  {i.quantity}x {i.name}
                </span>
                <span className="font-mono text-[#18392b] font-medium">
                  {formatCentsExact(i.unitPriceCents * i.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-[rgba(24,57,43,0.14)] pt-2 space-y-1 text-[#546358]">
              {quote.assemblyCents > 0 && (
                <div className="flex justify-between">
                  <span>Studio assembly ({customBuildCount} {customBuildCount === 1 ? 'build' : 'builds'})</span>
                  <span className="font-mono text-[#18392b] font-medium">
                    {formatCentsExact(quote.assemblyCents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-mono text-[#18392b] font-medium">
                  {quote.shippingCents === 0
                    ? 'Complimentary ($0)'
                    : formatCentsExact(quote.shippingCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (CA {TAX_RATE_LABEL})</span>
                <span className="font-mono text-[#18392b] font-medium">
                  {formatCentsExact(quote.taxCents)}
                </span>
              </div>
              <div className="border-t border-[rgba(24,57,43,0.14)] pt-2 flex justify-between text-base font-bold text-[#18392b] font-serif">
                <span>Total Authorized</span>
                <span>{total} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Submit Button */}
        <div className="px-5 py-4 bg-[#f0ede3] border-t border-[rgba(24,57,43,0.14)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {checkoutProblem ? (
            <p role="alert" className="text-xs font-semibold text-[#18392b]">
              {checkoutProblem}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#546358]">
              <Info className="w-4 h-4 text-[#657a4e] shrink-0" />
              <span>
                Orders route directly to our team&apos;s workbench &amp; transition to the Live Assembly Tracker.
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleProcessPayment()}
            disabled={!canPay}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingStatus}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize &amp; Pay {total}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
