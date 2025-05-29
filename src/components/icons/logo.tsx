import type { SVGProps } from 'react';

export function SmarterCatLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 60" // Adjusted viewBox for a more icon-like design
      width="40" // Default width for the logo
      height="40" // Default height for the logo
      aria-label="SmarterCat Logo"
      {...props}
    >
      {/* Cat head and ears - abstract */}
      <path 
        d="M15 50 C15 30, 20 15, 30 15 C40 15, 45 30, 45 50 L15 50 Z M20 18 L25 10 L30 18 M40 18 L35 10 L30 18"
        fill="hsl(var(--primary))"
      />
      {/* Stethoscope element - abstract */}
      <circle 
        cx="30" 
        cy="42" 
        r="7" 
        fill="hsl(var(--accent))" 
        stroke="hsl(var(--background))" // Use background for contrast if on primary
        strokeWidth="1.5"
      />
      <path 
        d="M22 25 C18 20, 18 15, 25 12" 
        stroke="hsl(var(--accent))" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M38 25 C42 20, 42 15, 35 12" 
        stroke="hsl(var(--accent))" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round"
      />
      <circle cx="25" cy="10" r="3" fill="hsl(var(--accent))" />
      <circle cx="35" cy="10" r="3" fill="hsl(var(--accent))" />
    </svg>
  );
}
