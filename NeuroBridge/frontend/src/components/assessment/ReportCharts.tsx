/**
 * Report charts as plain SVG with explicit colours, so the very same markup
 * renders on screen and can be turned into an image for the PDF.
 */
import { BAND_INFO, BAND_ORDER, TARGET, type SkillResult } from './reportData';
import { LIGHT, type Palette } from './chartPalette';

const FONT = 'Lexend, Helvetica, Arial, sans-serif';

/* ─── Radar: all six skills at a glance ─────────────────────────────────── */

export function SkillRadar({
  skills,
  palette = LIGHT,
  size = 340,
  forExport = false,
}: {
  skills: SkillResult[];
  palette?: Palette;
  size?: number;
  forExport?: boolean;
}) {
  const w = size;
  const h = Math.round(size * 0.86);
  const cx = w / 2;
  const cy = h / 2 + 4;
  const r = Math.min(w, h) * 0.33;
  const n = skills.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, value: number) => {
    const a = angle(i);
    const d = (r * value) / 100;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)] as const;
  };
  const ring = (value: number) => skills.map((_, i) => point(i, value).join(',')).join(' ');
  const shape = skills.map((s, i) => point(i, Math.max(s.score, 3)).join(',')).join(' ');
  const summary = skills.map((s) => `${s.name} ${s.score}`).join(', ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={forExport ? w : '100%'}
      height={forExport ? h : undefined}
      role="img"
      aria-label={`Skills chart: ${summary}. Goal is ${TARGET}.`}
      style={{ maxWidth: forExport ? undefined : w, display: 'block', margin: '0 auto' }}
    >
      {forExport && <rect width={w} height={h} fill={palette.surface} />}
      {[25, 50, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke={palette.grid} strokeWidth={1} />
      ))}
      {/* Goal ring */}
      <polygon points={ring(TARGET)} fill="none" stroke={palette.target} strokeWidth={1.5} strokeDasharray="5 4" />
      {skills.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={palette.axis} strokeWidth={1} />;
      })}
      <polygon points={shape} fill={palette.fill} stroke={palette.stroke} strokeWidth={2.5} strokeLinejoin="round" />
      {skills.map((s, i) => {
        const [x, y] = point(i, Math.max(s.score, 3));
        return <circle key={s.id} cx={x} cy={y} r={5} fill={BAND_INFO[s.band].color} stroke={palette.surface} strokeWidth={2} />;
      })}
      {skills.map((s, i) => {
        const a = angle(i);
        const lx = cx + (r + 26) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return (
          <g key={`l-${s.id}`}>
            <text x={lx} y={ly} textAnchor={anchor} fontFamily={FONT} fontSize={13} fontWeight={700} fill={palette.label}>
              {s.short}
            </text>
            <text x={lx} y={ly + 15} textAnchor={anchor} fontFamily={FONT} fontSize={12} fontWeight={800} fill={BAND_INFO[s.band].color}>
              {String(s.score)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Donut: how many skills are strong / growing / need practice ─────── */

export function BandDonut({
  counts,
  palette = LIGHT,
  size = 168,
  forExport = false,
}: {
  counts: number[]; // in BAND_ORDER
  palette?: Palette;
  size?: number;
  forExport?: boolean;
}) {
  const total = counts.reduce((s, c) => s + c, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const stroke = size * 0.16;
  const circumference = 2 * Math.PI * r;
  const summary = BAND_ORDER.map((b, i) => `${BAND_INFO[b].label}: ${counts[i]}`).join(', ');
  const segments = BAND_ORDER.map((band, i) => {
    const before = counts.slice(0, i).reduce((s, c) => s + c, 0);
    return { band, count: counts[i], start: total ? (before / total) * circumference : 0 };
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Skills by level. ${summary}.`}
    >
      {forExport && <rect width={size} height={size} fill={palette.surface} />}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={palette.grid} strokeWidth={stroke} />
      {total > 0 &&
        segments.map(({ band, count, start }) => {
          if (!count) return null;
          const len = (count / total) * circumference;
          return (
            <circle
              key={band}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={BAND_INFO[band].color}
              strokeWidth={stroke}
              strokeDasharray={`${Math.max(len - (count === total ? 0 : 2), 0.5)} ${circumference}`}
              strokeDashoffset={-start}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
      <text x={cx} y={cy + 2} textAnchor="middle" fontFamily={FONT} fontSize={size * 0.2} fontWeight={900} fill={palette.label}>
        {`${counts[0]}/${total}`}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontFamily={FONT} fontSize={size * 0.075} fontWeight={700} fill={palette.muted}>
        {'strong'}
      </text>
    </svg>
  );
}
