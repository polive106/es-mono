// Stub auth hook - will be replaced with actual auth implementation

interface User {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'talent_manager';
}

interface AuthState {
  user: User | null;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  return {
    user: null,
    logout: async () => {
      // TODO: Implement logout
      console.log('Logout not implemented yet');
    },
  };
}
