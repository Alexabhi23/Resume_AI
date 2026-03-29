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

export default function DashboardView() {
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

  // Mock latest session data for UI representation
  const latestSession = sessions[0];
  const oldScore = latestSession?.original_kas ?? 42;
  const newScore = latestSession?.final_kas ?? latestSession?.kas_score ?? 86;

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
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Welcome Toolbar</h1>
          <p style={{ color: '#6b7280', fontWeight: 700 }}>
            Here is an overview of your tailored resumes.
          </p>
        </div>
        {user?.user_metadata?.github_connected && (
          <div className="badge" style={{ background: 'var(--color-ink)', color: '#fff' }}>
            GitHub Connected
          </div>
        )}
      </div>

      {/* Before/After Score Visualization */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        <motion.div 
          className="card card-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-8)' }}
        >
          <h3 style={{ marginBottom: 'var(--space-4)', color: '#6b7280' }}>Original Master Match</h3>
          <div style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', color: 'var(--color-orange)', lineHeight: 1 }}>
            {oldScore}
          </div>
          <span className="badge" style={{ background: '#fff0eb', color: 'var(--color-orange)', borderColor: 'var(--color-orange)', marginTop: 'var(--space-4)' }}>
            Needs Work
          </span>
        </motion.div>

        <motion.div 
          className="card card-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-8)', borderColor: 'var(--color-electric)' }}
        >
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-electric)' }}>Tailored Score</h3>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', color: 'var(--color-electric)', lineHeight: 1 }}
          >
            {newScore}
          </motion.div>
          <span className="badge" style={{ background: '#e0fff4', color: 'var(--color-teal)', borderColor: 'var(--color-teal)', marginTop: 'var(--space-4)' }}>
            +{newScore - oldScore} pts
          </span>
        </motion.div>
      </div>

      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Recent Sessions</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: '#6b7280' }}>Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', color: '#6b7280' }}>
          <p style={{ fontWeight: 900, fontSize: 'var(--text-lg)' }}>No tailored resumes yet.</p>
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => window.location.href = '/upload'}>
            Tailor Your First Resume
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
              className="card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '4px' }}>{session.job_title || 'Software Engineer'}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6b7280' }}>
                  {session.company_name || 'Acme Corp'} • {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Unknown Date'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span className="badge" style={{ borderColor: 'var(--color-electric)', color: 'var(--color-electric)' }}>
                  Score: {session.final_kas ?? 0}
                </span>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>View</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
