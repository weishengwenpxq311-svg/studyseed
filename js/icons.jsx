// Simple inline icons — minimal line art, paper-tag feel
const Icon = {
  Calendar: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="6" width="20" height="18" rx="3"/>
      <path d="M4 11h20"/>
      <path d="M9 3v5M19 3v5"/>
      <circle cx="10" cy="16" r="1" fill="currentColor"/>
      <circle cx="14" cy="16" r="1" fill="currentColor"/>
      <circle cx="18" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),
  Book: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 5h7a3 3 0 0 1 3 3v16a3 3 0 0 0-3-3H5z"/>
      <path d="M23 5h-7a3 3 0 0 0-3 3v16a3 3 0 0 1 3-3h7z"/>
      <path d="M8 10h4M8 13h3"/>
    </svg>
  ),
  Grid: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="4" width="20" height="20" rx="3"/>
      <path d="M4 10h20M4 17h20M11 4v20M18 4v20"/>
    </svg>
  ),
  Sprout: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 23v-9"/>
      <path d="M14 14c0-4 3-7 7-7-0.5 4.5-3 7-7 7z"/>
      <path d="M14 17c0-3-2.5-5-6-5 .3 3.5 2.5 5 6 5z"/>
      <path d="M9 23h10"/>
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 14l6 6 12-14"/>
    </svg>
  ),
  ArrowRight: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 12H5M11 19l-7-7 7-7"/>
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 28 28" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="14" cy="14" r="9"/>
      <path d="M14 8v6l4 2"/>
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Smile: (p) => (
    <svg viewBox="0 0 64 64" width={p.size||64} height={p.size||64} fill="none" {...p}>
      <circle cx="22" cy="26" r="3.4" fill="currentColor"/>
      <circle cx="42" cy="26" r="3.4" fill="currentColor"/>
      <path d="M18 36c3 6 9 9 14 9s11-3 14-9" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  Triangles: (p) => (
    <svg viewBox="0 0 48 16" width={p.size||48} height={(p.size||48)/3} fill="currentColor" {...p}>
      <path d="M0 0L12 8L0 16z"/>
      <path d="M16 0L28 8L16 16z"/>
      <path d="M32 0L44 8L32 16z"/>
    </svg>
  )
};

Object.assign(window, { Icon });
