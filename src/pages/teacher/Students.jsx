import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, Users, Award, X, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, EmptyState, Avatar } from '../../components/ui';
import AddStudentModal from '../../components/AddStudentModal';

export default function TeacherStudents() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [manualBadges, setManualBadges] = useState([]);
  const [awardFor, setAwardFor] = useState(null);
  const [awardCode, setAwardCode] = useState('');
  const [awardNote, setAwardNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Teachers can grant manual + hybrid badges only.
  useEffect(() => {
    supabase.from('badge_definitions').select('code, name, tier, award_type')
      .in('award_type', ['manual', 'hybrid']).eq('is_active', true).order('sort_order')
      .then(({ data }) => setManualBadges(data ?? []));
  }, []);

  async function grant() {
    if (!awardCode) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('award_manual_badge', {
      p_user: awardFor.id, p_code: awardCode, p_note: awardNote || null,
    });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    if (data === false) return toast('Student already has this badge', 'error');
    toast(`Badge granted to ${awardFor.full_name.split(' ')[0]}`);
    setAwardFor(null); setAwardCode(''); setAwardNote('');
  }

  useEffect(() => {
    (async () => {
      // Names + avatars only — no phone/email. Personal contact details are not
      // exposed to teachers (served via the my_students SECURITY DEFINER RPC).
      const { data: rows } = await supabase.rpc('my_students');
      if (!rows?.length) { setStudents([]); setLoading(false); return; }

      const ids = [...new Set(rows.map(r => r.challenge_id))];
      const [{ data: weekly }, { data: sessions }] = await Promise.all([
        supabase.from('weekly_checkins').select('user_id, week_number, weight_kg, created_at').order('week_number'),
        supabase.from('sessions').select('id, challenge_id').in('challenge_id', ids).eq('completed', true),
      ]);

      const sessionIds = (sessions ?? []).map(s => s.id);
      let attendance = [];
      if (sessionIds.length) {
        const { data: att } = await supabase.from('attendance').select('user_id, attended, attendance_pct').in('session_id', sessionIds);
        attendance = att ?? [];
      }
      const totalSessions = sessionIds.length;

      const byUser = new Map();
      for (const r of rows) {
        if (byUser.has(r.user_id)) continue;
        const checks = (weekly ?? []).filter(w => w.user_id === r.user_id);
        const mine = attendance.filter(a => a.user_id === r.user_id);
        const attended = mine.filter(a => a.attended).length;
        const missed = totalSessions - attended;
        const pctRows = mine.filter(a => a.attendance_pct != null);
        const avgPct = pctRows.length ? Math.round(pctRows.reduce((s, a) => s + a.attendance_pct, 0) / pctRows.length) : null;

        // Red flag: weight flat/rising for 2+ weeks, or 3+ sessions missed.
        const last = checks[checks.length - 1];
        const prev = checks[checks.length - 2];
        const weightStalled = last && prev && last.weight_kg >= prev.weight_kg;
        const flagged = weightStalled || missed >= 3;

        const trend = last && prev ? Math.sign(last.weight_kg - prev.weight_kg) : null;

        byUser.set(r.user_id, {
          id: r.user_id, full_name: r.full_name, avatar_url: r.avatar_url,
          challenge: r.challenge_name,
          attended, totalSessions, checks: checks.length, avgPct,
          lastWeight: last?.weight_kg, trend, flagged,
        });
      }
      setStudents([...byUser.values()].sort((a, b) => Number(b.flagged) - Number(a.flagged)));
      setLoading(false);
    })();
  }, [profile.id]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">My Students</h1>
        <button onClick={() => setAddOpen(true)} className="btn-primary !py-2.5 text-sm"><UserPlus className="w-4 h-4" /> Add student</button>
      </div>
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <p className="text-xs text-slate-500 -mt-2">New students are linked to your referrals. They appear here once enrolled in your series.</p>

      {students.length === 0 ? (
        <Card><EmptyState icon={Users} title="No students yet" hint="Students appear here once they enroll in your challenges." /></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {students.map(s => (
            <Card key={s.id} className={`p-4 md:p-5 ${s.flagged ? 'border-red-300 bg-red-50/50' : ''}`}>
              <div className="flex items-center gap-3">
                <Avatar name={s.full_name} url={s.avatar_url} size="w-11 h-11" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2">
                    {s.full_name}
                    {s.flagged && <AlertTriangle className="w-4 h-4 text-red-500" aria-label="Needs attention" />}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{s.challenge}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { setAwardFor(s); setAwardCode(''); setAwardNote(''); }}
                    className="btn-secondary !py-2 !px-3 text-xs"
                    title="Award a badge"
                  >
                    <Award className="w-4 h-4 text-amber-500" /> Award
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-xl border border-slate-100 py-2">
                  <p className="text-lg font-display font-bold">
                    {s.attended}<span className="text-xs text-slate-400">/{s.totalSessions}</span>
                    {s.avgPct != null && <span className="ml-1 text-xs font-bold text-sky-600">· {s.avgPct}%</span>}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">attended</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 py-2">
                  <p className="text-lg font-display font-bold">{s.checks}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">check-ins</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 py-2">
                  <p className="text-lg font-display font-bold flex items-center justify-center gap-1">
                    {s.lastWeight ?? '—'}
                    {s.trend === -1 && <TrendingDown className="w-4 h-4 text-emerald-500" />}
                    {s.trend === 1 && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {s.trend === 0 && <Minus className="w-4 h-4 text-slate-400" />}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">last kg</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Award badge modal */}
      {awardFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Award a badge</h3>
              <button onClick={() => setAwardFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mt-1">to {awardFor.full_name} · manual/special badges only</p>
            <div className="mt-4 space-y-3">
              <select className="input" value={awardCode} onChange={e => setAwardCode(e.target.value)}>
                <option value="">Select a badge…</option>
                {manualBadges.map(b => <option key={b.code} value={b.code}>{b.name} ({b.tier})</option>)}
              </select>
              <textarea className="input" rows="2" placeholder="Optional note" value={awardNote} onChange={e => setAwardNote(e.target.value)} />
              <button onClick={grant} disabled={busy || !awardCode} className="btn-primary w-full">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Grant badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
