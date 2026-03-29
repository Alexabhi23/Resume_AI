import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'supabase-js';
import { corsHeaders } from 'cors';

// V9 - Final armored deployment (verify_jwt: true)
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');
    const rawToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? queryToken;

    if (!rawToken) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${rawToken}` } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(rawToken);
    if (authError || !user) throw new Error('Unauthorized stream session');

    const jobId = url.searchParams.get('id');
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Missing job id' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: session, error: sessionError } = await supabaseClient
      .from('analysis_sessions')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Streaming logic here...
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          `event: result\ndata: ${JSON.stringify({ status: "V10 Stream linked to " + jobId })}\n\n`
        ));
        controller.close();
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
