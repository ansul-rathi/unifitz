import { useEffect, useState } from 'react';
import { X, Loader2, MessageSquarePlus, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmtDateTime } from '../lib/datetime';
import { Avatar, StarRating } from './ui';

// Staff attendance sheet for one session — shared by the series Schedule and
// live classes. Live classes add per-student remarks (shown to that student),
// a session summary (sessions.description, shown to the class) and, for the
// class's own teachers, the students' private ratings.
export default function AttendanceSheet({ session, onClose, onSaved, withRemarks = false, showFeedback = false }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [remarks, setRemarks] = useState({});        // user_id → remark text
  const [openRemarks, setOpenRemarks] = useState(new Set());
  const [summary, setSummary] = useState(session.description ?? '');
  const [feedback, setFeedback] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: enr }, { data: existing }, { data: parts }, { data: fb }] = await Promise.all([
        // Names + avatars only — no student contact details exposed to teachers.
        supabase.rpc('series_roster', { p_challenge: session.challenge_id }),
        supabase.from('attendance').select('user_id, attended, remark').eq('session_id', session.id),
        supabase.from('session_participants').select('*').eq('session_id', session.id).is('user_id', null),
        showFeedback
          ? supabase.from('session_feedback').select('user_id, rating, note').eq('session_id', session.id)
          : Promise.resolve({ data: [] }),
      ]);
      setRoster(enr ?? []);
      setMarked(new Set((existing ?? []).filter(a => a.attended).map(a => a.user_id)));
      setRemarks(Object.fromEntries((existing ?? []).filter(a => a.remark).map(a => [a.user_id, a.remark])));
      setUnmatched(parts ?? []);
      setFeedback(fb ?? []);
      setLoading(false);
    })();
  }, [session.id, session.challenge_id, showFeedback]);

  const toggle = (set, id) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  // Reconcile a Zoom participant that couldn't auto-match to a Unifitz user.
  // Audit trail: record who matched and when (matched_by / matched_at).
  async function reconcile(participantId, userId) {
    if (!userId) return;
    const { error } = await supabase.from('session_participants')
      .update({ user_id: userId, matched_by: profile.id, matched_at: new Date().toISOString() })
      .eq('id', participantId);
    if (error) return toast(error.message, 'error');
    setUnmatched(u => u.filter(p => p.id !== participantId));
    toast('Participant matched — re-runs at next meeting.ended, or mark manually here');
  }

  async function save() {
    setBusy(true);
    const rows = roster.map(r => ({
      session_id: session.id,
      user_id: r.user_id,
      attended: marked.has(r.user_id),
      marked_by: profile.id,
      source: 'manual',
      ...(withRemarks ? { remark: remarks[r.user_id]?.trim() || null } : {}),
    }));
    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'session_id,user_id' });
    if (!error && withRemarks && summary.trim() !== (session.description ?? '')) {
      const res = await supabase.from('sessions').update({ description: summary.trim() || null }).eq('id', session.id);
      if (res.error) { setBusy(false); return toast(res.error.message, 'error'); }
    }
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast(`Attendance saved — ${marked.size}/${roster.length} present`);
    onSaved?.();
    onClose();
  }

  const nameOf = id => roster.find(r => r.user_id === id)?.full_name ?? 'Former student';
  const avg = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[85vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Attendance — Day {session.day_number}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">{session.title}{session.scheduled_at && <> · {fmtDateTime(session.scheduled_at)}</>}</p>

        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : (
          <>
            {roster.length === 0 && <p className="mt-4 text-sm text-slate-500">No students in this class yet.</p>}
            <ul className="mt-4 space-y-1.5">
              {roster.map(r => {
                const showRemark = withRemarks && (openRemarks.has(r.user_id) || remarks[r.user_id]);
                return (
                  <li key={r.user_id} className="rounded-xl hover:bg-slate-50 transition-colors duration-150">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marked.has(r.user_id)}
                          onChange={() => setMarked(m => toggle(m, r.user_id))}
                          className="w-5 h-5 accent-brand-500"
                        />
                        <Avatar name={r.full_name} url={r.avatar_url} size="w-8 h-8" />
                        <span className="text-sm font-semibold truncate">{r.full_name}</span>
                      </label>
                      {withRemarks && !showRemark && (
                        <button type="button" onClick={() => setOpenRemarks(s => toggle(s, r.user_id))}
                          title="Add a remark for this student" aria-label={`Add a remark for ${r.full_name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white">
                          <MessageSquarePlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {showRemark && (
                      <div className="px-3 pb-2.5">
                        <input
                          autoFocus={!remarks[r.user_id]}
                          value={remarks[r.user_id] ?? ''}
                          onChange={e => setRemarks(x => ({ ...x, [r.user_id]: e.target.value }))}
                          placeholder="e.g. Work a bit on squat form"
                          aria-label={`Remark for ${r.full_name}`}
                          className="input !py-2 text-sm"
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {withRemarks && (
              <div className="mt-4">
                <label className="label" htmlFor="session-summary">Session summary <span className="font-normal text-slate-400">(optional, visible to the class)</span></label>
                <textarea id="session-summary" rows="2" className="input text-sm" value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="e.g. Strength day — squats, lunges, core" />
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={onClose} disabled={busy} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={busy || !roster.length} className="btn-primary flex-1">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save ({marked.size}/{roster.length} present)
              </button>
            </div>

            {showFeedback && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Student feedback
                  {feedback.length > 0 && <span className="font-semibold text-slate-500">· {avg.toFixed(1)} avg ({feedback.length})</span>}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Only you can see this.</p>
                {feedback.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No ratings yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {feedback.map(f => (
                      <li key={f.user_id} className="rounded-xl border border-slate-100 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold truncate">{nameOf(f.user_id)}</span>
                          <StarRating value={f.rating} size="w-3.5 h-3.5" />
                        </div>
                        {f.note && <p className="mt-1 text-xs text-slate-600">{f.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Unmatched Zoom participants — reconcile to a Unifitz member */}
            {unmatched.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-sm text-amber-700">Unmatched Zoom participants ({unmatched.length})</h4>
                <p className="text-xs text-slate-500 mt-0.5">These joined without a matching email. Assign each to a member.</p>
                <ul className="mt-3 space-y-2">
                  {unmatched.map(p => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className="flex-1 text-sm truncate">
                        {p.zoom_participant_name || p.zoom_participant_email || 'Unknown'}
                      </span>
                      <select
                        defaultValue=""
                        onChange={e => reconcile(p.id, e.target.value)}
                        className="input !py-1.5 !px-2 text-xs w-40"
                        aria-label="Assign participant to member"
                      >
                        <option value="">Assign to…</option>
                        {roster.map(r => (
                          <option key={r.user_id} value={r.user_id}>{r.full_name}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
