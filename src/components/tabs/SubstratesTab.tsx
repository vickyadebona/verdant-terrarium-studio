import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { SubstrateId, SubstrateLayer } from '../../types/terrarium';
import { SUBSTRATES } from '../../data';

interface SubstratesTabProps {
  substrates: SubstrateLayer[];
  onAddSubstrate: (type: SubstrateId) => void;
  onUpdateSubstrate: (uid: string, patch: Partial<SubstrateLayer>) => void;
  onMoveSubstrate: (index: number, direction: -1 | 1) => void;
  onRemoveSubstrate: (uid: string) => void;
}

export const SubstratesTab: React.FC<SubstratesTabProps> = ({
  substrates,
  onAddSubstrate,
  onUpdateSubstrate,
  onMoveSubstrate,
  onRemoveSubstrate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
          Tap to Add Layer ({substrates.length}/6)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {SUBSTRATES.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onAddSubstrate(sub.id)}
              disabled={substrates.length >= 6}
              className="p-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 active:bg-stone-700 border border-stone-700/70 text-left transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                style={{
                  background: `linear-gradient(to bottom, ${sub.colorTop}, ${sub.colorBottom})`,
                }}
              />
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-200 truncate">{sub.name}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold ml-1">
                    +${sub.pricePerLayer}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 truncate">{sub.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Layer Stack */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Active Soil Stack (Top to Bottom)
        </h3>
        {[...substrates].reverse().map((layer, revIdx) => {
          const actualIdx = substrates.length - 1 - revIdx;
          const cfg = SUBSTRATES.find((s) => s.id === layer.type) || SUBSTRATES[0];
          return (
            <div
              key={layer.uid}
              className="p-2.5 sm:p-3 rounded-xl bg-stone-800/50 border border-stone-700/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: cfg.colorTop }}
                  />
                  <span className="text-xs font-medium text-stone-200">{cfg.name}</span>
                  <span className="text-[11px] text-emerald-400">${cfg.pricePerLayer}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMoveSubstrate(actualIdx, 1)}
                    disabled={actualIdx === substrates.length - 1}
                    className="p-1.5 rounded hover:bg-stone-700 text-stone-400 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveSubstrate(actualIdx, -1)}
                    disabled={actualIdx === 0}
                    className="p-1.5 rounded hover:bg-stone-700 text-stone-400 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveSubstrate(layer.uid)}
                    className="p-1.5 rounded hover:bg-rose-950 text-stone-400 hover:text-rose-400"
                    title="Remove Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Depth</span>
                    <span>{layer.depth}mm</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={85}
                    value={layer.depth}
                    onChange={(e) =>
                      onUpdateSubstrate(layer.uid, { depth: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Slope Wave</span>
                    <span>{layer.contour > 0 ? `+${layer.contour}` : layer.contour}</span>
                  </div>
                  <input
                    type="range"
                    min={-25}
                    max={25}
                    value={layer.contour}
                    onChange={(e) =>
                      onUpdateSubstrate(layer.uid, { contour: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
