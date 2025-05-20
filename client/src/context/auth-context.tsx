import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, AuthState } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const { data, isLoading } = useQuery<{
    isAuthenticated: boolean;
    user: User | null;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string }) => {
      return await apiRequest('POST', '/api/auth/demo-login', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    },
  });

  useEffect(() => {
    if (!isLoading) {
      setAuthState({
        isAuthenticated: data?.isAuthenticated || false,
        isLoading: false,
        user: data?.user || null,
      });
    }
  }, [data, isLoading]);

  const login = async (name: string, email: string) => {
    if (!name || !email) return;
    await loginMutation.mutateAsync({ name, email });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
