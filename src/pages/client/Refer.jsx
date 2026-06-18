import { useEffect, useState } from 'react';
import { Copy, MessageCircle, Gift, CheckCircle2, Clock, UserPlus, Share2, Users, Trophy, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, EmptyState, ProgressBar } from '../../components/ui';

const STATUS_META = {
  signed_up: { label: 'Signed up', icon: UserPlus, color: 'bg-slate-100 text-slate-600', ring: 'text-slate-400' },
  active: { label: 'Active', icon: Clock, color: 'bg-sky-100 text-sky-700', ring: 'text-sky-500' },
  reward_earned: { label: 'Reward earned', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', ring: 'text-emerald-500' },
};

// Successful referrals needed for the headline reward.
const REWARD_GOAL = 3;
const REWARD_DAY = 7; // friend must reach Day 7 of a series

const PERKS = [
  { icon: Gift, text: 'Points on every successful referral' },
  { icon: Trophy, text: '"Super Referrer" badge at 3 referrals' },
  { icon: MessageCircle, text: 'Live-class shoutout from your trainer' },
  { icon: Sparkles, text: 'Free 1-on-1 consult at 3 referrals' },
];

export default function ClientRefer() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [days, setDays] = useState({}); // referred_id → attended count

  const code = profile.referral_code;
  const link = `${window.location.origin}/auth?mode=signup&ref=${code}`;
  const shareText = `Hey! I've been working out with UniFitz — live Zumba, Yoga and Strength classes on Zoom, and it's genuinely fun. Book a free demo class with my code ${code} and we both earn rewards: ${link}`;
  const waText = encodeURIComponent(shareText);

  useEffect(() => {
    (async () => {
      const { data: refs } = await supabase.from('referrals').select('*').eq('referrer_id', profile.id).order('created_at', { ascending: false });
      setReferrals(refs ?? []);

      // Attendance count per active friend → "Day X/7".
      const d = {};
      for (const r of refs ?? []) {
        if (r.status === 'active') {
          const { count } = await supabase.from('attendance').select('id', { count: 'exact', head: true })
            .eq('user_id', r.referred_id).eq('attended', true);
          d[r.referred_id] = count ?? 0;
        }
      }
      setDays(d);
      setLoading(false);
    })();
  }, [profile.id]);

  function copy(text, msg) {
    navigator.clipboard.writeText(text);
    toast(msg);
  }

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: 'UniFitz', text: shareText }); } catch { /* cancelled */ }
    } else {
      copy(link, 'Link copied');
    }
  }

  if (loading) return <Spinner />;

  const total = referrals.length;
  const active = referrals.filter(r => r.status === 'active').length;
  const earned = referrals.filter(r => r.status === 'reward_earned').length;
  const goalPct = Math.min(100, Math.round((earned / REWARD_GOAL) * 100));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Refer &amp; Earn</h1>

      {/* Code card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500 to-orange-600 !border-0 text-white">
        <p className="text-sm font-semibold text-orange-100">Your referral code</p>
        <button
          onClick={() => copy(code, 'Code copied')}
          className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-extrabold tracking-wider active:scale-[.98] transition-transform"
          title="Tap to copy"
        >
          {code} <Copy className="w-5 h-5 text-orange-100" />
        </button>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer"
             className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors duration-200 flex-1">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
          <button onClick={nativeShare} className="btn-secondary !border-0 text-sm flex-1">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={() => copy(link, 'Link copied')} className="btn-secondary !border-0 text-sm flex-1">
            <Copy className="w-4 h-4" /> Copy link
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Users} tone="text-sky-500" label="Invited" value={total} />
        <Stat icon={Clock} tone="text-amber-500" label="Active" value={active} />
        <Stat icon={Trophy} tone="text-emerald-500" label="Rewards" value={earned} />
      </div>

      {/* Reward milestone */}
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-500" /> Free 1-on-1 consult</h3>
          <span className="text-sm font-bold text-slate-900">{Math.min(earned, REWARD_GOAL)}/{REWARD_GOAL}</span>
        </div>
        <div className="mt-3"><ProgressBar value={Math.min(earned, REWARD_GOAL)} max={REWARD_GOAL} /></div>
        <p className="mt-2 text-sm text-slate-500">
          {earned >= REWARD_GOAL
            ? "🎉 You've unlocked it! Your trainer will reach out."
            : `${REWARD_GOAL - earned} more successful ${REWARD_GOAL - earned === 1 ? 'referral' : 'referrals'} to unlock.`}
        </p>
      </Card>

      {/* How it works */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">How it works</h3>
        <ol className="mt-3 space-y-3">
          {[
            'Your friend signs up with your code.',
            <>They complete <strong>Day {REWARD_DAY}</strong> of any series.</>,
            <><strong>You both earn the reward</strong> — auto-tracked, approved by the team.</>,
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="w-6 h-6 shrink-0 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid sm:grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          {PERKS.map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-start gap-2 text-sm text-slate-600">
              <Icon className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" /> {text}
            </p>
          ))}
        </div>
      </Card>

      {/* My referrals */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Your referrals</h3>
        {referrals.length === 0 ? (
          <EmptyState icon={Gift} title="No referrals yet" hint="Share your code — your first reward is one friend away." />
        ) : (
          <ul className="mt-3 space-y-2.5">
            {referrals.map(r => {
              const meta = STATUS_META[r.status] ?? STATUS_META.signed_up;
              const d = days[r.referred_id];
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3">
                  <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-slate-50">
                    <meta.icon className={`w-4.5 h-4.5 ${meta.ring}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Friend joined {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    {r.status === 'active' && d != null && (
                      <div className="mt-1 flex items-center gap-2">
                        <ProgressBar value={Math.min(d, REWARD_DAY)} max={REWARD_DAY} className="flex-1 max-w-[140px]" />
                        <span className="text-[11px] font-semibold text-slate-400">Day {Math.min(d, REWARD_DAY)}/{REWARD_DAY}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${meta.color}`}>{meta.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, tone, label, value }) {
  return (
    <Card className="p-3.5 text-center">
      <Icon className={`w-5 h-5 mx-auto ${tone}`} />
      <p className="mt-1.5 font-display text-2xl font-bold leading-none text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{label}</p>
    </Card>
  );
}
