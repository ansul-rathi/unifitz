// Professional dropdown (Headless UI Listbox) — replaces native <select>.
// Accessible, keyboard-navigable, animated, styled to the app.
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

// options: array of { value, label } OR plain strings.
export default function Select({ value, onChange, options, placeholder = 'Select…', className = '', buttonClassName = '' }) {
  const opts = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  const current = opts.find(o => o.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        <ListboxButton
          className={`relative w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${buttonClassName}`}
        >
          <span className={`block truncate ${current ? 'text-slate-900' : 'text-slate-400'}`}>{current?.label ?? placeholder}</span>
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className="z-[70] w-[var(--button-width)] mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl focus:outline-none origin-top transition duration-150 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
        >
          {opts.map(o => (
            <ListboxOption
              key={o.value}
              value={o.value}
              className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 cursor-pointer data-[focus]:bg-brand-50 data-[focus]:text-brand-700 data-[selected]:text-brand-700"
            >
              <span className="truncate">{o.label}</span>
              <Check className="w-4 h-4 opacity-0 group-data-[selected]:opacity-100 text-brand-600" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
