import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MessageCircle, Phone, Mail, Ban, ShieldCheck, GraduationCap, AlertTriangle,
  Ticket, IndianRupee, CalendarCheck, Medal, Salad, Users as UsersIcon, Loader2, Plus, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { waTo } from '../../config';
import { fmtDate, fmtDateTime } from '../../lib/datetime';
import { Card, Spinner, EmptyState, Avatar, StatCard } from '../../components/ui';

// Admin Member 360° — everything about one member in one place, plus a
// follow-up log. All reads use existing admin RLS access; email comes from the
// admin_user_email() SECURITY DEFINER RPC (profiles has no email column).
export default function AdminUserDetail() {
  const { id } = useParams();
  const { profile: me } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState(null);
  const [fu, setFu] = useState({ note: '', channel: 'whatsapp', next_at: '' });
  const [savingFu, setSavingFu] = useState(false);

  const load = useCallback(async () => {
    const [
      { data: p }, { data: email }, { data: enr }, { data: pays },
      { count: attCount }, { data: attRecent }, { data: badges },
      { data: weekly }, { count: dailyCount }, { data: diet },
      { count: referralsMade }, { data: follows },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.rpc('admin_user_email', { p_user: id }),
      supabase.from('enrollments').select('id, status, access_type, joined_at, challenge:challenge_id(name)').eq('user_id', id).order('joined_at', { ascending: false }),
      supabase.from('payments').select('amount, currency, method, status, created_at, access_type, challenge:challenge_id(name)').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('attended', true),
      supabase.from('attendance').select('attendance_pct, session:session_id(title, scheduled_at)').eq('user_id', id).eq('attended', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('user_badges').select('badge_code, earned_at, badge:badge_code(name, tier)').eq('user_id', id).order('earned_at', { ascending: false }),
      supabase.from('weekly_checkins').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(5),
      supabase.from('daily_checkins').select('id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('diet_plans').select('calorie_target, is_free_plan, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', id),
      supabase.from('follow_ups').select('*, author:author_id(full_name)').eq('user_id', id).order('created_at', { ascending: false }),
    ]);

    let referrer = null;
    if (p?.referred_by) {
      const { data: r } = await supabase.from('profiles').select('full_name').eq('id', p.referred_by).maybeSingle();
      referrer = r?.full_name ?? null;
    }

    setD({
      p, email, referrer,
      enrollments: enr ?? [], payments: pays ?? [],
      attCount: attCount ?? 0, attRecent: attRecent ?? [],
      badges: badges ?? [], weekly: weekly ?? [], dailyCount: dailyCount ?? 0,
      diet, referralsMade: referralsMade ?? 0, follows: follows ?? [],
    });
    setLoading(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function patchProfile(body, msg) {
    const { error } = await supabase.from('profiles').update(body).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast(msg);
    load();
  }

  async function addFollowUp(e) {
    e.preventDefault();
    if (!fu.note.trim()) return toast('Write a note', 'error');
    setSavingFu(true);
    const { error } = await supabase.from('follow_ups').insert({
      user_id: id, author_id: me.id, note: fu.note.trim(),
      channel: fu.channel, next_at: fu.next_at ? new Date(fu.next_at).toISOString() : null,
    });
    setSavingFu(false);
    if (error) return toast(error.message, 'error');
    setFu({ note: '', channel: 'whatsapp', next_at: '' });
    toast('Follow-up logged');
    load();
  }

  async function toggleFollowUp(f) {
    await supabase.from('follow_ups').update({ status: f.status === 'done' ? 'open' : 'done' }).eq('id', f.id);
    load();
  }

  if (loading) return <Spinner />;
  if (!d?.p) return <EmptyState icon={AlertTriangle} title="Member not found" />;

  const p = d.p;
  const paid = d.payments.filter(x => ['paid', 'verified'].includes(x.status)).reduce((s, x) => s + Number(x.amount), 0);
  const wa = waTo(p.phone, `Hi ${p.full_name || 'there'}! 👋`);

  // Missing-data checklist — expected onboarding fields.
  const expected = [
    ['Name', p.full_name], ['Phone', p.phone], ['Age', p.age], ['Gender', p.gender],
    ['Height', p.height_cm], ['Start weight', p.starting_weight_kg], ['Target weight', p.target_weight_kg],
    ['Goal', p.fitness_goal], ['Activity level', p.activity_level],
  ];
  const missing = expected.filter(([, v]) => v == null || v === '');

  return (
    <div className="space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> All users</Link>

      {/* Header */}
      <Card className="p-5 md:p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar name={p.full_name} url={p.avatar_url} size="w-16 h-16" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{p.full_name || 'Unnamed member'}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.role === 'admin' ? 'bg-violet-100 text-violet-700' : p.role === 'teacher' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{p.role}</span>
              <span className={`text-xs font-bold ${p.is_active ? 'text-emerald-600' : 'text-red-500'}`}>{p.is_active ? 'Active' : 'Deactivated'}</span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
              {p.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}</span>}
              {d.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {d.email}</span>}
              <span className="inline-flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-slate-400" /> Joined {fmtDate(p.created_at, { withYear: true })}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {wa
              ? <a href={wa} target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-3 text-sm bg-emerald-500 hover:bg-emerald-600"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
              : <span className="text-xs text-slate-400 self-center">No phone on file</span>}
            {p.role === 'client' && <button onClick={() => patchProfile({ role: 'teacher' }, 'Promoted to teacher')} title="Promote to teacher" className="btn-secondary !py-2 !px-3 text-sm"><GraduationCap className="w-4 h-4" /></button>}
            <button onClick={() => patchProfile({ is_active: !p.is_active }, p.is_active ? 'Deactivated' : 'Reactivated')} className={`btn-secondary !py-2 !px-3 text-sm ${p.is_active ? 'text-red-500' : 'text-emerald-600'}`}>
              {p.is_active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Ticket} label="Series" value={d.enrollments.length} />
        <StatCard icon={CalendarCheck} label="Attended" value={d.attCount} accent="text-emerald-500" />
        <StatCard icon={IndianRupee} label="Paid" value={`₹${paid.toLocaleString('en-IN')}`} accent="text-emerald-500" />
        <StatCard icon={Medal} label="Badges" value={d.badges.length} accent="text-amber-500" />
        <StatCard icon={UsersIcon} label="Referrals" value={d.referralsMade} accent="text-violet-500" />
      </div>

      {/* Missing data */}
      {missing.length > 0 && (
        <Card className="p-5 md:p-6 border border-amber-200 bg-amber-50/50">
          <h2 className="font-bold text-sm flex items-center gap-2 text-amber-800"><AlertTriangle className="w-4 h-4" /> Missing data ({missing.length})</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {missing.map(([k]) => <span key={k} className="text-xs font-bold bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">{k}</span>)}
          </div>
          {wa && <a href={waTo(p.phone, `Hi ${p.full_name || 'there'}! We're missing a few details to personalise your plan: ${missing.map(([k]) => k).join(', ')}. Could you share them?`)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"><MessageCircle className="w-3.5 h-3.5" /> Ask on WhatsApp</a>}
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile details */}
        <Card className="p-5 md:p-6">
          <h2 className="font-bold text-lg">Profile</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {[
              ['Age', p.age], ['Gender', p.gender], ['Height', p.height_cm && `${p.height_cm} cm`],
              ['Start weight', p.starting_weight_kg && `${p.starting_weight_kg} kg`],
              ['Target weight', p.target_weight_kg && `${p.target_weight_kg} kg`],
              ['Goal', p.fitness_goal], ['Activity', p.activity_level], ['Diet', p.diet_type],
              ['Referral code', p.referral_code], ['Referred by', d.referrer],
              ['Diet plan', d.diet ? `${d.diet.calorie_target ?? '—'} kcal${d.diet.is_free_plan ? ' (free)' : ''}` : null],
              ['Daily check-ins', d.dailyCount || null],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold text-slate-400">{k}</dt>
                <dd className="font-semibold text-slate-800">{v ?? <span className="text-slate-300">—</span>}</dd>
              </div>
            ))}
          </dl>
          {d.weekly.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Latest measurements</p>
              <p className="text-sm text-slate-700">Week {d.weekly[0].week_number} · {d.weekly[0].weight_kg ?? '—'} kg{d.weekly[0].waist_in ? ` · waist ${d.weekly[0].waist_in}"` : ''}</p>
            </div>
          )}
        </Card>

        {/* Enrollments + payments */}
        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h2 className="font-bold text-lg">Enrollments ({d.enrollments.length})</h2>
            {d.enrollments.length === 0 ? <EmptyState icon={Ticket} title="No enrollments" /> : (
              <ul className="mt-3 space-y-2">
                {d.enrollments.map(e => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 font-semibold truncate">{e.challenge?.name ?? 'Series'}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{e.access_type}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${e.status === 'active' ? 'bg-emerald-100 text-emerald-700' : e.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>{e.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-5 md:p-6">
            <h2 className="font-bold text-lg">Payments ({d.payments.length})</h2>
            {d.payments.length === 0 ? <EmptyState icon={IndianRupee} title="No payments" /> : (
              <ul className="mt-3 space-y-2">
                {d.payments.map((x, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 min-w-0 truncate">{x.challenge?.name ?? 'Series'} <span className="text-slate-400">· {fmtDate(x.created_at)}</span></span>
                    <span className="font-bold">₹{Number(x.amount).toLocaleString('en-IN')}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${['paid', 'verified'].includes(x.status) ? 'bg-emerald-100 text-emerald-700' : x.status === 'pending_verification' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{x.method}/{x.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Follow-ups */}
      <Card className="p-5 md:p-6">
        <h2 className="font-bold text-lg">Follow-ups ({d.follows.length})</h2>
        <form onSubmit={addFollowUp} className="mt-3 grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
          <textarea rows="1" placeholder="Log a follow-up note…" className="input !py-2 text-sm" value={fu.note} onChange={e => setFu(x => ({ ...x, note: e.target.value }))} />
          <select className="input !py-2 text-sm sm:w-32" value={fu.channel} onChange={e => setFu(x => ({ ...x, channel: e.target.value }))}>
            <option value="whatsapp">WhatsApp</option><option value="call">Call</option><option value="other">Other</option>
          </select>
          <input type="date" className="input !py-2 text-sm" value={fu.next_at} onChange={e => setFu(x => ({ ...x, next_at: e.target.value }))} title="Next follow-up date" />
          <button type="submit" disabled={savingFu} className="btn-primary !py-2 text-sm">{savingFu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Log</button>
        </form>

        {d.follows.length === 0 ? <EmptyState icon={MessageCircle} title="No follow-ups yet" /> : (
          <ul className="mt-4 space-y-2.5">
            {d.follows.map(f => (
              <li key={f.id} className={`flex items-start gap-3 rounded-xl border border-slate-200 p-3 ${f.status === 'done' ? 'opacity-60' : ''}`}>
                <button onClick={() => toggleFollowUp(f)} title={f.status === 'done' ? 'Reopen' : 'Mark done'} className={`p-1 rounded-lg shrink-0 ${f.status === 'done' ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 className="w-5 h-5" /></button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${f.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{f.note}</p>
                  <p className="text-xs text-slate-400">
                    {f.channel && <span className="font-semibold uppercase">{f.channel}</span>} · {fmtDateTime(f.created_at, { withYear: true })}
                    {f.author?.full_name && ` · by ${f.author.full_name}`}
                    {f.next_at && ` · next ${fmtDate(f.next_at, { withYear: true })}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
