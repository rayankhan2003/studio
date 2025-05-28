import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} PrepWise. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Use
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
            Contact Us
          </Link>
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
            FAQ
          </Link>
        </nav>
      </div>
    </footer>
  );
}
