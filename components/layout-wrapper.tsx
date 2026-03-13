'use client';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface LayoutWrapperProps {
  children: ReactNode;
  role?: 'lecturer' | 'department_head';
}

export function LayoutWrapper({ children, role = 'lecturer' }: LayoutWrapperProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="dashboard-section">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
