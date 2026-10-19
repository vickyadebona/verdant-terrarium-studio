import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  X,
} from 'lucide-react';
import type { PlacedItem } from '../types/terrarium';
import { CATALOG_ITEMS } from '../data';

interface ItemInspectorToolbarProps {
  selectedItem: PlacedItem;
  onUpdateItem: (uid: string, patch: Partial<PlacedItem>) => void;
  onDuplicateItem: (uid: string) => void;
  onDeleteItem: (uid: string) => void;
  onDeselect: () => void;
}

export const ItemInspectorToolbar: React.FC<ItemInspectorToolbarProps> = ({
  selectedItem,
  onUpdateItem,
  onDuplicateItem,
  onDeleteItem,
  onDeselect,
}) => {
  const catalogName = CATALOG_ITEMS.find((c) => c.id === selectedItem.itemId)?.name;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-2 sm:top-4 z-30 max-w-[94vw] overflow-x-auto flex items-center gap-1 bg-stone-900/95 backdrop-blur-md border border-stone-700/90 px-2.5 py-1.5 rounded-2xl shadow-2xl"
    >
      <span className="text-[11px] sm:text-xs font-medium text-emerald-300 pr-2 border-r border-stone-700 whitespace-nowrap">
        {catalogName}
      </span>

      <button
        onClick={() =>
          onUpdateItem(selectedItem.uid, {
            scale: Math.min(2.2, +(selectedItem.scale + 0.12).toFixed(2)),
          })
        }
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Scale Up"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() =>
          onUpdateItem(selectedItem.uid, {
            scale: Math.max(0.45, +(selectedItem.scale - 0.12).toFixed(2)),
          })
        }
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Scale Down"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          onUpdateItem(selectedItem.uid, { rotation: selectedItem.rotation - 12 })
        }
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Rotate Left"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={() =>
          onUpdateItem(selectedItem.uid, { rotation: selectedItem.rotation + 12 })
        }
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Rotate Right"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdateItem(selectedItem.uid, { flipX: !selectedItem.flipX })}
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Flip Horizontally"
      >
        <FlipHorizontal className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdateItem(selectedItem.uid, { zIndex: selectedItem.zIndex + 1 })}
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Bring Forward"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={() =>
          onUpdateItem(selectedItem.uid, { zIndex: Math.max(1, selectedItem.zIndex - 1) })
        }
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Send Backward"
      >
        <ArrowDown className="w-4 h-4" />
      </button>

      <button
        onClick={() => onDuplicateItem(selectedItem.uid)}
        className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        onClick={() => onDeleteItem(selectedItem.uid)}
        className="p-2 rounded-lg hover:bg-rose-950 active:bg-rose-900 text-rose-400 shrink-0"
        title="Delete Specimen"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <button
        onClick={onDeselect}
        className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 shrink-0"
        title="Deselect"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
