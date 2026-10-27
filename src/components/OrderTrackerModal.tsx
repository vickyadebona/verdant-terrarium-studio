import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Wrench,
  Sprout,
  ShieldAlert,
  Truck,
  Check,
  ChevronRight,
  FileCode2,
  Copy,
  Download,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useDialogFocus } from '../hooks/useDialogFocus';
import type { OrderStage } from '../types/terrarium';
import { formatCentsExact } from '../catalog/money';
import { QUARANTINE_HOURS, TAX_RATE_LABEL } from '../catalog/delivery';

interface StageMeta {
  key: OrderStage;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageMeta[] = [
  {
    key: 'BLUEPRINT_RECEIVED',
    label: 'Blueprint Received',
    description: 'BOM pricing validated & serialized CAD coordinates locked.',
    icon: Clock,
  },
  {
    key: 'CIRCUIT_SOLDERING',
    label: 'Circuit Soldering',
    description: 'Our team solders the PWM circadian LED & ultrasonic piezo mist circuit.',
    icon: Wrench,
  },
  {
    key: 'PLANTING',
    label: 'Soil & Planting',
    description: 'Substrates stratified & live specimens rooted.',
    icon: Sprout,
  },
  {
    key: 'QUARANTINE',
    label: `${QUARANTINE_HOURS}-Hour Quarantine`,
    description: 'Moisture seal, fungus gnat check & springtail colony balance.',
    icon: ShieldAlert,
  },
  {
    key: 'SHIPPED',
    label: 'Dispatched & Delivered',
    description: 'Hand-delivered via climate courier or shipped in thermal insulated crate.',
    icon: Truck,
  },
];

export const OrderTrackerModal: React.FC = () => {
  const { isTrackerModalOpen, closeTrackerModal, orders, activeOrder: selectedOrder, openTrackerModal, advanceOrderStage } =
    useCart();
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const dialogRef = useDialogFocus(isTrackerModalOpen, closeTrackerModal);

  if (!isTrackerModalOpen) return null;

  // The order the shopper opened (kept current from the saved list), else the newest one
  const activeOrder =
    orders.find((order) => order.orderId === selectedOrder?.orderId) ?? orders[0] ?? null;

  if (!activeOrder) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#18392b]/40 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Workshop Assembly Tracker"
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] rounded-2xl max-w-md w-full p-6 text-center text-[#18392b] shadow-2xl">
          <p className="text-sm text-[#546358] mb-4">No active studio orders found yet.</p>
          <button
            onClick={closeTrackerModal}
            className="px-4 py-2 bg-[#18392b] hover:bg-[#11291f] text-white rounded-xl text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === activeOrder.currentStage);

  const copyOrderPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(activeOrder, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const downloadOrderJson = () => {
    const blob = new Blob([JSON.stringify(activeOrder, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terrascape-order-${activeOrder.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#18392b]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-modal-title"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl text-[#18392b]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[rgba(24,57,43,0.14)] bg-[#f0ede3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(184,194,161,0.35)] border border-[rgba(24,57,43,0.16)] flex items-center justify-center text-[#18392b]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="tracker-modal-title" className="text-base sm:text-lg font-serif font-normal text-[#18392b]">
                  Workshop Assembly Tracker
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[rgba(184,194,161,0.3)] text-[#18392b] border border-[rgba(24,57,43,0.18)]">
                  #{activeOrder.orderId}
                </span>
              </div>
              <p className="text-xs text-[#546358]">
                Live multi-stage build progress from our team&apos;s workbench
              </p>
            </div>
          </div>
          <button
            onClick={closeTrackerModal}
            aria-label="Close tracker"
            className="p-2 rounded-xl text-[#546358] hover:text-[#18392b] hover:bg-[rgba(24,57,43,0.06)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {orders.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="tracker-order-select" className="text-xs font-semibold text-[#546358]">
                Order
              </label>
              <select
                id="tracker-order-select"
                value={activeOrder.orderId}
                onChange={(event) => {
                  const next = orders.find((order) => order.orderId === event.target.value);
                  if (next) openTrackerModal(next);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(24,57,43,0.18)] text-[#18392b] text-xs font-mono"
              >
                {orders.map((order) => (
                  <option key={order.orderId} value={order.orderId}>
                    #{order.orderId} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Order Banner & Delivery ETA */}
          <div className="bg-[rgba(184,194,161,0.25)] border border-[rgba(24,57,43,0.16)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18392b]" />
                <span className="font-semibold text-[#18392b]">
                  Payment Captured &amp; Blueprint Verified via Stripe
                </span>
              </div>
              <p className="text-xs text-[#546358]">
                {activeOrder.trackingNumber ? (
                  <>
                    Tracking code: <span className="font-mono text-[#18392b] font-medium">{activeOrder.trackingNumber}</span> ({activeOrder.carrier})
                  </>
                ) : (
                  activeOrder.deliveryOptionTitle
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#546358] uppercase tracking-wider font-sans">Est. Completion</div>
              <div className="text-sm font-bold text-[#18392b] font-mono">
                {activeOrder.estimatedDeliveryDate}
              </div>
            </div>
          </div>

          {/* 5-Stage Visual Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#546358] font-sans">
                Studio Assembly Stages
              </label>
              {/* Development builds only: the studio advances real orders from the Phase 3 workbench. */}
              {process.env.NODE_ENV !== "production" && currentStageIndex < STAGES.length - 1 && (
                <button
                  onClick={() => advanceOrderStage(activeOrder.orderId)}
                  className="px-2.5 py-1 rounded-lg bg-[#f0ede3] hover:bg-[#eae5d8] text-[#18392b] text-xs border border-[rgba(24,57,43,0.18)] font-medium transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#657a4e]" />
                  <span>Simulate Next Stage (Our Team&apos;s Update)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {STAGES.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                      isCurrent
                        ? 'bg-[rgba(184,194,161,0.35)] border-[#18392b] text-[#18392b] ring-1 ring-[#18392b]'
                        : isPassed
                        ? 'bg-[#f0ede3] border-[rgba(24,57,43,0.18)] text-[#18392b]'
                        : 'bg-[#f8f5ee] border-[rgba(24,57,43,0.1)] text-[#546358]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isCurrent
                            ? 'bg-[#18392b] text-white font-bold'
                            : isPassed
                            ? 'bg-[rgba(184,194,161,0.5)] text-[#18392b] font-medium border border-[rgba(24,57,43,0.18)]'
                            : 'bg-[#f0ede3] text-[#546358] border border-[rgba(24,57,43,0.12)]'
                        }`}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <Icon
                        className={`w-4 h-4 ${
                          isCurrent ? 'text-[#18392b]' : isPassed ? 'text-[#657a4e]' : 'text-[#546358]/50'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-tight mb-1">{step.label}</div>
                      <div className="text-[10px] text-[#546358] line-clamp-2 leading-relaxed">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Workshop Technician Activity Log */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#546358] block font-sans">
              Workbench Activity Log
            </label>
            <div className="space-y-2.5 bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] rounded-xl p-4 max-h-52 overflow-y-auto">
              {activeOrder.stageHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-b border-[rgba(24,57,43,0.1)] pb-2.5 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-[#18392b] mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#18392b]">{entry.title}</span>
                      <span className="text-[10px] font-mono text-[#546358]">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#546358] leading-relaxed text-[11px]">{entry.notes}</p>
                    <p className="text-[10px] text-[#657a4e] font-mono">Logged by: {entry.technician}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & Blueprint Payload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#546358] block mb-1 font-sans">
                Delivery &amp; Customer Specs
              </span>
              <div className="text-xs text-[#18392b] space-y-1">
                <div>
                  <span className="text-[#546358]">Recipient:</span> {activeOrder.customerName}
                </div>
                <div>
                  <span className="text-[#546358]">Email:</span> {activeOrder.customerEmail}
                </div>
                {activeOrder.shippingAddress.street && (
                  <div>
                    <span className="text-[#546358]">Address:</span> {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zip}
                  </div>
                )}
                <div>
                  <span className="text-[#546358]">Fulfillment:</span> {activeOrder.deliveryOptionTitle}
                </div>
                {activeOrder.deliveryNotes && (
                  <div className="pt-1 text-[11px] text-[#546358] italic">
                    &ldquo;{activeOrder.deliveryNotes}&rdquo;
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f0ede3] border border-[rgba(24,57,43,0.14)] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#546358] block mb-1 font-sans">
                Payment &amp; BOM Summary
              </span>
              <div className="text-xs text-[#18392b] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#546358]">Items Subtotal:</span>
                  <span className="font-mono">{formatCentsExact(activeOrder.subtotalCents)}</span>
                </div>
                {!!activeOrder.assemblyCents && (
                  <div className="flex justify-between">
                    <span className="text-[#546358]">Studio Assembly:</span>
                    <span className="font-mono">{formatCentsExact(activeOrder.assemblyCents)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#546358]">Delivery:</span>
                  <span className="font-mono">
                    {activeOrder.shippingCents === 0
                      ? 'Complimentary ($0)'
                      : formatCentsExact(activeOrder.shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#546358]">Sales Tax (CA {TAX_RATE_LABEL}):</span>
                  <span className="font-mono">{formatCentsExact(activeOrder.taxCents)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#18392b] pt-1 border-t border-[rgba(24,57,43,0.14)]">
                  <span>Total Paid (Stripe):</span>
                  <span className="font-mono">{formatCentsExact(activeOrder.totalCents)} USD</span>
                </div>
                <div className="text-[10px] text-[#546358] font-mono pt-0.5">
                  Method: {activeOrder.paymentMethodDetails.brand} (•••• {activeOrder.paymentMethodDetails.last4})
                </div>
              </div>
            </div>
          </div>

          {/* Raw order and blueprint data for our team when fulfilling orders. Development builds
              only; customers never see it. It moves to the team's /admin page with the backend. */}
          {process.env.NODE_ENV !== "production" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowRawJson((prev) => !prev)}
                className="text-xs font-mono uppercase text-[#546358] hover:text-[#18392b] flex items-center gap-1 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#657a4e]" />
                <span>{showRawJson ? 'Hide Raw Stripe & Blueprint JSON' : 'Inspect Raw Stripe & Blueprint JSON'}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyOrderPayload}
                  className="px-2.5 py-1 rounded bg-[#f0ede3] hover:bg-[#eae5d8] border border-[rgba(24,57,43,0.14)] text-xs text-[#18392b] flex items-center gap-1 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-[#18392b]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPayload ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={downloadOrderJson}
                  className="px-2.5 py-1 rounded bg-[#f0ede3] hover:bg-[#eae5d8] border border-[rgba(24,57,43,0.14)] text-xs text-[#18392b] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
            {showRawJson && (
              <pre className="bg-[#18392b] border border-[rgba(24,57,43,0.2)] text-[#b8c2a1] rounded-xl p-3 text-[10px] font-mono max-h-44 overflow-y-auto">
                {JSON.stringify(activeOrder, null, 2)}
              </pre>
            )}
          </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#f0ede3] border-t border-[rgba(24,57,43,0.14)] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#546358]">
            {orders.length > 1 && (
              <span>
                Viewing order 1 of {orders.length} in local history.
              </span>
            )}
          </div>
          <button
            onClick={closeTrackerModal}
            className="px-5 py-2.5 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-medium text-xs sm:text-sm transition cursor-pointer shadow-sm"
          >
            Done / Return to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
