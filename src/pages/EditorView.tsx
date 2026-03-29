import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResumeStream } from '../hooks/useResumeStream';
import { useResumeStore } from '../store/useResumeStore';
import { useJDStore } from '../store/useJDStore';
import { BulletCard } from '../components/BulletCard';
import { ResumePreview, TemplatePicker } from '../components/ResumePreview';
import { KASGauge } from '../components/KASGauge';
import { ExportButton } from '../components/ExportButton';

export default function EditorView() {
  const { jobId: sessionId } = useParams<{ jobId: string }>();
  // Subscribes to the backend SSE generator
  useResumeStream(sessionId || '');

  const { bullets, error } = useResumeStore();
  const { rawJD } = useJDStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1fr)',
        height: '100vh',
        paddingTop: 'var(--nav-height)',
        gap: 'var(--panel-gap)'
      }}
    >
      {/* Left Panel: Conversational AI & Bullet Feed */}
      <div style={{
        background: 'var(--color-surface-2)',
        borderRight: 'var(--sticker-outline)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Header / KAS Gauge */}
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface)',
          borderBottom: 'var(--sticker-outline)',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(13,13,26,0.05)'
        }}>
          <KASGauge />
        </div>

        {/* Chat / Bullet Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          {/* AI Intro Bubble */}
          <div className="card" style={{ alignSelf: 'flex-start', maxWidth: '85%', borderTopLeftRadius: 0, padding: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontWeight: 900, fontFamily: 'var(--font-body)', fontSize: '15px' }}>
              ✦ I'm analyzing your profile against the target JD. Review my suggested rewrites below to beat the ATS.
            </p>
          </div>

          {rawJD && (
            <div className="card" style={{ alignSelf: 'flex-end', maxWidth: '85%', borderTopRightRadius: 0, padding: 'var(--space-4)', background: 'var(--color-surface)' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                Analyzing against provided JD...
              </p>
            </div>
          )}

          {error && (
            <div style={{ padding: 'var(--space-3)', background: '#fff0f0', border: '2px solid var(--color-red)', borderRadius: 'var(--sticker-radius-pill)', fontWeight: 900, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Render Streaming Bullets */}
          {Object.values(bullets).map((bullet) => (
            <BulletCard key={bullet.id} bullet={bullet} />
          ))}

          {Object.values(bullets).length === 0 && !error && (
            <div style={{ textAlign: 'center', color: '#9ea3c0', marginTop: 'var(--space-8)' }}>
              <div style={{ fontSize: '2rem', animation: 'bounce 2s infinite' }}>⏳</div>
              <p style={{ fontWeight: 900, marginTop: 'var(--space-2)' }}>Generating suggestions...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Live Resume Preview */}
      <div style={{
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Template Picker */}
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface)',
          borderBottom: 'var(--sticker-outline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Live Preview</h2>
          <TemplatePicker />
        </div>

        {/* Document Frame */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-8)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <ResumePreview />
        </div>

        {/* Sticky Export Action */}
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-8)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: 400,
          zIndex: 20
        }}>
          <ExportButton />
        </div>
      </div>
    </motion.div>
  );
}
