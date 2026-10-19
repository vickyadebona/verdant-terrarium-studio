import React from 'react';
import {
  Box,
  Layers,
  Flower2,
  Mountain,
  Cpu,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type {
  ActiveTab,
  CatalogItem,
  HardwareId,
  LightingMode,
  SubstrateId,
  SubstrateLayer,
  VesselId,
} from '../types/terrarium';
import { VesselsTab } from './tabs/VesselsTab';
import { SubstratesTab } from './tabs/SubstratesTab';
import { CatalogTab } from './tabs/CatalogTab';
import { HardwareTab } from './tabs/HardwareTab';

interface BuilderDrawerProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileDrawerMinimized: boolean;
  onToggleMinimize: () => void;
  vesselId: VesselId;
  onSelectVessel: (id: VesselId) => void;
  substrates: SubstrateLayer[];
  onAddSubstrate: (type: SubstrateId) => void;
  onUpdateSubstrate: (uid: string, patch: Partial<SubstrateLayer>) => void;
  onMoveSubstrate: (index: number, direction: -1 | 1) => void;
  onRemoveSubstrate: (uid: string) => void;
  lighting: LightingMode;
  onAddItem: (item: CatalogItem) => void;
  equippedHardware: HardwareId[];
  onToggleHardware: (id: HardwareId) => void;
}

const TABS: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
  { id: 'vessels', label: 'Vessels', icon: Box },
  { id: 'substrates', label: 'Soil', icon: Layers },
  { id: 'flora', label: 'Flora', icon: Flower2 },
  { id: 'hardscape', label: 'Decor', icon: Mountain },
  { id: 'hardware', label: 'Circuits', icon: Cpu },
];

export const BuilderDrawer: React.FC<BuilderDrawerProps> = ({
  activeTab,
  onSelectTab,
  mobileDrawerMinimized,
  onToggleMinimize,
  vesselId,
  onSelectVessel,
  substrates,
  onAddSubstrate,
  onUpdateSubstrate,
  onMoveSubstrate,
  onRemoveSubstrate,
  lighting,
  onAddItem,
  equippedHardware,
  onToggleHardware,
}) => {
  return (
    <aside
      className={`order-2 lg:order-1 lg:col-span-4 xl:col-span-4 border-t lg:border-t-0 lg:border-r border-stone-800/80 bg-stone-900/90 backdrop-blur-md flex flex-col shrink-0 transition-all duration-300 z-20 ${
        mobileDrawerMinimized ? 'h-12 lg:h-full' : 'h-[45dvh] sm:h-[42dvh] lg:h-full'
      }`}
    >
      {/* Category Tabs (5 Tabs including Hardware) */}
      <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-stone-950/70 border-b border-stone-800 shrink-0">
        <div className="grid grid-cols-5 gap-1 flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`py-1.5 sm:py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Minimize / Expand Sheet Button */}
        <button
          onClick={onToggleMinimize}
          className="lg:hidden p-2 rounded-lg bg-stone-800/80 text-stone-300 hover:text-white border border-stone-700/70 ml-1"
          title={mobileDrawerMinimized ? 'Expand Tray' : 'Minimize Tray'}
        >
          {mobileDrawerMinimized ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      {!mobileDrawerMinimized && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
          {activeTab === 'vessels' && (
            <VesselsTab vesselId={vesselId} onSelectVessel={onSelectVessel} />
          )}

          {activeTab === 'substrates' && (
            <SubstratesTab
              substrates={substrates}
              onAddSubstrate={onAddSubstrate}
              onUpdateSubstrate={onUpdateSubstrate}
              onMoveSubstrate={onMoveSubstrate}
              onRemoveSubstrate={onRemoveSubstrate}
            />
          )}

          {(activeTab === 'flora' || activeTab === 'hardscape') && (
            <CatalogTab
              category={activeTab}
              lighting={lighting}
              onAddItem={onAddItem}
            />
          )}

          {activeTab === 'hardware' && (
            <HardwareTab
              equippedHardware={equippedHardware}
              onToggleHardware={onToggleHardware}
            />
          )}
        </div>
      )}
    </aside>
  );
};
