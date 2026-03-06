'use client';

interface IconProps {
  size?: number;
  className?: string;
}

export function InquisitorIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diamond frame */}
      <path
        d="M32 4L58 32L32 60L6 32Z"
        fill="none"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Eye white */}
      <ellipse cx="30" cy="30" rx="14" ry="9" fill="#134e4a" />
      <ellipse cx="30" cy="30" rx="14" ry="9" fill="none" stroke="#5eead4" strokeWidth="1.5" />
      {/* Iris */}
      <circle cx="30" cy="30" r="5.5" fill="#0d9488">
        <animate attributeName="r" values="5.5;6.2;5.5" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Pupil */}
      <circle cx="30" cy="30" r="2.5" fill="#042f2e">
        <animate attributeName="r" values="2.5;2;2.5" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Iris highlight */}
      <circle cx="28" cy="28.5" r="1.5" fill="#5eead4" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Magnifying glass handle */}
      <line x1="42" y1="38" x2="52" y2="50" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
      {/* Magnifying glass lens ring */}
      <circle cx="38" cy="34" r="7" fill="none" stroke="#5eead4" strokeWidth="2">
        <animate attributeName="opacity" values="1;0.5;1" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Gleam on lens */}
      <path
        d="M34 29 Q36 27 38 29"
        stroke="#99f6e4"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" begin="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
