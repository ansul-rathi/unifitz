import { useCallback, useEffect, useState } from 'react';
import { Users, Pause, Play, UserMinus, Phone, Loader2, AlertTriangle, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Card, Avatar, EmptyState } from './ui';
import { fmtDateTime, fmtDate } from '../lib/datetime';

const expired = m => m.expires_at && new Date(m.expires_at) < new Date();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Enrolled-member panel for a series, shared by the admin + teacher detail pages.
// Members come from the series_members() SECURITY DEFINER RPC (phone is admin-only).
// Admins can pause / resume / remove; teachers see a read-only roster.
const STATUS_TONE = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  removed: 'bg-slate-200 text-slate-500',
};

export default function SeriesMembers({ challengeId, isAdmin, onChanged }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('live');
  const [busyId, setBusyId] = useState(null);
  const [failed, setFailed] = useState(false);

  // The RPC has returned intermittent 502s under load (audit U-44): retry
  // transient failures with backoff, and on a final failure keep the last good
  // list and say so — never show a misleading "No members yet".
  const load = useCallback(async () => {
    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await sleep(600 * 2 ** (attempt - 1));
      res = await supabase.rpc('series_members', { p_challenge: challengeId });
      if (!res.error) break;
      if (res.error.code && /^(42|22|PGRST2)/.test(res.error.code)) break;   // permission/bad input: don't retry
    }
    setLoading(false);
    if (res.error) { setFailed(true); return; }
    setFailed(false);
    setRows(res.data ?? []);
  }, [challengeId]);
  useEffect(() => { load(); }, [load]);

  async function setStatus(m, status, msg) {
    setBusyId(m.user_id);
    const { error } = await supabase.from('enrollments')
      .update({ status, status_changed_at: new Date().toISOString() })
      .eq('challenge_id', challengeId).eq('user_id', m.user_id);
    setBusyId(null);
    if (error) return toast(error.message, 'error');
    toast(msg);
    load();
    onChanged?.();
  }

  const live = rows.filter(r => r.access_type === 'live');
  const recorded = rows.filter(r => r.access_type === 'recorded');
  const shown = tab === 'live' ? live : recorded;

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-brand-500" /> Enrolled members ({rows.length})</h2>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm font-bold">
          {[['live', `Live (${live.length})`], ['recorded', `Recorded (${recorded.length})`]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={`px-3 py-1.5 rounded-md ${tab === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      {failed && (
        <div role="alert" className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{rows.length ? 'Couldn’t refresh the member list — showing the last loaded version.' : 'Couldn’t load members right now.'}</span>
          <button type="button" onClick={() => { setLoading(true); load(); }} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" /> Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : failed && !rows.length ? null : shown.length === 0 ? (
        <EmptyState icon={Users} title={`No ${tab} members yet`} />
      ) : (
        <ul className="mt-4 space-y-2">
          {shown.map(m => (
            <li key={m.user_id} className={`flex items-center gap-3 rounded-xl border border-slate-200 p-3 ${m.status === 'removed' ? 'opacity-60' : ''}`}>
              <Avatar name={m.full_name} url={m.avatar_url} size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{m.full_name}</p>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2">
                  <span>Joined {fmtDateTime(m.joined_at, { withYear: true })}</span>
                  {m.access_type === 'recorded' && (
                    <span className={expired(m) ? 'text-red-500 font-semibold' : ''}>
                      · {m.expires_at ? `${expired(m) ? 'expired' : 'until'} ${fmtDate(m.expires_at, { withYear: true })}` : 'lifetime'}
                    </span>
                  )}
                  {m.pay_method && <span>· {m.pay_method} · {m.pay_status}</span>}
                  {isAdmin && m.phone && <span className="inline-flex items-center gap-0.5"><Phone className="w-3 h-3" /> {m.phone}</span>}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_TONE[m.status] ?? STATUS_TONE.active}`}>{m.status}</span>
              {isAdmin && m.status !== 'removed' && (
                <div className="flex gap-1 shrink-0">
                  {m.status === 'active' ? (
                    <button onClick={() => setStatus(m, 'paused', `${m.full_name} paused`)} disabled={busyId === m.user_id} title="Pause access" className="p-2 rounded-lg text-amber-600 hover:bg-amber-50">
                      {busyId === m.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button onClick={() => setStatus(m, 'active', `${m.full_name} resumed`)} disabled={busyId === m.user_id} title="Resume access" className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50">
                      {busyId === m.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => { if (confirm(`Remove ${m.full_name} from this series?`)) setStatus(m, 'removed', `${m.full_name} removed`); }} disabled={busyId === m.user_id} title="Remove from series" className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
