// Inline SVG illustrations for all 15 assessment questions.
// Neutral, abstract, no text, soft blue + white palette, minimal.
import React from 'react';

export function Q1VisualSimilarity() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      {/* Left shape - rounded rectangle */}
      <rect x="60" y="60" width="110" height="100" rx="20" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" />
      <rect x="85" y="85" width="60" height="14" rx="7" fill="#93c5fd" />
      <rect x="85" y="110" width="60" height="14" rx="7" fill="#93c5fd" />
      {/* Right shape - same but with notch */}
      <rect x="230" y="60" width="110" height="100" rx="20" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" />
      <rect x="255" y="85" width="60" height="14" rx="7" fill="#93c5fd" />
      <rect x="255" y="110" width="60" height="14" rx="7" fill="#93c5fd" />
      {/* Notch difference */}
      <circle cx="340" cy="60" r="12" fill="#f0f7ff" />
      <circle cx="340" cy="60" r="7" fill="#60a5fa" />
      {/* vs separator */}
      <circle cx="200" cy="110" r="18" fill="#3b82f6" opacity="0.15" />
      <circle cx="200" cy="110" r="10" fill="#3b82f6" opacity="0.25" />
    </svg>
  );
}

export function Q2LineTracking() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      {[50, 75, 100, 125, 150, 175].map((y, i) => (
        <rect key={i} x="60" y={y} width={220 + (i % 3) * 30} height="10" rx="5"
          fill={i === 2 ? "#3b82f6" : "#bfdbfe"} opacity={i === 2 ? 1 : 0.7} />
      ))}
      <rect x="55" y="95" width="315" height="22" rx="8" fill="#3b82f6" opacity="0.08" />
      <line x1="40" y1="106" x2="360" y2="106" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
      <ellipse cx="340" cy="50" rx="28" ry="18" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
      <circle cx="340" cy="50" r="8" fill="#3b82f6" />
      <circle cx="343" cy="47" r="3" fill="white" />
      {[200, 215].map((y, i) => (
        <rect key={i} x="60" y={y} width={180 + i * 20} height="10" rx="5" fill="#bfdbfe" opacity="0.5" />
      ))}
    </svg>
  );
}

export function Q3ObjectNaming() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="178" y="120" width="44" height="60" rx="6" fill="#93c5fd" />
      <rect x="160" y="174" width="80" height="12" rx="6" fill="#60a5fa" />
      <ellipse cx="200" cy="100" rx="42" ry="42" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" />
      <ellipse cx="200" cy="100" rx="28" ry="28" fill="#93c5fd" />
      <ellipse cx="200" cy="100" rx="58" ry="58" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3" strokeDasharray="8 5" />
      <circle cx="290" cy="55" r="28" fill="white" stroke="#93c5fd" strokeWidth="2" />
      <circle cx="278" cy="88" r="8" fill="white" stroke="#93c5fd" strokeWidth="2" />
      <circle cx="270" cy="104" r="5" fill="white" stroke="#93c5fd" strokeWidth="1.5" />
      <rect x="278" y="43" width="24" height="10" rx="5" fill="#bfdbfe" />
      <circle cx="290" cy="66" r="6" fill="#93c5fd" />
    </svg>
  );
}

export function Q4DirectionProcessing() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <polygon points="50,110 120,70 120,95 220,95 220,125 120,125 120,150" fill="#3b82f6" opacity="0.8" />
      <polygon points="350,110 280,70 280,95 180,95 180,125 280,125 280,150" fill="#60a5fa" opacity="0.8" />
      <circle cx="200" cy="110" r="22" fill="white" stroke="#bfdbfe" strokeWidth="3" />
      <circle cx="200" cy="110" r="12" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="2" />
    </svg>
  );
}

export function Q5MapNavigation() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <path d="M60 180 C100 180 120 140 160 120 C200 100 200 80 240 70 C280 60 310 80 340 50"
        fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <path d="M200 100 C220 130 260 150 300 160"
        fill="none" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 5" />
      <circle cx="60" cy="180" r="12" fill="#3b82f6" />
      <circle cx="60" cy="180" r="6" fill="white" />
      <polygon points="340,40 328,60 352,60" fill="#3b82f6" />
      <polygon points="300,168 290,184 310,184" fill="#93c5fd" />
      <circle cx="200" cy="100" r="8" fill="white" stroke="#3b82f6" strokeWidth="3" />
    </svg>
  );
}

export function Q6SentenceRereading() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      {[60, 85, 110, 135, 160, 185].map((y, i) => (
        <rect key={i} x="60" y={y} width={i === 1 ? 240 : 180 + (i * 8)} height="12" rx="6"
          fill={i === 1 ? "#3b82f6" : "#bfdbfe"} opacity={i === 1 ? 0.9 : 0.5} />
      ))}
      <path d="M 310 85 C 350 85 360 50 310 45 C 275 42 260 65 280 82"
        fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="275,77 272,95 288,85" fill="#3b82f6" />
    </svg>
  );
}

export function Q7MultistepInstructions() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="80" y="30" width="240" height="38" rx="12" fill="#3b82f6" opacity="0.9" />
      <circle cx="110" cy="49" r="11" fill="white" opacity="0.4" />
      <rect x="130" y="42" width="120" height="10" rx="5" fill="white" opacity="0.5" />
      <rect x="80" y="80" width="240" height="38" rx="12" fill="#60a5fa" opacity="0.85" />
      <circle cx="110" cy="99" r="11" fill="white" opacity="0.4" />
      <rect x="130" y="92" width="100" height="10" rx="5" fill="white" opacity="0.5" />
      <rect x="80" y="130" width="240" height="38" rx="12" fill="#93c5fd" opacity="0.8" />
      <circle cx="110" cy="149" r="11" fill="white" opacity="0.4" />
      <rect x="130" y="142" width="140" height="10" rx="5" fill="white" opacity="0.5" />
      <rect x="80" y="180" width="240" height="30" rx="12" fill="#bfdbfe" opacity="0.7" />
      <circle cx="110" cy="195" r="9" fill="white" opacity="0.4" />
      <rect x="130" y="189" width="90" height="10" rx="5" fill="white" opacity="0.5" />
      <line x1="200" y1="68" x2="200" y2="80" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="118" x2="200" y2="130" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="168" x2="200" y2="180" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export function Q8WritingAccuracy() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="80" y="20" width="200" height="180" rx="12" fill="white" stroke="#bfdbfe" strokeWidth="2.5" />
      {[55, 80, 105, 130, 155, 180].map((y, i) => (
        <rect key={i} x="100" y={y} width={i === 2 ? 120 : 160} height="10" rx="5"
          fill={i === 2 ? "#fde68a" : "#e0f2fe"} />
      ))}
      <line x1="100" y1="110" x2="220" y2="110" stroke="#f87171" strokeWidth="2.5" opacity="0.7" />
      <rect x="295" y="40" width="18" height="90" rx="5" fill="#fbbf24" transform="rotate(30 295 40)" />
      <polygon points="295,130 313,130 304,150" fill="#374151" transform="rotate(30 295 40)" />
      <rect x="295" y="32" width="18" height="12" rx="3" fill="#f87171" transform="rotate(30 295 40)" />
    </svg>
  );
}

export function Q9WordRetrieval() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="60" y="40" width="240" height="120" rx="24" fill="white" stroke="#3b82f6" strokeWidth="3" />
      <polygon points="120,160 90,195 155,160" fill="white" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="120,160 155,160 90,195" fill="white" />
      <circle cx="130" cy="100" r="14" fill="#bfdbfe" />
      <circle cx="200" cy="100" r="14" fill="#93c5fd" />
      <circle cx="270" cy="100" r="14" fill="#bfdbfe" />
      <circle cx="130" cy="100" r="7" fill="#3b82f6" />
      <circle cx="200" cy="100" r="7" fill="#3b82f6" />
      <circle cx="270" cy="100" r="7" fill="#3b82f6" />
    </svg>
  );
}

export function Q10ProblemSolving() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="155" y="80" width="90" height="60" rx="16" fill="#3b82f6" />
      <rect x="168" y="96" width="64" height="10" rx="5" fill="white" opacity="0.5" />
      <rect x="168" y="112" width="48" height="10" rx="5" fill="white" opacity="0.4" />
      <line x1="200" y1="140" x2="100" y2="185" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <polygon points="94,188 106,178 112,192" fill="#3b82f6" />
      <line x1="200" y1="140" x2="200" y2="190" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
      <polygon points="194,192 206,192 200,205" fill="#60a5fa" />
      <line x1="200" y1="140" x2="300" y2="185" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      <polygon points="294,178 306,188 288,192" fill="#93c5fd" />
      <circle cx="88" cy="195" r="14" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="200" cy="208" r="14" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="312" cy="195" r="14" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="2" />
    </svg>
  );
}

export function Q11SoundSegmentation() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <rect x="40" y="80" width="90" height="60" rx="14" fill="#3b82f6" />
      <rect x="155" y="80" width="90" height="60" rx="14" fill="#60a5fa" />
      <rect x="270" y="80" width="90" height="60" rx="14" fill="#93c5fd" />
      <rect x="130" y="101" width="25" height="18" rx="6" fill="#f0f7ff" />
      <rect x="245" y="101" width="25" height="18" rx="6" fill="#f0f7ff" />
      {[85, 200, 315].map((cx, i) => (
        <path key={i} d={`M${cx - 18},165 Q${cx - 9},150 ${cx},165 Q${cx + 9},180 ${cx + 18},165`}
          fill="none" stroke={["#3b82f6", "#60a5fa", "#93c5fd"][i]} strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Q12IdeaOrganization() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <line x1="200" y1="20" x2="200" y2="200" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="6 4" />
      <rect x="30" y="45" width="50" height="30" rx="8" fill="#93c5fd" transform="rotate(-12 55 60)" opacity="0.8" />
      <rect x="90" y="90" width="40" height="25" rx="8" fill="#60a5fa" transform="rotate(8 110 103)" opacity="0.8" />
      <circle cx="65" cy="130" r="20" fill="#bfdbfe" opacity="0.9" />
      <rect x="40" y="160" width="60" height="22" rx="8" fill="#93c5fd" transform="rotate(15 70 171)" opacity="0.7" />
      <circle cx="130" cy="60" r="16" fill="#3b82f6" opacity="0.5" />
      <rect x="220" y="45" width="150" height="24" rx="8" fill="#3b82f6" opacity="0.85" />
      <rect x="220" y="82" width="150" height="24" rx="8" fill="#60a5fa" opacity="0.85" />
      <rect x="220" y="119" width="150" height="24" rx="8" fill="#93c5fd" opacity="0.85" />
      <rect x="220" y="156" width="150" height="24" rx="8" fill="#bfdbfe" opacity="0.85" />
    </svg>
  );
}

export function Q13MultiplicationRecall() {
  const circles: React.ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 100 + col * 68;
      const cy = 50 + row * 52;
      const highlighted = row === 2 && col === 3;
      circles.push(
        <circle key={`${row}-${col}`} cx={cx} cy={cy} r="22"
          fill={highlighted ? '#3b82f6' : '#bfdbfe'}
          stroke={highlighted ? '#1d4ed8' : '#93c5fd'}
          strokeWidth="2.5" />
      );
    }
  }
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      {circles}
    </svg>
  );
}

export function Q14SequenceRecall() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 60 + i * 72;
        const highlighted = i === 3;
        return (
          <g key={i}>
            <rect x={cx - 28} y="80" width="56" height="60" rx="14"
              fill={highlighted ? "#3b82f6" : "#bfdbfe"}
              stroke={highlighted ? "#1d4ed8" : "#93c5fd"}
              strokeWidth={highlighted ? 3.5 : 2} />
            {i < 4 && (
              <polygon points={`${cx + 32},110 ${cx + 44},105 ${cx + 44},115`} fill="#93c5fd" opacity="0.7" />
            )}
          </g>
        );
      })}
      <circle cx="348" cy="170" r="18" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
      <path d="M342,163 Q342,158 348,158 Q354,158 354,163 Q354,168 348,170" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="348" cy="175" r="2.5" fill="#3b82f6" />
    </svg>
  );
}

export function Q15ReadingAloud() {
  return (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="220" fill="#f0f7ff" rx="16" />
      <line x1="50" y1="110" x2="350" y2="110" stroke="#e0f2fe" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 70 + i * 62;
        return (
          <g key={i}>
            <path d={`M${cx - 16},110 Q${cx - 8},82 ${cx},110 Q${cx + 8},138 ${cx + 16},110`}
              fill="none" stroke="#3b82f6"
              strokeWidth={2.5 + i * 0.3}
              strokeLinecap="round"
              opacity={0.6 + i * 0.08} />
            {i < 4 && (
              <>
                <circle cx={cx + 26} cy="110" r="3" fill="#93c5fd" opacity="0.7" />
                <circle cx={cx + 32} cy="110" r="3" fill="#93c5fd" opacity="0.5" />
                <circle cx={cx + 38} cy="110" r="3" fill="#93c5fd" opacity="0.3" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Map question IDs to their illustration components
export const questionIllustrations: Record<number, () => React.ReactElement> = {
  1: Q1VisualSimilarity,
  2: Q2LineTracking,
  3: Q3ObjectNaming,
  4: Q4DirectionProcessing,
  5: Q5MapNavigation,
  6: Q6SentenceRereading,
  7: Q7MultistepInstructions,
  8: Q8WritingAccuracy,
  9: Q9WordRetrieval,
  10: Q10ProblemSolving,
  11: Q11SoundSegmentation,
  12: Q12IdeaOrganization,
  13: Q13MultiplicationRecall,
  14: Q14SequenceRecall,
  15: Q15ReadingAloud,
};
