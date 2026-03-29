import { useCallback, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useResumeStore } from '../store/useResumeStore';

export default function UploadView() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        minHeight: '100vh',
        padding: 'var(--space-8)',
        paddingTop: 'calc(var(--nav-height) + var(--space-12))',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>
          Upload your resume
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: '#6b7280', fontWeight: 700 }}>
          Let's start with your current master resume. PDF or DOCX only.
        </p>
      </div>

      <DropZone onUploadSuccess={() => navigate('/jd')} />
    </motion.div>
  );
}

function DropZone({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setProgress(10);
    try {
      // 1. Proactive session check and refresh
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError || !session?.access_token) {
        console.error('[Auth] Session validation failed:', sessionError);
        throw new Error('Session expired — please log in again to upload.');
      }
      
      console.log('[Auth] token prefix:', session.access_token.slice(0, 20));
      console.log('[Auth] anon key defined:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      const formData = new FormData();
      formData.append('file', file);

      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 10 : p));
      }, 300);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(body.message ?? 'Upload failed');
      }
      
      const data = await res.json();
      useResumeStore.getState().setJobId(data.job_id);
      useResumeStore.getState().setStructuredResume(data.structured_json);
      
      setProgress(100);
      setTimeout(onUploadSuccess, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload');
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    await uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  return (
    <div
      className={`card card-lg`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `var(--sticker-outline-fat)`,
        borderColor: isDragging ? 'var(--color-electric)' : 'var(--color-ink)',
        background: isDragging ? 'var(--color-surface-2)' : 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all var(--transition-base)',
      }}
    >
      <input
        type="file"
        id="file-upload"
        accept=".pdf,.docx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {progress > 0 && progress < 100 ? (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Uploading... {progress}%</h3>
          <div style={{
            height: 24,
            background: 'var(--color-surface-2)',
            border: 'var(--sticker-outline)',
            borderRadius: 'var(--sticker-radius-pill)',
            overflow: 'hidden',
            boxShadow: 'var(--sticker-shadow)',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{
                height: '100%',
                background: 'var(--color-electric)',
                borderRight: 'var(--sticker-outline)',
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div style={{
            width: 80, height: 80,
            background: 'var(--color-lime)', border: 'var(--sticker-outline)', borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', marginBottom: 'var(--space-4)',
            boxShadow: 'var(--sticker-shadow)',
            transform: isDragging ? 'translate(-4px, -4px) scale(1.1)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            📄
          </div>
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
            Drag and drop your resume
          </h3>
          <p style={{ color: '#6b7280', marginBottom: 'var(--space-6)', fontWeight: 700 }}>
            PDF or DOCX • Max 10MB
          </p>
          <label htmlFor="file-upload" className="btn btn-primary" style={{ padding: 'var(--space-4) var(--space-8)' }}>
            Browse Files
          </label>
        </>
      )}

      {error && (
        <div style={{
          marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-4)',
          background: '#fff0f0', border: '2px solid var(--color-red)', borderRadius: 'var(--sticker-radius-pill)',
          color: 'var(--color-ink)', fontWeight: 900
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
