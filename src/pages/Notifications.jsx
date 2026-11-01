import { useCallback, useEffect, useState } from 'react';
import { Bell, UserPlus, IndianRupee, Ticket, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, Avatar, EmptyState } from '../../components/ui';
import { fmtDateTime } from '../../lib/datetime';

// Admin activity feed — signups, enrollments, payments. Rows are written by DB
// triggers (see migration_admin_notifications.sql); this page reads + marks read
// and live-updates via a realtime subscription.
const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'signup', label: 'Signups' },
  { key: 'enrollment', label: 'Enrollments' },
  { key: 'payment', label: 'Payments' },
];
const ICON = {
  signup: { Icon: UserPlus, tone: 'bg-sky-100 text-sky-600' },
  enrollment: { Icon: Ticket, tone: 'bg-brand-100 text-brand-600' },
  payment: { Icon: IndianRupee, tone: 'bg-emerald-100 text-emerald-600' },
};

function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return fmtDateTime(ts, { withYear: true });
}

export default function AdminNotifications() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(200);
    setRows(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // Live-update on any change to the feed.
  useEffect(() => {
    const channel = supabase.channel('admin-notifications-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [load]);

  async function markAllRead() {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) return toast(error.message, 'error');
    toast('All caught up');
    load();
  }

  const shown = filter === 'all' ? rows : rows.filter(r => r.type === filter);
  const unread = rows.filter(r => !r.is_read).length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-500" /> Notifications
          {unread > 0 && <span className="text-sm font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{unread}</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary !py-2 text-sm"><CheckCheck className="w-4 h-4" /> Mark all read</button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${filter === t.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here yet" hint="Signups, enrollments and payments will show up here." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {shown.map(n => {
            const { Icon, tone } = ICON[n.type] ?? ICON.signup;
            return (
              <div key={n.id} className={`flex items-center gap-3 px-4 py-3 ${!n.is_read ? 'bg-brand-50/40' : ''}`}>
                {n.actor
                  ? <Avatar name={n.actor.full_name} url={n.actor.avatar_url} size="w-9 h-9" />
                  : <span className={`inline-flex w-9 h-9 items-center justify-center rounded-full ${tone}`}><Icon className="w-4 h-4" /></span>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-400">{timeAgo(n.created_at)}</p>
                </div>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${tone}`}><Icon className="w-3.5 h-3.5" /></span>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" aria-label="unread" />}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
