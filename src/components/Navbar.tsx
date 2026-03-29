import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        background: 'var(--color-surface)',
        border: 'none',
        borderBottom: 'var(--sticker-outline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        zIndex: 'var(--z-nav)',
        boxShadow: '0 4px 0px #0d0d1a',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'var(--color-electric)',
          border: 'var(--sticker-outline)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--sticker-shadow)',
          fontSize: '1.1rem',
        }}>
          ✦
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          color: 'var(--color-ink)',
        }}>
          ResumeAI
        </span>
      </Link>

      {/* Nav Links */}
      {!user && (
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
          <NavLink to="/#features">Features</NavLink>
          <NavLink to="/#how-it-works">How it Works</NavLink>
          <NavLink to="/#pricing">Pricing</NavLink>
        </div>
      )}

      {user && (
        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/upload">Tailor Resume</NavLink>
          <NavLink to="/history">History</NavLink>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        {user ? (
          <motion.button
            className="btn btn-secondary"
            onClick={signOut}
            whileTap={{ scale: 0.93, x: 4, y: 4 }}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Sign Out
          </motion.button>
        ) : isAuthPage ? null : (
          <>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: 'var(--text-sm)' }}>
              Log In
            </Link>
            <motion.div whileTap={{ scale: 0.93, x: 4, y: 4 }}>
              <Link to="/login" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
                Get Started Free
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </motion.nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 900,
        fontSize: 'var(--text-sm)',
        color: 'var(--color-ink)',
        textDecoration: 'none',
        padding: 'var(--space-1) var(--space-2)',
        transition: 'color var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-electric)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
    >
      {children}
    </Link>
  );
}
