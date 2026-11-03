/**
 * Builds the downloadable report as a real (vector) PDF with jsPDF.
 * Charts reuse the on-screen SVG components, rasterised at 3× for sharpness.
 * (html2canvas cannot read Tailwind v4's oklch() colours, so we don't
 * screenshot the page.) Loaded on demand — only when the student clicks
 * "Download report".
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { jsPDF } from 'jspdf';
import { SkillRadar, BandDonut } from './ReportCharts';
import { LIGHT } from './chartPalette';
import {
  BAND_INFO,
  BAND_ORDER,
  TARGET,
  formatDuration,
  type MetricsLike,
  type SkillResult,
} from './reportData';

export interface ReportPdfInput {
  studentName?: string;
  levelLabel: string;
  levelColor: string;
  score: number;
  skills: SkillResult[];
  focus: SkillResult[];
  levels: number[]; // skills per band, in BAND_ORDER
  metrics?: MetricsLike;
  recommendations: string[];
  learningStyle: { primary: string; description: string; tips: string[] };
}

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const v = h.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
const INK: RGB = [30, 41, 59];
const MUTED: RGB = [100, 116, 139];
const LINE: RGB = [226, 232, 240];
const BLUE: RGB = [37, 99, 235];
const SOFT: RGB = [248, 250, 252];

async function svgToPng(svg: string, width: number, height: number, scale = 3): Promise<string> {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not draw the chart'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadReportPdf(input: ReportPdfInput): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const W = 210;
  const M = 14; // page margin
  const today = new Date();
  const dateText = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const ink = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  const footer = (page: number) => {
    draw(LINE);
    doc.setLineWidth(0.3);
    doc.line(M, 284, W - M, 284);
    font(8);
    ink(MUTED);
    doc.text('This is a screening to help you learn, not a medical diagnosis. A teacher or specialist can do a full check.', M, 289);
    doc.text(`Page ${page}`, W - M, 289, { align: 'right' });
  };

  const sectionTitle = (text: string, x: number, y: number) => {
    font(13, 'bold');
    ink(INK);
    doc.text(text, x, y);
  };

  // ── Header band ──────────────────────────────────────────────────────────
  fill(BLUE);
  doc.rect(0, 0, W, 30, 'F');
  ink([255, 255, 255]);
  font(20, 'bold');
  doc.text('My Learning Report', M, 15);
  font(10);
  doc.text('NeuroBridge reading & learning check', M, 22);
  font(10, 'bold');
  if (input.studentName) doc.text(input.studentName, W - M, 15, { align: 'right' });
  font(10);
  doc.text(dateText, W - M, 22, { align: 'right' });

  // ── Summary tiles ────────────────────────────────────────────────────────
  const tileY = 37;
  const tileH = 24;
  const tileW = (W - M * 2 - 8) / 3;
  const tiles: { label: string; value: string; color: RGB }[] = [
    { label: 'Your level', value: input.levelLabel, color: hex(input.levelColor) },
    { label: 'Performance index', value: `${input.score} / 100`, color: BLUE },
    {
      label: 'Areas to grow',
      value: String(input.skills.filter((s) => s.score < TARGET).length),
      color: hex(BAND_INFO.needs.color),
    },
  ];
  tiles.forEach((t, i) => {
    const x = M + i * (tileW + 4);
    fill(SOFT);
    draw(LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, tileY, tileW, tileH, 3, 3, 'FD');
    fill(t.color);
    doc.roundedRect(x, tileY, 2.2, tileH, 1, 1, 'F');
    font(8, 'bold');
    ink(MUTED);
    doc.text(t.label.toUpperCase(), x + 6, tileY + 8);
    font(15, 'bold');
    ink(t.color);
    doc.text(t.value, x + 6, tileY + 18, { maxWidth: tileW - 9 });
  });

  // ── Radar + focus areas ──────────────────────────────────────────────────
  const radarSvg = renderToStaticMarkup(
    createElement(SkillRadar, { skills: input.skills, palette: LIGHT, size: 360, forExport: true }),
  );
  const radarPng = await svgToPng(radarSvg, 360, Math.round(360 * 0.86));
  const radarY = 68;
  sectionTitle('Your skills at a glance', M, radarY);
  doc.addImage(radarPng, 'PNG', M - 2, radarY + 3, 92, 92 * 0.86, 'radar', 'FAST');
  font(8);
  ink(MUTED);
  draw(hex(LIGHT.target));
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([1.6, 1.2], 0);
  doc.line(M + 4, radarY + 85, M + 12, radarY + 85);
  doc.setLineDashPattern([], 0);
  doc.text(`Green dashed ring = goal (${TARGET})`, M + 14, radarY + 86);

  const fx = 112;
  sectionTitle('Where to grow first', fx, radarY);
  let fy = radarY + 8;
  input.focus.forEach((s, i) => {
    const band = BAND_INFO[s.band];
    fill(hex(band.soft));
    doc.roundedRect(fx, fy, W - M - fx, 24, 3, 3, 'F');
    fill(hex(band.color));
    doc.circle(fx + 6, fy + 7, 3.2, 'F');
    font(9, 'bold');
    ink([255, 255, 255]);
    doc.text(String(i + 1), fx + 6, fy + 8.2, { align: 'center' });
    font(11, 'bold');
    ink(INK);
    doc.text(s.name, fx + 12, fy + 8);
    font(11, 'bold');
    ink(hex(band.text));
    doc.text(`${s.score}`, W - M - 4, fy + 8, { align: 'right' });
    font(8.5);
    ink(INK);
    doc.text(doc.splitTextToSize(`Try: ${s.tip}`, W - M - fx - 10), fx + 6, fy + 15);
    fy += 27;
  });
  if (input.focus.every((s) => s.score >= TARGET)) {
    font(9);
    ink(MUTED);
    doc.text('No big gaps. Keep practising to stay strong!', fx, fy + 3);
  }

  // ── All skills bar chart ─────────────────────────────────────────────────
  const barsY = 165;
  sectionTitle('All skills, lowest first', M, barsY);
  const labelW = 44;
  const trackX = M + labelW;
  const trackW = 98;
  const sorted = [...input.skills].sort((a, b) => a.score - b.score);
  sorted.forEach((s, i) => {
    const y = barsY + 6 + i * 8.5;
    const band = BAND_INFO[s.band];
    font(9.5, 'bold');
    ink(INK);
    doc.text(s.name, M, y + 4.2);
    fill([241, 245, 249]);
    doc.roundedRect(trackX, y, trackW, 5.6, 2.8, 2.8, 'F');
    fill(hex(band.color));
    const bw = Math.max((trackW * s.score) / 100, 5.6);
    doc.roundedRect(trackX, y, bw, 5.6, 2.8, 2.8, 'F');
    font(9.5, 'bold');
    ink(hex(band.text));
    doc.text(String(s.score), trackX + trackW + 3, y + 4.2);
    font(8.5);
    ink(MUTED);
    doc.text(band.label, trackX + trackW + 12, y + 4.2);
  });
  // goal marker
  const gx = trackX + (trackW * TARGET) / 100;
  draw(hex(LIGHT.target));
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1.2, 1], 0);
  doc.line(gx, barsY + 4, gx, barsY + 6 + sorted.length * 8.5);
  doc.setLineDashPattern([], 0);
  font(7.5, 'bold');
  ink(hex('#047857'));
  doc.text(`goal ${TARGET}`, gx, barsY + 3, { align: 'center' });

  // ── Answers donut + how you worked ───────────────────────────────────────
  const lowY = 226;
  sectionTitle('Skills by level', M, lowY);
  const donutSvg = renderToStaticMarkup(
    createElement(BandDonut, { counts: input.levels, palette: LIGHT, size: 168, forExport: true }),
  );
  const donutPng = await svgToPng(donutSvg, 168, 168);
  doc.addImage(donutPng, 'PNG', M, lowY + 3, 40, 40, 'donut', 'FAST');
  BAND_ORDER.forEach((band, i) => {
    const ly = lowY + 15 + i * 8;
    fill(hex(BAND_INFO[band].color));
    doc.roundedRect(M + 44, ly - 3, 4, 4, 1, 1, 'F');
    font(9.5);
    ink(INK);
    doc.text(`${BAND_INFO[band].label}: ${input.levels[i]}`, M + 50, ly);
  });

  const statsX = 112;
  sectionTitle('How you worked', statsX, lowY);
  const m = input.metrics;
  const stats: [string, string][] = [
    ['Time taken', formatDuration(m?.totalTime)],
    ['Answers changed', String(m?.confusionCount ?? 0)],
    ['Listened again', String(m?.audioReplayCount ?? 0)],
    ['Went back', String(m?.backtrackCount ?? 0)],
  ];
  const sw = (W - M - statsX - 4) / 2;
  stats.forEach(([label, value], i) => {
    const x = statsX + (i % 2) * (sw + 4);
    const y = lowY + 4 + Math.floor(i / 2) * 20;
    fill(SOFT);
    draw(LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, sw, 17, 3, 3, 'FD');
    font(14, 'bold');
    ink(BLUE);
    doc.text(value, x + 4, y + 8.5);
    font(8);
    ink(MUTED);
    doc.text(label, x + 4, y + 14);
  });

  footer(1);

  // ── Page 2: the plan ─────────────────────────────────────────────────────
  doc.addPage();
  fill(BLUE);
  doc.rect(0, 0, W, 18, 'F');
  ink([255, 255, 255]);
  font(14, 'bold');
  doc.text('My plan', M, 12);

  let y = 30;
  sectionTitle('Practise these', M, y);
  y += 6;
  input.focus.forEach((s, i) => {
    const band = BAND_INFO[s.band];
    const what = doc.splitTextToSize(s.what, W - M * 2 - 16);
    const tip = doc.splitTextToSize(`How: ${s.tip}`, W - M * 2 - 16);
    const h = 15 + (what.length + tip.length) * 4.6;
    fill(hex(band.soft));
    doc.roundedRect(M, y, W - M * 2, h, 3, 3, 'F');
    fill(hex(band.color));
    doc.circle(M + 7, y + 7.5, 3.4, 'F');
    font(9, 'bold');
    ink([255, 255, 255]);
    doc.text(String(i + 1), M + 7, y + 8.7, { align: 'center' });
    font(11.5, 'bold');
    ink(INK);
    doc.text(`${s.name}  (${s.score})`, M + 14, y + 9);
    font(9.5);
    ink(MUTED);
    doc.text(what, M + 14, y + 15);
    ink(INK);
    doc.text(tip, M + 14, y + 15 + what.length * 4.6);
    y += h + 4;
  });

  y += 4;
  sectionTitle('Settings that help you read', M, y);
  y += 3;
  input.recommendations.forEach((r) => {
    const lines = doc.splitTextToSize(r, W - M * 2 - 12);
    fill(SOFT);
    doc.roundedRect(M, y + 2, W - M * 2, 4 + lines.length * 4.6, 2, 2, 'F');
    fill(hex(BAND_INFO.strong.color));
    doc.circle(M + 5, y + 5.7, 1.6, 'F');
    font(9.5);
    ink(INK);
    doc.text(lines, M + 10, y + 6.6);
    y += 6 + lines.length * 4.6;
  });

  y += 6;
  sectionTitle(`How you learn best: ${input.learningStyle.primary}`, M, y);
  font(9.5);
  ink(MUTED);
  const desc = doc.splitTextToSize(input.learningStyle.description, W - M * 2);
  doc.text(desc, M, y + 6);
  y += 7 + desc.length * 4.6;
  input.learningStyle.tips.forEach((tip) => {
    fill(BLUE);
    doc.circle(M + 2, y + 1.6, 1.2, 'F');
    font(9.5);
    ink(INK);
    doc.text(tip, M + 6, y + 2.8);
    y += 6;
  });

  y += 6;
  if (y < 250) {
    fill([239, 246, 255]);
    draw([191, 219, 254]);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, W - M * 2, 20, 3, 3, 'FD');
    font(11, 'bold');
    ink(BLUE);
    doc.text('Next step: get the NeuroBridge Chrome helper', M + 5, y + 8);
    font(9);
    ink(INK);
    doc.text('It brings your font, reading ruler and read-aloud to every website.', M + 5, y + 14.5);
  }

  footer(2);

  const stamp = today.toISOString().slice(0, 10);
  doc.save(`neurobridge-learning-report-${stamp}.pdf`);
}
