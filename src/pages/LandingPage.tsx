import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        overflowX: 'hidden'
      }}
    >
      <header style={{
        paddingTop: 'calc(var(--nav-height) + var(--space-20))',
        paddingBottom: 'var(--space-20)',
        textAlign: 'center',
        paddingInline: 'var(--space-4)'
      }}>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <div className="badge" style={{ background: 'var(--color-lime)', borderColor: 'var(--color-ink)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', padding: '6px 16px' }}>
            ⚡ Powered by Tiny Fish Agent API
          </div>
          
          <h1 style={{ fontSize: 'var(--text-6xl)', lineHeight: 1.1, marginBottom: 'var(--space-6)', color: 'var(--color-ink)' }}>
            Beat the <span style={{ color: 'var(--color-electric)' }}>ATS</span>.<br />
            Get the <span style={{ color: 'var(--color-teal)' }}>Interview</span>.
          </h1>
          
          <p style={{ fontSize: 'var(--text-xl)', color: '#4b5563', marginBottom: 'var(--space-8)', fontWeight: 700, maxWidth: 600, marginInline: 'auto' }}>
            Upload your master resume and a target job description. Our AI rewrites each bullet point to match exactly what employers are looking for, with verifiable ATS scoring.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <motion.div whileTap={{ scale: 0.93, x: 4, y: 4 }}>
              <Link to="/upload" className="btn btn-primary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' }}>
                Tailor Resume Now ✦
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.93, x: 4, y: 4 }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' }}>
                View Dashboard
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Sticker Decoration */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="card"
          style={{
            position: 'absolute',
            top: '25%', right: '10%',
            transform: 'rotate(12deg)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-yellow)',
            borderColor: 'var(--color-ink)'
          }}
        >
          <h3 style={{ fontSize: 'var(--text-xl)' }}>100% Match!</h3>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="card"
          style={{
            position: 'absolute',
            bottom: '20%', left: '10%',
            transform: 'rotate(-10deg)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-cyan)',
            borderColor: 'var(--color-ink)'
          }}
        >
          <h3 style={{ fontSize: 'var(--text-xl)' }}>PDF Export</h3>
        </motion.div>
      </header>
    </motion.div>
  );
}
