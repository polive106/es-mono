/**
 * Centralized query key factory for TanStack Query
 *
 * Benefits:
 * - Type-safe query keys
 * - Hierarchical structure enables granular cache invalidation
 * - Single source of truth for all query keys
 *
 * @example
 * // Use in a query
 * useQuery({
 *   queryKey: queryKeys.auth.user(),
 *   queryFn: getCurrentUser,
 * });
 *
 * // Invalidate all auth queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
 *
 * // Invalidate only user query
 * queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  skills: {
    all: ['skills'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.skills.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.skills.all, 'detail', id] as const,
  },
  missions: {
    all: ['missions'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.missions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.missions.all, 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: () => [...queryKeys.companies.all, 'list'] as const,
    current: () => [...queryKeys.companies.all, 'current'] as const,
    detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
  },
} as const;
