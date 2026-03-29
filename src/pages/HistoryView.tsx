import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ResumeSession {
  id: string;
  user_id: string;
  job_title?: string;
  company_name?: string;
  created_at: string | null;
  kas_score?: number | null;
  original_kas?: number;
  final_kas?: number;
  pdf_url?: string;
}

export default function HistoryView() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ResumeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        // Map the Supabase return type to our local ResumeSession type
        const mappedSessions: ResumeSession[] = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          created_at: item.created_at,
          kas_score: item.kas_score,
          final_kas: item.kas_score || undefined, // use kas_score as final
        }));
        setSessions(mappedSessions);
      }
      setLoading(false);
    }
    fetchSessions();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        minHeight: '100vh',
        padding: 'var(--space-8)',
        paddingTop: 'calc(var(--nav-height) + var(--space-8))',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>History</h1>
      <p style={{ color: '#6b7280', fontWeight: 700, marginBottom: 'var(--space-8)' }}>
        Your past tailored resumes and PDF exports.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: '#6b7280' }}>Loading history...</div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ fontWeight: 900, color: '#6b7280' }}>Nothing here yet. Time to tailor your first resume!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
              className="card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '4px' }}>{session.job_title || 'Unknown Role'}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6b7280' }}>
                  {session.company_name || 'Company'} • {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Unknown Date'}
                </p>
                {session.pdf_url && (
                  <a href={session.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-electric)', fontSize: 'var(--text-sm)', fontWeight: 900, textDecoration: 'none', display: 'inline-block', marginTop: 'var(--space-2)' }}>
                    Download PDF ↓
                  </a>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                <span className="badge" style={{ borderColor: 'var(--color-electric)', color: 'var(--color-electric)' }}>
                  {session.final_kas ?? 0} KAS
                </span>
                {session.original_kas && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-orange)', fontWeight: 900 }}>
                    Up from {session.original_kas}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
