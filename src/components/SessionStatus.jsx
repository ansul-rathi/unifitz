import { Check } from 'lucide-react';
import { STAGES, stageKey, stageIndex, stageMeta } from '../lib/sessionStatus';

// Compact current-stage pill.
export function SessionStatusPill({ session, className = '' }) {
  const m = stageMeta(stageKey(session));
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${m.tone} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} /> {m.label}
    </span>
  );
}

// Lifecycle checklist: Created → Scheduled → Live → Ended → Recording… → Ready.
export function SessionStatusSteps({ session }) {
  const idx = stageIndex(session);
  return (
    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
      {STAGES.map((st, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <span key={st.key} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${done || current ? 'text-slate-700' : 'text-slate-300'}`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              current ? 'bg-brand-500 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              {done && <Check className="w-2.5 h-2.5" />}
            </span>
            {st.label}
          </span>
        );
      })}
    </div>
  );
}
