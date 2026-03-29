import { useState } from 'react';
import { motion } from 'framer-motion';
import { useResumeStore } from '../store/useResumeStore';
import type { BulletState } from '../store/useResumeStore';

interface BulletCardProps {
  bullet: BulletState;
}

export function BulletCard({ bullet }: BulletCardProps) {
  const { acceptBullet, rejectBullet, editBullet } = useResumeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bullet.rewritten || '');

  const handleEditSave = () => {
    editBullet(bullet.id, editText);
    setIsEditing(false);
  };

  const isAccepted = bullet.status === 'accepted';
  const isRejected = bullet.status === 'rejected';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, rotate: -2, y: 16 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!isAccepted && !isRejected ? { scale: 1.01 } : {}}
      className="card"
      style={{
        position: 'relative',
        background: isAccepted ? 'var(--color-surface-2)' : 'var(--color-surface)',
        borderLeft: isAccepted ? '5px solid var(--color-teal)' : isRejected ? '5px solid var(--color-red)' : '5px solid var(--color-electric)',
        marginBottom: 'var(--space-4)',
        opacity: isRejected ? 0.6 : 1,
        transition: 'all var(--transition-base)',
      }}
    >
      {/* Streaming Progress Bar */}
      {bullet.status === 'streaming' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'var(--color-surface-2)', overflow: 'hidden',
          borderRadius: 'var(--sticker-radius) var(--sticker-radius) 0 0'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bullet.progress}%` }}
            style={{ height: '100%', background: 'var(--color-electric)', transition: 'width 0.2s' }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        
        {/* Original Text */}
        <div style={{ fontSize: 'var(--text-xs)', color: '#6b7280', fontFamily: 'var(--font-body)', fontWeight: 700, fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid #e5e7eb' }}>
          "{bullet.original}"
        </div>

        {/* Rewritten Text / Editor */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <textarea
              className="input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ minHeight: 80, fontSize: 'var(--text-sm)', padding: 'var(--space-2)' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}>Save</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', fontWeight: 900, lineHeight: 1.5 }}>
            {bullet.editedText || bullet.rewritten || 'Analyzing...'}
            {bullet.status === 'streaming' && <span style={{ color: 'var(--color-electric)', animation: 'pulse 1s infinite' }}> ✦</span>}
          </div>
        )}

        {/* Keywords */}
        {bullet.keywords.length > 0 && !isEditing && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            {bullet.keywords.map((kw, i) => (
              <span key={i} className="chip" style={{ fontSize: '10px', padding: '2px 8px' }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {bullet.status === 'done' && !isAccepted && !isRejected && !isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '2px dashed #e5e7eb' }}
        >
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => acceptBullet(bullet.id)}
            className="btn btn-teal"
            style={{ flex: 1, padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
          >
            ✓ Accept
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ padding: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
          >
            ✎ Edit
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => rejectBullet(bullet.id)}
            className="btn btn-danger"
            style={{ padding: 'var(--space-2)', fontSize: '1.2rem', width: 44, display: 'flex', justifyContent: 'center' }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
