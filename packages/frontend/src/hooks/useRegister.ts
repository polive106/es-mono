/**
 * useRegister Hook
 *
 * Thin wrapper around RegisterUseCase with TanStack Query integration.
 * Handles loading states, errors, and cache invalidation automatically.
 *
 * @example
 * const { mutate: register, isPending, error } = useRegister();
 *
 * const handleSubmit = () => {
 *   register(
 *     { name, email, password, inviteCode, languagePref },
 *     {
 *       onSuccess: () => navigate('/auth/login'),
 *       onError: (error) => showError(error.message),
 *     }
 *   );
 * };
 */

import { useMutation } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import type { RegisterData } from '../types/auth.types';

export function useRegister() {
  const { registerUseCase } = useUseCases();

  return useMutation({
    mutationFn: (data: RegisterData) => registerUseCase.execute(data),
  });
}
