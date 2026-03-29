import { useResumeStore } from '../store/useResumeStore';

import { supabase } from '../lib/supabase';

const MAX_RETRIES = 3;
const BACKOFF_MS = [0, 2000, 6000]; // exponential backoff schedule

/**
 * Calls a Tiny Fish Agent API endpoint via Supabase Edge Function
 * - Exponential backoff: 0s → 2s → 6s (max 3 attempts)
 */
export async function callTinyFish<T>(
  functionSlug: string,
  payload: object
): Promise<T> {
  let lastError: Error | null = null;

  // Clean the slug just in case it was passed as a path
  const cleanSlug = functionSlug.startsWith('/') ? functionSlug.split('/').pop() || functionSlug : functionSlug;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((res) => setTimeout(res, BACKOFF_MS[attempt]));
    }

    try {
      // 1. Fetch valid auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication session missing. Please log in again.');
      }

      const { data, error } = await supabase.functions.invoke(cleanSlug, {
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
        throw new Error(`[TinyFish] Function error: ${msg}`);
      }

      if (!data) throw new Error('[TinyFish] No data returned');

      return data as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on abort (timeout) or auth failures
      if (lastError.message.includes('timeout') || lastError.message.includes('abort')) {
        lastError = new Error('[TinyFish] Request timed out');
        break;
      }
    }
  }

  // All retries exhausted — propagate error to Zustand
  const message = lastError?.message ?? 'Unknown error from Tiny Fish API';
  useResumeStore.getState().setError(message);
  throw lastError;
}
