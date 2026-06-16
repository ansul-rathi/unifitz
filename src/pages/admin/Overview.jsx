import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, Percent, AlertTriangle, UserPlus, Download, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../lib/csv';
import { Card, Spinner, StatCard } from '../../components/ui';

export default function AdminOverview() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [
        { count: members },
        { data: activeCheckins },
        { data: att },
        { data: weekly },
        { count: newSignups },
        { data: sessions },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('daily_checkins').select('user_id').gte('checkin_date', weekAgo.slice(0, 10)),
        supabase.from('attendance').select('attended, created_at, session_id'),
        supabase.from('weekly_checkins').select('user_id, week_number, weight_kg').order('week_number'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client').gte('created_at', weekAgo),
        supabase.from('sessions').select('id, day_number, scheduled_at').eq('completed', true).order('day_number'),
      ]);

      const activeThisWeek = new Set((activeCheckins ?? []).map(c => c.user_id)).size;
      const attended = (att ?? []).filter(a => a.attended).length;
      const possible = (sessions ?? []).length * (members ?? 1);
      const avgAttendance = possible ? Math.round((attended / possible) * 100) : 0;

      // At-risk: weight flat/rising in last 2 weeks per user.
      const byUser = {};
      for (const w of weekly ?? []) (byUser[w.user_id] ??= []).push(w);
      const atRisk = Object.values(byUser).filter(list => {
        const a = list[list.length - 2], b = list[list.length - 1];
        return a && b && b.weight_kg >= a.weight_kg;
      }).length;

      setStats({ members: members ?? 0, activeThisWeek, avgAttendance, atRisk, newSignups: newSignups ?? 0 });

      // Attendance trend per completed session day.
      const byDay = {};
      for (const s of sessions ?? []) byDay[s.id] = { day: `D${s.day_number}` };
      const counts = {};
      for (const a of att ?? []) {
        if (a.attended && byDay[a.session_id]) counts[a.session_id] = (counts[a.session_id] ?? 0) + 1;
      }
      setTrend((sessions ?? []).map(s => ({ day: `D${s.day_number}`, attended: counts[s.id] ?? 0 })));
      setLoading(false);
    })();
  }, []);

  async function exportAll() {
    setExporting(true);
    try {
      const tables = ['profiles', 'weekly_checkins', 'attendance', 'referrals'];
      for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*');
        if (error) throw error;
        if (data?.length) downloadCSV(data, `unifit-${t}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
      toast('Export complete — 4 CSV files downloaded');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
        <button onClick={exportAll} disabled={exporting} className="btn-secondary !py-2.5 text-sm">
          <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export all data (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={Users} label="Total members" value={stats.members} to="/admin/users?role=client" />
        <StatCard icon={Activity} label="Active this week" value={stats.activeThisWeek} accent="text-emerald-500" to="/admin/reports#engagement" />
        <StatCard icon={Percent} label="Avg attendance" value={`${stats.avgAttendance}%`} accent="text-sky-500" to="/admin/reports#attendance" />
        <StatCard icon={AlertTriangle} label="At-risk members" value={stats.atRisk} alert={stats.atRisk > 0} to="/admin/reports#at-risk" />
        <StatCard icon={UserPlus} label="New signups (7d)" value={stats.newSignups} accent="text-violet-500" to="/admin/users?sort=recent" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Attendance trend (per session)</h3>
          <Link to="/admin/reports" className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1">Full reports <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} width={32} />
            <Tooltip />
            <Line type="monotone" dataKey="attended" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-xs text-slate-400">
        Free-tier reminder: open this dashboard (or the Supabase dashboard) at least once a week so the project doesn't pause, and use Export CSV as your manual backup.
      </p>
    </div>
  );
}
