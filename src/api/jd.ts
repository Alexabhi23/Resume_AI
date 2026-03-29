import { supabase } from '../lib/supabase';
import type { JDRequirement } from '../store/useJDStore';



interface JDExtractPayload {
  jd_text: string;
  structured_resume: Record<string, unknown>;
  agent: 'tinyfish';
  job_id: string;
}

interface JDExtractResponse {
  requirements: JDRequirement[];
  keywords: string[];
  seniority: string;
}

export async function extractJD(payload: JDExtractPayload): Promise<JDExtractResponse> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Authentication session missing. Please log in again.');
  }

  const { data, error } = await supabase.functions.invoke('jd-extract', {
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
    throw new Error(`JD extract failed: ${msg}`);
  }

  return data;
}
