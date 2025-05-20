import React from 'react';
import { useLocation } from 'wouter';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFeature } from '@/context/feature-context';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { features, currentFeature } = useFeature();
  const [location, navigate] = useLocation();

  const currentFeatureObj = features.find(f => f.id === currentFeature);

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden text-neutral-800 focus:outline-none"
          onClick={onToggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-neutral-800 hidden md:block">
          {currentFeatureObj?.name || 'AI Assistant'}
        </h1>
        <div className="md:hidden flex items-center space-x-2">
          <i className="ri-robot-line text-xl text-google-blue"></i>
          <h1 className="text-lg font-semibold text-neutral-800">AI Assistant</h1>
        </div>
      </div>

      {!isAuthenticated ? (
        <GoogleSignInButton size="sm" />
      ) : (
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};

export default Header;
