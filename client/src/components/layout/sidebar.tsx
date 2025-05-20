import React from 'react';
import { useLocation } from 'wouter';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFeature } from '@/context/feature-context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { features, currentFeature, setCurrentFeature } = useFeature();
  const [location, navigate] = useLocation();

  const handleFeatureClick = (featureId: string) => {
    setCurrentFeature(featureId as any);
    navigate(features.find(f => f.id === featureId)?.path || '/');
  };

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 h-full flex flex-col">
      {/* Logo Area */}
      <div className="p-4 border-b border-neutral-200 flex items-center">
        <div className="flex items-center space-x-2">
          <i className="ri-robot-line text-2xl text-google-blue"></i>
          <h1 className="text-xl font-semibold text-neutral-800">AI Assistant</h1>
        </div>
      </div>

      {/* Features Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Features
        </h2>
        {features.map((feature) => (
          <div
            key={feature.id}
            className={cn(
              'feature-item cursor-pointer p-3 rounded-lg hover:bg-neutral-100 transition-colors flex items-center space-x-3',
              currentFeature === feature.id ? 'bg-neutral-100' : ''
            )}
            onClick={() => handleFeatureClick(feature.id)}
          >
            <i
              className={cn(
                feature.icon,
                'text-lg',
                currentFeature === feature.id ? 'text-google-blue' : 'text-neutral-500'
              )}
            ></i>
            <span className="font-medium text-neutral-800">{feature.name}</span>
          </div>
        ))}
      </div>

      {/* User Account Area */}
      <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-800">{user?.name}</span>
            <span className="text-xs text-neutral-500">{user?.email}</span>
          </div>
        </div>
        <button
          className="text-neutral-500 hover:text-neutral-800 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
