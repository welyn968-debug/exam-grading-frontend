'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  BarChart3,
  Users,
  ClipboardList,
  Settings,
  Sparkles,
  Shield,
} from 'lucide-react';

const lecturerMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'My Exams', href: '/exams' },
  { icon: CheckCircle2, label: 'Review Grades', href: '/review' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

const departmentMenuItems = [
  { icon: LayoutDashboard, label: 'Department', href: '/department' },
  { icon: Users, label: 'All Lecturers', href: '/lecturers' },
  { icon: ClipboardList, label: 'All Exams', href: '/all-exams' },
  { icon: BarChart3, label: 'Analytics', href: '/department-analytics' },
  { icon: Shield, label: 'AI Health', href: '/ai-health' },
  { icon: FileText, label: 'Reports', href: '/reports' },
];

interface SidebarProps {
  role?: 'lecturer' | 'department_head';
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role = 'lecturer', isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = role === 'department_head' ? departmentMenuItems : lecturerMenuItems;

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    return pathname.startsWith(href) && href !== '/';
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-sidebar-border/90 bg-sidebar/95 backdrop-blur-sm transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border/80 px-5 py-6">
            <Link href="/" className="flex items-center gap-3" onClick={onClose}>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">
                  ExamGrader KE
                </p>
                <p className="text-xs text-muted-foreground">
                  {role === 'department_head' ? 'Department Console' : 'Lecturer Console'}
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workspace
            </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_30px_-22px_rgba(31,78,216,0.9)]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className={`size-4 ${active ? 'text-sidebar-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </nav>

          <div className="border-t border-sidebar-border/80 px-4 py-4">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Account
            </p>
            <Link
              href="/settings"
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive('/settings')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Settings className="size-4 text-muted-foreground group-hover:text-sidebar-foreground" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t border-sidebar-border/80 px-4 py-4">
            <div className="rounded-xl border border-sidebar-border bg-white/80 px-3 py-2">
              <p className="text-xs font-medium text-slate-900">AI Health</p>
              <p className="text-xs text-muted-foreground">System running normally</p>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
