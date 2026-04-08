export function CoffeeLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Steam */}
      <path d="M10 7c0-1-1-1.5-1-2.5s1-1.5 1-2.5" />
      <path d="M14 7c0-1-1-1.5-1-2.5s1-1.5 1-2.5" />
      {/* Cup body */}
      <path d="M6 9h12l-1.5 8.5a1 1 0 01-1 .5h-7a1 1 0 01-1-.5L6 9z" />
      {/* Handle */}
      <path d="M18 12.5h1a2.5 2.5 0 010 5h-1" />
      {/* Saucer */}
      <path d="M4 20.5h16" />
    </svg>
  );
}
