import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, UserCog, ShieldCheck, Ban, GraduationCap, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, Avatar } from '../../components/ui';
import AddStudentModal from '../../components/AddStudentModal';

export default function AdminUsers() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [roleFilter, setRoleFilter] = useState(['client', 'teacher', 'admin'].includes(params.get('role')) ? params.get('role') : 'all');
  const [q, setQ] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter(r =>
    (roleFilter === 'all' || r.role === roleFilter) &&
    (q === '' || r.full_name.toLowerCase().includes(q.toLowerCase()) || (r.phone ?? '').includes(q))
  ), [rows, roleFilter, q]);

  async function patch(id, body, msg) {
    const { error } = await supabase.from('profiles').update(body).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast(msg);
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <button onClick={() => setAddOpen(true)} className="btn-primary !py-2.5 text-sm"><UserPlus className="w-4 h-4" /> Add student</button>
      </div>
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" placeholder="Search by name or phone…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input sm:w-44" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          {['all', 'client', 'teacher', 'admin'].map(r => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}
        </select>
      </div>

      {/* Desktop table / mobile cards */}
      <Card className="overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Member</th>
              <th className="px-5 py-3 font-bold">Phone</th>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)} className="hover:bg-slate-50/60 cursor-pointer">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2.5 font-semibold">
                    <Avatar name={u.full_name} url={u.avatar_url} size="w-8 h-8" /> {u.full_name}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{u.phone ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-violet-100 text-violet-700' : u.role === 'teacher' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold ${u.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    {u.role === 'client' && (
                      <button onClick={e => { e.stopPropagation(); patch(u.id, { role: 'teacher' }, `${u.full_name} promoted to teacher`); }}
                        title="Promote to teacher" className="p-2 rounded-lg hover:bg-sky-50 text-sky-600">
                        <GraduationCap className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); patch(u.id, { is_active: !u.is_active }, u.is_active ? 'Deactivated' : 'Reactivated'); }}
                      title={u.is_active ? 'Deactivate' : 'Reactivate'}
                      className={`p-2 rounded-lg ${u.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-600'}`}>
                      {u.is_active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="md:hidden space-y-2.5">
        {filtered.map(u => (
          <Card key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)} className="p-4 flex items-center gap-3 cursor-pointer">
            <Avatar name={u.full_name} url={u.avatar_url} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{u.full_name}</p>
              <p className="text-xs text-slate-500">{u.role} · {u.is_active ? 'active' : 'deactivated'}</p>
            </div>
            {u.role === 'client' && (
              <button onClick={e => { e.stopPropagation(); patch(u.id, { role: 'teacher' }, 'Promoted to teacher'); }} className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <GraduationCap className="w-4 h-4" />
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); patch(u.id, { is_active: !u.is_active }, u.is_active ? 'Deactivated' : 'Reactivated'); }}
              className={`p-2 rounded-lg ${u.is_active ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {u.is_active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center text-sm text-slate-500">
          <UserCog className="w-8 h-8 mx-auto text-slate-300 mb-2" /> No users match.
        </Card>
      )}
    </div>
  );
}
