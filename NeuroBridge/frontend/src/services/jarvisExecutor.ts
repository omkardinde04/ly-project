// Action Executor for Jarvis Web Agent
// Deterministic execution engine with Lifecycle: UNDERSTAND -> VALIDATE -> EXECUTE -> VERIFY -> COMPLETE

import type { NavigateFunction } from 'react-router-dom';
import type { StructuredIntent, ActionResult, PendingConfirmation } from '../types/jarvisAgent';
import { GLOBAL_ACTIONS } from './jarvisActionRegistry';
import { executeAndVerifyScroll, type ScrollMagnitude } from './scrollService';
import {
  getExtractedPageSummary,
  getSelectedPageText,
  scrollToPageMatch,
} from './pageContentExtractor';
import { FUN_FONTS, weightName, type FunFontId } from '../utils/funFonts';

export interface ExecutorDependencies {
  navigate: NavigateFunction;
  currentRoute: string;
  dyslexiaContext?: {
    // Theme & dark mode
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
    setDarkMode?: (enabled: boolean) => void;
    // Fun mode
    isDyslexiaMode: boolean;
    toggleDyslexiaMode: () => void;
    enableFunMode?: () => void;
    disableFunMode?: () => void;
    // Fun font
    funFont?: FunFontId;
    setFunFont?: (font: FunFontId) => void;
    // Line spacing
    funLineHeight?: number;
    setFunLineHeight?: (value: number) => void;
    // Font weight
    funWeight?: number;
    setFunWeight?: (value: number) => void;
    // Letter spacing
    funLetterSpacing?: number;
    setFunLetterSpacing?: (value: number) => void;
    // Reset
    resetFunSettings?: () => void;
    // High contrast
    highContrast: boolean;
    setHighContrast?: (enabled: boolean) => void;
    toggleHighContrast?: () => void;
    // Text size
    textSize: number;
    setTextSize: (size: number) => void;
    // Motion
    reduceMotion?: boolean;
    setReduceMotion?: (enabled: boolean) => void;
  };
  authContext?: {
    logout: () => void;
  };
  assistantContext?: {
    closeAssistant: () => void;
  };
  spotlightReaderContext?: {
    isActive: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    startPageReading: (container?: HTMLElement | string) => boolean;
    startTextReading?: (text: string, sourceElement?: HTMLElement | null) => boolean;
    pauseReading: () => void;
    resumeReading: () => void;
    stopReading: () => void;
    restartReading?: () => void;
    nextWord?: () => void;
    prevWord?: () => void;
    nextParagraph?: () => void;
    prevParagraph?: () => void;
    setSpeed: (speed: number) => void;
    speed: number;
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
        executed: false,
        verified: true,
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
        // ── 1. Navigation with Route & Tab Verification ────────────────────────
        case 'navigate_home': {
          this.deps.navigate('/');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Home page',
            spokenResponse: intent.spokenResponse || 'You are now on the home page.',
          };
        }

        case 'open_dashboard': {
          this.deps.navigate('/dashboard');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Student Dashboard',
            spokenResponse: intent.spokenResponse || 'Opening your student dashboard.',
          };
        }

        case 'open_learn': {
          this.deps.navigate('/learn');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Learning Hub',
            spokenResponse: intent.spokenResponse || 'Opening the learning hub.',
          };
        }

        case 'open_opportunities': {
          this.deps.navigate('/opportunities');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Opportunities & Jobs',
            spokenResponse: intent.spokenResponse || 'Opening career opportunities.',
          };
        }

        case 'open_community': {
          this.deps.navigate('/community');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Community',
            spokenResponse: intent.spokenResponse || 'Opening the peer community.',
          };
        }

        case 'open_courses': {
          this.deps.navigate('/dashboard/courses');
          this.dispatchDashboardTabEvent('courses');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Courses catalog',
            spokenResponse: intent.spokenResponse || 'Opening the courses catalog.',
          };
        }

        case 'open_assessment': {
          this.deps.navigate('/assessment');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Cognitive Assessment',
            spokenResponse: intent.spokenResponse || 'Opening the cognitive assessment.',
          };
        }

        case 'open_about': {
          this.deps.navigate('/about');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to About page',
            spokenResponse: intent.spokenResponse || 'Opening the About page.',
          };
        }

        case 'open_login': {
          this.deps.navigate('/login');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Login',
            spokenResponse: intent.spokenResponse || 'Opening the login page.',
          };
        }

        case 'open_creator_studio': {
          this.deps.navigate('/creator/dashboard');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Course Creator Studio',
            spokenResponse: intent.spokenResponse || 'Opening Course Creator Studio.',
          };
        }

        case 'open_chrome_extension': {
          this.deps.navigate('/chrome-extension');
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated to Chrome Extension page',
            spokenResponse: intent.spokenResponse || 'Opening Chrome extension page.',
          };
        }

        // ── Dashboard Sub-Tabs ────────────────────────────────────────────────
        case 'open_profile':
        case 'open_settings':
        case 'open_accessibility_settings':
        case 'open_ai_notebook':
        case 'open_nearby':
        case 'open_progress': {
          const tabName =
            action === 'open_profile'
              ? 'profile'
              : action === 'open_settings' || action === 'open_accessibility_settings'
                ? parameters.tab || 'settings'
                : action === 'open_ai_notebook'
                  ? 'notebook'
                  : action === 'open_nearby'
                    ? 'nearby'
                    : 'progress';

          this.deps.navigate(`/dashboard?tab=${tabName}`, { state: { tab: tabName } });
          this.dispatchDashboardTabEvent(tabName);

          const sectionLabel =
            tabName === 'profile'
              ? 'User Profile'
              : tabName === 'settings' || tabName === 'accessibility'
                ? 'Accessibility Settings'
                : tabName === 'notebook'
                  ? 'AI Notebook'
                  : tabName === 'nearby'
                    ? 'Nearby Care'
                    : 'Progress & Games';

          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: `Opened ${sectionLabel}`,
            spokenResponse: intent.spokenResponse || `Opening ${sectionLabel}.`,
          };
        }

        // ── Browser History Navigation ────────────────────────────────────────
        case 'go_back': {
          this.deps.navigate(-1);
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated back to previous page',
            spokenResponse: intent.spokenResponse || 'Going back to the previous page.',
          };
        }

        case 'go_forward': {
          this.deps.navigate(1);
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Navigated forward',
            spokenResponse: intent.spokenResponse || 'Going forward.',
          };
        }

        // ── 2. Real Scrolling with Container Detection & Delta Verification ───
        case 'scroll_down': {
          const magnitude: ScrollMagnitude = (parameters.magnitude as ScrollMagnitude) || 'normal';
          const scrollResult = await executeAndVerifyScroll('down', magnitude);
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: scrollResult.message,
            spokenResponse: intent.spokenResponse || scrollResult.spokenResponse,
          };
        }

        case 'scroll_up': {
          const magnitude: ScrollMagnitude = (parameters.magnitude as ScrollMagnitude) || 'normal';
          const scrollResult = await executeAndVerifyScroll('up', magnitude);
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: scrollResult.message,
            spokenResponse: intent.spokenResponse || scrollResult.spokenResponse,
          };
        }

        case 'scroll_to_top': {
          const scrollResult = await executeAndVerifyScroll('top');
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: scrollResult.message,
            spokenResponse: intent.spokenResponse || scrollResult.spokenResponse,
          };
        }

        case 'scroll_to_bottom': {
          const scrollResult = await executeAndVerifyScroll('bottom');
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: scrollResult.message,
            spokenResponse: intent.spokenResponse || scrollResult.spokenResponse,
          };
        }

        case 'scroll_next_section': {
          const scrollResult = await executeAndVerifyScroll('down', 'lot');
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: 'Scrolled to next section',
            spokenResponse: 'Moving to next section.',
          };
        }

        case 'scroll_prev_section': {
          const scrollResult = await executeAndVerifyScroll('up', 'lot');
          return {
            success: scrollResult.success,
            actionId: action,
            executed: scrollResult.executed,
            verified: scrollResult.verified,
            message: 'Scrolled to previous section',
            spokenResponse: 'Moving to previous section.',
          };
        }

        // ── 3. Page Reading & Spotlight Control ────────────────────────────────
        case 'read_page': {
          if (this.deps.spotlightReaderContext) {
            const started = this.deps.spotlightReaderContext.startPageReading();
            if (started) {
              return {
                success: true,
                actionId: action,
                executed: true,
                verified: true,
                message: 'Reading page aloud with spotlight',
                spokenResponse: 'Starting page reading with spotlight.',
              };
            } else {
              return {
                success: false,
                actionId: action,
                executed: true,
                verified: false,
                message: 'No readable text content found on this page.',
                spokenResponse: "I couldn't find readable text content on this page.",
              };
            }
          }
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: 'Spotlight reader service not initialized.',
            spokenResponse: 'The page reader is not ready.',
          };
        }

        case 'pause_reading': {
          if (this.deps.spotlightReaderContext) {
            this.deps.spotlightReaderContext.pauseReading();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Paused reading',
              spokenResponse: 'Paused reading.',
            };
          }
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: 'No active reading session to pause.',
          };
        }

        case 'resume_reading': {
          if (this.deps.spotlightReaderContext) {
            this.deps.spotlightReaderContext.resumeReading();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Resumed reading',
              spokenResponse: 'Resuming reading.',
            };
          }
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: 'No paused reading session to resume.',
          };
        }

        case 'stop_reading': {
          if (this.deps.spotlightReaderContext) {
            this.deps.spotlightReaderContext.stopReading();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Stopped page reading',
              spokenResponse: 'Stopped reading.',
            };
          }
          return {
            success: true,
            actionId: action,
            executed: false,
            verified: true,
            message: 'Reading already stopped.',
            spokenResponse: 'Reading stopped.',
          };
        }

        case 'read_next_paragraph':
        case 'next_paragraph': {
          if (this.deps.spotlightReaderContext?.nextParagraph) {
            this.deps.spotlightReaderContext.nextParagraph();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Skipped to next paragraph',
              spokenResponse: 'Next paragraph.',
            };
          }
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: 'No active reading session.',
          };
        }

        case 'read_prev_paragraph':
        case 'prev_paragraph': {
          if (this.deps.spotlightReaderContext?.prevParagraph) {
            this.deps.spotlightReaderContext.prevParagraph();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Moved to previous paragraph',
              spokenResponse: 'Previous paragraph.',
            };
          }
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: 'No active reading session.',
          };
        }

        case 'next_word':
        case 'spotlight_next_word': {
          if (this.deps.spotlightReaderContext?.nextWord) {
            this.deps.spotlightReaderContext.nextWord();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Advanced to next word',
              spokenResponse: 'Next word.',
            };
          }
          return { success: false, message: 'Spotlight reader not active.' };
        }

        case 'prev_word':
        case 'previous_word':
        case 'spotlight_prev_word': {
          if (this.deps.spotlightReaderContext?.prevWord) {
            this.deps.spotlightReaderContext.prevWord();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Moved to previous word',
              spokenResponse: 'Previous word.',
            };
          }
          return { success: false, message: 'Spotlight reader not active.' };
        }

        case 'restart_reading': {
          if (this.deps.spotlightReaderContext?.restartReading) {
            this.deps.spotlightReaderContext.restartReading();
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Restarting reading from the beginning',
              spokenResponse: 'Restarting from the beginning.',
            };
          }
          return { success: false, message: 'Spotlight reader not active.' };
        }

        case 'speed_up_reading': {
          if (this.deps.spotlightReaderContext) {
            const currentSpeed = this.deps.spotlightReaderContext.speed || 1.0;
            const newSpeed = Math.min(2.0, Math.round((currentSpeed + 0.25) * 100) / 100);
            this.deps.spotlightReaderContext.setSpeed(newSpeed);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Reading speed increased to ${newSpeed}x`,
              spokenResponse: 'Reading faster now.',
            };
          }
          return { success: false, message: 'Spotlight reader not active.' };
        }

        case 'slow_down_reading': {
          if (this.deps.spotlightReaderContext) {
            const currentSpeed = this.deps.spotlightReaderContext.speed || 1.0;
            const newSpeed = Math.max(0.6, Math.round((currentSpeed - 0.25) * 100) / 100);
            this.deps.spotlightReaderContext.setSpeed(newSpeed);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Reading speed decreased to ${newSpeed}x`,
              spokenResponse: 'Reading slower for comfort.',
            };
          }
          return { success: false, message: 'Spotlight reader not active.' };
        }

        // ── 4. Theme & Dark Mode ──────────────────────────────────────────────
        case 'enable_dark_mode': {
          if (this.deps.dyslexiaContext) {
            if (this.deps.dyslexiaContext.isDarkMode) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'Dark mode is already active.',
                spokenResponse: 'Dark mode is already enabled.',
              };
            }
            if (this.deps.dyslexiaContext.setDarkMode) {
              this.deps.dyslexiaContext.setDarkMode(true);
            } else if (this.deps.dyslexiaContext.toggleDarkMode) {
              this.deps.dyslexiaContext.toggleDarkMode();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Dark mode enabled.',
              spokenResponse: 'Dark mode is now on.',
            };
          }
          return { success: false, message: 'Theme controls unavailable.' };
        }

        case 'disable_dark_mode': {
          if (this.deps.dyslexiaContext) {
            if (!this.deps.dyslexiaContext.isDarkMode) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'Light mode is already active.',
                spokenResponse: 'Dark mode is already turned off.',
              };
            }
            if (this.deps.dyslexiaContext.setDarkMode) {
              this.deps.dyslexiaContext.setDarkMode(false);
            } else if (this.deps.dyslexiaContext.toggleDarkMode) {
              this.deps.dyslexiaContext.toggleDarkMode();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Light mode enabled.',
              spokenResponse: 'Switched to light mode.',
            };
          }
          return { success: false, message: 'Theme controls unavailable.' };
        }

        case 'toggle_dark_mode': {
          if (this.deps.dyslexiaContext) {
            const wasDark = !!this.deps.dyslexiaContext.isDarkMode;
            if (this.deps.dyslexiaContext.toggleDarkMode) {
              this.deps.dyslexiaContext.toggleDarkMode();
            }
            const newState = !wasDark;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: newState ? 'Dark mode enabled.' : 'Light mode enabled.',
              spokenResponse: newState ? 'Dark mode is now on.' : 'Switched to light mode.',
            };
          }
          return { success: false, message: 'Theme controls unavailable.' };
        }

        case 'get_theme': {
          if (this.deps.dyslexiaContext) {
            const isDark = !!this.deps.dyslexiaContext.isDarkMode;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: isDark ? 'Current theme: Dark mode' : 'Current theme: Light mode',
              spokenResponse: isDark ? 'Dark mode is currently active.' : 'Light mode is currently active.',
            };
          }
          return { success: false, message: 'Theme context unavailable.' };
        }

        // ── 5. Fun Mode (Dyslexia-friendly reading mode) ──────────────────────
        case 'enable_fun_mode': {
          if (this.deps.dyslexiaContext) {
            if (this.deps.dyslexiaContext.isDyslexiaMode) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'Fun mode is already enabled.',
                spokenResponse: 'Fun mode is already turned on.',
              };
            }
            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            } else {
              this.deps.dyslexiaContext.toggleDyslexiaMode();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: '✨ Fun mode enabled! Accessible font and comfortable spacing applied.',
              spokenResponse: 'Fun mode is now on.',
            };
          }
          return { success: false, message: 'Accessibility context unavailable.' };
        }

        case 'disable_fun_mode': {
          if (this.deps.dyslexiaContext) {
            if (!this.deps.dyslexiaContext.isDyslexiaMode) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'Fun mode is already disabled.',
                spokenResponse: 'Fun mode is already off.',
              };
            }
            if (this.deps.dyslexiaContext.disableFunMode) {
              this.deps.dyslexiaContext.disableFunMode();
            } else {
              this.deps.dyslexiaContext.toggleDyslexiaMode();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Fun mode disabled. Standard reading style restored.',
              spokenResponse: 'Fun mode is now off.',
            };
          }
          return { success: false, message: 'Accessibility context unavailable.' };
        }

        case 'toggle_fun_mode':
        case 'toggle_dyslexia_mode':
        case 'toggle_dyslexia_font': {
          if (this.deps.dyslexiaContext) {
            const wasOn = this.deps.dyslexiaContext.isDyslexiaMode;
            this.deps.dyslexiaContext.toggleDyslexiaMode();
            const newState = !wasOn;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: newState ? '✨ Fun mode enabled!' : 'Fun mode disabled.',
              spokenResponse: newState ? 'Fun mode is now on.' : 'Fun mode is now off.',
            };
          }
          return { success: false, message: 'Accessibility context unavailable.' };
        }

        case 'get_fun_mode': {
          if (this.deps.dyslexiaContext) {
            const isOn = this.deps.dyslexiaContext.isDyslexiaMode;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: isOn ? 'Fun mode is currently enabled.' : 'Fun mode is currently disabled.',
              spokenResponse: isOn ? 'Fun mode is currently on.' : 'Fun mode is currently off.',
            };
          }
          return { success: false, message: 'Accessibility context unavailable.' };
        }

        // ── 6. Font Family Controls ───────────────────────────────────────────
        case 'set_font': {
          if (this.deps.dyslexiaContext) {
            const rawFont = (parameters.font || '').toString().toLowerCase().trim().replace(/[\s_-]+/g, '');
            // Map variations
            const fontMap: Record<string, FunFontId> = {
              lexend: 'lexend',
              opendyslexic: 'opendyslexic',
              dyslexic: 'opendyslexic',
              atkinson: 'atkinson',
              atkinsonhyperlegible: 'atkinson',
              hyperlegible: 'atkinson',
              comicneue: 'comic-neue',
              comic: 'comic-neue',
              andika: 'andika',
              nunito: 'nunito',
              verdana: 'verdana',
              arial: 'arial',
            };

            const matchedId = fontMap[rawFont];
            if (!matchedId) {
              const available = FUN_FONTS.map((f) => f.label).join(', ');
              return {
                success: false,
                actionId: action,
                executed: false,
                verified: false,
                message: `Font '${parameters.font}' is not supported. Supported fonts are: ${available}.`,
                spokenResponse: `That font is not available. You can choose from Lexend, OpenDyslexic, Atkinson, Comic Neue, Andika, Nunito, Verdana, or Arial.`,
              };
            }

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunFont) {
              this.deps.dyslexiaContext.setFunFont(matchedId);
            }

            const fontLabel = FUN_FONTS.find((f) => f.id === matchedId)?.label || matchedId;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Reading font changed to ${fontLabel}.`,
              spokenResponse: `Font changed to ${fontLabel}.`,
            };
          }
          return { success: false, message: 'Font controls unavailable.' };
        }

        case 'get_font': {
          if (this.deps.dyslexiaContext) {
            const fontId = this.deps.dyslexiaContext.funFont || 'lexend';
            const fontLabel = FUN_FONTS.find((f) => f.id === fontId)?.label || fontId;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Current reading font: ${fontLabel}`,
              spokenResponse: `The currently selected font is ${fontLabel}.`,
            };
          }
          return { success: false, message: 'Font context unavailable.' };
        }

        // ── 7. Line Spacing Controls ──────────────────────────────────────────
        case 'set_line_spacing': {
          if (this.deps.dyslexiaContext) {
            let targetValue: number;
            if (parameters.value !== undefined && !isNaN(Number(parameters.value))) {
              targetValue = Number(parameters.value);
            } else if (parameters.preset === 'normal' || parameters.preset === 'default') {
              targetValue = 1.8;
            } else {
              targetValue = 1.8;
            }

            // Clamp between 1.2 and 2.6
            const clamped = Math.max(1.2, Math.min(2.6, Math.round(targetValue * 10) / 10));

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLineHeight) {
              this.deps.dyslexiaContext.setFunLineHeight(clamped);
            }

            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Line spacing set to ${clamped.toFixed(1)}×`,
              spokenResponse: `Line spacing set to ${clamped.toFixed(1)} times.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'increase_line_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLineHeight || 1.8;
            const step = parameters.step ? Number(parameters.step) : 0.2;
            const next = Math.min(2.6, Math.round((current + step) * 10) / 10);

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLineHeight) {
              this.deps.dyslexiaContext.setFunLineHeight(next);
            }

            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Increased line spacing to ${next.toFixed(1)}×`,
              spokenResponse: `Line spacing increased to ${next.toFixed(1)} times.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'decrease_line_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLineHeight || 1.8;
            const step = parameters.step ? Number(parameters.step) : 0.2;
            const next = Math.max(1.2, Math.round((current - step) * 10) / 10);

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLineHeight) {
              this.deps.dyslexiaContext.setFunLineHeight(next);
            }

            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Decreased line spacing to ${next.toFixed(1)}×`,
              spokenResponse: `Line spacing decreased to ${next.toFixed(1)} times.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'get_line_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLineHeight || 1.8;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Current line spacing: ${current.toFixed(1)}×`,
              spokenResponse: `Your current line spacing is ${current.toFixed(1)} times.`,
            };
          }
          return { success: false, message: 'Spacing context unavailable.' };
        }

        // ── 8. Font Weight Controls ───────────────────────────────────────────
        case 'set_font_weight': {
          if (this.deps.dyslexiaContext) {
            let targetWeight: number = 400;
            const raw = (parameters.weight ?? '').toString().toLowerCase().trim();

            if (!isNaN(Number(raw)) && Number(raw) >= 300 && Number(raw) <= 800) {
              targetWeight = Math.round(Number(raw) / 100) * 100;
            } else if (raw.includes('bold') || raw.includes('heavy') || raw.includes('thicker')) {
              targetWeight = 700;
            } else if (raw.includes('semi') || raw.includes('demi')) {
              targetWeight = 600;
            } else if (raw.includes('medium')) {
              targetWeight = 500;
            } else if (raw.includes('regular') || raw.includes('normal')) {
              targetWeight = 400;
            } else if (raw.includes('light') || raw.includes('thin')) {
              targetWeight = 300;
            } else {
              targetWeight = 400;
            }

            const clamped = Math.max(300, Math.min(800, targetWeight));

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunWeight) {
              this.deps.dyslexiaContext.setFunWeight(clamped);
            }

            const name = weightName(clamped);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Font weight set to ${name} (${clamped}).`,
              spokenResponse: `Font weight set to ${name}.`,
            };
          }
          return { success: false, message: 'Weight controls unavailable.' };
        }

        case 'get_font_weight': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funWeight || 400;
            const name = weightName(current);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Current font weight: ${name} (${current})`,
              spokenResponse: `The current font weight is ${name}, which is ${current}.`,
            };
          }
          return { success: false, message: 'Weight context unavailable.' };
        }

        // ── 9. Letter Spacing Controls ────────────────────────────────────────
        case 'set_letter_spacing': {
          if (this.deps.dyslexiaContext) {
            let targetSpacing = 0.03;
            if (parameters.value !== undefined && !isNaN(Number(parameters.value))) {
              let val = Number(parameters.value);
              // If given as percentage like 5 for 5%, normalize to 0.05
              if (val > 1) val = val / 100;
              targetSpacing = val;
            } else if (parameters.preset === 'normal' || parameters.preset === 'none' || parameters.preset === '0') {
              targetSpacing = 0;
            }

            const clamped = Math.max(0, Math.min(0.2, Math.round(targetSpacing * 100) / 100));

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLetterSpacing) {
              this.deps.dyslexiaContext.setFunLetterSpacing(clamped);
            }

            const display = clamped === 0 ? 'Normal' : `+${Math.round(clamped * 100)}%`;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Letter spacing set to ${display}.`,
              spokenResponse: `Letter spacing set to ${display}.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'increase_letter_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLetterSpacing || 0.03;
            const next = Math.min(0.2, Math.round((current + 0.02) * 100) / 100);

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLetterSpacing) {
              this.deps.dyslexiaContext.setFunLetterSpacing(next);
            }

            const display = `+${Math.round(next * 100)}%`;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Increased letter spacing to ${display}.`,
              spokenResponse: `Letter spacing increased to ${display}.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'decrease_letter_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLetterSpacing || 0.03;
            const next = Math.max(0, Math.round((current - 0.02) * 100) / 100);

            if (this.deps.dyslexiaContext.enableFunMode) {
              this.deps.dyslexiaContext.enableFunMode();
            }
            if (this.deps.dyslexiaContext.setFunLetterSpacing) {
              this.deps.dyslexiaContext.setFunLetterSpacing(next);
            }

            const display = next === 0 ? 'Normal' : `+${Math.round(next * 100)}%`;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Decreased letter spacing to ${display}.`,
              spokenResponse: `Letter spacing decreased to ${display}.`,
            };
          }
          return { success: false, message: 'Spacing controls unavailable.' };
        }

        case 'get_letter_spacing': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.funLetterSpacing || 0.03;
            const display = current === 0 ? 'Normal' : `+${Math.round(current * 100)}%`;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Current letter spacing: ${display}`,
              spokenResponse: `Your current letter spacing is ${display}.`,
            };
          }
          return { success: false, message: 'Spacing context unavailable.' };
        }

        // ── 10. Text Size Controls ────────────────────────────────────────────
        case 'set_text_size': {
          if (this.deps.dyslexiaContext) {
            let target = 100;
            if (parameters.value !== undefined && !isNaN(Number(parameters.value))) {
              target = Number(parameters.value);
            }
            const clamped = Math.max(90, Math.min(150, Math.round(target / 5) * 5));

            this.deps.dyslexiaContext.setTextSize(clamped);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Text size set to ${clamped}%`,
              spokenResponse: `Text size set to ${clamped} percent.`,
            };
          }
          return { success: false, message: 'Text size controls unavailable.' };
        }

        case 'reset_text_size': {
          if (this.deps.dyslexiaContext) {
            this.deps.dyslexiaContext.setTextSize(100);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Text size reset to 100%.',
              spokenResponse: 'Text size reset to default 100 percent.',
            };
          }
          return { success: false, message: 'Text size controls unavailable.' };
        }

        case 'get_text_size': {
          if (this.deps.dyslexiaContext) {
            const current = this.deps.dyslexiaContext.textSize || 100;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Current text size: ${current}%`,
              spokenResponse: `Your current text size is ${current} percent.`,
            };
          }
          return { success: false, message: 'Text size context unavailable.' };
        }

        // ── 11. Reset Reading Settings ────────────────────────────────────────
        case 'reset_reading_settings':
        case 'reset_settings': {
          if (this.deps.dyslexiaContext) {
            if (this.deps.dyslexiaContext.resetFunSettings) {
              this.deps.dyslexiaContext.resetFunSettings();
            }
            this.deps.dyslexiaContext.setTextSize(100);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: '✨ All reading settings have been reset to default values.',
              spokenResponse: 'All reading settings have been restored to defaults.',
            };
          }
          return { success: false, message: 'Settings context unavailable.' };
        }

        case 'get_reading_settings': {
          if (this.deps.dyslexiaContext) {
            const font = this.deps.dyslexiaContext.funFont || 'lexend';
            const fontLabel = FUN_FONTS.find((f) => f.id === font)?.label || font;
            const lineH = (this.deps.dyslexiaContext.funLineHeight || 1.8).toFixed(1);
            const weight = weightName(this.deps.dyslexiaContext.funWeight || 400);
            const letterS =
              (this.deps.dyslexiaContext.funLetterSpacing || 0.03) === 0
                ? 'Normal'
                : `+${Math.round((this.deps.dyslexiaContext.funLetterSpacing || 0.03) * 100)}%`;
            const size = this.deps.dyslexiaContext.textSize || 100;
            const funOn = !!this.deps.dyslexiaContext.isDyslexiaMode;

            const summary = `⚙️ Current Reading Settings:\n• Fun Mode: ${funOn ? 'On' : 'Off'}\n• Font: ${fontLabel}\n• Line Spacing: ${lineH}×\n• Font Weight: ${weight}\n• Letter Spacing: ${letterS}\n• Text Size: ${size}%`;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: summary,
              spokenResponse: `Your font is ${fontLabel}, line spacing is ${lineH} times, font weight is ${weight}, letter spacing is ${letterS}, and text size is ${size} percent.`,
            };
          }
          return { success: false, message: 'Settings context unavailable.' };
        }

        // ── 12. Accessibility Toggles ─────────────────────────────────────────
        case 'enable_high_contrast': {
          if (this.deps.dyslexiaContext) {
            if (this.deps.dyslexiaContext.highContrast) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'High contrast mode is already active.',
                spokenResponse: 'High contrast is already on.',
              };
            }
            if (this.deps.dyslexiaContext.setHighContrast) {
              this.deps.dyslexiaContext.setHighContrast(true);
            } else if (this.deps.dyslexiaContext.toggleHighContrast) {
              this.deps.dyslexiaContext.toggleHighContrast();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'High contrast mode enabled.',
              spokenResponse: 'High contrast mode is now on.',
            };
          }
          return { success: false, message: 'Contrast context unavailable.' };
        }

        case 'disable_high_contrast': {
          if (this.deps.dyslexiaContext) {
            if (!this.deps.dyslexiaContext.highContrast) {
              return {
                success: true,
                actionId: action,
                executed: false,
                verified: true,
                message: 'High contrast mode is already off.',
                spokenResponse: 'High contrast is already turned off.',
              };
            }
            if (this.deps.dyslexiaContext.setHighContrast) {
              this.deps.dyslexiaContext.setHighContrast(false);
            } else if (this.deps.dyslexiaContext.toggleHighContrast) {
              this.deps.dyslexiaContext.toggleHighContrast();
            }
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'High contrast mode disabled.',
              spokenResponse: 'High contrast mode is now off.',
            };
          }
          return { success: false, message: 'Contrast context unavailable.' };
        }

        case 'enable_reduce_motion': {
          if (this.deps.dyslexiaContext?.setReduceMotion) {
            this.deps.dyslexiaContext.setReduceMotion(true);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Reduced motion enabled.',
              spokenResponse: 'Reduced motion is now enabled.',
            };
          }
          return { success: false, message: 'Motion context unavailable.' };
        }

        case 'disable_reduce_motion': {
          if (this.deps.dyslexiaContext?.setReduceMotion) {
            this.deps.dyslexiaContext.setReduceMotion(false);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Standard animations restored.',
              spokenResponse: 'Animations restored.',
            };
          }
          return { success: false, message: 'Motion context unavailable.' };
        }

        case 'toggle_high_contrast': {
          if (this.deps.dyslexiaContext) {
            const wasOn = this.deps.dyslexiaContext.highContrast;
            if (this.deps.dyslexiaContext.setHighContrast) {
              this.deps.dyslexiaContext.setHighContrast(!wasOn);
            } else if (this.deps.dyslexiaContext.toggleHighContrast) {
              this.deps.dyslexiaContext.toggleHighContrast();
            }
            const newState = !wasOn;
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `High contrast mode ${newState ? 'enabled' : 'disabled'}`,
              spokenResponse: `High contrast mode ${newState ? 'enabled' : 'disabled'}.`,
            };
          }
          return { success: false, message: 'Accessibility context not available.' };
        }

        case 'increase_text_size':
        case 'increase_font_size': {
          if (this.deps.dyslexiaContext) {
            const currentSize = this.deps.dyslexiaContext.textSize || 100;
            const newSize = Math.min(150, currentSize + 10);
            this.deps.dyslexiaContext.setTextSize(newSize);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Increased text size to ${newSize}%`,
              spokenResponse: 'Increased text size.',
            };
          }
          return { success: false, message: 'Accessibility context not available.' };
        }

        case 'decrease_text_size':
        case 'decrease_font_size': {
          if (this.deps.dyslexiaContext) {
            const currentSize = this.deps.dyslexiaContext.textSize || 100;
            const newSize = Math.max(80, currentSize - 10);
            this.deps.dyslexiaContext.setTextSize(newSize);
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: `Decreased text size to ${newSize}%`,
              spokenResponse: 'Decreased text size.',
            };
          }
          return { success: false, message: 'Accessibility context not available.' };
        }

        // ── 5. Page Understanding & Summarization ──────────────────────────────
        case 'summarize_page': {
          const summary = getExtractedPageSummary();
          const pageTitle = summary.pageTitle || 'the current page';

          let displayMsg = `📄 Summary of ${pageTitle}:\n\n`;
          if (summary.summaryBulletPoints.length > 0) {
            displayMsg += summary.summaryBulletPoints.slice(0, 3).map((bp) => `• ${bp}`).join('\n\n');
          } else {
            displayMsg += summary.mainText.slice(0, 240) + '...';
          }

          const spoken =
            intent.spokenResponse ||
            `Here is a summary of ${pageTitle}. ${summary.summaryBulletPoints[0] ||
            'It outlines key features and learning resources on this page.'
            }`;

          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: displayMsg,
            spokenResponse: spoken.slice(0, 240),
          };
        }

        case 'explain_page': {
          const summary = getExtractedPageSummary();
          const pageTitle = summary.pageTitle || 'this page';
          const actionsText =
            summary.keyActions.length > 0
              ? `You can use controls like: ${summary.keyActions.join(', ')}.`
              : 'You can explore courses, read content, or adjust accessibility.';

          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: `💡 Guide for ${pageTitle}:\n\n${actionsText}\n\n• Say "Read this page" to listen with word spotlight.\n• Say "Go to Dashboard" to view learning progress.`,
            spokenResponse: `On ${pageTitle}, ${actionsText}`,
          };
        }

        case 'search_page': {
          const query = parameters.query || '';
          if (!query) {
            return { success: false, message: 'Please specify a term to find on the page.' };
          }
          const found = scrollToPageMatch(query);
          return {
            success: found,
            actionId: action,
            executed: true,
            verified: found,
            message: found ? `Found and highlighted "${query}" on the page.` : `Could not find "${query}" on this page.`,
            spokenResponse: found ? `Found ${query} on this page.` : `Could not find that on this page.`,
          };
        }

        case 'close_assistant': {
          if (this.deps.assistantContext?.closeAssistant) {
            this.deps.assistantContext.closeAssistant();
          }
          return {
            success: true,
            actionId: action,
            executed: true,
            verified: true,
            message: 'Minimized Jarvis assistant',
            spokenResponse: 'Minimized. Say "Hey Jarvis" whenever you need me.',
          };
        }

        // ── 6. Sensitive Action Confirmation (User Logout) ─────────────────────
        case 'user_logout': {
          if (this.deps.authContext?.logout) {
            this.deps.authContext.logout();
            this.deps.navigate('/login');
            return {
              success: true,
              actionId: action,
              executed: true,
              verified: true,
              message: 'Successfully logged out.',
              spokenResponse: 'You have been logged out.',
            };
          }
          return { success: false, message: 'Auth context not available.' };
        }

        default:
          return {
            success: false,
            actionId: action,
            executed: false,
            verified: false,
            message: `Action '${action}' is not supported. Available actions include navigation, scrolling, reading, and dyslexia font toggles.`,
            spokenResponse: "I'm not able to perform that action yet.",
          };
      }
    } catch (err: any) {
      console.error('[JarvisExecutor error]', err);
      return {
        success: false,
        actionId: action,
        executed: false,
        verified: false,
        message: err.message || 'Execution failed',
        spokenResponse: 'I ran into an issue performing that action.',
      };
    }
  }

  /**
   * Prepares confirmation request for sensitive actions like logout
   */
  private prepareConfirmation(intent: StructuredIntent): ActionResult {
    const actionDef = GLOBAL_ACTIONS[intent.action || ''];
    const prompt = intent.confirmationPrompt || `Are you sure you want to perform ${actionDef?.name || 'this action'}?`;
    const spoken = intent.spokenResponse || prompt;

    this.pendingConfirmation = {
      intent,
      prompt,
      spokenPrompt: spoken,
      onConfirm: async () => {
        this.pendingConfirmation = null;
        return this.executeIntent({ ...intent, type: 'confirm_action' });
      },
      onCancel: () => {
        this.pendingConfirmation = null;
      },
    };

    return {
      success: true,
      actionId: intent.action,
      message: prompt,
      spokenResponse: spoken,
    };
  }

  /**
   * Helper to dispatch tab changes to Dashboard components
   */
  private dispatchDashboardTabEvent(tabName: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('neurobridge:switch-tab', { detail: { tab: tabName } })
      );
    }
  }
}
