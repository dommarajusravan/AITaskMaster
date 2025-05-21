import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';

const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <i className="ri-robot-line text-6xl text-google-blue mb-4"></i>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to AI Assistant</h2>
        <p className="text-neutral-500 mb-6">
          Sign in with your Google account to start chatting with our AI assistant and unlock powerful productivity tools.
        </p>
        {!isAuthenticated && (
          <div className="space-y-4">
            <GoogleSignInButton className="mx-auto" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <EmailAuthForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
