/**
 * useCompanies Hook
 *
 * Fetches list of all companies
 */

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCaseProvider';
import { queryKeys } from '../lib/query-keys';

export function useCompanies() {
  const { listCompaniesUseCase } = useUseCases();

  return useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: () => listCompaniesUseCase.execute(),
  });
}
