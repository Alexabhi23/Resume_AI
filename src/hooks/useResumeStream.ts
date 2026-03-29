import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useResumeStore } from '../store/useResumeStore';

/**
 * SSE hook that subscribes to `resume-stream` via direct Supabase URL.
 * Uses native fetch with Web Streams to allow passing Authorization headers
 * required by the verified JWT Gateway.
 */
export function useResumeStream(sessionId: string) {
  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();

    const connect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        const apiUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const url = `${apiUrl}/functions/v1/resume-stream?session_id=${encodeURIComponent(sessionId)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': anonKey,
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to stream: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No stream available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? ''; // keep the last incomplete chunk

          for (const part of parts) {
             const lines = part.split('\n');
             let eventType = 'message';
             let eventData = '';

             for (const line of lines) {
               if (line.startsWith('event:')) eventType = line.slice(6).trim();
               else if (line.startsWith('data:')) eventData += line.slice(5).trim();
             }
             
             if (!eventData) continue;

             if (eventType === 'progress') {
                try {
                  const payload = JSON.parse(eventData);
                  useResumeStore.getState().updateBulletProgress(payload);
                } catch { }
             } else if (eventType === 'result') {
                try {
                  const payload = JSON.parse(eventData);
                  useResumeStore.getState().setBulletResult(payload);
                  if (payload.kas_score !== undefined) {
                    useResumeStore.getState().setKASScore(payload.kas_score);
                  }
                } catch { }
             }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[SSE] Stream error —', err);
        }
      }
    };

    connect();

    return () => {
      controller.abort();
    };
  }, [sessionId]);
}
