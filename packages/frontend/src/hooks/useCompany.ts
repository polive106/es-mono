/**
 * useCompany Hook
 *
 * Fetches a single company by ID
 */

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';

export function useCompany(id?: string) {
  const { getCompanyUseCase } = useUseCases();

  return useQuery({
    queryKey: queryKeys.companies.detail(id!),
    queryFn: () => getCompanyUseCase.execute(id!),
    enabled: !!id,
  });
}
