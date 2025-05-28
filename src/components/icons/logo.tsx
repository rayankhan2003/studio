import type { SVGProps } from 'react';

export function SmarterCatLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140" // Adjusted width for potentially longer name
      height="30"
      aria-label="SmarterCat Logo"
      {...props}
    >
      <text
        x="10"
        y="35"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28" // Slightly reduced font size if needed for longer name
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        SmarterCat
      </text>
    </svg>
  );
}
