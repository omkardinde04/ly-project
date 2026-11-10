// Jarvis Agent Engine - ChatGPT-Style Conversational Intelligence & Website Action Agent
// Provides fast, natural, screen-aware conversational AI with structured page interaction

import type {
  StructuredIntent,
  JarvisContext,
  JarvisActionType,
} from '../types/jarvisAgent';
import { GLOBAL_ACTIONS } from './jarvisActionRegistry';
import { API_BASE } from '../config/api';

export class JarvisAgentEngine {
  /**
   * Main entrypoint to determine user intent from input and website context
   * Uses real LLM (ChatGPT-style) with instant command fast-path and dual fallbacks
   */
  public async processInput(
    userInput: string,
    context: JarvisContext
  ): Promise<StructuredIntent> {
    const cleanInput = userInput.trim();
    if (!cleanInput) {
      return {
        type: 'conversation',
        displayText: "I'm ready! How can I help you learn or explore today?",
        spokenResponse: "I'm ready! How can I help you learn or explore today?",
      };
    }

    // 1. Fast-Path: Direct High-Confidence Website Commands (0ms latency)
    const directCmd = this.getDirectCommand(cleanInput, context);
    if (directCmd) {
      return directCmd;
    }

    // 2. Real LLM Intelligence: Backend /api/llm/chat (Gemini + Pollinations)
    try {
      const llmResult = await this.queryLLM(cleanInput, context);
      if (llmResult) {
        return llmResult;
      }
    } catch (err) {
      console.warn('[JarvisAgentEngine] Backend LLM failed, using client AI fallback:', err);
    }

    // 3. Client-Side LLM Fallback (Pollinations AI: free OpenAI-compatible endpoint)
    try {
      const clientFallback = await this.queryClientAI(cleanInput, context);
      if (clientFallback) {
        return clientFallback;
      }
    } catch (err) {
      console.warn('[JarvisAgentEngine] Client AI query failed:', err);
    }

    // 4. Offline Heuristic Fallback
    return this.siriConversationalEngine(cleanInput, context);
  }

  /**
   * Fast-path immediate commands for core site actions
   */
  private getDirectCommand(input: string, context: JarvisContext): StructuredIntent | null {
    const text = input.toLowerCase().trim();

    // Spotlight / Page Reading commands
    if (this.matchesAny(text, ['read this page', 'read page', 'read aloud', 'start reading', 'read out loud', 'वाचून दाखव'])) {
      return {
        type: 'action',
        action: 'read_page',
        displayText: 'Reading the current page aloud with word spotlight...',
        spokenResponse: 'Starting page reading now.',
      };
    }
    if (this.matchesAny(text, ['pause reading', 'pause audio', 'pause reader', 'थांबव'])) {
      return {
        type: 'action',
        action: 'pause_reading',
        displayText: 'Paused reading.',
        spokenResponse: 'Paused.',
      };
    }
    if (this.matchesAny(text, ['resume reading', 'continue reading', 'unpause', 'पुढे वाच'])) {
      return {
        type: 'action',
        action: 'resume_reading',
        displayText: 'Resuming reading.',
        spokenResponse: 'Resuming reading.',
      };
    }
    if (this.matchesAny(text, ['stop reading', 'stop audio', 'stop reader', 'वाचणे बंद कर'])) {
      return {
        type: 'action',
        action: 'stop_reading',
        displayText: 'Stopped reading.',
        spokenResponse: 'Stopped reading.',
      };
    }

    // Dyslexia & Visual Accessibility Tools
    if (this.matchesAny(text, ['toggle dyslexia font', 'opendyslexic font', 'change font', 'dyslexia font', 'फॉन्ट बदल'])) {
      return {
        type: 'action',
        action: 'toggle_dyslexia_font',
        displayText: 'Toggled OpenDyslexic readable font.',
        spokenResponse: 'Adjusted font for reading ease.',
      };
    }
    if (this.matchesAny(text, ['high contrast', 'toggle high contrast', 'contrast mode'])) {
      return {
        type: 'action',
        action: 'toggle_high_contrast',
        displayText: 'Toggled high contrast mode.',
        spokenResponse: 'Toggled contrast mode.',
      };
    }
    if (this.matchesAny(text, ['bigger text', 'larger text', 'increase text size', 'make text bigger', 'मोठा फॉन्ट'])) {
      return {
        type: 'action',
        action: 'increase_text_size',
        displayText: 'Increased text size.',
        spokenResponse: 'Making text larger.',
      };
    }
    if (this.matchesAny(text, ['smaller text', 'decrease text size', 'make text smaller', 'लहान फॉन्ट'])) {
      return {
        type: 'action',
        action: 'decrease_text_size',
        displayText: 'Decreased text size.',
        spokenResponse: 'Making text smaller.',
      };
    }

    // Direct Navigation
    if (text === 'go home' || text === 'go to home' || text === 'open home') {
      return {
        type: 'action',
        action: 'navigate_home',
        displayText: 'Navigating to Home',
        spokenResponse: 'Taking you to the home page.',
      };
    }
    if (text === 'go to dashboard' || text === 'open dashboard' || text === 'my dashboard' || text === 'dashboard') {
      return {
        type: 'action',
        action: 'open_dashboard',
        displayText: 'Navigating to Dashboard',
        spokenResponse: 'Opening your student dashboard.',
      };
    }
    if (text === 'take assessment' || text === 'go to assessment' || text === 'start assessment' || text === 'assessment') {
      return {
        type: 'action',
        action: 'open_assessment',
        displayText: 'Navigating to Assessment',
        spokenResponse: 'Opening the cognitive assessment.',
      };
    }
    if (text === 'show jobs' || text === 'open opportunities' || text === 'go to opportunities' || text === 'careers') {
      return {
        type: 'action',
        action: 'open_opportunities',
        displayText: 'Navigating to Opportunities & Jobs',
        spokenResponse: 'Opening career opportunities.',
      };
    }
    if (text === 'open community' || text === 'go to community' || text === 'community hub') {
      return {
        type: 'action',
        action: 'open_community',
        displayText: 'Navigating to Community Hub',
        spokenResponse: 'Opening community discussions.',
      };
    }
    if (text === 'nearby care' || text === 'hospitals near me' || text === 'open nearby care') {
      return {
        type: 'action',
        action: 'open_nearby',
        displayText: 'Navigating to Nearby Care',
        spokenResponse: 'Opening nearby care and support.',
      };
    }

    return null;
  }

  /**
   * Queries our backend /api/llm/chat endpoint powered by Gemini + Pollinations
   */
  private async queryLLM(
    userInput: string,
    context: JarvisContext
  ): Promise<StructuredIntent | null> {
    const history = (context.recentHistory || []).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    try {
      const res = await fetch(`${API_BASE}/api/llm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history,
            { role: 'user', content: userInput },
          ],
          context: {
            currentRoute: context.currentRoute,
            pageTitle: context.pageTitle,
            pageContent: context.pageContent,
            userName: context.userName,
            language: context.language,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) return null;

      const data = await res.json();
      if (!data || !data.text) return null;

      if (data.action && GLOBAL_ACTIONS[data.action]) {
        return {
          type: 'action',
          action: data.action as JarvisActionType,
          displayText: data.text,
          spokenResponse: data.spokenResponse || data.text.slice(0, 240),
        };
      }

      return {
        type: 'conversation',
        displayText: data.text,
        spokenResponse: data.spokenResponse || data.text.slice(0, 240),
      };
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  /**
   * High-Performance Client-Side LLM Fallback (Pollinations AI)
   * Ensures Jarvis behaves like ChatGPT even if local backend is offline!
   */
  private async queryClientAI(
    userInput: string,
    context: JarvisContext
  ): Promise<StructuredIntent | null> {
    const systemPrompt = `You are JARVIS, an intelligent, empathetic, and friendly AI assistant inside NeuroBridge, an educational platform for neurodivergent and dyslexic learners.
You act like ChatGPT: capable of answering ANY question — science, mathematics, coding, history, writing, explaining complex concepts simply, giving study advice, and having natural conversations.

DYSLEXIA-FRIENDLY RESPONSE STYLE:
- Write in clean, structured Markdown.
- Use bullet points, bold key terms, and short, readable paragraphs.
- Keep vocabulary clear and supportive.
- Be encouraging and warm.

WEBSITE CONTEXT:
- Active Page: "${context.pageTitle || 'NeuroBridge'}" (${context.currentRoute || '/'})
- Learner Name: "${context.userName || 'Learner'}"
${context.pageContent ? `- Active Screen Content: "${String(context.pageContent).slice(0, 1000)}"` : ''}`;

    const history = (context.recentHistory || []).slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userInput },
          ],
          model: 'openai',
          seed: 42,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || !text.trim()) return null;

      return {
        type: 'conversation',
        displayText: text.trim(),
        spokenResponse: text.trim().slice(0, 240),
      };
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  /**
   * Alias for backward compatibility
   */
  public fallbackHeuristicIntent(input: string, context: JarvisContext): StructuredIntent {
    return this.siriConversationalEngine(input, context);
  }

  /**
   * High-Performance Siri Conversational Intelligence Engine
   * Provides human-like conversational responses, page reading, in-page awareness, and actions
   */
  public siriConversationalEngine(
    input: string,
    context: JarvisContext
  ): StructuredIntent {
    const text = input.toLowerCase().trim();
    const userName = context.userName ? context.userName.split(' ')[0] : '';

    // ── 1. Page Reading & Speech Controls (Spotlight Reader) ──────────────────
    if (
      this.matchesAny(text, [
        'read this page',
        'read page',
        'read the whole page',
        'read the page',
        'read aloud',
        'read out loud',
        'read to me',
        'start reading',
        'read article',
        'read content',
        'listen to this page',
        'speak page',
        'हे पान वाचा',
        'वाचा',
        'पढ़ो',
        'पृष्ठ पढ़ो',
      ])
    ) {
      return {
        type: 'action',
        action: 'read_page',
        spokenResponse: "Reading this page for you now. Just say 'stop' or 'pause' whenever you'd like.",
        displayText: "📖 Reading page aloud with word spotlight...\n\nSay 'Pause', 'Resume', or 'Stop' anytime.",
      };
    }

    if (
      this.matchesAny(text, [
        'pause reading',
        'pause the reading',
        'pause speech',
        'pause audio',
        'hold on',
        'थांबा',
        'विराम',
      ]) ||
      text === 'pause'
    ) {
      return {
        type: 'action',
        action: 'pause_reading',
        spokenResponse: 'Reading paused.',
        displayText: '⏸ Reading paused',
      };
    }

    if (
      this.matchesAny(text, [
        'resume reading',
        'resume',
        'continue reading',
        'continue speaking',
        'keep reading',
        'चालू ठेवा',
        'पुन्हा सुरू करा',
        'जारी रखो',
      ])
    ) {
      return {
        type: 'action',
        action: 'resume_reading',
        spokenResponse: 'Resuming reading.',
        displayText: '▶ Resuming reading',
      };
    }

    if (
      this.matchesAny(text, [
        'stop reading',
        'stop speaking',
        'stop talking',
        'stop audio',
        'be quiet',
        'shut up',
        'silence',
        'quiet',
        'cancel reading',
        'बंद करा',
        'शांत रहा',
        'चुप रहो',
      ]) ||
      text === 'stop'
    ) {
      return {
        type: 'action',
        action: 'stop_reading',
        spokenResponse: 'Stopped reading.',
        displayText: '⏹ Stopped reading',
      };
    }

    if (this.matchesAny(text, ['read faster', 'speak faster', 'speed up reading', 'speed up', 'वेग वाढवा'])) {
      return {
        type: 'action',
        action: 'speed_up_reading',
        spokenResponse: 'Reading a bit faster now.',
        displayText: '⏩ Increased reading speed',
      };
    }

    if (this.matchesAny(text, ['read slower', 'speak slower', 'slow down reading', 'slow down', 'वेग कमी करा'])) {
      return {
        type: 'action',
        action: 'slow_down_reading',
        spokenResponse: 'Reading a bit slower for comfort.',
        displayText: '⏪ Decreased reading speed',
      };
    }

    if (this.matchesAny(text, ['read selected', 'read selection', 'read this text', 'read highlighted', 'read what i highlighted'])) {
      return {
        type: 'action',
        action: 'read_selection',
        spokenResponse: 'Reading selected text.',
        displayText: '🔍 Reading selected text',
      };
    }

    // ── 2. Page Understanding & Summarization ─────────────────────────────────
    if (
      this.matchesAny(text, [
        'summarize this page',
        'summarize page',
        'summarize the page',
        'summarize',
        'what is on this page',
        'what is this page about',
        'what does this page say',
        'tell me about this page',
        'page summary',
        'brief me',
        'overview of this page',
        'सारांश',
        'या पानाचा सारांश',
      ])
    ) {
      return {
        type: 'action',
        action: 'summarize_page',
        spokenResponse: `Summarizing ${context.pageTitle || 'this page'} for you.`,
        displayText: `📄 Summarizing ${context.pageTitle}...`,
      };
    }

    if (
      this.matchesAny(text, [
        'what can i do here',
        'explain this page',
        'where am i',
        'how does this page work',
        'help with this page',
        'guide me',
        'what is this section',
        'मार्गदर्शन',
      ])
    ) {
      return {
        type: 'action',
        action: 'explain_page',
        spokenResponse: `Here is what you can do on the ${context.pageTitle} page.`,
        displayText: `💡 Guide for ${context.pageTitle}`,
      };
    }

    // ── 3. Page In-Content Search ─────────────────────────────────────────────
    if (text.startsWith('find ') || text.startsWith('search for ') || text.startsWith('locate ')) {
      const query = text.replace(/^(find|search for|locate)\s+/i, '').trim();
      if (query) {
        return {
          type: 'action',
          action: 'search_page',
          parameters: { query },
          spokenResponse: `Searching for ${query} on this page.`,
          displayText: `🔍 Searching page for "${query}"`,
        };
      }
    }

    // ── 4. Smart Element Clicking ─────────────────────────────────────────────
    if (text.startsWith('click ') || text.startsWith('tap ') || text.startsWith('press ') || text.startsWith('select ')) {
      const target = text.replace(/^(click|tap|press|select)\s+/i, '').trim();
      if (target) {
        return {
          type: 'action',
          action: 'click_element',
          parameters: { targetId: target },
          spokenResponse: `Clicking ${target}.`,
          displayText: `Tapping "${target}"`,
        };
      }
    }

    // ── 5. Navigation Commands ────────────────────────────────────────────────
    if (this.matchesAny(text, ['home', 'landing page', 'go home', 'take me home', 'main page', 'घर'])) {
      return {
        type: 'action',
        action: 'navigate_home',
        spokenResponse: 'Heading to the home page.',
        displayText: 'Navigating to Home',
      };
    }

    if (this.matchesAny(text, ['dashboard', 'open dashboard', 'my dashboard', 'overview', 'student dashboard', 'डैशबोर्ड'])) {
      return {
        type: 'action',
        action: 'open_dashboard',
        spokenResponse: `Opening your dashboard${userName ? ', ' + userName : ''}.`,
        displayText: 'Navigating to Dashboard',
      };
    }

    if (this.matchesAny(text, ['learn', 'learning', 'practice', 'study', 'study hub', 'learning center', 'शिकणे'])) {
      return {
        type: 'action',
        action: 'open_learn',
        spokenResponse: 'Opening the learning hub.',
        displayText: 'Navigating to Learn Hub',
      };
    }

    if (this.matchesAny(text, ['opportunities', 'jobs', 'careers', 'internships', 'job board', 'नोकरी'])) {
      return {
        type: 'action',
        action: 'open_opportunities',
        spokenResponse: 'Opening career opportunities and dyslexia-friendly jobs.',
        displayText: 'Navigating to Opportunities & Jobs',
      };
    }

    if (this.matchesAny(text, ['community', 'peer', 'forum', 'discussion', 'community page', 'समुदाय'])) {
      return {
        type: 'action',
        action: 'open_community',
        spokenResponse: 'Opening the peer community.',
        displayText: 'Navigating to Community',
      };
    }

    if (this.matchesAny(text, ['course', 'courses', 'classes', 'catalog', 'video lessons', 'tutorials', 'कोर्स'])) {
      return {
        type: 'action',
        action: 'open_courses',
        spokenResponse: 'Here is the courses catalog.',
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

    if (this.matchesAny(text, ['about', 'about us', 'mission', 'about neurobridge', 'माहिती'])) {
      return {
        type: 'action',
        action: 'open_about',
        spokenResponse: 'Opening the About page.',
        displayText: 'Navigating to About NeuroBridge',
      };
    }

    if (this.matchesAny(text, ['login', 'sign in', 'register', 'signup', 'create account', 'लॉगिन'])) {
      return {
        type: 'action',
        action: 'open_login',
        spokenResponse: 'Opening the login page.',
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
        spokenResponse: 'Opening accessibility settings.',
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

    // ── 6. Browser History & Scrolling ────────────────────────────────────────
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

    if (this.matchesAny(text, ['scroll to top', 'top of page', 'go to top', 'scroll top', 'start of page'])) {
      return {
        type: 'action',
        action: 'scroll_to_top',
        spokenResponse: 'At the top.',
        displayText: 'Scrolled to top',
      };
    }

    if (this.matchesAny(text, ['scroll to bottom', 'bottom of page', 'go to bottom', 'go to footer', 'end of page'])) {
      return {
        type: 'action',
        action: 'scroll_to_bottom',
        spokenResponse: 'At the bottom.',
        displayText: 'Scrolled to bottom',
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

    // ── 7. Accessibility Toggles ──────────────────────────────────────────────
    if (this.matchesAny(text, ['dyslexia font', 'dyslexia mode', 'toggle font', 'opendyslexic', 'accessible font'])) {
      return {
        type: 'action',
        action: 'toggle_dyslexia_mode',
        spokenResponse: 'Toggling OpenDyslexic font mode.',
        displayText: 'Toggled Dyslexia Font Mode',
      };
    }

    if (this.matchesAny(text, ['high contrast', 'contrast mode', 'dark contrast', 'dark mode', 'कंट्रास्ट'])) {
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
        spokenResponse: 'Made text bigger.',
        displayText: 'Increased font size',
      };
    }

    if (this.matchesAny(text, ['smaller text', 'decrease text', 'smaller font', 'make text smaller'])) {
      return {
        type: 'action',
        action: 'decrease_text_size',
        spokenResponse: 'Made text smaller.',
        displayText: 'Decreased font size',
      };
    }

    // ── 8. Sensitive Actions ──────────────────────────────────────────────────
    if (this.matchesAny(text, ['logout', 'sign out', 'log me out', 'exit account'])) {
      return {
        type: 'confirmation_required',
        action: 'user_logout',
        confirmationPrompt: 'Are you sure you want to log out of NeuroBridge?',
        spokenResponse: 'Are you sure you want to log out?',
        displayText: 'Are you sure you want to log out?',
      };
    }

    // ── 9. Siri Conversational Chit-Chat & Personality ────────────────────────
    if (this.matchesAny(text, ['hello', 'hi', 'hey', 'hey jarvis', 'good morning', 'good afternoon', 'good evening', 'नमस्ते', 'नमस्कार'])) {
      const greetings = [
        `Hey${userName ? ' ' + userName : ''}! How can I help you today?`,
        `Hello${userName ? ' ' + userName : ''}! Ready to read, learn, or navigate?`,
        `Hey there! Say 'read page' or tell me where you'd like to go.`,
      ];
      const reply = greetings[Math.floor(Math.random() * greetings.length)];
      return {
        type: 'conversation',
        spokenResponse: reply,
        displayText: `${reply}\n\n• Say *"Read this page"* to listen with word highlighting\n• Say *"Summarize"* for a quick overview\n• Say *"Go to Courses"* or *"Opportunities"*`,
      };
    }

    if (this.matchesAny(text, ['how are you', 'how are you doing', 'how is it going', 'how do you feel', 'कसे आहात'])) {
      return {
        type: 'conversation',
        spokenResponse: "I'm doing great, thank you! Ready to read or help you explore.",
        displayText: "I'm doing great! I can read pages out loud, summarize text, or help you find anything on NeuroBridge. What's on your mind?",
      };
    }

    if (this.matchesAny(text, ['who are you', 'what is your name', 'what are you', 'tell me about yourself', 'तू कोण आहेस'])) {
      return {
        type: 'conversation',
        spokenResponse: "I'm Jarvis, your Siri-like assistant for NeuroBridge. I can read pages out loud, summarize text, and guide you around.",
        displayText: "I'm **JARVIS**, your voice assistant designed for neurodiverse learners. Think of me like Siri for NeuroBridge — I can read whole pages out loud with word highlighting, summarize articles, navigate effortlessly, and adjust reading comfort.",
      };
    }

    if (this.matchesAny(text, ['are you an ai', 'are you a robot', 'are you human', 'are you siri'])) {
      return {
        type: 'conversation',
        spokenResponse: "I'm Jarvis, your personal website assistant. Think of me like Siri for your browser.",
        displayText: "I'm Jarvis! Like Siri, I'm here to take voice commands, read content aloud, and do the heavy lifting so you can focus on learning without stress.",
      };
    }

    if (this.matchesAny(text, ['tell me a joke', 'make me laugh', 'joke', 'विनोद'])) {
      const jokes = [
        {
          spoken: "Why did the computer go to school? To improve its memory!",
          display: "😄 Why did the computer go to school?\n\nTo improve its memory!",
        },
        {
          spoken: "Why was the math book sad? Because it had too many problems.",
          display: "😄 Why was the math book sad?\n\nBecause it had too many problems!",
        },
        {
          spoken: "What do you call a dinosaur that knows a lot of words? A thesaurus!",
          display: "😄 What do you call a dinosaur that knows a lot of words?\n\nA thesaurus!",
        },
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        type: 'conversation',
        spokenResponse: joke.spoken,
        displayText: joke.display,
      };
    }

    if (this.matchesAny(text, ['what time is it', 'what is the time', 'current time', 'time now', 'वेळ'])) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        type: 'conversation',
        spokenResponse: `It is currently ${timeStr}.`,
        displayText: `⏰ It is ${timeStr}.`,
      };
    }

    if (this.matchesAny(text, ['thank you', 'thanks', 'thanks jarvis', 'thank u', 'धन्यवाद', 'आभार'])) {
      const replies = ['Anytime!', 'You are very welcome!', 'Happy to help!', 'Always here for you!'];
      const picked = replies[Math.floor(Math.random() * replies.length)];
      return {
        type: 'conversation',
        spokenResponse: picked,
        displayText: `${picked} Let me know if you'd like me to read or navigate anywhere.`,
      };
    }

    if (this.matchesAny(text, ['what is neurobridge', 'tell me about neurobridge', 'what is this site', 'what is this website'])) {
      return {
        type: 'conversation',
        spokenResponse: 'NeuroBridge is an inclusive platform designed for dyslexia and neurodivergent learners.',
        displayText: "NeuroBridge empowers learners with dyslexia through:\n• 🎧 Real-time word-by-word reading assistance\n• 🔤 OpenDyslexic accessible fonts & color contrasts\n• 🎮 Cognitive mini-games & gamified reading\n• 💼 Dyslexia-inclusive career opportunities and resume builder",
      };
    }

    if (this.matchesAny(text, ['what can you do', 'what are your powers', 'help', 'features', 'commands'])) {
      return {
        type: 'conversation',
        spokenResponse: "I can read whole pages aloud with word highlighting, summarize text, navigate anywhere, click buttons, or adjust fonts. Just ask!",
        displayText: "Here is what I can do for you:\n\n• **Read aloud**: 'Read this page', 'Pause', 'Resume', 'Stop'\n• **Summarize**: 'Summarize this page' or 'What is on this page?'\n• **Navigate**: 'Go to Dashboard', 'Open Courses', 'Show Jobs'\n• **Interact**: 'Click Enroll', 'Find Python', 'Scroll down'\n• **Dyslexia Tools**: 'Toggle Dyslexia font', 'High contrast', 'Make text bigger'",
      };
    }

    // ── 10. Intelligent Contextual Fallback (Siri-like) ────────────────────────
    return {
      type: 'conversation',
      spokenResponse: `I'm on the ${context.pageTitle} page with you. You can ask me to read this page aloud, summarize it, or jump to courses and jobs.`,
      displayText: `I'm right here on the **${context.pageTitle}** page.\n\nTry asking:\n• *"Read this page out loud"*\n• *"Summarize this page"*\n• *"What can I do here?"*\n• *"Go to Dashboard"*`,
    };
  }

  private matchesAny(input: string, patterns: string[]): boolean {
    return patterns.some((p) => input.includes(p));
  }
}
