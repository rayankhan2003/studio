
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, ArrowLeftCircle, BarChart3, Settings, UserCog, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, superAdminOnly: false },
  { href: '/admin/questions', label: 'Question Bank', icon: BookOpen, superAdminOnly: false },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, superAdminOnly: false },
  { href: '/admin/manager', label: 'Admin Manager', icon: UserCog, superAdminOnly: true },
  { href: '/admin/content', label: 'Blogs & Events', icon: Newspaper, superAdminOnly: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, superAdminOnly: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r hidden md:block">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {adminNavItems.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) {
              return null;
            }
            // A sub-admin's access to other pages would be checked here in a real app
            // e.g., if (!user.permissions.canViewAnalytics && item.href === '/admin/analytics') return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                  pathname.startsWith(item.href) && item.href !== '/admin/dashboard' ? 'bg-muted text-primary' : pathname === item.href ? 'bg-muted text-primary' : ''
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t mt-auto">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <ArrowLeftCircle className="h-5 w-5" />
            Back to Main Site
          </Link>
        </div>
      </div>
    </aside>
  );
}
