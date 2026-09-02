// Jarvis Agent Engine - Intent classification & reasoning with Llama 3 + Ollama
// Generates structured website actions and conversational responses

import type {
  StructuredIntent,
  JarvisContext,
  JarvisActionType,
} from '../types/jarvisAgent';
import { GLOBAL_ACTIONS } from './jarvisActionRegistry';

export class JarvisAgentEngine {
  private ollamaEndpoint: string = '/api/ollama/generate';
  private modelName: string = 'llama3';

  /**
   * Main entrypoint to determine user intent from input and website context
   */
  public async processInput(
    userInput: string,
    context: JarvisContext
  ): Promise<StructuredIntent> {
    const cleanInput = userInput.trim();
    if (!cleanInput) {
      return {
        type: 'conversation',
        displayText: "I didn't catch that. How can I help you navigate?",
        spokenResponse: "I didn't catch that. How can I help you navigate?",
      };
    }

    // 1. First attempt inference with Ollama (Llama 3)
    try {
      const llmResult = await this.queryLlama3(cleanInput, context);
      if (llmResult) {
        return this.validateAndNormalizeIntent(llmResult, cleanInput);
      }
    } catch (err) {
      console.warn('[JarvisAgentEngine] Ollama query failed, utilizing heuristic fallback:', err);
    }

    // 2. Deterministic NLP fallback if Ollama is unreachable or slow
    return this.fallbackHeuristicIntent(cleanInput, context);
  }

  /**
   * Queries Llama 3 with context and structured JSON format
   */
  private async queryLlama3(
    userInput: string,
    context: JarvisContext
  ): Promise<any | null> {
    const actionsList = Object.values(GLOBAL_ACTIONS).map(
      (a) => `- ${a.id}: ${a.description} (synonyms: ${a.synonyms?.join(', ') || 'none'})`
    ).join('\n');

    const recentHistoryText = context.recentHistory
      .slice(-4)
      .map((h) => `${h.role === 'user' ? 'User' : 'Jarvis'}: ${h.content}`)
      .join('\n');

    const prompt = `You are JARVIS, an intelligent AI Web Agent embedded inside the NeuroBridge dyslexia-friendly website.
Your job is to understand what the user wants and output ONLY a valid JSON object matching the schema below.

CURRENT WEBSITE CONTEXT:
- Current Page Route: "${context.currentRoute}"
- Current Page Title: "${context.pageTitle}"
- Active Tab (if on Dashboard): "${context.activeTab || 'home'}"
- User Name: "${context.userName || 'Student'}"
- User Language: "${context.language}"

AVAILABLE WEBSITE ACTIONS (You MUST ONLY choose from these action IDs):
${actionsList}

RECENT CONVERSATION:
${recentHistoryText || 'No prior messages.'}

USER REQUEST: "${userInput}"

RESPONSE INSTRUCTIONS:
1. If the user wants to navigate somewhere, scroll, click something, or adjust settings, return type "action" with the exact matching action ID.
2. If the user asks a normal question about dyslexia, courses, or the platform, return type "conversation".
3. If the user asks to log out or perform a sensitive action, return type "confirmation_required".
4. Spoken responses MUST be short, warm, and concise (1 short sentence max for actions, e.g. "Opening your dashboard.").
5. Output MUST be ONLY raw JSON without markdown backticks.

REQUIRED JSON FORMAT:
{
  "type": "action" | "conversation" | "confirmation_required",
  "action": "<exact_action_id_from_list_above_or_null>",
  "parameters": {},
  "spokenResponse": "<short 1-sentence spoken response>",
  "displayText": "<display response text for chat bubble>"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast UI responsiveness

    const response = await fetch(this.ollamaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.modelName,
        prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.2, // Low temperature for deterministic action selection
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.response) return null;

    try {
      // Parse JSON from Llama 3 output
      const parsed = JSON.parse(data.response);
      return parsed;
    } catch {
      // Strip markdown code fences if model returned them
      const cleaned = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Validates and sanitizes the parsed intent against registered actions
   */
  private validateAndNormalizeIntent(
    raw: any,
    userInput: string
  ): StructuredIntent {
    const type: JarvisActionType =
      raw.type === 'action' || raw.type === 'conversation' || raw.type === 'confirmation_required'
        ? raw.type
        : 'conversation';

    let action = raw.action;

    // Verify action exists in registry
    if (action && !GLOBAL_ACTIONS[action]) {
      // Look for fuzzy match in registry
      const matched = Object.keys(GLOBAL_ACTIONS).find(
        (key) => key === action || action.includes(key)
      );
      action = matched || undefined;
    }

    if (type === 'action' && !action) {
      return this.fallbackHeuristicIntent(userInput, {
        currentRoute: '',
        pageTitle: '',
        availableActions: [],
        recentHistory: [],
        language: 'en',
      });
    }

    const spokenResponse =
      raw.spokenResponse ||
      (type === 'action' && action
        ? `Opening ${GLOBAL_ACTIONS[action]?.name || 'requested page'}.`
        : raw.displayText || 'I can help with that.');

    return {
      type: action ? type : 'conversation',
      action,
      parameters: raw.parameters || {},
      spokenResponse,
      displayText: raw.displayText || spokenResponse,
    };
  }

  /**
   * Deterministic NLP Heuristic Parser
   * Instant, reliable fallback that guarantees navigation and core controls always work
   */
  public fallbackHeuristicIntent(
    input: string,
    context: JarvisContext
  ): StructuredIntent {
    const text = input.toLowerCase().trim();

    // ── Navigation Heuristics ────────────────────────────────────────────────
    if (this.matchesAny(text, ['home', 'landing page', 'go home', 'take me home', 'main page', 'घर'])) {
      return {
        type: 'action',
        action: 'navigate_home',
        spokenResponse: 'Taking you to the home page.',
        displayText: 'Navigating to Home',
      };
    }

    if (this.matchesAny(text, ['dashboard', 'open dashboard', 'my dashboard', 'overview', 'डैशबोर्ड'])) {
      return {
        type: 'action',
        action: 'open_dashboard',
        spokenResponse: 'Opening your dashboard.',
        displayText: 'Navigating to Dashboard',
      };
    }

    if (this.matchesAny(text, ['learn', 'learning', 'practice', 'study', 'study hub', 'learning center', 'शिकणे'])) {
      return {
        type: 'action',
        action: 'open_learn',
        spokenResponse: 'Opening the learning center.',
        displayText: 'Navigating to Learn',
      };
    }

    if (this.matchesAny(text, ['opportunities', 'jobs', 'careers', 'internships', 'job board', 'नोकरी'])) {
      return {
        type: 'action',
        action: 'open_opportunities',
        spokenResponse: 'Opening career opportunities and jobs.',
        displayText: 'Navigating to Opportunities',
      };
    }

    if (this.matchesAny(text, ['community', 'peer', 'forum', 'discussion', 'community page', 'समुदाय'])) {
      return {
        type: 'action',
        action: 'open_community',
        spokenResponse: 'Opening the community page.',
        displayText: 'Navigating to Community',
      };
    }

    if (this.matchesAny(text, ['course', 'courses', 'classes', 'catalog', 'video lessons', 'कोर्स'])) {
      return {
        type: 'action',
        action: 'open_courses',
        spokenResponse: 'Opening the courses catalog.',
        displayText: 'Navigating to Courses',
      };
    }

    if (this.matchesAny(text, ['resume', 'cv', 'resume builder', 'build resume', 'बायोडाटा'])) {
      return {
        type: 'action',
        action: 'open_resume_builder',
        spokenResponse: 'Opening the resume builder.',
        displayText: 'Navigating to Resume Builder',
      };
    }

    if (this.matchesAny(text, ['assessment', 'test', 'dyslexia test', 'cognitive assessment', 'चाचणी'])) {
      return {
        type: 'action',
        action: 'open_assessment',
        spokenResponse: 'Opening the cognitive assessment.',
        displayText: 'Navigating to Assessment',
      };
    }

    if (this.matchesAny(text, ['about', 'about us', 'mission', 'माहिती'])) {
      return {
        type: 'action',
        action: 'open_about',
        spokenResponse: 'Opening about NeuroBridge.',
        displayText: 'Navigating to About',
      };
    }

    if (this.matchesAny(text, ['login', 'sign in', 'register', 'signup', 'create account', 'लॉगिन'])) {
      return {
        type: 'action',
        action: 'open_login',
        spokenResponse: 'Opening login page.',
        displayText: 'Navigating to Login',
      };
    }

    if (this.matchesAny(text, ['profile', 'my profile', 'account', 'user settings'])) {
      return {
        type: 'action',
        action: 'open_profile',
        spokenResponse: 'Opening your profile.',
        displayText: 'Opening Profile',
      };
    }

    if (this.matchesAny(text, ['accessibility settings', 'font settings', 'preferences', 'contrast settings'])) {
      return {
        type: 'action',
        action: 'open_accessibility_settings',
        spokenResponse: 'Opening accessibility preferences.',
        displayText: 'Opening Accessibility Settings',
      };
    }

    if (this.matchesAny(text, ['ai notebook', 'notebook', 'rag brain', 'document search', 'notes'])) {
      return {
        type: 'action',
        action: 'open_ai_notebook',
        spokenResponse: 'Opening AI Notebook.',
        displayText: 'Opening AI Notebook',
      };
    }

    if (this.matchesAny(text, ['creator studio', 'create course', 'course creator', 'studio'])) {
      return {
        type: 'action',
        action: 'open_creator_studio',
        spokenResponse: 'Opening Course Creator Studio.',
        displayText: 'Opening Creator Studio',
      };
    }

    // ── History & Navigation Control ──────────────────────────────────────────
    if (this.matchesAny(text, ['go back', 'back', 'previous page', 'return', 'मागे'])) {
      return {
        type: 'action',
        action: 'go_back',
        spokenResponse: 'Going back.',
        displayText: 'Going back to previous page',
      };
    }

    if (this.matchesAny(text, ['go forward', 'forward', 'next page', 'पुढे'])) {
      return {
        type: 'action',
        action: 'go_forward',
        spokenResponse: 'Going forward.',
        displayText: 'Going forward',
      };
    }

    // ── Scrolling Heuristics ──────────────────────────────────────────────────
    if (this.matchesAny(text, ['scroll to top', 'top of page', 'go to top', 'scroll top', 'start of page'])) {
      return {
        type: 'action',
        action: 'scroll_to_top',
        spokenResponse: 'Scrolling to the top.',
        displayText: 'Scrolling to top',
      };
    }

    if (this.matchesAny(text, ['scroll to bottom', 'bottom of page', 'go to bottom', 'go to footer', 'end of page'])) {
      return {
        type: 'action',
        action: 'scroll_to_bottom',
        spokenResponse: 'Scrolling to the bottom.',
        displayText: 'Scrolling to bottom',
      };
    }

    if (this.matchesAny(text, ['scroll down', 'page down', 'go down', 'down', 'खाली'])) {
      return {
        type: 'action',
        action: 'scroll_down',
        spokenResponse: 'Scrolling down.',
        displayText: 'Scrolling down',
      };
    }

    if (this.matchesAny(text, ['scroll up', 'page up', 'go up', 'up', 'वर'])) {
      return {
        type: 'action',
        action: 'scroll_up',
        spokenResponse: 'Scrolling up.',
        displayText: 'Scrolling up',
      };
    }

    // ── Accessibility & UI Toggles ────────────────────────────────────────────
    if (this.matchesAny(text, ['dyslexia font', 'dyslexia mode', 'toggle font', 'opendyslexic'])) {
      return {
        type: 'action',
        action: 'toggle_dyslexia_mode',
        spokenResponse: 'Toggling dyslexia font mode.',
        displayText: 'Toggled Dyslexia Mode',
      };
    }

    if (this.matchesAny(text, ['high contrast', 'contrast mode', 'dark contrast', 'कंट्रास्ट'])) {
      return {
        type: 'action',
        action: 'toggle_high_contrast',
        spokenResponse: 'Toggling high contrast mode.',
        displayText: 'Toggled High Contrast',
      };
    }

    if (this.matchesAny(text, ['bigger text', 'increase text', 'larger font', 'zoom text', 'make text bigger'])) {
      return {
        type: 'action',
        action: 'increase_text_size',
        spokenResponse: 'Increasing text size.',
        displayText: 'Increased font size',
      };
    }

    if (this.matchesAny(text, ['smaller text', 'decrease text', 'smaller font', 'make text smaller'])) {
      return {
        type: 'action',
        action: 'decrease_text_size',
        spokenResponse: 'Decreasing text size.',
        displayText: 'Decreased font size',
      };
    }

    // ── Sensitive Actions (Logout) ────────────────────────────────────────────
    if (this.matchesAny(text, ['logout', 'sign out', 'log me out', 'exit account'])) {
      return {
        type: 'confirmation_required',
        action: 'user_logout',
        confirmationPrompt: 'Are you sure you want to log out of NeuroBridge?',
        spokenResponse: 'Are you sure you want to log out?',
        displayText: 'Are you sure you want to log out?',
      };
    }

    // ── General Interactive Fallback / Question ───────────────────────────────
    return {
      type: 'conversation',
      spokenResponse: "I am Jarvis, your website assistant. You can ask me to navigate pages, scroll, adjust reading settings, or explain anything on NeuroBridge.",
      displayText: "I can help you navigate to the Dashboard, Learn page, Courses, Opportunities, Community, or adjust accessibility settings. Just say where you'd like to go!",
    };
  }

  private matchesAny(input: string, patterns: string[]): boolean {
    return patterns.some((p) => input.includes(p));
  }
}
