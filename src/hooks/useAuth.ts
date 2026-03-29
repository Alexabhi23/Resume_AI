import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const { user, session, loading, error, githubConnected } = useAuthStore();

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().clearAuth();
  };

  return { user, session, loading, error, githubConnected, signOut };
}
