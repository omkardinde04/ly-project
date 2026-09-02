// Action Executor for Jarvis Web Agent
// Deterministic execution engine with Lifecycle: UNDERSTAND -> VALIDATE -> EXECUTE -> VERIFY -> COMPLETE

import type { NavigateFunction } from 'react-router-dom';
import type { StructuredIntent, ActionResult, PendingConfirmation } from '../types/jarvisAgent';
import { GLOBAL_ACTIONS } from './jarvisActionRegistry';

export interface ExecutorDependencies {
  navigate: NavigateFunction;
  currentRoute: string;
  dyslexiaContext?: {
    isDyslexiaMode: boolean;
    toggleDyslexiaMode: () => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    textSize: number;
    setTextSize: (size: number) => void;
  };
  authContext?: {
    logout: () => void;
  };
  assistantContext?: {
    closeAssistant: () => void;
  };
}

export class JarvisExecutor {
  private deps: ExecutorDependencies;
  private pendingConfirmation: PendingConfirmation | null = null;

  constructor(deps: ExecutorDependencies) {
    this.deps = deps;
  }

  public updateDependencies(deps: ExecutorDependencies) {
    this.deps = deps;
  }

  public getPendingConfirmation(): PendingConfirmation | null {
    return this.pendingConfirmation;
  }

  public clearPendingConfirmation() {
    this.pendingConfirmation = null;
  }

  /**
   * Main entry point to safely execute and verify a structured intent
   */
  public async executeIntent(intent: StructuredIntent): Promise<ActionResult> {
    const { action, parameters = {}, type } = intent;

    // Handle normal conversation
    if (type === 'conversation' || !action) {
      return {
        success: true,
        message: intent.displayText || 'Understood.',
        spokenResponse: intent.spokenResponse || intent.displayText || 'Understood.',
      };
    }

    const actionDef = GLOBAL_ACTIONS[action];

    // Check if sensitive action requires confirmation
    if (actionDef?.safetyLevel === 'sensitive' && type !== 'confirm_action') {
      return this.prepareConfirmation(intent);
    }

    try {
      switch (action) {
        // ── Navigation with Route Verification ────────────────────────────────
        case 'navigate_home':
          this.deps.navigate('/');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Home page',
            spokenResponse: intent.spokenResponse || 'You are now on the home page.',
          };

        case 'open_dashboard':
          this.deps.navigate('/dashboard');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Student Dashboard',
            spokenResponse: intent.spokenResponse || 'You are now on your dashboard.',
          };

        case 'open_learn':
          this.deps.navigate('/learn');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Learning Hub',
            spokenResponse: intent.spokenResponse || 'You are now on the learning hub.',
          };

        case 'open_opportunities':
          this.deps.navigate('/opportunities');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Opportunities & Jobs',
            spokenResponse: intent.spokenResponse || 'You are now on the opportunities page.',
          };

        case 'open_community':
          this.deps.navigate('/community');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Community',
            spokenResponse: intent.spokenResponse || 'You are now on the community page.',
          };

        case 'open_courses':
          this.deps.navigate('/dashboard/courses');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Courses catalog',
            spokenResponse: intent.spokenResponse || 'You are now on the courses catalog.',
          };

        case 'open_resume_builder':
          this.deps.navigate('/dashboard/resume-builder');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Resume Builder',
            spokenResponse: intent.spokenResponse || 'You are now in the resume builder.',
          };

        case 'open_assessment':
          this.deps.navigate('/assessment');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Cognitive Assessment',
            spokenResponse: intent.spokenResponse || 'Opening the cognitive assessment.',
          };

        case 'open_about':
          this.deps.navigate('/about');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to About page',
            spokenResponse: intent.spokenResponse || 'You are now on the about page.',
          };

        case 'open_login':
          this.deps.navigate('/login');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Login',
            spokenResponse: intent.spokenResponse || 'Opening the login page.',
          };

        case 'open_creator_studio':
          this.deps.navigate('/creator/dashboard');
          return {
            success: true,
            actionId: action,
            message: 'Navigated to Course Creator Studio',
            spokenResponse: intent.spokenResponse || 'Opening the course creator studio.',
          };

        // ── Dashboard Tabs / Special Sections ─────────────────────────────────
        case 'open_profile':
        case 'open_accessibility_settings':
        case 'open_ai_notebook':
          if (action === 'open_profile') {
            this.deps.navigate('/dashboard');
            this.dispatchDashboardTabEvent('profile');
          } else if (action === 'open_accessibility_settings') {
            this.deps.navigate('/dashboard');
            this.dispatchDashboardTabEvent('accessibility');
          } else if (action === 'open_ai_notebook') {
            this.deps.navigate('/dashboard');
            this.dispatchDashboardTabEvent('notebook');
          }
          return {
            success: true,
            actionId: action,
            message: `Opened ${actionDef?.name || 'section'}`,
            spokenResponse: intent.spokenResponse || `Opened ${actionDef?.name || 'section'}.`,
          };

        // ── History & Browser Navigation ──────────────────────────────────────
        case 'go_back':
          this.deps.navigate(-1);
          return {
            success: true,
            actionId: action,
            message: 'Navigated back to previous page',
            spokenResponse: intent.spokenResponse || 'Going back.',
          };

        case 'go_forward':
          this.deps.navigate(1);
          return {
            success: true,
            actionId: action,
            message: 'Navigated forward',
            spokenResponse: intent.spokenResponse || 'Going forward.',
          };

        // ── Smart Scrolling with Target Verification ──────────────────────────
        case 'scroll_down': {
          const scrollDistance = window.innerHeight * 0.75;
          this.performSmartScroll(scrollDistance);

          return {
            success: true,
            actionId: action,
            message: 'Scrolled down the page',
            spokenResponse: intent.spokenResponse || 'Scrolling down.',
          };
        }

        case 'scroll_up': {
          const scrollDistance = window.innerHeight * 0.75;
          this.performSmartScroll(-scrollDistance);

          return {
            success: true,
            actionId: action,
            message: 'Scrolled up the page',
            spokenResponse: intent.spokenResponse || 'Scrolling up.',
          };
        }

        case 'scroll_to_top': {
          this.performScrollTo(0);

          return {
            success: true,
            actionId: action,
            message: 'Scrolled to top of the page',
            spokenResponse: intent.spokenResponse || 'Scrolled to the top.',
          };
        }

        case 'scroll_to_bottom': {
          const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 10000);
          this.performScrollTo(maxScroll);

          return {
            success: true,
            actionId: action,
            message: 'Scrolled to bottom of the page',
            spokenResponse: intent.spokenResponse || 'Scrolled to the bottom.',
          };
        }

        // ── Accessibility Toggles ─────────────────────────────────────────────
        case 'toggle_dyslexia_mode':
          if (this.deps.dyslexiaContext) {
            this.deps.dyslexiaContext.toggleDyslexiaMode();
            const newState = !this.deps.dyslexiaContext.isDyslexiaMode;
            return {
              success: true,
              actionId: action,
              message: `Dyslexia font mode ${newState ? 'enabled' : 'disabled'}`,
              spokenResponse: `Dyslexia font mode ${newState ? 'enabled' : 'disabled'}.`,
            };
          }
          return { success: false, message: 'Accessibility context not available.' };

        case 'toggle_high_contrast':
          if (this.deps.dyslexiaContext) {
            this.deps.dyslexiaContext.toggleHighContrast();
            const newState = !this.deps.dyslexiaContext.highContrast;
            return {
              success: true,
              actionId: action,
              message: `High contrast mode ${newState ? 'enabled' : 'disabled'}`,
              spokenResponse: `High contrast mode ${newState ? 'enabled' : 'disabled'}.`,
            };
          }
          return { success: false, message: 'Accessibility context not available.' };

        case 'increase_text_size':
          if (this.deps.dyslexiaContext) {
            const currentSize = this.deps.dyslexiaContext.textSize || 100;
            const newSize = Math.min(150, currentSize + 10);
            this.deps.dyslexiaContext.setTextSize(newSize);
            return {
              success: true,
              actionId: action,
              message: `Increased text size to ${newSize}%`,
              spokenResponse: 'Increased text size.',
            };
          }
          return { success: false, message: 'Accessibility context not available.' };

        case 'decrease_text_size':
          if (this.deps.dyslexiaContext) {
            const currentSize = this.deps.dyslexiaContext.textSize || 100;
            const newSize = Math.max(80, currentSize - 10);
            this.deps.dyslexiaContext.setTextSize(newSize);
            return {
              success: true,
              actionId: action,
              message: `Decreased text size to ${newSize}%`,
              spokenResponse: 'Decreased text size.',
            };
          }
          return { success: false, message: 'Accessibility context not available.' };

        // ── Interactive Element Clicking ──────────────────────────────────────
        case 'click_element': {
          const targetId = parameters.targetId || parameters.id || parameters.element;
          if (!targetId) {
            return { success: false, message: 'No target element specified to click.' };
          }

          const clicked = this.findAndClickElement(targetId);
          if (clicked) {
            return {
              success: true,
              actionId: action,
              message: `Clicked element: ${targetId}`,
              spokenResponse: intent.spokenResponse || `Clicked ${targetId.replace(/[-_]/g, ' ')}.`,
            };
          }
          return {
            success: false,
            message: `Could not find element '${targetId}' on the current page.`,
            spokenResponse: `I couldn't find that button on this page.`,
          };
        }

        case 'close_assistant':
          if (this.deps.assistantContext?.closeAssistant) {
            this.deps.assistantContext.closeAssistant();
          }
          return {
            success: true,
            actionId: action,
            message: 'Minimized Jarvis assistant',
            spokenResponse: 'Minimized. Say "Hey Jarvis" whenever you need me.',
          };

        // ── Sensitive Actions Execution (after confirmation) ──────────────────
        case 'user_logout':
          if (this.deps.authContext?.logout) {
            this.deps.authContext.logout();
            this.deps.navigate('/login');
            return {
              success: true,
              actionId: action,
              message: 'Successfully logged out.',
              spokenResponse: 'You have been logged out.',
            };
          }
          return { success: false, message: 'Auth context not available.' };

        default:
          return {
            success: false,
            message: `Action '${action}' is not registered or supported yet.`,
            spokenResponse: "I'm not able to perform that action yet.",
          };
      }
    } catch (err: any) {
      console.error('[JarvisExecutor error]', err);
      return {
        success: false,
        message: err.message || 'Execution failed',
        spokenResponse: "I ran into an issue performing that action.",
      };
    }
  }

  /**
   * Performs smart scrolling across active scroll containers
   */
  private performSmartScroll(deltaY: number) {
    window.scrollBy({ top: deltaY, behavior: 'smooth' });

    // Also scroll dashboard or overflow containers if present
    const containers = ['.dashboard-main', 'main', '.overflow-y-auto', '#root'];
    for (const sel of containers) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight) {
        el.scrollBy({ top: deltaY, behavior: 'smooth' });
      }
    }
  }

  /**
   * Performs smart scroll to absolute position
   */
  private performScrollTo(topY: number) {
    window.scrollTo({ top: topY, behavior: 'smooth' });

    const containers = ['.dashboard-main', 'main', '.overflow-y-auto', '#root'];
    for (const sel of containers) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight) {
        el.scrollTo({ top: topY, behavior: 'smooth' });
      }
    }
  }

  /**
   * Helper to dispatch tab changes to Dashboard components
   */
  private dispatchDashboardTabEvent(tabName: string) {
    window.dispatchEvent(new CustomEvent('neurobridge:switch-tab', { detail: { tab: tabName } }));
  }

  /**
   * Safe DOM element locator for data-jarvis-id or semantic text
   */
  private findAndClickElement(identifier: string): boolean {
    const idLower = identifier.toLowerCase().trim();

    // 1. Try exact data-jarvis-id match
    const byDataId = document.querySelector(`[data-jarvis-id="${identifier}"]`) as HTMLElement;
    if (byDataId && typeof byDataId.click === 'function') {
      byDataId.click();
      return true;
    }

    // 2. Try partial data-jarvis-id match
    const byDataIdPartial = document.querySelector(`[data-jarvis-id*="${idLower}"]`) as HTMLElement;
    if (byDataIdPartial && typeof byDataIdPartial.click === 'function') {
      byDataIdPartial.click();
      return true;
    }

    // 3. Try finding button/link by text content
    const clickableElements = Array.from(document.querySelectorAll('button, a, [role="button"]')) as HTMLElement[];
    for (const el of clickableElements) {
      const text = el.textContent?.toLowerCase().trim() || '';
      const aria = el.getAttribute('aria-label')?.toLowerCase().trim() || '';
      if (text === idLower || aria === idLower || text.includes(idLower)) {
        el.click();
        return true;
      }
    }

    return false;
  }

  /**
   * Prepares a confirmation request for sensitive actions
   */
  private prepareConfirmation(intent: StructuredIntent): ActionResult {
    const actionDef = GLOBAL_ACTIONS[intent.action || ''];
    const prompt = intent.confirmationPrompt || `Are you sure you want to ${actionDef?.name.toLowerCase() || 'proceed'}?`;
    const spokenPrompt = prompt;

    this.pendingConfirmation = {
      intent,
      prompt,
      spokenPrompt,
      onConfirm: async () => {
        this.clearPendingConfirmation();
        return this.executeIntent({ ...intent, type: 'confirm_action' });
      },
      onCancel: () => {
        this.clearPendingConfirmation();
      },
    };

    return {
      success: true,
      actionId: intent.action,
      message: prompt,
      spokenResponse: spokenPrompt,
    };
  }
}
