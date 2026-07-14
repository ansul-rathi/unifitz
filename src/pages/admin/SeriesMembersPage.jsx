import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import SeriesMembers from '../../components/SeriesMembers';

// Dedicated members screen — kept off the main Series detail page; reached via
// the "Enrolled" stat. Serves both admin and teacher (teacher = read-only).
export default function SeriesMembersPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const isAdmin = profile.role === 'admin';
  const backTo = `${isAdmin ? '/admin' : '/teacher'}/series/${id}`;
  const [name, setName] = useState('');

  useEffect(() => {
    supabase.from('challenges').select('name').eq('id', id).maybeSingle().then(({ data }) => setName(data?.name ?? ''));
  }, [id]);

  return (
    <div className="space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> Back to series</Link>
      <h1 className="text-2xl md:text-3xl font-bold">{name || 'Series'} — Members</h1>
      <SeriesMembers challengeId={id} isAdmin={isAdmin} />
    </div>
  );
}
