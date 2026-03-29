import { useState } from 'react';
import { motion } from 'framer-motion';
import { useResumeStore } from '../store/useResumeStore';
import { exportResumePDF } from '../api/export';

export function ExportButton() {
  const { jobId, kasScore, bullets, selectedTemplate, totalBullets, acceptedCount } = useResumeStore();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Allow export if KAS >= 50, OR if user explicitly overrides (assume backend handles threshold)
  const isEnabled = kasScore >= 50 && totalBullets > 0;

  const handleExport = async () => {
    if (!jobId || !isEnabled) return;
    setIsExporting(true);
    setError(null);

    // Filter accepted bullet IDs
    const accepted_bullets = Object.values(bullets)
      .filter((b) => b.status === 'accepted')
      .map((b) => b.id);

    // If accepted count is less than 50% of total bullets parsed,
    // tell backend to merge accepted bullets into the master resume format.
    const use_master = totalBullets > 0 && acceptedCount / totalBullets < 0.5;

    try {
      const url = await exportResumePDF({
        job_id: jobId,
        accepted_bullets,
        template: selectedTemplate,
        use_master
      });
      // Opens the signed Supabase Storage URL
      window.open(url, '_blank');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
      <motion.button
        className="btn btn-electric"
        style={{
          width: '100%',
          padding: 'var(--space-4)',
          fontSize: 'var(--text-lg)',
          background: isEnabled ? 'var(--color-electric)' : '#9ea3c0',
          color: '#fff',
          cursor: isEnabled && !isExporting ? 'pointer' : 'not-allowed',
        }}
        whileTap={isEnabled && !isExporting ? { scale: 0.95, x: 4, y: 4 } : {}}
        onClick={handleExport}
        disabled={!isEnabled || isExporting}
      >
        {isExporting ? 'Generating PDF...' : 'Export PDF ✧'}
      </motion.button>
      
      {!isEnabled && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-orange)', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 900 }}>
          Reach a KAS Score of at least 50 to export.
        </span>
      )}

      {error && (
        <div style={{ padding: 'var(--space-2)', background: '#fff0f0', border: '1.5px solid var(--color-red)', borderRadius: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-ink)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
