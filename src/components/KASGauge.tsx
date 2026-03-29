import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useResumeStore } from '../store/useResumeStore';

export function KASGauge() {
  const score = useResumeStore((state) => state.kasScore);
  const [prevScore, setPrevScore] = useState(0);

  // Smooth bounce animation for the number
  const springScore = useSpring(0, { stiffness: 60, damping: 12 });
  
  // Sync spring with actual Zustand score
  useEffect(() => {
    springScore.set(score);
    const timeout = setTimeout(() => setPrevScore(score), 500); // delta calculation delay
    return () => clearTimeout(timeout);
  }, [score, springScore]);

  // Derived display values
  const displayScore = useTransform(springScore, (val) => Math.round(val));
  
  const color = 
    score >= 80 ? 'var(--color-electric)' : 
    score >= 60 ? 'var(--color-orange)' : 
    'var(--color-red)';
    
  const delta = Math.round(score - prevScore);

  return (
    <div className="card" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 'var(--space-4)',
      padding: 'var(--space-3) var(--space-4)',
      borderRadius: 'var(--sticker-radius-pill)'
    }}>
      {/* Circular Gauge */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="50" cy="50" r="40" stroke="var(--color-surface-2)" strokeWidth="12" fill="none" />
          {/* Progress */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray="251.2" // 2 * PI * 40
            strokeDashoffset={useTransform(springScore, (val) => 251.2 - (251.2 * val) / 100)}
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        {/* Number inside */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-ink)'
        }}>
          <motion.span>{displayScore}</motion.span>
        </div>
      </div>

      {/* Label & Delta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, fontSize: 'var(--text-xs)' }}>
          ATS Match
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color }}>
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
          </span>
          {delta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={score}
              className="badge"
              style={{
                background: delta > 0 ? 'var(--color-teal)' : 'var(--color-orange)',
                color: '#fff',
                border: 'var(--sticker-outline)'
              }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
