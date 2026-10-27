import React from 'react';
import { ASSEMBLY_FEE_CENTS } from '../catalog';
import { formatCents } from '../catalog/money';
import {
  DELIVERY_OPTIONS,
  SHIPPING_OPTIONS,
  deliveryFeeLabel,
  leadTimeLabel,
  type ShippingOption,
} from '../catalog/delivery';

interface DeliveryOptionPickerProps {
  /** Radio group name; must be unique on the page. */
  name: string;
  value: ShippingOption;
  onChange: (option: ShippingOption) => void;
  subtotalCents: number;
  /** Number of custom Studio builds in the greenhouse, for the assembly fee note. */
  customBuildCount: number;
}

/** The one delivery choice for an order, shared by the cart drawer and the checkout. */
export const DeliveryOptionPicker: React.FC<DeliveryOptionPickerProps> = ({
  name,
  value,
  onChange,
  subtotalCents,
  customBuildCount,
}) => (
  <fieldset className="space-y-2">
    <legend className="text-xs font-semibold uppercase tracking-wider text-[#546358] mb-2 font-sans">
      Delivery for this order
    </legend>
    {SHIPPING_OPTIONS.map((option) => {
      const spec = DELIVERY_OPTIONS[option];
      const id = `${name}-${option}`;
      const selected = value === option;
      return (
        <label
          key={option}
          htmlFor={id}
          className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition text-xs ${
            selected
              ? 'bg-[rgba(184,194,161,0.25)] border-[#18392b] ring-1 ring-[#18392b]'
              : 'bg-white border-[rgba(24,57,43,0.16)] hover:border-[rgba(24,57,43,0.3)]'
          }`}
        >
          <input
            id={id}
            type="radio"
            name={name}
            value={option}
            checked={selected}
            onChange={() => onChange(option)}
            className="mt-0.5 accent-[#18392b]"
          />
          <span className="flex-1 min-w-0">
            <span className="flex items-baseline justify-between gap-2 font-semibold text-[#18392b]">
              <span>{spec.title}</span>
              <span className="shrink-0">{deliveryFeeLabel(option, subtotalCents)}</span>
            </span>
            <span className="block text-[#546358] mt-0.5 leading-relaxed">
              {spec.summary} {leadTimeLabel(option)}.
              {spec.assembled && customBuildCount > 0 && (
                <> Studio assembly adds {formatCents(ASSEMBLY_FEE_CENTS)} per custom build.</>
              )}
            </span>
          </span>
        </label>
      );
    })}
  </fieldset>
);
