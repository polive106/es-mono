/**
 * useLogout Hook
 *
 * Thin wrapper around LogoutUseCase with TanStack Query integration.
 * Clears auth cache and invalidates queries on successful logout.
 *
 * @example
 * const { mutate: logout, isPending } = useLogout();
 *
 * const handleLogout = () => {
 *   logout(undefined, {
 *     onSuccess: () => navigate('/auth/login'),
 *   });
 * };
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';

export function useLogout() {
  const { logoutUseCase } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUseCase.execute(),
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(queryKeys.auth.user(), null);
      // Clear all queries
      queryClient.clear();
    },
  });
}
