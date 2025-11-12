/**
 * useUpdateCompany Hook
 *
 * Updates a company's profile information
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';
import type { UpdateCompanyInput } from '../usecases/companies';

export function useUpdateCompany() {
  const { updateCompanyUseCase } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCompanyInput) => updateCompanyUseCase.execute(input),
    onSuccess: (company) => {
      // Update company cache after successful update
      queryClient.setQueryData(queryKeys.companies.detail(company.id), company);
      // Invalidate companies list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
  });
}
