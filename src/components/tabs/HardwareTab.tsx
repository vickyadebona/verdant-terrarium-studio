import React from 'react';
import { Wrench, Check } from 'lucide-react';
import type { HardwareId } from '../../types/terrarium';
import { HARDWARE_MODULES } from '../../data';

interface HardwareTabProps {
  equippedHardware: HardwareId[];
  onToggleHardware: (id: HardwareId) => void;
}

export const HardwareTab: React.FC<HardwareTabProps> = ({
  equippedHardware,
  onToggleHardware,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <Wrench className="w-4 h-4" />
          <span>Integrated Smart Vivarium Lid (Standard)</span>
        </div>
        <p className="text-[11px] text-stone-300 mt-1">
          Every TerraScape vessel arrives with our custom circadian LED ring, whisper-quiet ventilation fan, and ultrasonic misting manifold pre-soldered and calibrated into the lid ($0).
        </p>
      </div>

      <div className="space-y-2.5">
        {HARDWARE_MODULES.map((hw) => {
          const isStandard = hw.price === 0;
          const isEquipped = isStandard || equippedHardware.includes(hw.id);
          return (
            <div
              key={hw.id}
              onClick={() => {
                if (!isStandard) {
                  onToggleHardware(hw.id);
                }
              }}
              className={`p-3 rounded-xl border transition ${
                isStandard
                  ? 'bg-emerald-950/40 border-emerald-500/50 cursor-default'
                  : isEquipped
                    ? 'bg-emerald-950/50 border-emerald-500/70 shadow-sm cursor-pointer'
                    : 'bg-stone-800/40 border-stone-800 hover:border-stone-700 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-stone-100">
                      {hw.name}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {isStandard ? 'Included' : `+$${hw.price}`}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-amber-300/90 mt-0.5">{hw.specs}</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                    isEquipped
                      ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                      : 'border-stone-600 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">{hw.description}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800/80">
                <span>SKU: {hw.sku}</span>
                <span>Power: {hw.powerDraw}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
