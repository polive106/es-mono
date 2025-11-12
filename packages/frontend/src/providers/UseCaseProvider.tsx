/**
 * Use Case Provider
 *
 * Provides dependency injection for all use cases throughout the application.
 * Use cases are instantiated once and shared across the app.
 *
 * @example
 * // In main.tsx
 * <UseCaseProvider>
 *   <App />
 * </UseCaseProvider>
 *
 * // In a hook
 * const { loginUseCase } = useUseCases();
 * await loginUseCase.execute(credentials);
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { CompanyService } from '../services/company.service';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from '../usecases/auth';
import {
  GetCompanyUseCase,
  ListCompaniesUseCase,
  UpdateCompanyUseCase,
} from '../usecases/companies';
import { API_URL } from '../lib/api';

interface UseCaseContextValue {
  // Auth use cases
  loginUseCase: LoginUseCase;
  registerUseCase: RegisterUseCase;
  logoutUseCase: LogoutUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
  // Company use cases
  getCompanyUseCase: GetCompanyUseCase;
  listCompaniesUseCase: ListCompaniesUseCase;
  updateCompanyUseCase: UpdateCompanyUseCase;
}

const UseCaseContext = createContext<UseCaseContextValue | null>(null);

interface UseCaseProviderProps {
  children: ReactNode;
}

export function UseCaseProvider({ children }: UseCaseProviderProps) {
  // Instantiate services
  const authService = useMemo(() => new AuthService(API_URL), []);
  const companyService = useMemo(() => new CompanyService(API_URL), []);

  // Instantiate use cases with their dependencies
  const useCases = useMemo(
    () => ({
      loginUseCase: new LoginUseCase(authService),
      registerUseCase: new RegisterUseCase(authService),
      logoutUseCase: new LogoutUseCase(authService),
      getCurrentUserUseCase: new GetCurrentUserUseCase(authService),
      getCompanyUseCase: new GetCompanyUseCase(companyService),
      listCompaniesUseCase: new ListCompaniesUseCase(companyService),
      updateCompanyUseCase: new UpdateCompanyUseCase(companyService),
    }),
    [authService, companyService]
  );

  return <UseCaseContext.Provider value={useCases}>{children}</UseCaseContext.Provider>;
}

/**
 * Hook to access use cases
 *
 * @throws Error if used outside UseCaseProvider
 */
export function useUseCases(): UseCaseContextValue {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCases must be used within UseCaseProvider');
  }
  return context;
}
