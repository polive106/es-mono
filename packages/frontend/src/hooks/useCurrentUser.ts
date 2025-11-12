/**
 * useCurrentUser Hook
 *
 * Fetches and caches the currently authenticated user.
 * Automatically handles loading, error states, and caching.
 *
 * @example
 * const { data: user, isLoading, error } = useCurrentUser();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 * if (!user) return <LoginPrompt />;
 *
 * return <Dashboard user={user} />;
 */

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';

interface UseCurrentUserOptions {
  /**
   * Whether to fetch user on mount
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to retry on failure
   * @default false (don't retry 401s)
   */
  retry?: boolean;
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { getCurrentUserUseCase } = useUseCases();
  const { enabled = true, retry = false } = options;

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => getCurrentUserUseCase.execute(),
    enabled,
    retry,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
