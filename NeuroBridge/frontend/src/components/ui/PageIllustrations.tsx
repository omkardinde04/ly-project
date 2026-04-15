/**
 * PageIllustrations.tsx
 * Custom inline SVG illustrations for Learn, Community, and About pages.
 * No external images — zero network dependency, instant load.
 * All illustrations: soft blue + white palette, no text/letters/numbers.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LEARN — Step-based learning cards with reading, audio & visual icons
// ─────────────────────────────────────────────────────────────────────────────
export function LearnIllustration() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto h-auto"
      role="img"
      aria-label="Structured learning cards illustration"
    >
      {/* Background */}
      <rect x="0" y="0" width="480" height="320" rx="24" fill="#EEF5FF" />

      {/* ── Step connector line ── */}
      <line x1="80" y1="60" x2="80" y2="280" stroke="#BFDBFE" strokeWidth="3" strokeDasharray="6 4" />

      {/* ── Card 1 — Reading ── */}
      <rect x="100" y="40" width="340" height="70" rx="16" fill="white" />
      {/* Step dot */}
      <circle cx="80" cy="75" r="10" fill="#3B82F6" />
      <circle cx="80" cy="75" r="5" fill="white" />
      {/* Icon area */}
      <rect x="116" y="54" width="44" height="44" rx="12" fill="#DBEAFE" />
      {/* Book icon lines */}
      <rect x="126" y="64" width="24" height="3" rx="1.5" fill="#3B82F6" />
      <rect x="126" y="71" width="18" height="3" rx="1.5" fill="#93C5FD" />
      <rect x="126" y="78" width="22" height="3" rx="1.5" fill="#93C5FD" />
      <rect x="126" y="85" width="14" height="3" rx="1.5" fill="#93C5FD" />
      {/* Text blocks */}
      <rect x="174" y="58" width="140" height="12" rx="6" fill="#BFDBFE" />
      <rect x="174" y="76" width="200" height="9" rx="4.5" fill="#EFF6FF" />
      <rect x="174" y="91" width="160" height="9" rx="4.5" fill="#EFF6FF" />
      {/* Badge */}
      <rect x="376" y="58" width="48" height="20" rx="10" fill="#3B82F6" />
      <circle cx="390" cy="68" r="5" fill="white" opacity="0.5" />
      <rect x="399" y="64" width="18" height="4" rx="2" fill="white" opacity="0.5" />
      <rect x="399" y="70" width="12" height="3" rx="1.5" fill="white" opacity="0.3" />

      {/* ── Card 2 — Audio learning ── */}
      <rect x="100" y="130" width="340" height="70" rx="16" fill="white" />
      <circle cx="80" cy="165" r="10" fill="#8B5CF6" />
      <circle cx="80" cy="165" r="5" fill="white" />
      <rect x="116" y="144" width="44" height="44" rx="12" fill="#EDE9FE" />
      {/* Headphone arcs */}
      <path d="M130 164 Q130 152 138 152 Q146 152 146 164" stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="127" y="162" width="6" height="10" rx="3" fill="#8B5CF6" />
      <rect x="143" y="162" width="6" height="10" rx="3" fill="#8B5CF6" />
      <rect x="174" y="148" width="120" height="12" rx="6" fill="#C4B5FD" />
      <rect x="174" y="166" width="200" height="9" rx="4.5" fill="#F5F3FF" />
      <rect x="174" y="181" width="150" height="9" rx="4.5" fill="#F5F3FF" />
      {/* Waveform mini */}
      <rect x="380" y="155" width="4" height="20" rx="2" fill="#8B5CF6" opacity="0.8" />
      <rect x="388" y="160" width="4" height="10" rx="2" fill="#8B5CF6" opacity="0.5" />
      <rect x="396" y="153" width="4" height="24" rx="2" fill="#8B5CF6" opacity="0.6" />
      <rect x="404" y="158" width="4" height="14" rx="2" fill="#8B5CF6" opacity="0.4" />
      <rect x="412" y="156" width="4" height="18" rx="2" fill="#8B5CF6" opacity="0.7" />

      {/* ── Card 3 — Visual learning ── */}
      <rect x="100" y="220" width="340" height="70" rx="16" fill="white" />
      <circle cx="80" cy="255" r="10" fill="#10B981" />
      <circle cx="80" cy="255" r="5" fill="white" />
      <rect x="116" y="234" width="44" height="44" rx="12" fill="#D1FAE5" />
      {/* Visual/eye icon */}
      <ellipse cx="138" cy="256" rx="12" ry="8" stroke="#10B981" strokeWidth="2.5" fill="none" />
      <circle cx="138" cy="256" r="4" fill="#10B981" />
      <circle cx="140" cy="254" r="1.5" fill="white" />
      <rect x="174" y="238" width="110" height="12" rx="6" fill="#6EE7B7" />
      <rect x="174" y="256" width="200" height="9" rx="4.5" fill="#ECFDF5" />
      <rect x="174" y="271" width="170" height="9" rx="4.5" fill="#ECFDF5" />
      {/* Small visual grid */}
      <rect x="376" y="238" width="18" height="18" rx="4" fill="#6EE7B7" opacity="0.6" />
      <rect x="398" y="238" width="18" height="18" rx="4" fill="#34D399" opacity="0.5" />
      <rect x="376" y="260" width="18" height="18" rx="4" fill="#34D399" opacity="0.4" />
      <rect x="398" y="260" width="18" height="18" rx="4" fill="#6EE7B7" opacity="0.7" />

      {/* ── Neutral person (left) ── */}
      <circle cx="36" cy="280" r="20" fill="#FDE8D8" />
      <path d="M16 320 Q16 298 36 292 Q56 298 56 320" fill="#DBEAFE" />
      {/* Small arm gesture */}
      <path d="M52 300 Q68 280 80 260" stroke="#FDE8D8" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY — Users connected through rounded cards
// ─────────────────────────────────────────────────────────────────────────────
export function CommunityIllustration() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto h-auto"
      role="img"
      aria-label="Community connections illustration"
    >
      {/* Background */}
      <rect x="0" y="0" width="480" height="320" rx="24" fill="#EEF5FF" />

      {/* ── Central hub card ── */}
      <rect x="175" y="120" width="130" height="80" rx="20" fill="white" />
      <circle cx="224" cy="148" r="16" fill="#DBEAFE" />
      {/* Person icon - central */}
      <circle cx="224" cy="143" r="7" fill="#3B82F6" />
      <path d="M210 164 Q210 152 224 149 Q238 152 238 164" fill="#3B82F6" opacity="0.4" />
      <circle cx="255" cy="148" r="16" fill="#DBEAFE" />
      <circle cx="255" cy="143" r="7" fill="#8B5CF6" />
      <path d="M241 164 Q241 152 255 149 Q269 152 269 164" fill="#8B5CF6" opacity="0.4" />
      {/* Connecting arc */}
      <path d="M224 140 Q239 133 255 140" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
      {/* Reaction chips */}
      <rect x="185" y="176" width="50" height="16" rx="8" fill="#EFF6FF" />
      <circle cx="197" cy="184" r="5" fill="#BFDBFE" />
      <rect x="206" y="181" width="22" height="5" rx="2.5" fill="#BFDBFE" />
      <rect x="240" y="176" width="55" height="16" rx="8" fill="#EDE9FE" />
      <circle cx="252" cy="184" r="5" fill="#C4B5FD" />
      <rect x="261" y="181" width="26" height="5" rx="2.5" fill="#C4B5FD" />

      {/* ── Top-left user card ── */}
      <rect x="30" y="30" width="110" height="70" rx="16" fill="white" />
      <circle cx="55" cy="58" r="16" fill="#DBEAFE" />
      <circle cx="55" cy="54" r="7" fill="#3B82F6" />
      <path d="M42 74 Q42 62 55 58 Q68 62 68 74" fill="#3B82F6" opacity="0.4" />
      <rect x="78" y="46" width="46" height="9" rx="4.5" fill="#BFDBFE" />
      <rect x="78" y="60" width="36" height="7" rx="3.5" fill="#EFF6FF" />
      <rect x="78" y="72" width="42" height="7" rx="3.5" fill="#EFF6FF" />

      {/* Connection line top-left → center */}
      <path d="M140 65 Q175 100 200 130" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <circle cx="140" cy="65" r="5" fill="#93C5FD" />
      <circle cx="200" cy="130" r="5" fill="#93C5FD" />

      {/* ── Top-right user card ── */}
      <rect x="340" y="30" width="110" height="70" rx="16" fill="white" />
      <circle cx="365" cy="58" r="16" fill="#EDE9FE" />
      <circle cx="365" cy="54" r="7" fill="#8B5CF6" />
      <path d="M352 74 Q352 62 365 58 Q378 62 378 74" fill="#8B5CF6" opacity="0.4" />
      <rect x="388" y="46" width="46" height="9" rx="4.5" fill="#C4B5FD" />
      <rect x="388" y="60" width="36" height="7" rx="3.5" fill="#F5F3FF" />
      <rect x="388" y="72" width="42" height="7" rx="3.5" fill="#F5F3FF" />

      {/* Connection line top-right → center */}
      <path d="M340 65 Q305 100 280 130" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <circle cx="340" cy="65" r="5" fill="#A78BFA" />
      <circle cx="280" cy="130" r="5" fill="#A78BFA" />

      {/* ── Bottom-left user card ── */}
      <rect x="30" y="220" width="110" height="70" rx="16" fill="white" />
      <circle cx="55" cy="248" r="16" fill="#D1FAE5" />
      <circle cx="55" cy="244" r="7" fill="#10B981" />
      <path d="M42 264 Q42 252 55 248 Q68 252 68 264" fill="#10B981" opacity="0.4" />
      <rect x="78" y="236" width="46" height="9" rx="4.5" fill="#6EE7B7" />
      <rect x="78" y="250" width="36" height="7" rx="3.5" fill="#ECFDF5" />
      <rect x="78" y="262" width="42" height="7" rx="3.5" fill="#ECFDF5" />

      {/* Connection line bottom-left → center */}
      <path d="M140 255 Q170 230 200 210" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <circle cx="140" cy="255" r="5" fill="#34D399" />
      <circle cx="200" cy="210" r="5" fill="#34D399" />

      {/* ── Bottom-right user card ── */}
      <rect x="340" y="220" width="110" height="70" rx="16" fill="white" />
      <circle cx="365" cy="248" r="16" fill="#FEF3C7" />
      <circle cx="365" cy="244" r="7" fill="#F59E0B" />
      <path d="M352 264 Q352 252 365 248 Q378 252 378 264" fill="#F59E0B" opacity="0.4" />
      <rect x="388" y="236" width="46" height="9" rx="4.5" fill="#FDE68A" />
      <rect x="388" y="250" width="36" height="7" rx="3.5" fill="#FFFBEB" />
      <rect x="388" y="262" width="42" height="7" rx="3.5" fill="#FFFBEB" />

      {/* Connection line bottom-right → center */}
      <path d="M340 255 Q310 230 280 210" stroke="#FDE68A" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <circle cx="340" cy="255" r="5" fill="#FCD34D" />
      <circle cx="280" cy="210" r="5" fill="#FCD34D" />

      {/* ── Floating idea/support chips ── */}
      <rect x="170" y="48" width="70" height="24" rx="12" fill="white" />
      <circle cx="185" cy="60" r="7" fill="#BFDBFE" />
      <rect x="196" y="56" width="36" height="4" rx="2" fill="#BFDBFE" />
      <rect x="196" y="62" width="26" height="3" rx="1.5" fill="#EFF6FF" />

      <rect x="250" y="48" width="70" height="24" rx="12" fill="white" />
      <circle cx="265" cy="60" r="7" fill="#C4B5FD" />
      <rect x="276" y="56" width="36" height="4" rx="2" fill="#C4B5FD" />
      <rect x="276" y="62" width="26" height="3" rx="1.5" fill="#F5F3FF" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT — Accessible interface with adaptive features
// ─────────────────────────────────────────────────────────────────────────────
export function AboutIllustration() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto h-auto"
      role="img"
      aria-label="Accessible platform illustration"
    >
      {/* Background */}
      <rect x="0" y="0" width="480" height="320" rx="24" fill="#EEF5FF" />

      {/* ── Main interface window ── */}
      <rect x="40" y="30" width="280" height="240" rx="20" fill="white" />

      {/* Top bar */}
      <rect x="40" y="30" width="280" height="40" rx="20" fill="#DBEAFE" />
      <rect x="40" y="50" width="280" height="20" fill="#DBEAFE" />
      {/* Traffic lights */}
      <circle cx="62" cy="50" r="7" fill="#93C5FD" />
      <circle cx="82" cy="50" r="7" fill="#BFDBFE" />
      <circle cx="102" cy="50" r="7" fill="#BFDBFE" />

      {/* ── Content area — spacing controls ── */}
      {/* Font size slider */}
      <rect x="60" y="90" width="220" height="14" rx="7" fill="#EFF6FF" />
      <rect x="60" y="90" width="140" height="14" rx="7" fill="#BFDBFE" />
      <circle cx="200" cy="97" r="10" fill="#3B82F6" />
      <circle cx="200" cy="97" r="5" fill="white" />

      {/* Small text icon */}
      <rect x="60" y="84" width="16" height="6" rx="3" fill="#93C5FD" />
      {/* Large text icon */}
      <rect x="270" y="80" width="22" height="10" rx="5" fill="#3B82F6" />

      {/* ── Spacing rows ── */}
      <rect x="60" y="122" width="220" height="12" rx="6" fill="#EFF6FF" />
      <rect x="60" y="142" width="180" height="12" rx="6" fill="#EFF6FF" />
      <rect x="60" y="162" width="200" height="12" rx="6" fill="#EFF6FF" />

      {/* ── Compact vs spacious indicator ── */}
      {/* Compact block */}
      <rect x="60" y="190" width="90" height="60" rx="12" fill="#F8FAFF" />
      <rect x="68" y="200" width="74" height="5" rx="2.5" fill="#BFDBFE" />
      <rect x="68" y="208" width="60" height="5" rx="2.5" fill="#EFF6FF" />
      <rect x="68" y="216" width="68" height="5" rx="2.5" fill="#EFF6FF" />
      <rect x="68" y="224" width="50" height="5" rx="2.5" fill="#EFF6FF" />
      <rect x="68" y="232" width="62" height="5" rx="2.5" fill="#EFF6FF" />

      {/* Arrow */}
      <path d="M158 220 L178 220" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M174 215 L180 220 L174 225" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Spacious block (highlighted/active) */}
      <rect x="184" y="190" width="96" height="60" rx="12" fill="#EFF6FF" />
      <rect x="192" y="202" width="80" height="7" rx="3.5" fill="#BFDBFE" />
      <rect x="192" y="216" width="64" height="7" rx="3.5" fill="#EFF6FF" />
      <rect x="192" y="230" width="72" height="7" rx="3.5" fill="#EFF6FF" />
      {/* Active glow border */}
      <rect x="184" y="190" width="96" height="60" rx="12" stroke="#3B82F6" strokeWidth="2" fill="none" />

      {/* ── Right panel — accessibility features ── */}
      <rect x="340" y="30" width="110" height="240" rx="20" fill="white" />

      {/* Audio feature */}
      <rect x="356" y="50" width="78" height="50" rx="14" fill="#EFF6FF" />
      <circle cx="384" cy="68" r="14" fill="#DBEAFE" />
      {/* Speaker */}
      <path d="M379 63 L374 68 L379 73" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M382 60 Q392 68 382 76" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M385 57 Q398 68 385 79" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="402" y="63" width="24" height="5" rx="2.5" fill="#BFDBFE" />
      <rect x="402" y="71" width="16" height="4" rx="2" fill="#EFF6FF" />

      {/* Contrast feature */}
      <rect x="356" y="112" width="78" height="50" rx="14" fill="#EDE9FE" />
      <circle cx="384" cy="130" r="14" fill="#C4B5FD" />
      {/* Half-moon contrast icon */}
      <path d="M384 118 A12 12 0 0 1 384 142 A12 12 0 0 0 384 118Z" fill="#8B5CF6" />
      <circle cx="384" cy="130" r="12" stroke="#8B5CF6" strokeWidth="2" fill="none" />
      <rect x="402" y="125" width="24" height="5" rx="2.5" fill="#C4B5FD" />
      <rect x="402" y="133" width="16" height="4" rx="2" fill="#EDE9FE" />

      {/* Spacing feature */}
      <rect x="356" y="174" width="78" height="50" rx="14" fill="#D1FAE5" />
      <rect x="368" y="188" width="54" height="4" rx="2" fill="#6EE7B7" />
      <rect x="368" y="198" width="54" height="4" rx="2" fill="#34D399" />
      <rect x="368" y="208" width="54" height="4" rx="2" fill="#6EE7B7" />
      {/* Spacing arrows */}
      <path d="M380 192 L380 196" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M380 202 L380 206" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />

      {/* Progress feature */}
      <rect x="356" y="236" width="78" height="24" rx="10" fill="#EFF6FF" />
      <rect x="364" y="244" width="62" height="8" rx="4" fill="#EFF6FF" />
      <rect x="364" y="244" width="40" height="8" rx="4" fill="#3B82F6" />

      {/* ── Neutral person ── */}
      <circle cx="420" cy="298" r="18" fill="#FDE8D8" />
      <path d="M402 320 Q402 305 420 300 Q438 305 438 320" fill="#DBEAFE" />
      {/* Arm pointing at interface */}
      <path d="M404 310 Q370 290 330 260" stroke="#FDE8D8" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="328" cy="260" r="5" fill="#3B82F6" opacity="0.5" />

      {/* ── Floating accessibility badge ── */}
      <rect x="140" y="8" width="100" height="26" rx="13" fill="#3B82F6" />
      <circle cx="157" cy="21" r="7" fill="white" opacity="0.3" />
      <rect x="168" y="16" width="60" height="5" rx="2.5" fill="white" opacity="0.5" />
      <rect x="168" y="23" width="44" height="4" rx="2" fill="white" opacity="0.3" />
    </svg>
  );
}
