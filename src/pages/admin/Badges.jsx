import { useEffect, useMemo, useState } from 'react';
import { Award, Pencil, Loader2, X, Trophy, Search, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { TIERS } from '../../lib/badges';
import { Card, Spinner, Avatar } from '../../components/ui';

export default function AdminBadges() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('definitions'); // definitions | leaderboard | award
  const [defs, setDefs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  // Leaderboard + award
  const [leaders, setLeaders] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [awardUser, setAwardUser] = useState('');
  const [awardCode, setAwardCode] = useState('');

  async function load() {
    const [{ data: d }, { data: lb }, { data: us }] = await Promise.all([
      supabase.from('badge_definitions').select('*').order('sort_order'),
      supabase.from('profiles').select('id, full_name, avatar_url, points').eq('role', 'client').order('points', { ascending: false }).limit(20),
      supabase.from('profiles').select('id, full_name').order('full_name'),
    ]);
    setDefs(d ?? []);
    setLeaders(lb ?? []);
    setUsers(us ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveDef(e) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: editing.name, description: editing.description, category: editing.category,
      tier: editing.tier, points: +editing.points, icon: editing.icon,
      award_type: editing.award_type, is_active: editing.is_active,
      rule: editing.ruleText ? safeJson(editing.ruleText) : null,
    };
    const { error } = await supabase.from('badge_definitions').update(payload).eq('id', editing.id);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('Badge updated');
    setEditing(null);
    load();
  }

  async function awardToUser() {
    if (!awardUser || !awardCode) return;
    const { error } = await supabase.rpc('award_manual_badge', { p_user: awardUser, p_code: awardCode, p_note: 'Admin grant' });
    if (error) return toast(error.message, 'error');
    toast('Badge awarded');
    setAwardCode('');
    load();
  }

  async function revoke(userId, code) {
    const { error } = await supabase.rpc('revoke_badge', { p_user: userId, p_code: code });
    if (error) return toast(error.message, 'error');
    toast('Badge revoked');
    load();
  }

  const filteredUsers = useMemo(
    () => users.filter(u => q === '' || u.full_name.toLowerCase().includes(q.toLowerCase())),
    [users, q],
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Badges</h1>

      <div className="inline-flex bg-slate-100 rounded-xl p-1">
        {[['definitions', 'Definitions'], ['leaderboard', 'Leaderboard'], ['award', 'Award / Revoke']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${tab === k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Definitions */}
      {tab === 'definitions' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {defs.map(d => {
            const t = TIERS[d.tier] ?? TIERS.bronze;
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{d.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{d.category} · {d.award_type}</p>
                  </div>
                  <button onClick={() => setEditing({ ...d, ruleText: d.rule ? JSON.stringify(d.rule) : '' })} aria-label="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${t.bg} ${t.text}`}>{t.label}</span>
                  <span className="text-xs text-slate-400">{d.points} pts</span>
                  {!d.is_active && <span className="text-[11px] font-bold text-red-500">inactive</span>}
                </div>
                {d.rule && <p className="mt-2 text-[11px] font-mono text-slate-400">{JSON.stringify(d.rule)}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <Card className="p-5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Points leaderboard</h3>
          <ol className="mt-3 space-y-2">
            {leaders.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                <Avatar name={u.full_name} url={u.avatar_url} size="w-8 h-8" />
                <span className="flex-1 text-sm font-semibold truncate">{u.full_name}</span>
                <span className="text-sm font-bold text-brand-600">{u.points ?? 0} pts</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Award / Revoke */}
      {tab === 'award' && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-lg">Award any badge</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="input sm:col-span-1" value={awardUser} onChange={e => setAwardUser(e.target.value)}>
              <option value="">Select user…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
            <select className="input sm:col-span-1" value={awardCode} onChange={e => setAwardCode(e.target.value)}>
              <option value="">Select badge…</option>
              {defs.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
            <button onClick={awardToUser} disabled={!awardUser || !awardCode} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Award
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !pl-10" placeholder="Search a user to revoke a badge…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            {q && (
              <ul className="mt-3 space-y-1.5">
                {filteredUsers.slice(0, 6).map(u => <RevokeRow key={u.id} user={u} defs={defs} onRevoke={revoke} />)}
              </ul>
            )}
          </div>
        </Card>
      )}

      {/* Edit definition modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <form onSubmit={saveDef} className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[88vh] overflow-y-auto animate-fade-up space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Edit badge</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <input className="input" placeholder="Name" value={editing.name} onChange={e => setEditing(x => ({ ...x, name: e.target.value }))} />
            <textarea className="input" rows="2" placeholder="Description" value={editing.description ?? ''} onChange={e => setEditing(x => ({ ...x, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Category" value={editing.category} onChange={e => setEditing(x => ({ ...x, category: e.target.value }))} />
              <select className="input" value={editing.tier} onChange={e => setEditing(x => ({ ...x, tier: e.target.value }))}>
                {Object.keys(TIERS).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" className="input" placeholder="Points" value={editing.points} onChange={e => setEditing(x => ({ ...x, points: e.target.value }))} />
              <select className="input" value={editing.award_type} onChange={e => setEditing(x => ({ ...x, award_type: e.target.value }))}>
                {['auto', 'manual', 'hybrid'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <input className="input" placeholder="Lucide icon" value={editing.icon} onChange={e => setEditing(x => ({ ...x, icon: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(x => ({ ...x, is_active: e.target.checked }))} className="w-5 h-5 accent-brand-500" />
                Active
              </label>
            </div>
            <div>
              <label className="label">Rule (JSON, e.g. {`{"metric":"sessions_attended","gte":25}`})</label>
              <input className="input font-mono text-xs" placeholder='{"metric":"...","gte":0}' value={editing.ruleText} onChange={e => setEditing(x => ({ ...x, ruleText: e.target.value }))} />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function RevokeRow({ user, defs, onRevoke }) {
  const [badges, setBadges] = useState(null);
  useEffect(() => {
    supabase.from('user_badges').select('badge_code').eq('user_id', user.id)
      .then(({ data }) => setBadges(data ?? []));
  }, [user.id]);
  return (
    <li className="rounded-xl border border-slate-100 p-3">
      <p className="font-semibold text-sm">{user.full_name}</p>
      {badges === null ? <p className="text-xs text-slate-400 mt-1">Loading…</p>
        : badges.length === 0 ? <p className="text-xs text-slate-400 mt-1">No badges</p>
        : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map(b => {
              const d = defs.find(x => x.code === b.badge_code);
              return (
                <button key={b.badge_code} onClick={() => onRevoke(user.id, b.badge_code)}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-red-100 hover:text-red-600 px-2.5 py-1 rounded-full transition-colors duration-150">
                  {d?.name ?? b.badge_code} <Trash2 className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        )}
    </li>
  );
}
