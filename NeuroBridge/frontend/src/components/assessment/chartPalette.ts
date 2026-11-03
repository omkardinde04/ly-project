/** Colours for the report charts (explicit hex so they also work in the PDF). */
export interface Palette {
  grid: string;
  axis: string;
  label: string;
  muted: string;
  fill: string;
  stroke: string;
  target: string;
  surface: string;
}

export const LIGHT: Palette = {
  grid: '#E2E8F0',
  axis: '#CBD5E1',
  label: '#1E293B',
  muted: '#64748B',
  fill: 'rgba(37, 99, 235, 0.18)',
  stroke: '#2563EB',
  target: '#10B981',
  surface: '#FFFFFF',
};

export const DARK: Palette = {
  grid: '#1E293B',
  axis: '#334155',
  label: '#E2E8F0',
  muted: '#94A3B8',
  fill: 'rgba(96, 165, 250, 0.22)',
  stroke: '#60A5FA',
  target: '#34D399',
  surface: '#0F172A',
};
