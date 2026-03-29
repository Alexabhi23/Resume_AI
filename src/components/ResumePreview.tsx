import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore } from '../store/useResumeStore';
import type { Template } from '../store/useResumeStore';

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface ExperienceEntry {
  title?: string;
  company?: string;
  dates?: string;
  bullet_ids?: string[];
}

interface StructuredResume {
  personal_info?: PersonalInfo;
  experience?: ExperienceEntry[];
  [key: string]: unknown;
}

// Note: This is a client-side layout preview.
// The actual PDF export relies on server-side python WeasyPrint,
// ensuring the output beats ATS parsers perfectly.
export function ResumePreview() {
  const { bullets, selectedTemplate, structuredResume } = useResumeStore();
  const resume = structuredResume as unknown as StructuredResume | null;

  // Convert dict to array to map over experiences
  const experienceSection: ExperienceEntry[] = resume?.experience ?? [];
  
  // Filter for bullets that have been accepted or user-edited
  const getDisplayBullets = (bulletIds: string[]) => {
    return bulletIds.map(id => bullets[id]).filter(b => b?.status === 'accepted');
  };

  return (
    <div 
      className="card"
      style={{
        background: '#fff',
        width: '100%',
        minHeight: '800px',
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'var(--space-8)',
        borderRadius: 0, // Resumes should look like paper, even in Sticker Pop Pro
        border: 'var(--sticker-outline)',
        boxShadow: 'var(--sticker-shadow)',
        fontFamily: selectedTemplate === 'modern' ? 'Helvetica, sans-serif' : 'Times New Roman, serif',
        color: '#000',
        lineHeight: 1.5,
        overflowY: 'auto',
      }}
    >
      <div style={{ textAlign: selectedTemplate === 'classic' ? 'center' : 'left', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>
          {resume?.personal_info?.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {resume?.personal_info?.email} • {resume?.personal_info?.phone}
        </div>
      </div>

      {experienceSection.map((job, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
            <span>{job.title}</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{job.dates}</span>
          </div>
          <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>
            {job.company}
          </div>
          
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {/* Find the IDs assigned to this job's bullets and render the accepted ones */}
            <AnimatePresence>
              {getDisplayBullets(job.bullet_ids || []).map((b) => (
                <motion.li 
                  key={b.id}
                  layout="position"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ marginBottom: '4px', fontSize: '13px' }}
                >
                  {b.editedText || b.rewritten}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </div>
  );
}

export function TemplatePicker() {
  const { selectedTemplate, setSelectedTemplate } = useResumeStore();
  
  const templates: Template[] = ['classic', 'modern', 'minimal', 'executive'];

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
      {templates.map((t) => (
        <motion.button
          key={t}
          onClick={() => setSelectedTemplate(t)}
          whileTap={{ scale: 0.95 }}
          className="badge"
          style={{
            cursor: 'pointer',
            background: selectedTemplate === t ? 'var(--color-ink)' : 'var(--color-surface)',
            color: selectedTemplate === t ? '#fff' : 'var(--color-ink)',
            borderColor: 'var(--color-ink)',
            padding: 'var(--space-2) var(--space-4)',
            textTransform: 'capitalize'
          }}
        >
          {t}
        </motion.button>
      ))}
    </div>
  );
}
