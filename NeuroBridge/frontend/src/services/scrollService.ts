/**
 * Scroll Service for NeuroBridge Jarvis Web Agent
 * Handles dynamic scrollable container detection, smooth scrolling with configurable magnitudes,
 * boundary detection, and before/after verification.
 */

export type ScrollDirection = 'down' | 'up' | 'top' | 'bottom';
export type ScrollMagnitude = 'little' | 'normal' | 'lot';

export interface ScrollExecutionResult {
  success: boolean;
  actionId: string;
  executed: boolean;
  verified: boolean;
  message: string;
  spokenResponse: string;
  initialTop: number;
  finalTop: number;
  deltaY: number;
}

/**
 * Finds the actual active scrollable container on the current page.
 * Supports window, .dashboard-main, main, or nested overflow containers.
 */
export function getActiveScrollContainer(): HTMLElement | Window {
  if (typeof window === 'undefined') return {} as Window;

  // On landing page or pages with global window scroll, window is always primary
  if (document.getElementById('hero-section') || window.location.pathname === '/') {
    return window;
  }

  // 1. In Dashboard, the main content area has h-screen overflow-y-auto
  const dashboardMain = document.querySelector('.dashboard-main') as HTMLElement | null;
  if (dashboardMain && dashboardMain.scrollHeight > dashboardMain.clientHeight + 10) {
    return dashboardMain;
  }

  // 2. Check main tag if it has explicit overflow and scrollable content
  const mainEl = document.querySelector('main') as HTMLElement | null;
  if (mainEl) {
    const style = window.getComputedStyle(mainEl);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      mainEl.scrollHeight > mainEl.clientHeight + 10
    ) {
      return mainEl;
    }
  }

  // 3. Check any custom scroll container with significant height (excluding assistants and modals)
  const scrollables = document.querySelectorAll(
    '.overflow-y-auto, .overflow-y-scroll, [data-scrollable="true"]'
  );
  for (const el of Array.from(scrollables) as HTMLElement[]) {
    if (
      el.scrollHeight > el.clientHeight + 20 &&
      el.clientHeight >= 240 &&
      !el.closest('nav, aside, header, footer, .speech-ignore, .assistant-window, .fixed, [role="region"], [role="dialog"]')
    ) {
      return el;
    }
  }

  // 4. Default to window
  return window;
}

/**
 * Reads the current vertical scroll position and bounds of a container.
 */
export function getScrollPosition(container: HTMLElement | Window): {
  top: number;
  maxTop: number;
  clientHeight: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, maxTop: 0, clientHeight: 0 };
  }

  if (container === window) {
    const top =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const clientHeight = window.innerHeight;
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const maxTop = Math.max(0, scrollHeight - clientHeight);
    return { top, maxTop, clientHeight };
  } else {
    const el = container as HTMLElement;
    const top = el.scrollTop;
    const clientHeight = el.clientHeight;
    const maxTop = Math.max(0, el.scrollHeight - clientHeight);
    return { top, maxTop, clientHeight };
  }
}

/**
 * Executes a smooth scroll in the specified direction and magnitude,
 * waits for animation, and verifies whether the scroll position actually changed.
 */
export async function executeAndVerifyScroll(
  direction: ScrollDirection,
  magnitude: ScrollMagnitude = 'normal'
): Promise<ScrollExecutionResult> {
  const container = getActiveScrollContainer();
  const { top: initialTop, maxTop, clientHeight } = getScrollPosition(container);

  // Check boundary limits first before scrolling
  if ((direction === 'top' || direction === 'up') && initialTop <= 4) {
    return {
      success: true,
      actionId: direction === 'top' ? 'scroll_to_top' : 'scroll_up',
      executed: false,
      verified: true,
      message: 'Already at the top of the page.',
      spokenResponse: 'You are already at the top of the page.',
      initialTop,
      finalTop: initialTop,
      deltaY: 0,
    };
  }

  if ((direction === 'bottom' || direction === 'down') && initialTop >= maxTop - 4) {
    return {
      success: true,
      actionId: direction === 'bottom' ? 'scroll_to_bottom' : 'scroll_down',
      executed: false,
      verified: true,
      message: 'Already at the bottom of the page.',
      spokenResponse: 'You are already at the bottom of the page.',
      initialTop,
      finalTop: initialTop,
      deltaY: 0,
    };
  }

  // Calculate distance based on magnitude
  // little: 35%, normal: 70%, lot: 90%
  const fraction = magnitude === 'little' ? 0.35 : magnitude === 'lot' ? 0.90 : 0.70;

  let targetTop: number;
  if (direction === 'top') {
    targetTop = 0;
  } else if (direction === 'bottom') {
    targetTop = maxTop;
  } else if (direction === 'down') {
    const distance = Math.max(160, clientHeight * fraction);
    targetTop = Math.min(maxTop, initialTop + distance);
  } else {
    // up
    const distance = Math.max(160, clientHeight * fraction);
    targetTop = Math.max(0, initialTop - distance);
  }

  // Execute smooth scroll on the active container
  if (container === window) {
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  } else {
    (container as HTMLElement).scrollTo({ top: targetTop, behavior: 'smooth' });
  }

  // Await browser smooth-scroll animation to settle
  await new Promise((resolve) => setTimeout(resolve, 360));

  // Verify actual change
  const { top: finalTop } = getScrollPosition(container);
  const deltaY = Math.abs(finalTop - initialTop);
  const verified =
    deltaY > 8 ||
    (direction === 'top' && finalTop <= 8) ||
    (direction === 'bottom' && finalTop >= maxTop - 8);

  const actionId =
    direction === 'top'
      ? 'scroll_to_top'
      : direction === 'bottom'
      ? 'scroll_to_bottom'
      : direction === 'down'
      ? 'scroll_down'
      : 'scroll_up';

  if (verified) {
    const label =
      direction === 'top'
        ? 'to the top'
        : direction === 'bottom'
        ? 'to the bottom'
        : `${direction} (${magnitude})`;

    return {
      success: true,
      actionId,
      executed: true,
      verified: true,
      message: `Scrolled ${label} successfully`,
      spokenResponse:
        direction === 'top'
          ? 'At the top of the page.'
          : direction === 'bottom'
          ? 'At the bottom of the page.'
          : `Scrolled ${direction}.`,
      initialTop,
      finalTop,
      deltaY,
    };
  }

  // If no change occurred despite not being at the boundary
  return {
    success: false,
    actionId,
    executed: true,
    verified: false,
    message: 'Scroll action was triggered, but the page content could not be scrolled further.',
    spokenResponse: 'This section cannot be scrolled further.',
    initialTop,
    finalTop,
    deltaY: 0,
  };
}
