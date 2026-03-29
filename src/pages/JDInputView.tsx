import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useJDStore } from '../store/useJDStore';
import { useResumeStore } from '../store/useResumeStore';
import { extractJD } from '../api/jd';

export default function JDInputView() {
  const navigate = useNavigate();
  const { rawJD, requirements, keywords, setRawJD, setRequirements, setKeywords, setSeniority, removeRequirement } = useJDStore();
  const { jobId, structuredResume } = useResumeStore();
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!rawJD.trim()) return;
    if (!jobId || !structuredResume) {
      setError('Missing resume context. Please upload your resume first.');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const { requirements, keywords, seniority } = await extractJD({
        jd_text: rawJD,
        structured_resume: structuredResume,
        agent: 'tinyfish',
        job_id: jobId
      });
      
      setRequirements(requirements);
      setKeywords(keywords);
      setSeniority(seniority);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to extract JD');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        minHeight: '100vh',
        padding: 'var(--space-8)',
        paddingTop: 'calc(var(--nav-height) + var(--space-8))',
        maxWidth: 1000,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: requirements.length > 0 ? '1fr 340px' : '1fr',
        gap: 'var(--space-8)',
      }}
    >
      {/* Left Input Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Target Job Description</h1>
          <p style={{ color: '#6b7280' }}>Paste the job description you want to tailor your resume for.</p>
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            className="input"
            disabled={isExtracting}
            style={{
              minHeight: 320,
              resize: 'vertical',
              padding: 'var(--space-6)',
              lineHeight: 1.6,
              borderRadius: 'var(--sticker-radius-lg)',
            }}
            placeholder="e.g. We are looking for a Senior React Engineer..."
            value={rawJD}
            onChange={(e) => setRawJD(e.target.value)}
          />

          <motion.button
            className="btn btn-primary"
            onClick={requirements.length > 0 ? () => navigate(`/editor/${jobId}`) : handleExtract}
            disabled={isExtracting || !rawJD.trim()}
            whileTap={{ scale: 0.95, x: 2, y: 2 }}
            style={{ position: 'absolute', bottom: 'var(--space-6)', right: 'var(--space-6)' }}
          >
            {isExtracting ? 'Analyzing...' : requirements.length > 0 ? 'Start Tailoring ✦' : 'Extract Requirements'}
          </motion.button>
        </div>
        
        {error && (
          <div style={{ padding: 'var(--space-3)', background: '#fff0f0', border: '2px solid var(--color-red)', borderRadius: 'var(--sticker-radius)', fontWeight: 900 }}>
            {error}
          </div>
        )}
      </div>

      {/* Right Extracted Results Column */}
      <AnimatePresence>
        {requirements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="card card-lg"
            style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Key Requirements</h3>
              <p style={{ color: '#6b7280', fontSize: 'var(--text-sm)' }}>Edit or remove items we extracted.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {keywords.map((kw, i) => (
                <span key={i} className="chip">{kw}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <AnimatePresence>
                {requirements.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    style={{
                      padding: 'var(--space-3)',
                      background: 'var(--color-surface-2)',
                      border: 'var(--sticker-outline)',
                      borderRadius: 'var(--sticker-radius)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      boxShadow: 'var(--sticker-shadow)'
                    }}
                  >
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>
                      {req.text}
                    </div>
                    <button 
                      onClick={() => removeRequirement(req.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
