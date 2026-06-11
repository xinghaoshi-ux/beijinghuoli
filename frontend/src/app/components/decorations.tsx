export function TennisBallSwoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" aria-hidden>
      <path d="M5 55 C 60 20, 110 25, 165 45" stroke="#C9BEEC" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M10 65 C 65 30, 115 38, 170 52" stroke="#E3F6A5" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="178" cy="48" r="14" fill="#D4F751" stroke="#B6D935" strokeWidth="1.5" />
      <path d="M168 42 Q 178 48 168 54" stroke="#ffffff" strokeWidth="1.4" fill="none" />
      <path d="M188 42 Q 178 48 188 54" stroke="#ffffff" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

export function RacketSparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} fill="none" aria-hidden>
      <ellipse cx="120" cy="90" rx="55" ry="62" stroke="#9B7BE0" strokeWidth="6" fill="#F1EBFE" />
      <g stroke="#B9A4E8" strokeWidth="2">
        <line x1="78" y1="90" x2="162" y2="90" />
        <line x1="120" y1="32" x2="120" y2="148" />
        <line x1="88" y1="58" x2="152" y2="122" />
        <line x1="88" y1="122" x2="152" y2="58" />
      </g>
      <rect x="115" y="148" width="10" height="50" rx="4" fill="#8E6BD4" transform="rotate(-20 120 173)" />
      <circle cx="178" cy="160" r="18" fill="#D4F751" stroke="#B6D935" strokeWidth="1.5" />
      <path d="M168 152 Q 178 160 168 168" stroke="#ffffff" strokeWidth="1.6" fill="none" />
      <g fill="#9B7BE0">
        <path d="M40 50 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" />
        <path d="M180 30 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" />
        <path d="M50 170 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" />
      </g>
      <path d="M30 130 Q 60 110 80 140" stroke="#9B7BE0" strokeWidth="2" strokeDasharray="4 4" fill="none" />
    </svg>
  );
}

export function TrophyDot({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex items-center justify-center rounded-full bg-[#D4F751] " + className}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
        <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" fill="#1F1A38" />
        <path d="M9 13h6v2H9zM10 15h4v3h-4z" fill="#1F1A38" />
        <path d="M5 5h2v2a2 2 0 1 1-2-2zM17 5h2a2 2 0 1 1-2 2V5z" stroke="#1F1A38" strokeWidth="1.2" />
      </svg>
    </span>
  );
}
