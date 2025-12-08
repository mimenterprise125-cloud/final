import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type ViewMode = 'propfirm' | 'journal';

interface DashboardContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('propfirm');
  const location = useLocation();

  // persist preference in localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem('tradeone.viewMode');
      if (m === 'journal' || m === 'propfirm') setViewMode(m);
    } catch (e) {}
  }, []);

  // Auto-detect view mode based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('/journal') || currentPath.includes('/performance')) {
      setViewMode('journal');
    } else if (currentPath.includes('/accounts') || currentPath.includes('/payouts')) {
      setViewMode('propfirm');
    }
  }, [location.pathname]);

  useEffect(() => {
    try { localStorage.setItem('tradeone.viewMode', viewMode); } catch (e) {}
  }, [viewMode]);

  return (
    <DashboardContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardMode = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardMode must be used within DashboardProvider');
  }
  return context;
};
