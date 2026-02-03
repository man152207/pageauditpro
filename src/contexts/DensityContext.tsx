import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DensityMode = 'comfortable' | 'compact';

interface DensityContextType {
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  isCompact: boolean;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

const DENSITY_KEY = 'pagelyzer-density';

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<DensityMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(DENSITY_KEY) as DensityMode) || 'comfortable';
    }
    return 'comfortable';
  });

  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
    
    // Apply density class to document root
    if (density === 'compact') {
      document.documentElement.classList.add('density-compact');
    } else {
      document.documentElement.classList.remove('density-compact');
    }
  }, [density]);

  const setDensity = (newDensity: DensityMode) => {
    setDensityState(newDensity);
  };

  return (
    <DensityContext.Provider value={{ 
      density, 
      setDensity, 
      isCompact: density === 'compact' 
    }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
