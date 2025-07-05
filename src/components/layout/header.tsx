'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, LayoutDashboard, BarChart3, History as HistoryIcon, Settings, ShoppingCart, User, Brain } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/test/custom', label: 'Create Test', icon: Settings },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/planner', label: 'AI Planner', icon: Brain },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/pricing', label: 'Pricing', icon: ShoppingCart },
  { href: '/account', label: 'My Account', icon: User },
];

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="SmarterCat Home">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold text-primary">SmarterCat</span>
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
                   <Link href="/" className="flex items-center gap-2" aria-label="SmarterCat Home" onClick={() => setIsSheetOpen(false)}>
                    <Brain className="h-7 w-7 text-primary" />
                    <span className="text-xl font-semibold text-primary">SmarterCat</span>
                  </Link>
                </SheetHeader>
                <div className="p-4">
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.label} {...item} closeSheet={() => setIsSheetOpen(false)} />
                    ))}
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
