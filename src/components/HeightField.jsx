// Height input with cm ⇄ ft/in toggle. Always stores/returns centimetres.
import { useState, useEffect } from 'react';

function cmToFtIn(cm) {
  if (!cm) return { ft: '', inch: '' };
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return { ft: String(ft), inch: String(inch) };
}

export default function HeightField({ valueCm, onChange, id = 'height' }) {
  const [unit, setUnit] = useState('cm');
  const [ftIn, setFtIn] = useState(cmToFtIn(valueCm));

  // Keep ft/in display in sync when switching to ft or when cm changes externally.
  useEffect(() => { if (unit === 'ft') setFtIn(cmToFtIn(valueCm)); /* eslint-disable-next-line */ }, [unit]);

  function setFt(ft, inch) {
    setFtIn({ ft, inch });
    const f = Number(ft) || 0, i = Number(inch) || 0;
    onChange(f || i ? Math.round((f * 12 + i) * 2.54) : '');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label !mb-0" htmlFor={id}>Height</label>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
          {['cm', 'ft'].map(u => (
            <button key={u} type="button" onClick={() => setUnit(u)}
              className={`px-2.5 py-1 rounded-md transition-colors duration-150 ${unit === u ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
              {u === 'cm' ? 'cm' : 'ft/in'}
            </button>
          ))}
        </div>
      </div>
      {unit === 'cm' ? (
        <input id={id} type="number" min="100" max="230" className="input" placeholder="162"
          value={valueCm ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input type="number" min="3" max="7" className="input pr-9" placeholder="5"
              value={ftIn.ft} onChange={e => setFt(e.target.value, ftIn.inch)} aria-label="Feet" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ft</span>
          </div>
          <div className="relative">
            <input type="number" min="0" max="11" className="input pr-9" placeholder="4"
              value={ftIn.inch} onChange={e => setFt(ftIn.ft, e.target.value)} aria-label="Inches" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">in</span>
          </div>
        </div>
      )}
    </div>
  );
}
