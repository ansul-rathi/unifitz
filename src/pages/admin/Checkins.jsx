import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Search, ChevronLeft, ChevronRight, Download, Moon, Salad, Cookie,
  Droplets, Dumbbell, Scale, Flame, CalendarDays,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fmtDate } from '../../lib/datetime';
import { Card, Spinner, EmptyState, Avatar, StatCard } from '../../components/ui';

const WATER_GOAL = 16;          // 16 glasses = 4 litres
const GLASSES_PER_LITRE = 4;
const toLitres = (g) => {
  const l = g / GLASSES_PER_LITRE;
  return Number.isInteger(l) ? String(l) : l.toFixed(2).replace(/0$/, '');
};
// Averages don't land on quarter-litres, so round them to one decimal.
const litresLabel = (g) => (g == null ? '—' : `${(g / GLASSES_PER_LITRE).toFixed(1).replace(/\.0$/, '')} L`);
const SLEEP_LABEL = ['Poor', 'Meh', 'Okay', 'Good', 'Great'];
const WORKOUT_LABEL = ['Rough', 'Meh', 'Good', 'Great', 'Crushed it'];

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const shiftDay = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return iso(d);
};
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

function downloadCsv(filename, header, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map(r => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Yes / no / not-answered pill.
function Flag({ value, yes, no, goodIsYes = true }) {
  if (value == null) return <span className="text-slate-300">—</span>;
  const good = goodIsYes ? value : !value;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
      {value ? yes : no}
    </span>
  );
}

function Rating({ value, labels }) {
  if (value == null) return <span className="text-slate-300">—</span>;
  return (
    <span className={`text-xs font-bold ${value >= 3 ? 'text-emerald-600' : 'text-orange-600'}`}>
      {value}/5 <span className="font-medium text-slate-400">{labels[value - 1]}</span>
    </span>
  );
}

export default function AdminCheckins() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [date, setDate] = useState(() => iso(new Date()));
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');     // all | submitted | missed
  const [week, setWeek] = useState('all');

  // Roster + weekly history load once; daily rows reload per selected date.
  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: w }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, phone, avatar_url, is_active').eq('role', 'client').order('full_name'),
        supabase.from('weekly_checkins').select('*, profile:user_id(full_name, avatar_url)').order('created_at', { ascending: false }).limit(500),
      ]);
      setClients(p ?? []);
      setWeekly(w ?? []);
    })();
  }, []);

  const loadDaily = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('daily_checkins')
      .select('*, profile:user_id(full_name, avatar_url)')
      .eq('checkin_date', date)
      .order('created_at', { ascending: false });
    setDaily(data ?? []);
    setLoading(false);
  }, [date]);
  useEffect(() => { loadDaily(); }, [loadDaily]);

  // ── Daily rows: every active client, with their check-in for the day (or null) ──
  const dailyRows = useMemo(() => {
    const byUser = new Map(daily.map(c => [c.user_id, c]));
    const roster = clients.filter(c => c.is_active).map(c => ({ user: c, c: byUser.get(c.id) ?? null }));
    // Check-ins from users no longer on the active roster still deserve a row.
    const known = new Set(roster.map(r => r.user.id));
    const orphans = daily.filter(c => !known.has(c.user_id))
      .map(c => ({ user: { id: c.user_id, full_name: c.profile?.full_name ?? 'Unknown', avatar_url: c.profile?.avatar_url }, c }));
    // Submitted first (newest check-in on top), then everyone who missed, A–Z.
    return [...roster, ...orphans].sort((a, b) => {
      if (!!a.c !== !!b.c) return a.c ? -1 : 1;
      if (a.c && b.c) return new Date(b.c.created_at) - new Date(a.c.created_at);
      return (a.user.full_name ?? '').localeCompare(b.user.full_name ?? '');
    });
  }, [clients, daily]);

  const dailyFiltered = useMemo(() => dailyRows.filter(r =>
    (status === 'all' || (status === 'submitted' ? r.c : !r.c)) &&
    (q === '' || (r.user.full_name ?? '').toLowerCase().includes(q.toLowerCase()))
  ), [dailyRows, status, q]);

  const dailyStats = useMemo(() => {
    const done = dailyRows.filter(r => r.c).map(r => r.c);
    return {
      done: done.length,
      total: dailyRows.length,
      water: avg(done.map(c => c.water_glasses ?? 0)),
      workout: pct(done.filter(c => c.did_workout).length, done.length),
      diet: pct(done.filter(c => c.diet_consistent).length, done.length),
    };
  }, [dailyRows]);

  // ── Weekly ──
  const weeks = useMemo(() => [...new Set(weekly.map(w => w.week_number))].sort((a, b) => a - b), [weekly]);

  // Weight delta vs the same member's previous week.
  const weeklyRows = useMemo(() => {
    const byUser = new Map();
    for (const w of weekly) {
      if (!byUser.has(w.user_id)) byUser.set(w.user_id, []);
      byUser.get(w.user_id).push(w);
    }
    for (const list of byUser.values()) list.sort((a, b) => a.week_number - b.week_number);
    const delta = new Map();
    for (const list of byUser.values()) {
      list.forEach((w, i) => {
        const prev = list[i - 1];
        if (prev?.weight_kg != null && w.weight_kg != null) delta.set(w.id, +(w.weight_kg - prev.weight_kg).toFixed(1));
      });
    }
    return weekly.map(w => ({ ...w, delta: delta.get(w.id) ?? null }));
  }, [weekly]);

  const weeklyFiltered = useMemo(() => weeklyRows.filter(w =>
    (week === 'all' || w.week_number === +week) &&
    (q === '' || (w.profile?.full_name ?? '').toLowerCase().includes(q.toLowerCase()))
  ), [weeklyRows, week, q]);

  function exportCsv() {
    if (tab === 'daily') {
      downloadCsv(`daily-checkins-${date}.csv`,
        ['Member', 'Date', 'Submitted', 'Slept on time', 'Sleep quality', 'Diet consistent', 'Ate junk', 'Junk detail', 'Water glasses', 'Water litres', 'Worked out', 'Workout rating'],
        dailyFiltered.map(r => [
          r.user.full_name, date, r.c ? 'yes' : 'no',
          r.c?.slept_on_time ?? '', r.c?.sleep_quality ?? '', r.c?.diet_consistent ?? '',
          r.c?.ate_junk ?? '', r.c?.junk_detail ?? '', r.c?.water_glasses ?? '',
          r.c?.water_glasses == null ? '' : toLitres(r.c.water_glasses),
          r.c?.did_workout ?? '', r.c?.workout_rating ?? '',
        ]));
    } else {
      downloadCsv('weekly-checkins.csv',
        ['Member', 'Week', 'Weight kg', 'Change kg', 'Waist in', 'Hips in', 'Chest in', 'Energy', 'Workout days', 'Notes', 'Logged at'],
        weeklyFiltered.map(w => [
          w.profile?.full_name ?? '', w.week_number, w.weight_kg ?? '', w.delta ?? '',
          w.waist_in ?? '', w.hips_in ?? '', w.chest_in ?? '', w.energy_level ?? '',
          w.workout_days ?? '', w.notes ?? '', fmtDate(w.created_at, { withYear: true }),
        ]));
    }
  }

  const isToday = date === iso(new Date());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Check-ins</h1>
        <button onClick={exportCsv} className="btn-secondary !py-2.5 text-sm inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-72">
        {[['daily', 'Daily'], ['weekly', 'Weekly']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${tab === k ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'daily' ? (
        <>
          {/* Day picker */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setDate(d => shiftDay(d, -1))} aria-label="Previous day"
                className="w-10 h-10 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400"><ChevronLeft className="w-4 h-4" /></button>
              <input type="date" className="input !w-44" value={date} max={iso(new Date())} onChange={e => setDate(e.target.value)} />
              <button onClick={() => setDate(d => shiftDay(d, 1))} disabled={isToday} aria-label="Next day"
                className="w-10 h-10 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !pl-10" placeholder="Search member…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select className="input sm:w-40" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">All members</option>
              <option value="submitted">Submitted</option>
              <option value="missed">Missed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={ClipboardCheck} label="Checked in" value={`${dailyStats.done}/${dailyStats.total}`} sub={`${pct(dailyStats.done, dailyStats.total)}% of active members`} />
            <StatCard icon={Droplets} label="Avg water" value={dailyStats.water == null ? '—' : `${dailyStats.water.toFixed(1)}`} sub={`of ${WATER_GOAL} glasses · ${litresLabel(dailyStats.water)}`} accent="text-sky-500" />
            <StatCard icon={Dumbbell} label="Worked out" value={`${dailyStats.workout}%`} sub="of those checked in" accent="text-violet-500" />
            <StatCard icon={Salad} label="Diet on track" value={`${dailyStats.diet}%`} sub="of those checked in" accent="text-emerald-500" />
          </div>

          {loading ? <Spinner /> : dailyFiltered.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="No check-ins here" hint={`Nothing matches for ${fmtDate(date)}.`} />
          ) : (
            <>
              <Card className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-bold">Member</th>
                      <th className="px-4 py-3 font-bold"><Moon className="w-3.5 h-3.5 inline mr-1" />Sleep</th>
                      <th className="px-4 py-3 font-bold">Quality</th>
                      <th className="px-4 py-3 font-bold"><Salad className="w-3.5 h-3.5 inline mr-1" />Diet</th>
                      <th className="px-4 py-3 font-bold"><Cookie className="w-3.5 h-3.5 inline mr-1" />Junk</th>
                      <th className="px-4 py-3 font-bold"><Droplets className="w-3.5 h-3.5 inline mr-1" />Water</th>
                      <th className="px-4 py-3 font-bold"><Dumbbell className="w-3.5 h-3.5 inline mr-1" />Workout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyFiltered.map(({ user, c }) => (
                      <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)}
                        className={`hover:bg-slate-50/60 cursor-pointer ${c ? '' : 'bg-slate-50/40'}`}>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Avatar name={user.full_name} url={user.avatar_url} size="w-8 h-8" />
                            <span>
                              {user.full_name}
                              {!c && <span className="block text-xs font-medium text-slate-400">not submitted</span>}
                            </span>
                          </span>
                        </td>
                        {c ? (
                          <>
                            <td className="px-4 py-3"><Flag value={c.slept_on_time} yes="On time" no="Late" /></td>
                            <td className="px-4 py-3"><Rating value={c.sleep_quality} labels={SLEEP_LABEL} /></td>
                            <td className="px-4 py-3"><Flag value={c.diet_consistent} yes="On track" no="Off" /></td>
                            <td className="px-4 py-3">
                              <Flag value={c.ate_junk} yes="Yes" no="No" goodIsYes={false} />
                              {c.junk_detail && <span className="block text-xs text-slate-400 mt-0.5 max-w-[10rem] truncate">{c.junk_detail}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold tabular-nums ${(c.water_glasses ?? 0) >= WATER_GOAL ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {c.water_glasses ?? 0}<span className="text-slate-400 font-medium">/{WATER_GOAL}</span>
                              </span>
                              <span className="block text-xs text-slate-400 tabular-nums">{toLitres(c.water_glasses ?? 0)} L</span>
                            </td>
                            <td className="px-4 py-3">
                              {c.did_workout == null ? <span className="text-slate-300">—</span>
                                : c.did_workout ? <Rating value={c.workout_rating} labels={WORKOUT_LABEL} />
                                  : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Rest day</span>}
                            </td>
                          </>
                        ) : <td className="px-4 py-3 text-slate-300" colSpan={6}>—</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <div className="md:hidden space-y-2.5">
                {dailyFiltered.map(({ user, c }) => (
                  <Card key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} className="p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} url={user.avatar_url} />
                      <p className="font-bold text-sm flex-1 truncate">{user.full_name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c ? 'Done' : 'Missed'}
                      </span>
                    </div>
                    {c && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.slept_on_time != null && <Flag value={c.slept_on_time} yes="Slept on time" no="Late night" />}
                        {c.sleep_quality != null && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Sleep {SLEEP_LABEL[c.sleep_quality - 1]}</span>}
                        {c.diet_consistent != null && <Flag value={c.diet_consistent} yes="Diet on track" no="Diet off" />}
                        {c.ate_junk != null && <Flag value={c.ate_junk} yes="Had junk" no="No junk" goodIsYes={false} />}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">{c.water_glasses ?? 0}/{WATER_GOAL} water · {toLitres(c.water_glasses ?? 0)} L</span>
                        {c.did_workout != null && <Flag value={c.did_workout} yes={`Workout ${c.workout_rating ?? '–'}/5`} no="Rest day" />}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !pl-10" placeholder="Search member…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select className="input sm:w-44" value={week} onChange={e => setWeek(e.target.value)}>
              <option value="all">All weeks</option>
              {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>

          {weeklyFiltered.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No weekly check-ins" hint="Members log weight and measurements once a week." />
          ) : (
            <>
              <Card className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-bold">Member</th>
                      <th className="px-4 py-3 font-bold">Week</th>
                      <th className="px-4 py-3 font-bold"><Scale className="w-3.5 h-3.5 inline mr-1" />Weight</th>
                      <th className="px-4 py-3 font-bold">Change</th>
                      <th className="px-4 py-3 font-bold">Waist / Hips / Chest</th>
                      <th className="px-4 py-3 font-bold"><Flame className="w-3.5 h-3.5 inline mr-1" />Energy</th>
                      <th className="px-4 py-3 font-bold">Workout days</th>
                      <th className="px-4 py-3 font-bold">Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyFiltered.map(w => (
                      <tr key={w.id} onClick={() => navigate(`/admin/users/${w.user_id}`)} className="hover:bg-slate-50/60 cursor-pointer">
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Avatar name={w.profile?.full_name ?? '?'} url={w.profile?.avatar_url} size="w-8 h-8" />
                            {w.profile?.full_name ?? 'Unknown'}
                          </span>
                          {w.notes && <span className="block text-xs text-slate-400 mt-0.5 max-w-[16rem] truncate">{w.notes}</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-500">W{w.week_number}</td>
                        <td className="px-4 py-3 font-bold tabular-nums">{w.weight_kg != null ? `${w.weight_kg} kg` : '—'}</td>
                        <td className="px-4 py-3">
                          {w.delta == null ? <span className="text-slate-300">—</span> : (
                            <span className={`font-bold tabular-nums ${w.delta < 0 ? 'text-emerald-600' : w.delta > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                              {w.delta > 0 ? '+' : ''}{w.delta} kg
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-slate-500">
                          {[w.waist_in, w.hips_in, w.chest_in].map(v => v ?? '—').join(' / ')}
                        </td>
                        <td className="px-4 py-3"><Rating value={w.energy_level} labels={['Drained', 'Low', 'Okay', 'Good', 'High']} /></td>
                        <td className="px-4 py-3 tabular-nums text-slate-600">{w.workout_days ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(w.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <div className="md:hidden space-y-2.5">
                {weeklyFiltered.map(w => (
                  <Card key={w.id} onClick={() => navigate(`/admin/users/${w.user_id}`)} className="p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar name={w.profile?.full_name ?? '?'} url={w.profile?.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{w.profile?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500">Week {w.week_number} · {fmtDate(w.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums text-sm">{w.weight_kg != null ? `${w.weight_kg} kg` : '—'}</p>
                        {w.delta != null && (
                          <p className={`text-xs font-bold tabular-nums ${w.delta < 0 ? 'text-emerald-600' : w.delta > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                            {w.delta > 0 ? '+' : ''}{w.delta} kg
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
                      {w.energy_level != null && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Energy {w.energy_level}/5</span>}
                      {w.workout_days != null && <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{w.workout_days} workout days</span>}
                      {[['Waist', w.waist_in], ['Hips', w.hips_in], ['Chest', w.chest_in]].filter(([, v]) => v != null).map(([l, v]) => (
                        <span key={l} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{l} {v}"</span>
                      ))}
                    </div>
                    {w.notes && <p className="mt-2 text-xs text-slate-500">{w.notes}</p>}
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
