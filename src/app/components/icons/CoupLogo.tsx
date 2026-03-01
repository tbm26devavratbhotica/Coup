'use client';

interface CoupLogoProps {
  className?: string;
}

export function CoupLogo({ className }: CoupLogoProps) {
  return (
    <svg
      viewBox="0 0 320 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="COUP"
    >
      {/* Dagger behind the letters */}
      <g opacity="0.25">
        <path
          d="M160 0L156 52h8L160 0z"
          fill="#94a3b8"
        />
        <path
          d="M150 52h20v4c0 1-4 3-10 3s-10-2-10-3v-4z"
          fill="#475569"
        />
        <rect x="157" y="58" width="6" height="8" rx="1" fill="#1e293b" />
        <circle cx="160" cy="69" r="2.5" fill="#475569" />
      </g>

      {/* COUP text — single centered element */}
      <text
        x="160"
        y="78"
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="80"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="8"
      >
        COUP
      </text>

      {/* Underline accent */}
      <path
        d="M25 88h270"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Decorative dagger tips on sides */}
      <path d="M15 88l-6-8v8h6z" fill="#fbbf24" opacity="0.4" />
      <path d="M305 88l6-8v8h-6z" fill="#fbbf24" opacity="0.4" />
    </svg>
  );
}
