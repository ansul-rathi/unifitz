import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, PlayCircle, Video, CalendarClock, Clock, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, Avatar } from '../../components/ui';

// Turn a recording URL into an embeddable player. Falls back to an iframe (with
// an "open in new tab" escape hatch) for hosts we don't specially handle.
function embedFor(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (host.includes('drive.google.com')) {
      const m = u.pathname.match(/\/d\/([^/]+)/);
      if (m) return { type: 'iframe', src: `https://drive.google.com/file/d/${m[1]}/preview` };
    }
    if (host.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u.pathname)) {
      return { type: 'video', src: url };
    }
    // Zoom + anything else: best-effort embed, may be blocked by the host.
    return { type: 'iframe', src: url, mayBlock: true };
  } catch {
    return { type: 'iframe', src: url, mayBlock: true };
  }
}

export default function SessionPlayer() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(undefined); // undefined=loading, null=not found
  const [challenge, setChallenge] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const markedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle();
      setSession(s ?? null);
      if (s) {
        const { data: c } = await supabase.from('challenges').select('id, name, teacher_id').eq('id', s.challenge_id).maybeSingle();
        setChallenge(c ?? null);
        if (c?.teacher_id) {
          const { data: t } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', c.teacher_id).maybeSingle();
          setTeacher(t ?? null);
        }
        // Watching the recording credits attendance (RPC checks enrolment; ignore if not).
        if (s.completed && !markedRef.current) {
          markedRef.current = true;
          supabase.rpc('self_mark_attendance', { p_session: s.id });
        }
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Spinner />;

  if (!session) {
    return (
      <div className="max-w-2xl">
        <Card className="p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="mt-3 font-bold text-slate-700">Recording not available</p>
          <p className="mt-1 text-sm text-slate-500">It may be processing, or you need to enroll to watch it.</p>
          <button onClick={() => navigate('/app/challenges')} className="btn-primary mt-5 inline-flex">Browse series</button>
        </Card>
      </div>
    );
  }

  const url = session.recording_link || session.zoom_link || session.zoom_join_url || '';
  const embed = embedFor(url);
  const when = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    // Mobile: edge-to-edge, tight, premium. Desktop (sm+): unchanged boxed layout.
    <div className="-mt-5 sm:mt-0 -mx-4 sm:mx-0 max-w-4xl sm:space-y-5">
      {/* Video — full-bleed on mobile, rounded card on desktop */}
      <div className="relative w-full bg-black aspect-video overflow-hidden sm:rounded-2xl sm:border sm:border-slate-200">
        {/* Floating back button (over the video on mobile) */}
        <Link
          to={challenge ? `/app/challenges/${challenge.id}` : '/app/challenges'}
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-black/45 backdrop-blur text-white text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-black/60 transition-colors duration-200 sm:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        {!url ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-sm font-semibold">Recording is processing…</p>
          </div>
        ) : embed?.type === 'video' ? (
          <video src={embed.src} controls playsInline className="absolute inset-0 w-full h-full" />
        ) : (
          <iframe
            src={embed.src}
            title={session.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      {/* Desktop-only back link above details */}
      <Link
        to={challenge ? `/app/challenges/${challenge.id}` : '/app/challenges'}
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to series
      </Link>

      {/* Details */}
      <div className="px-4 pt-3 sm:px-0 sm:pt-0">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">Day {session.day_number}</span>
            {session.category && <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{session.category}</span>}
            {session.completed && <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full"><PlayCircle className="w-3.5 h-3.5" /> Recording</span>}
          </div>

          <h1 className="mt-2.5 text-lg sm:text-2xl font-bold leading-snug">{session.title}</h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
            {challenge && (
              <Link to={`/app/challenges/${challenge.id}`} className="inline-flex items-center gap-1.5 hover:text-brand-600">
                <Layers className="w-4 h-4 text-slate-400" /> {challenge.name}
              </Link>
            )}
            {teacher && (
              <span className="inline-flex items-center gap-1.5"><Avatar name={teacher.full_name} url={teacher.avatar_url} size="w-5 h-5" /> {teacher.full_name}</span>
            )}
            {when && <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-slate-400" /> {when}</span>}
            {session.duration_minutes && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {session.duration_minutes} min</span>}
          </div>

          {session.description && (
            <p className="mt-3.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{session.description}</p>
          )}

          {url && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3.5">
              <a href={url} target="_blank" rel="noreferrer" className="btn-secondary !py-2 text-sm">
                <ExternalLink className="w-4 h-4" /> Open in new tab
              </a>
              {embed?.mayBlock && (
                <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> If the video doesn't load above, use "Open in new tab".
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
