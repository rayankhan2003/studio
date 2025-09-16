
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, LayoutDashboard, BarChart3, History as HistoryIcon, Settings, ShoppingCart, User, Brain, LogOut, UserCircle, ShieldCheck, Building } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/test/custom', label: 'Create Test', icon: Settings },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/planner', label: 'AI Planner', icon: Brain },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/pricing', label: 'Pricing', icon: ShoppingCart },
];

const institutionalNavItems = [
    { href: '/institution/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/institution/teachers', label: 'Teachers', icon: UserCircle },
    { href: '/institution/sections', label: 'Sections', icon: Building },
    { href: '/institution/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const NavLink = ({ href, label, icon: Icon, closeSheet }: { href: string; label: string; icon: React.ElementType, closeSheet?: () => void }) => (
    <Link href={href} passHref legacyBehavior>
      <a onClick={closeSheet}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-base",
            pathname === href ? "bg-accent text-accent-foreground" : ""
          )}
        >
          <Icon className="mr-2 h-5 w-5" />
          {label}
        </Button>
      </a>
    </Link>
  );

  const UserMenu = () => {
    if (isLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={() => router.push('/account')}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
             {user.isAdmin && !user.isInstitutionalAdmin && (
                 <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                </DropdownMenuItem>
            )}
             {user.isInstitutionalAdmin && (
                 <DropdownMenuItem onClick={() => router.push('/institution/dashboard')}>
                    <Building className="mr-2 h-4 w-4" />
                    <span>Institution Dashboard</span>
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild variant="outline">
        <Link href="/account">
          <User className="mr-2 h-4 w-4" /> Login
        </Link>
      </Button>
    );
  };
  
  // Admin layout has its own sidebar, so we can render a minimal header
  if (pathname.startsWith('/admin')) {
      return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
             <div className="container mx-auto flex h-16 items-center justify-end px-4">
                <UserMenu />
             </div>
        </header>
      )
  }

  // Institutional layout gets a focused header
  if (pathname.startsWith('/institution')) {
       return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/institution/dashboard" className="flex items-center gap-2" aria-label="path2med Institution Home">
                    <Building className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-semibold text-primary">Institution Portal</span>
                </Link>

                 <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                    {institutionalNavItems.map((item) => (
                        <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/50",
                            pathname === item.href ? "text-primary bg-accent/80" : "text-foreground/70"
                        )}
                        >
                        {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex">
                        <UserMenu />
                    </div>
                     <div className="md:hidden">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle className="text-left flex items-center gap-2">
                                        <Building className="h-6 w-6 text-primary"/>
                                        Institution Menu
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="p-4">
                                <nav className="flex flex-col space-y-2">
                                    {institutionalNavItems.map((item) => (
                                    <NavLink key={item.label} {...item} closeSheet={() => setIsSheetOpen(false)} />
                                    ))}
                                    <div className="pt-2 mt-2 border-t">
                                    <Button variant="ghost" className="w-full justify-start text-base" onClick={() => { handleLogout(); setIsSheetOpen(false); }}>
                                        <LogOut className="mr-2 h-5 w-5" />
                                        Logout
                                    </Button>
                                    </div>
                                </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
      )
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="path2med Home">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold text-primary">path2med</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/50",
                pathname === item.href ? "text-primary bg-accent/80" : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
             <UserMenu />
          </div>
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                   <SheetTitle className="sr-only">Main Menu</SheetTitle>
                   <Link href="/" className="flex items-center gap-2" aria-label="path2med Home" onClick={() => setIsSheetOpen(false)}>
                    <Brain className="h-7 w-7 text-primary" />
                    <span className="text-xl font-semibold text-primary">path2med</span>
                  </Link>
                </SheetHeader>
                <div className="p-4">
                  <nav className="flex flex-col space-y-2">
                    {(user ? navItems : navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'History' && item.label !== 'AI Planner')).map((item) => (
                      <NavLink key={item.label} {...item} closeSheet={() => setIsSheetOpen(false)} />
                    ))}
                    <div className="pt-2 mt-2 border-t">
                      {user ? (
                         <Button variant="ghost" className="w-full justify-start text-base" onClick={() => { handleLogout(); setIsSheetOpen(false); }}>
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                          </Button>
                      ) : (
                         <NavLink href="/account" label="Login / Sign Up" icon={User} closeSheet={() => setIsSheetOpen(false)} />
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
