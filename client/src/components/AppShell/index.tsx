import React from 'react';
import { Sidebar } from '../Sidebar';
import { TopBar } from '../TopBar';
import { ProtectedRoute } from '../ProtectedRoute';

interface AppShellProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
          <TopBar onRefresh={onRefresh} isRefreshing={isRefreshing} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0b0f19] via-[#0e1626] to-[#0b0f19]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AppShell;
