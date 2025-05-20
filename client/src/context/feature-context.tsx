import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FeatureType, Feature } from '@/lib/types';

interface FeatureContextType {
  features: Feature[];
  currentFeature: FeatureType;
  setCurrentFeature: (featureId: FeatureType) => void;
}

const features: Feature[] = [
  {
    id: 'chat',
    name: 'Chat',
    icon: 'ri-message-3-line',
    path: '/chat',
  },
  {
    id: 'email',
    name: 'Email Summary',
    icon: 'ri-mail-line',
    path: '/email-summary',
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'ri-file-text-line',
    path: '/documents',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'ri-calendar-line',
    path: '/calendar',
  },
];

const FeatureContext = createContext<FeatureContextType>({
  features,
  currentFeature: 'chat',
  setCurrentFeature: () => {},
});

export const FeatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('chat');

  return (
    <FeatureContext.Provider
      value={{
        features,
        currentFeature,
        setCurrentFeature,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = () => useContext(FeatureContext);
