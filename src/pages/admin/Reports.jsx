import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, UserPlus, Activity, Percent, IndianRupee, TrendingUp, AlertTriangle, Trophy,
  Download, Flame, Gift, Salad,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../lib/csv';
import { Card, Spinner, StatCard, Avatar, EmptyState } from '../../components/ui';

const PIE_COLORS = ['#F97316', '#0EA5E9', '#8B5CF6', '#22C55E', '#EAB308'];
const weekKey = d => { const dt = new Date(d); const onejan = new Date(dt.getFullYear(), 0, 1); return `W${Math.ceil((((dt - onejan) / 86400000) + onejan.getDay() + 1) / 7)}`; };

export default function AdminReports() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [
        { data: profiles }, { data: enrollments }, { data: sessions }, { data: attendance },
        { data: weekly }, { data: daily }, { data: challenges }, { data: payments },
        { data: leads }, { data: badges }, { data: refs },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, role, points, created_at, starting_weight_kg, target_weight_kg'),
        supabase.from('enrollments').select('user_id, challenge_id'),
        supabase.from('sessions').select('id, challenge_id, day_number, category, completed'),
        supabase.from('attendance').select('user_id, attended, attendance_pct, session_id'),
        supabase.from('weekly_checkins').select('user_id, week_number, weight_kg'),
        supabase.from('daily_checkins').select('user_id, checkin_date'),
        supabase.from('challenges').select('id, name, is_free, price'),
        supabase.from('payments').select('challenge_id, amount, status, created_at'),
        supabase.from('leads').select('id, created_at'),
        supabase.from('badges').select('user_id'),
        supabase.from('referrals').select('referrer_id, status'),
      ]);

      const clients = (profiles ?? []).filter(p => p.role === 'client');
      const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

      // KPIs
      const weekAgo = Date.now() - 7 * 86400_000;
      const activeIds = new Set((daily ?? []).filter(c => new Date(c.checkin_date) >= new Date(weekAgo)).map(c => c.user_id));
      const attended = (attendance ?? []).filter(a => a.attended).length;
      const completedSessions = (sessions ?? []).filter(s => s.completed).length;
      const possible = completedSessions * (clients.length || 1);
      const avgAttendance = possible ? Math.round((attended / possible) * 100) : 0;
      const newSignups30 = clients.filter(c => new Date(c.created_at) >= new Date(since30)).length;
      const paidRevenue = (payments ?? []).filter(p => ['paid', 'verified'].includes(p.status)).reduce((s, p) => s + Number(p.amount), 0);
      const conversion = leads?.length ? Math.round((clients.length / (leads.length + clients.length)) * 100) : 0;

      // Signups per week (last 8)
      const signupByWeek = {};
      clients.forEach(c => { const k = weekKey(c.created_at); signupByWeek[k] = (signupByWeek[k] ?? 0) + 1; });
      const signupTrend = Object.entries(signupByWeek).slice(-8).map(([week, count]) => ({ week, count }));

      // Attendance per session day
      const attBySession = {};
      (attendance ?? []).forEach(a => { if (a.attended) attBySession[a.session_id] = (attBySession[a.session_id] ?? 0) + 1; });
      const sessByDay = (sessions ?? []).filter(s => s.completed).sort((a, b) => a.day_number - b.day_number)
        .map(s => ({ day: `D${s.day_number}`, attended: attBySession[s.id] ?? 0 }));

      // Revenue per series
      const revBySeries = {};
      (payments ?? []).forEach(p => { if (['paid', 'verified'].includes(p.status)) revBySeries[p.challenge_id] = (revBySeries[p.challenge_id] ?? 0) + Number(p.amount); });
      const revenueSeries = (challenges ?? []).map(c => ({ name: (c.name || '').slice(0, 14), revenue: revBySeries[c.id] ?? 0 })).filter(x => x.revenue > 0);

      // Program popularity (sessions by category)
      const catCount = {};
      (sessions ?? []).forEach(s => { if (s.category) catCount[s.category] = (catCount[s.category] ?? 0) + 1; });
      const programPie = Object.entries(catCount).map(([name, value]) => ({ name, value }));

      // Enrollment per series
      const enrBySeries = {};
      (enrollments ?? []).forEach(e => { enrBySeries[e.challenge_id] = (enrBySeries[e.challenge_id] ?? 0) + 1; });
      const enrollSeries = (challenges ?? []).map(c => ({ name: (c.name || '').slice(0, 14), enrolled: enrBySeries[c.id] ?? 0 })).filter(x => x.enrolled > 0);

      // At-risk: weight flat/rising 2+ weeks OR few check-ins
      const byUserWeekly = {};
      (weekly ?? []).forEach(w => (byUserWeekly[w.user_id] ??= []).push(w));
      const atRisk = clients.filter(c => {
        const list = (byUserWeekly[c.id] ?? []).sort((a, b) => a.week_number - b.week_number);
        const a = list.at(-2), b = list.at(-1);
        return a && b && b.weight_kg >= a.weight_kg;
      });

      // Top members by points; top referrers
      const topMembers = [...clients].sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 8);
      const refCount = {};
      (refs ?? []).forEach(r => { if (r.status === 'reward_earned') refCount[r.referrer_id] = (refCount[r.referrer_id] ?? 0) + 1; });
      const topReferrers = Object.entries(refCount).map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n).slice(0, 6);

      setD({
        kpi: { members: clients.length, active: activeIds.size, avgAttendance, newSignups30, paidRevenue, leads: leads?.length ?? 0, conversion, atRisk: atRisk.length, badges: badges?.length ?? 0 },
        signupTrend, sessByDay, revenueSeries, programPie, enrollSeries,
        atRisk, topMembers, topReferrers, nameMap,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  const k = d.kpi;

  function exportSummary() {
    downloadCSV([{
      generated_at: new Date().toISOString(),
      members: k.members, active_7d: k.active, avg_attendance_pct: k.avgAttendance,
      new_signups_30d: k.newSignups30, gross_revenue: k.paidRevenue, leads: k.leads,
      lead_conversion_pct: k.conversion, at_risk: k.atRisk, badges_awarded: k.badges,
    }], `unifit-report-${new Date().toISOString().slice(0, 10)}.csv`);
    toast('Report summary exported');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Reports & Insights</h1>
        <button onClick={exportSummary} className="btn-secondary !py-2.5 text-sm"><Download className="w-4 h-4" /> Export summary</button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Members" value={k.members} to="/admin/users?role=client" />
        <StatCard icon={Activity} label="Active (7d)" value={k.active} accent="text-emerald-500" />
        <StatCard icon={Percent} label="Avg attendance" value={`${k.avgAttendance}%`} accent="text-sky-500" />
        <StatCard icon={UserPlus} label="New signups (30d)" value={k.newSignups30} accent="text-violet-500" />
        <StatCard icon={IndianRupee} label="Gross revenue" value={`₹${k.paidRevenue.toLocaleString('en-IN')}`} accent="text-emerald-500" to="/admin/revenue" />
        <StatCard icon={Gift} label="Leads" value={k.leads} to="/admin/leads" />
        <StatCard icon={TrendingUp} label="Lead → member" value={`${k.conversion}%`} accent="text-sky-500" />
        <StatCard icon={Trophy} label="Badges awarded" value={k.badges} accent="text-amber-500" to="/admin/badges" />
      </div>

      {/* Growth + engagement */}
      <div id="engagement" className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold mb-3">New signups per week</h3>
          {d.signupTrend.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={d.signupTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="week" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} width={28} /><Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={UserPlus} title="No signups yet" />}
        </Card>
        <Card id="attendance" className="p-5">
          <h3 className="font-bold mb-3">Attendance per session</h3>
          {d.sessByDay.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={d.sessByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="day" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} width={28} /><Tooltip />
                <Line type="monotone" dataKey="attended" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Activity} title="No completed sessions yet" />}
        </Card>
      </div>

      {/* Revenue + enrollment + program mix */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="font-bold mb-3">Revenue by series</h3>
          {d.revenueSeries.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.revenueSeries}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} width={44} tickFormatter={v => `₹${v / 1000}k`} /><Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} /><Bar dataKey="revenue" fill="#22C55E" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={IndianRupee} title="No paid revenue yet" />}
        </Card>
        <Card className="p-5">
          <h3 className="font-bold mb-3">Enrollment by series</h3>
          {d.enrollSeries.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.enrollSeries}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} width={28} /><Tooltip /><Bar dataKey="enrolled" fill="#0EA5E9" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Users} title="No enrollments yet" />}
        </Card>
        <Card className="p-5">
          <h3 className="font-bold mb-3">Program mix</h3>
          {d.programPie.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={d.programPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>{d.programPie.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Legend /></PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Salad} title="No session categories yet" />}
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card id="at-risk" className="p-5">
          <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> At-risk members ({d.atRisk.length})</h3>
          {d.atRisk.length ? (
            <ul className="mt-3 space-y-2">
              {d.atRisk.slice(0, 8).map(m => (
                <li key={m.id} className="flex items-center gap-3"><Avatar name={m.full_name} url={m.avatar_url} size="w-8 h-8" /><span className="text-sm font-semibold flex-1 truncate">{m.full_name}</span><span className="text-xs text-red-500 font-bold">weight stalled</span></li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-slate-400">No at-risk members. 🎉</p>}
        </Card>
        <Card className="p-5">
          <h3 className="font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-brand-500" /> Top members (points)</h3>
          <ol className="mt-3 space-y-2">
            {d.topMembers.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3"><span className="w-5 text-sm font-bold text-slate-400">{i + 1}</span><Avatar name={m.full_name} url={m.avatar_url} size="w-8 h-8" /><span className="text-sm font-semibold flex-1 truncate">{m.full_name}</span><span className="text-sm font-bold text-brand-600">{m.points ?? 0}</span></li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold flex items-center gap-2"><Gift className="w-5 h-5 text-emerald-500" /> Top referrers</h3>
          {d.topReferrers.length ? (
            <ol className="mt-3 space-y-2">
              {d.topReferrers.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3"><span className="w-5 text-sm font-bold text-slate-400">{i + 1}</span><Avatar name={d.nameMap[r.id]?.full_name} url={d.nameMap[r.id]?.avatar_url} size="w-8 h-8" /><span className="text-sm font-semibold flex-1 truncate">{d.nameMap[r.id]?.full_name ?? 'Member'}</span><span className="text-sm font-bold text-emerald-600">{r.n}</span></li>
              ))}
            </ol>
          ) : <p className="mt-3 text-sm text-slate-400">No rewarded referrals yet.</p>}
        </Card>
      </div>
    </div>
  );
}
