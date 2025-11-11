/**
 * useLogin Hook
 *
 * Thin wrapper around LoginUseCase with TanStack Query integration.
 * Handles loading states, errors, and cache invalidation automatically.
 *
 * @example
 * const { mutate: login, isPending, error } = useLogin();
 *
 * const handleSubmit = () => {
 *   login(
 *     { email, password },
 *     {
 *       onSuccess: (user) => navigate('/dashboard'),
 *       onError: (error) => showError(error.message),
 *     }
 *   );
 * };
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';
import type { LoginCredentials } from '../types/auth.types';

export function useLogin() {
  const { loginUseCase } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      loginUseCase.execute(credentials),
    onSuccess: (user) => {
      // Update user cache after successful login
      queryClient.setQueryData(queryKeys.auth.user(), user);
      // Invalidate all auth-related queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
