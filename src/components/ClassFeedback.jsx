import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { StarRating } from './ui';

// Student rates one live class (1–5 + optional note). Only the class's
// teachers can read it. Saved through submit_session_feedback; re-saving edits.
export default function ClassFeedback({ sessionId, initial, onSaved }) {
  const toast = useToast();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [note, setNote] = useState(initial?.note ?? '');
  const [editing, setEditing] = useState(!initial);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await supabase.rpc('submit_session_feedback', { p_session: sessionId, p_rating: rating, p_note: note });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('Thanks — your trainer will see this');
    setEditing(false);
    onSaved?.({ rating, note: note.trim() || null });
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <StarRating value={rating} size="w-4 h-4" />
          {note && <p className="mt-0.5 text-xs text-slate-600">{note}</p>}
        </div>
        <button type="button" onClick={() => setEditing(true)} aria-label="Edit your rating" title="Edit"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div>
      <StarRating value={rating} onChange={setRating} size="w-6 h-6" label="Rate this class" />
      {rating > 0 && (
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Anything to tell your trainer? (optional)"
            aria-label="Note for your trainer" className="input !py-2 text-sm flex-1" />
          <button type="button" onClick={save} disabled={busy} className="btn-primary !py-2 text-sm">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send
          </button>
        </div>
      )}
      <p className="mt-1 text-[11px] text-slate-400">Only your trainer sees your rating.</p>
    </div>
  );
}
