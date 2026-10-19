import React from 'react';
import type { VesselId } from '../../types/terrarium';
import { VESSELS } from '../../data';

interface VesselsTabProps {
  vesselId: VesselId;
  onSelectVessel: (id: VesselId) => void;
}

export const VesselsTab: React.FC<VesselsTabProps> = ({ vesselId, onSelectVessel }) => {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-stone-400">
        Choose a glass enclosure. Prices include pre-drilled cable grommets for smart hardware lids.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {VESSELS.map((v) => {
          const selected = v.id === vesselId;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVessel(v.id)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                selected
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                  : 'bg-stone-800/40 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm">{v.name}</span>
                  <span className="text-xs font-semibold text-emerald-400">${v.price}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">{v.subtitle}</div>
              </div>
              <div className="w-9 h-11 rounded-lg bg-stone-900/90 border border-stone-700/60 flex items-center justify-center p-1 shrink-0">
                <svg viewBox="0 0 400 500" className="w-full h-full">
                  <path
                    d={v.outlinePath}
                    fill="rgba(52,211,153,0.12)"
                    stroke="#34d399"
                    strokeWidth="18"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
