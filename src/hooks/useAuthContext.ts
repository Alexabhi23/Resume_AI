import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

// Separated from AuthProvider to satisfy the react-refresh/only-export-components rule.
// AuthProvider.tsx should only export the AuthProvider component.
export function useAuthContext() {
  return useContext(AuthContext);
}
