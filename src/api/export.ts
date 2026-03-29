import { supabase } from '../lib/supabase';
import type { Template } from '../store/useResumeStore';



interface ExportPayload {
  job_id: string;
  accepted_bullets: string[];
  template: Template;
  /** true when acceptedCount / totalBullets < 0.5 — signals WeasyPrint to use master template */
  use_master: boolean;
}

interface ExportResponse {
  url: string; // Signed Supabase Storage URL
}

export async function exportResumePDF(payload: ExportPayload): Promise<string> {
  // Check auth session just to ensure validity locally before invoking
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Authentication session missing. Please log in again.');
  }

  const { data, error } = await supabase.functions.invoke<ExportResponse>('resume-export', {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    let msg = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errData = await error.context.json();
        msg = errData.error || msg;
      }
    } catch { /* ignore */ }
    throw new Error(`Export failed: ${msg}`);
  }

  if (!data) throw new Error('Export failed: No data returned from edge function');

  return data.url;
}
