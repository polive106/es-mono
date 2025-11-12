/**
 * Auth Hook (Legacy Compatibility)
 *
 * This hook provides backward compatibility for existing code.
 * New code should use the specific hooks from hooks/ instead:
 * - useLogin()
 * - useRegister()
 * - useLogout()
 * - useCurrentUser()
 */

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLogout } from '../hooks/useLogout';
import type { User } from '../types/auth.types';

export type { User };

interface AuthState {
  user: User | null | undefined;
  isLoading: boolean;
  logout: () => void;
}

/**
 * @deprecated Use specific hooks from hooks/ instead
 */
export function useAuth(): AuthState {
  const { data: user, isLoading } = useCurrentUser({ enabled: true, retry: false });
  const { mutate: logoutMutation } = useLogout();

  return {
    user,
    isLoading,
    logout: () => logoutMutation(),
  };
}
