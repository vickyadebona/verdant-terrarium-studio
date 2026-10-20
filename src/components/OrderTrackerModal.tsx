import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Wrench,
  Cpu,
  Layers,
  ThermometerSnowflake,
  Truck,
  Copy,
  Check,
  Download,
  FileCode2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { OrderStage } from '../types/terrarium';

const STAGES: Array<{
  key: OrderStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    key: 'BLUEPRINT_RECEIVED',
    label: 'Blueprint Queued',
    icon: FileCode2,
    description: 'BOM and coordinate specs validated. Assembly tray assigned in studio.',
  },
  {
    key: 'CIRCUIT_SOLDERING',
    label: 'Circuits Soldered',
    icon: Cpu,
    description: 'Andrew soldering PWM circadian LED ring and ultrasonic piezo misting manifold.',
  },
  {
    key: 'PLANTING',
    label: 'Planted & Contoured',
    icon: Layers,
    description: 'Substrates graded to wave slope; live specimens anchored and rooted.',
  },
  {
    key: 'QUARANTINE',
    label: '72h Micro-Climate',
    icon: ThermometerSnowflake,
    description: 'Closed-loop humidity cycling and circadian light acclimation test.',
  },
  {
    key: 'SHIPPED',
    label: 'Shipped / Ready',
    icon: Truck,
    description: 'Crated in insulated shock-proof packaging with temperature pack.',
  },
];

export const OrderTrackerModal: React.FC = () => {
  const { isTrackerModalOpen, closeTrackerModal, activeOrder, orders, advanceOrderStage } = useCart();
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isTrackerModalOpen || !activeOrder) return null;

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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-semibold text-stone-100">
                  Workshop Assembly Tracker
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  #{activeOrder.orderId}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Live multi-stage build progress from Andrew&apos;s workbench
              </p>
            </div>
          </div>
          <button
            onClick={closeTrackerModal}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Order Banner & Delivery ETA */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-200">
                  Payment Captured &amp; Blueprint Verified via Stripe
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Tracking code: <span className="font-mono text-emerald-200">{activeOrder.trackingNumber}</span> ({activeOrder.carrier})
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">Est. Completion</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">
                {activeOrder.estimatedDeliveryDate}
              </div>
            </div>
          </div>

          {/* 5-Stage Visual Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Studio Assembly Stages
              </label>
              {currentStageIndex < STAGES.length - 1 && (
                <button
                  onClick={() => advanceOrderStage(activeOrder.orderId)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 text-xs border border-emerald-700/60 font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Simulate Next Stage (Andrew&apos;s Update)</span>
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
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                        : isPassed
                        ? 'bg-stone-900/90 border-emerald-900/60 text-stone-300'
                        : 'bg-stone-950/40 border-stone-800 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isCurrent
                            ? 'bg-emerald-500 text-stone-950 font-bold animate-pulse'
                            : isPassed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-stone-900 text-stone-600 border border-stone-800'
                        }`}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <Icon
                        className={`w-4 h-4 ${
                          isCurrent ? 'text-emerald-400' : isPassed ? 'text-emerald-500/80' : 'text-stone-700'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-tight mb-1">{step.label}</div>
                      <div className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
              Workbench Activity Log
            </label>
            <div className="space-y-2.5 bg-stone-950/80 border border-stone-800 rounded-xl p-4 max-h-52 overflow-y-auto">
              {activeOrder.stageHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-b border-stone-800/60 pb-2.5 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-200">{entry.title}</span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-400 leading-relaxed text-[11px]">{entry.notes}</p>
                    <p className="text-[10px] text-emerald-400/80 font-mono">Logged by: {entry.technician}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & Blueprint Payload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                Delivery &amp; Customer Specs
              </span>
              <div className="text-xs text-stone-300 space-y-1">
                <div>
                  <span className="text-stone-500">Recipient:</span> {activeOrder.customerName}
                </div>
                <div>
                  <span className="text-stone-500">Email:</span> {activeOrder.customerEmail}
                </div>
                <div>
                  <span className="text-stone-500">Address:</span> {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zip}
                </div>
                <div>
                  <span className="text-stone-500">Fulfillment:</span> {activeOrder.deliveryOptionTitle}
                </div>
                {activeOrder.deliveryNotes && (
                  <div className="pt-1 text-[11px] text-stone-400 italic">
                    &ldquo;{activeOrder.deliveryNotes}&rdquo;
                  </div>
                )}
              </div>
            </div>

            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                Payment &amp; BOM Summary
              </span>
              <div className="text-xs text-stone-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Items Subtotal:</span>
                  <span className="font-mono">${activeOrder.subtotal}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping &amp; Delivery:</span>
                  <span className="font-mono">
                    {activeOrder.shippingFee === 0 ? 'Complimentary ($0)' : `$${activeOrder.shippingFee}.00`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Sales Tax (CA 9.5%):</span>
                  <span className="font-mono">${activeOrder.taxAmount}.00</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-300 pt-1 border-t border-stone-800">
                  <span>Total Paid (Stripe):</span>
                  <span className="font-mono">${activeOrder.total}.00 USD</span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono pt-0.5">
                  Method: {activeOrder.paymentMethodDetails.brand} (•••• {activeOrder.paymentMethodDetails.last4})
                </div>
              </div>
            </div>
          </div>

          {/* Serialized JSON Blueprint Export */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowRawJson((prev) => !prev)}
                className="text-xs font-mono uppercase text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showRawJson ? 'Hide Raw Stripe & Blueprint JSON' : 'Inspect Raw Stripe & Blueprint JSON'}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyOrderPayload}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPayload ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={downloadOrderJson}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
            {showRawJson && (
              <pre className="bg-black/90 border border-stone-800 rounded-xl p-3 text-[10px] font-mono text-emerald-300/90 max-h-44 overflow-y-auto">
                {JSON.stringify(activeOrder, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-400">
            {orders.length > 1 && (
              <span>
                Viewing order 1 of {orders.length} in local history.
              </span>
            )}
          </div>
          <button
            onClick={closeTrackerModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Done / Return to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
