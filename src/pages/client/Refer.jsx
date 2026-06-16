import { useEffect, useState } from 'react';
import { Copy, MessageCircle, Gift, Trophy, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, EmptyState, Avatar } from '../../components/ui';

const STATUS_META = {
  signed_up: { label: 'Signed up', icon: UserPlus, color: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active', icon: Clock, color: 'bg-sky-100 text-sky-700' },
  reward_earned: { label: 'Reward earned', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
};

const REWARDS = [
  'Points on every successful referral',
  '"Super Referrer" badge at 3 successful referrals',
  'Live-class shoutout from your trainer',
  'Free 1-on-1 consult at 3 successful referrals',
];

export default function ClientRefer() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [names, setNames] = useState({});
  const [top, setTop] = useState([]);

  const link = `${window.location.origin}/auth?mode=signup&ref=${profile.referral_code}`;
  const waText = encodeURIComponent(
    `Hey! I've been working out with UniFit — live Zumba, Yoga and Strength classes on Zoom, and the free challenge is genuinely fun. Join with my code ${profile.referral_code} and we both earn rewards: ${link}`
  );

  useEffect(() => {
    (async () => {
      const [{ data: refs }, { data: topRefs }] = await Promise.all([
        supabase.from('referrals').select('*').eq('referrer_id', profile.id).order('created_at', { ascending: false }),
        supabase.rpc('top_referrers'),
      ]);
      setReferrals(refs ?? []);
      setTop(topRefs ?? []);

      // Attendance count per referred friend ("Active — Day 4").
      const days = {};
      for (const r of refs ?? []) {
        if (r.status === 'active') {
          const { count } = await supabase.from('attendance').select('id', { count: 'exact', head: true })
            .eq('user_id', r.referred_id).eq('attended', true);
          days[r.referred_id] = count ?? 0;
        }
      }
      setNames(days);
      setLoading(false);
    })();
  }, [profile.id]);

  function copy(text, msg) {
    navigator.clipboard.writeText(text);
    toast(msg);
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Refer & Earn</h1>

      {/* Code card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500 to-orange-600 !border-0 text-white">
        <p className="text-sm font-semibold text-orange-100">Your referral code</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-wider">{profile.referral_code}</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button onClick={() => copy(profile.referral_code, 'Code copied')} className="btn-secondary !border-0 text-sm flex-1">
            <Copy className="w-4 h-4" /> Copy code
          </button>
          <button onClick={() => copy(link, 'Link copied')} className="btn-secondary !border-0 text-sm flex-1">
            <Copy className="w-4 h-4" /> Copy link
          </button>
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer"
             className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors duration-200 flex-1">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">How it works</h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal list-inside">
          <li>Your friend signs up with your code.</li>
          <li>They complete <strong>Day 7</strong> of any challenge.</li>
          <li><strong>You both earn the reward</strong> — automatically tracked, approved by the team.</li>
        </ol>
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {REWARDS.map(r => (
            <p key={r} className="flex items-start gap-2 text-sm text-slate-600">
              <Gift className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" /> {r}
            </p>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* My referrals */}
        <Card className="p-5 md:p-6">
          <h3 className="font-bold text-lg">Your referrals</h3>
          {referrals.length === 0 ? (
            <EmptyState icon={Gift} title="No referrals yet" hint="Share your code — your first reward is one friend away." />
          ) : (
            <ul className="mt-3 space-y-2.5">
              {referrals.map(r => {
                const meta = STATUS_META[r.status];
                return (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3">
                    <meta.icon className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-slate-700">Friend joined {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${meta.color}`}>
                      {meta.label}
                      {r.status === 'active' && names[r.referred_id] != null && ` — Day ${names[r.referred_id]}`}
                      {r.status === 'reward_earned' && ' ✓'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Top referrers */}
        <Card className="p-5 md:p-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Top referrers this month</h3>
          {top.length === 0 ? (
            <EmptyState icon={Trophy} title="Be the first this month" />
          ) : (
            <ol className="mt-3 space-y-2.5">
              {top.map((t, i) => (
                <li key={t.full_name} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                  <Avatar name={t.full_name} size="w-8 h-8" />
                  <span className="flex-1 text-sm font-semibold">{t.full_name}</span>
                  <span className="text-sm font-bold text-brand-600">{t.rewards} rewards</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
