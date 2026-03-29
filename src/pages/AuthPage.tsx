import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setError } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // If Supabase returns a session immediately (email confirmation disabled), redirect
        if (data.session) {
          navigate('/dashboard');
        } else {
          setMessage('Check your email to confirm your account!');
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setMessage('Password reset link sent to your email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const handleGitHubOAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user repo',
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      paddingTop: 'calc(var(--nav-height) + var(--space-8))',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--color-surface)',
          border: 'var(--sticker-outline-fat)',
          borderRadius: 'var(--sticker-radius-lg)',
          boxShadow: 'var(--sticker-shadow-lg)',
          padding: 'var(--space-10)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'var(--color-electric)',
            border: 'var(--sticker-outline)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            boxShadow: 'var(--sticker-shadow)',
            fontSize: '1.5rem',
          }}>
            ✦
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-2)',
          }}>
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Get started free' : 'Reset password'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#6b7280' }}>
            {mode === 'signin' ? 'Sign in to your ResumeAI account' :
             mode === 'signup' ? 'Create your account — no credit card required' :
             'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* OAuth Buttons */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <motion.button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-3)' }}
              whileTap={{ scale: 0.93, x: 4, y: 4 }}
              onClick={handleGoogleOAuth}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>
            <motion.button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-3)' }}
              whileTap={{ scale: 0.93, x: 4, y: 4 }}
              onClick={handleGitHubOAuth}
            >
              <GitHubIcon />
              Continue with GitHub
            </motion.button>
          </div>
        )}

        {/* Divider */}
        {mode !== 'reset' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ flex: 1, height: 2, background: '#e5e7eb' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#9ea3c0', fontSize: 'var(--text-sm)' }}>
              or
            </span>
            <div style={{ flex: 1, height: 2, background: '#e5e7eb' }} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 900, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 900, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'var(--space-3)',
                background: message.includes('error') || message.includes('Invalid') ? '#fff0f0' : '#f0fff8',
                border: `2px solid ${message.includes('error') || message.includes('Invalid') ? 'var(--color-red)' : 'var(--color-teal)'}`,
                borderRadius: 'var(--sticker-radius-pill)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-ink)',
              }}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            id="auth-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            whileTap={{ scale: 0.93, x: 4, y: 4 }}
            disabled={loading}
          >
            {loading ? 'Please wait…' :
             mode === 'signin' ? 'Sign In' :
             mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </motion.button>
        </form>

        {/* Mode Switchers */}
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {mode === 'signin' && (
            <>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: '#6b7280' }}>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-electric)', fontWeight: 900, fontFamily: 'inherit' }}>
                  Sign up free
                </button>
              </span>
              <button onClick={() => setMode('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ea3c0', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: '#6b7280' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-electric)', fontWeight: 900, fontFamily: 'inherit' }}>
                Sign in
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-electric)', fontWeight: 900, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
              ← Back to sign in
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}
