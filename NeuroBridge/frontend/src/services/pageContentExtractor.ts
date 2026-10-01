// Page Content Extractor - Extracts clean, semantic text and interactive elements from the active DOM
// Used by Jarvis to "read the whole page", summarize, answer page questions, and search

export interface PageSection {
  title: string;
  content: string;
}

export interface ExtractedPageSummary {
  pageTitle: string;
  headings: string[];
  mainText: string;
  summaryBulletPoints: string[];
  keyActions: string[];
}

/**
 * Extracts clean, readable text from the main content area of the current page.
 * Strips out navigation bars, headers, footers, scripts, SVG icons, and hidden elements.
 */
export function extractCleanPageText(maxLength: number = 3000): string {
  if (typeof document === 'undefined') return '';

  // Look for primary content containers in order of specificity
  const mainContainers = [
    document.querySelector('main'),
    document.querySelector('[role="main"]'),
    document.querySelector('.dashboard-main'),
    document.querySelector('#root > div'),
    document.body,
  ];

  const root = mainContainers.find((el) => el !== null) as HTMLElement | undefined;
  if (!root) return '';

  // Extract visible paragraphs, headings, list items, and article text
  const selectors = 'h1, h2, h3, h4, p, li, blockquote, [data-readable="true"]';
  const elements = Array.from(root.querySelectorAll(selectors)) as HTMLElement[];

  const textBlocks: string[] = [];
  let totalLength = 0;

  for (const el of elements) {
    // Skip if inside nav, footer, or hidden elements
    if (el.closest('nav, header, footer, .speech-ignore, [aria-hidden="true"], [role="dialog"]')) {
      continue;
    }

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      continue;
    }

    const text = el.innerText?.trim() || el.textContent?.trim() || '';
    if (!text || text.length < 3) continue;

    // Avoid duplicate chunks
    if (textBlocks.includes(text)) continue;

    textBlocks.push(text);
    totalLength += text.length;
    if (totalLength >= maxLength) break;
  }

  return textBlocks.join('\n\n').slice(0, maxLength);
}

/**
 * Extracts a structured overview of what is currently on the screen
 */
export function getExtractedPageSummary(): ExtractedPageSummary {
  if (typeof document === 'undefined') {
    return {
      pageTitle: 'NeuroBridge',
      headings: [],
      mainText: '',
      summaryBulletPoints: [],
      keyActions: [],
    };
  }

  const title = document.querySelector('h1')?.textContent?.trim() || document.title || 'NeuroBridge';

  // Find major headings (h2, h3)
  const headings = Array.from(document.querySelectorAll('h2, h3'))
    .map((h) => h.textContent?.trim() || '')
    .filter((h) => h.length > 2 && !h.toLowerCase().includes('jarvis'))
    .slice(0, 8);

  // Find clickable action labels on screen
  const keyActions = Array.from(document.querySelectorAll('button, a[href]'))
    .map((b) => b.textContent?.trim() || '')
    .filter((txt) => txt.length > 2 && txt.length < 30 && !txt.toLowerCase().includes('jarvis'))
    .slice(0, 6);

  // Extract main readable text
  const mainText = extractCleanPageText(2500);

  // Generate bullet points from paragraphs or list items
  const summaryBulletPoints: string[] = [];
  const paragraphs = Array.from(document.querySelectorAll('main p, .dashboard-main p, p'))
    .map((p) => p.textContent?.trim() || '')
    .filter((p) => p.length > 25 && !p.toLowerCase().includes('jarvis'))
    .slice(0, 4);

  if (paragraphs.length > 0) {
    summaryBulletPoints.push(...paragraphs);
  } else if (headings.length > 0) {
    headings.forEach((h) => summaryBulletPoints.push(`Section: ${h}`));
  }

  return {
    pageTitle: title,
    headings,
    mainText,
    summaryBulletPoints,
    keyActions,
  };
}

/**
 * Returns any text currently highlighted by the user with their mouse/selection
 */
export function getSelectedPageText(): string {
  if (typeof window === 'undefined') return '';
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

/**
 * Searches for a text string or section on the page and scrolls it smoothly into view
 */
export function scrollToPageMatch(query: string): boolean {
  if (typeof document === 'undefined' || !query.trim()) return false;

  const lower = query.toLowerCase().trim();
  const candidates = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, li, button, [data-jarvis-id]')) as HTMLElement[];

  for (const el of candidates) {
    const text = el.textContent?.toLowerCase() || '';
    if (text.includes(lower)) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Apply a temporary highlight pulse
      const originalBg = el.style.backgroundColor;
      const originalTransition = el.style.transition;
      el.style.transition = 'background-color 0.4s ease';
      el.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';

      setTimeout(() => {
        el.style.backgroundColor = originalBg;
        setTimeout(() => {
          el.style.transition = originalTransition;
        }, 400);
      }, 1600);

      return true;
    }
  }

  return false;
}
