import React from 'react';
import { Plus } from 'lucide-react';
import type { CatalogItem, ItemCategory, LightingMode } from '../../types/terrarium';
import { CATALOG_ITEMS } from '../../data';

interface CatalogTabProps {
  category: ItemCategory;
  lighting: LightingMode;
  onAddItem: (item: CatalogItem) => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({ category, lighting, onAddItem }) => {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-stone-400">
        Tap any specimen to plant it, then drag it inside the glass vessel.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
        {CATALOG_ITEMS.filter((item) => item.category === category).map((catItem) => (
          <button
            key={catItem.id}
            onClick={() => onAddItem(catItem)}
            className="group p-2.5 rounded-xl bg-stone-800/40 hover:bg-stone-800/90 active:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 transition flex flex-col items-center text-center cursor-pointer relative"
          >
            <span className="absolute top-1.5 left-2 text-[10px] font-semibold text-emerald-400">
              ${catItem.price}
            </span>
            {catItem.bioluminescent && (
              <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                Glows
              </span>
            )}
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mt-2">
              <svg viewBox="-50 -70 100 85" className="w-full h-full overflow-visible">
                {catItem.renderSvg(lighting === 'night')}
              </svg>
            </div>
            <div className="text-xs font-medium text-stone-200 group-hover:text-emerald-300 transition mt-0.5 line-clamp-1">
              {catItem.name}
            </div>
            <div className="text-[10px] italic text-stone-400 line-clamp-1">{catItem.latin}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <Plus className="w-3 h-3" /> Plant
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
