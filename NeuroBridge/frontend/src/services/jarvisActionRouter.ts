/**
 * Jarvis Action Router
 * Cleanly separates actionable website commands from general AI conversation.
 * Resolves natural language variations into typed, validated StructuredIntents
 * with zero AI hallucination.
 */

import type { StructuredIntent, JarvisContext } from '../types/jarvisAgent';

export class JarvisActionRouter {
  /**
   * Evaluates user input against registered action patterns.
   * Returns a StructuredIntent if an action is matched, or null if it's general conversation.
   */
  public static route(input: string, context?: JarvisContext): StructuredIntent | null {
    const raw = input.trim();
    if (!raw) return null;

    // Normalize input: lowercase, strip extra whitespace and common filler punctuation
    // Normalize text: preserve decimal numbers like 1.5, replace punctuation with spaces
    const text = raw
      .toLowerCase()
      .replace(/[,/#!$%\^&*;:{}=\-_`~()]/g, ' ')
      .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // ── 1. SCROLLING COMMANDS ────────────────────────────────────────────────
    // Check top and bottom first
    if (
      this.matchesAny(text, [
        'scroll to the top',
        'scroll to top',
        'take me to the top',
        'take me to top',
        'go to the top',
        'go to top',
        'scroll top',
        'back to the top',
        'back to top',
        'to the top',
        'to top',
        'beginning of the page',
        'start of the page',
        'start of page',
        'take me to the beginning',
        'सुरुवातीला जा',
        'शीर्ष पर जाओ',
      ]) ||
      text === 'top'
    ) {
      return {
        type: 'action',
        action: 'scroll_to_top',
        parameters: { direction: 'top' },
        displayText: 'Scrolling to top of page...',
        spokenResponse: 'Going to the top.',
      };
    }

    if (
      this.matchesAny(text, [
        'scroll to the bottom',
        'scroll to bottom',
        'take me to the bottom',
        'take me to bottom',
        'go to the bottom',
        'go to bottom',
        'scroll bottom',
        'to the bottom',
        'to bottom',
        'end of the page',
        'end of page',
        'bottom of the page',
        'bottom of page',
        'go to footer',
        'to the footer',
        'तळाशी जा',
        'नीचे जाओ',
      ]) ||
      text === 'bottom'
    ) {
      return {
        type: 'action',
        action: 'scroll_to_bottom',
        parameters: { direction: 'bottom' },
        displayText: 'Scrolling to bottom of page...',
        spokenResponse: 'Going to the bottom.',
      };
    }

    // Scroll Down variations (little, lot, normal)
    if (
      this.matchesAny(text, [
        'scroll down a little',
        'scroll down a bit',
        'scroll down slightly',
        'scroll a little down',
        'scroll a bit down',
        'scroll a little',
        'scroll a bit',
        'move down a little',
        'move down a bit',
        'down a little',
        'down a bit',
        'थोडे खाली',
      ])
    ) {
      return {
        type: 'action',
        action: 'scroll_down',
        parameters: { direction: 'down', magnitude: 'little' },
        displayText: 'Scrolling down a bit...',
        spokenResponse: 'Scrolling down a little.',
      };
    }

    if (
      this.matchesAny(text, [
        'scroll down a lot',
        'scroll down way down',
        'scroll way down',
        'scroll down more',
        'go further down',
        'further down',
        'move down one screen',
        'scroll down one screen',
        'one screen down',
        'page down',
        'scroll lot',
        'खूप खाली',
      ])
    ) {
      return {
        type: 'action',
        action: 'scroll_down',
        parameters: { direction: 'down', magnitude: 'lot' },
        displayText: 'Scrolling down further...',
        spokenResponse: 'Scrolling down a lot.',
      };
    }

    if (
      this.matchesAny(text, [
        'scroll down',
        'move down',
        'go down',
        'scroll down please',
        'please scroll down',
        'scroll lower',
        'खाली स्क्रोल करा',
        'खाली जा',
        'नीचे स्क्रोल करो',
      ]) ||
      text === 'down'
    ) {
      return {
        type: 'action',
        action: 'scroll_down',
        parameters: { direction: 'down', magnitude: 'normal' },
        displayText: 'Scrolling down...',
        spokenResponse: 'Scrolling down.',
      };
    }

    // Scroll Up variations (little, lot, normal)
    if (
      this.matchesAny(text, [
        'scroll up a little',
        'scroll up a bit',
        'scroll up slightly',
        'scroll a little up',
        'scroll a bit up',
        'move up a little',
        'move up a bit',
        'up a little',
        'up a bit',
        'थोडे वर',
      ])
    ) {
      return {
        type: 'action',
        action: 'scroll_up',
        parameters: { direction: 'up', magnitude: 'little' },
        displayText: 'Scrolling up a bit...',
        spokenResponse: 'Scrolling up a little.',
      };
    }

    if (
      this.matchesAny(text, [
        'scroll up a lot',
        'scroll way up',
        'scroll up more',
        'go further up',
        'further up',
        'move up one screen',
        'scroll up one screen',
        'one screen up',
        'page up',
        'खूप वर',
      ])
    ) {
      return {
        type: 'action',
        action: 'scroll_up',
        parameters: { direction: 'up', magnitude: 'lot' },
        displayText: 'Scrolling up further...',
        spokenResponse: 'Scrolling up a lot.',
      };
    }

    if (
      this.matchesAny(text, [
        'scroll up',
        'move up',
        'go up',
        'scroll up please',
        'please scroll up',
        'scroll higher',
        'वर स्क्रोल करा',
        'वर जा',
        'ऊपर स्क्रोल करो',
      ]) ||
      text === 'up'
    ) {
      return {
        type: 'action',
        action: 'scroll_up',
        parameters: { direction: 'up', magnitude: 'normal' },
        displayText: 'Scrolling up...',
        spokenResponse: 'Scrolling up.',
      };
    }

    // Next / Previous Section
    if (this.matchesAny(text, ['scroll to the next section', 'scroll to next section', 'next section', 'पुढील विभाग'])) {
      return {
        type: 'action',
        action: 'scroll_next_section',
        displayText: 'Scrolling to next section...',
        spokenResponse: 'Moving to the next section.',
      };
    }

    if (this.matchesAny(text, ['scroll to previous section', 'go back to the previous section', 'previous section', 'मागील विभाग'])) {
      return {
        type: 'action',
        action: 'scroll_prev_section',
        displayText: 'Scrolling to previous section...',
        spokenResponse: 'Moving to the previous section.',
      };
    }

    // ── 2. PAGE READING & SPOTLIGHT COMMANDS ─────────────────────────────────
    if (
      this.matchesAny(text, [
        'restart reading',
        'read from beginning',
        'read from the beginning',
        'start reading again',
        'start from the top',
        'read again from top',
        'पुन्हा सुरू करा',
      ])
    ) {
      return {
        type: 'action',
        action: 'restart_reading',
        displayText: '🔄 Restarting reading from beginning...',
        spokenResponse: 'Restarting from the beginning.',
      };
    }

    if (
      this.matchesAny(text, [
        'read this page',
        'read the page for me',
        'read page for me',
        'read the page',
        'read page',
        'read aloud with spotlight',
        'read aloud',
        'read out loud',
        'read to me',
        'start reading',
        'start read',
        'read the visible content',
        'read visible content',
        'read from here',
        'listen to this page',
        'speak this page',
        'हे पान वाचा',
        'वाचा',
        'पृष्ठ पढ़ो',
        'पढ़ो',
      ])
    ) {
      return {
        type: 'action',
        action: 'read_page',
        displayText: '📖 Starting page reading with spotlight...',
        spokenResponse: 'Starting page reading.',
      };
    }

    if (
      this.matchesAny(text, [
        'pause reading',
        'pause the reading',
        'pause audio',
        'pause speech',
        'hold on',
        'थांबा',
        'विराम',
        'रुकिए',
      ]) ||
      text === 'pause'
    ) {
      return {
        type: 'action',
        action: 'pause_reading',
        displayText: '⏸ Reading paused',
        spokenResponse: 'Reading paused.',
      };
    }

    if (
      this.matchesAny(text, [
        'resume reading',
        'resume the reading',
        'continue reading',
        'continue speaking',
        'keep reading',
        'unpause',
        'चालू ठेवा',
        'पुन्हा सुरू करा',
        'जारी रखो',
      ]) ||
      text === 'resume' ||
      text === 'continue'
    ) {
      return {
        type: 'action',
        action: 'resume_reading',
        displayText: '▶ Resuming reading',
        spokenResponse: 'Resuming reading.',
      };
    }

    if (
      this.matchesAny(text, [
        'stop reading',
        'stop speaking',
        'stop talking',
        'stop audio',
        'stop reader',
        'be quiet',
        'shut up',
        'silence',
        'quiet',
        'cancel reading',
        'थांबव',
        'बंद करा',
        'शांत रहा',
        'चुप',
      ]) ||
      text === 'stop'
    ) {
      return {
        type: 'action',
        action: 'stop_reading',
        displayText: '⏹ Stopped page reading',
        spokenResponse: 'Stopped reading.',
      };
    }

    if (
      this.matchesAny(text, [
        'restart reading',
        'read from beginning',
        'read from the beginning',
        'start reading again',
        'start from the top',
        'read again from top',
        'पुन्हा सुरू करा',
      ])
    ) {
      return {
        type: 'action',
        action: 'restart_reading',
        displayText: '🔄 Restarting reading from beginning...',
        spokenResponse: 'Restarting from the beginning.',
      };
    }

    if (
      this.matchesAny(text, [
        'next word',
        'advance word',
        'go to next word',
        'forward a word',
        'skip word',
        'पुढचा शब्द',
      ])
    ) {
      return {
        type: 'action',
        action: 'next_word',
        displayText: 'Next word...',
        spokenResponse: 'Next word.',
      };
    }

    if (
      this.matchesAny(text, [
        'previous word',
        'prev word',
        'go back a word',
        'back a word',
        'मागील शब्द',
      ])
    ) {
      return {
        type: 'action',
        action: 'prev_word',
        displayText: 'Previous word...',
        spokenResponse: 'Previous word.',
      };
    }

    if (
      this.matchesAny(text, [
        'read next paragraph',
        'read the next paragraph',
        'next paragraph',
        'skip this paragraph',
        'skip paragraph',
        'skip this',
        'next block',
        'पुढचा परिच्छेद',
      ])
    ) {
      return {
        type: 'action',
        action: 'read_next_paragraph',
        displayText: '⏭ Skipping to next paragraph...',
        spokenResponse: 'Skipping to next paragraph.',
      };
    }

    if (
      this.matchesAny(text, [
        'previous paragraph',
        'read previous paragraph',
        'go back a paragraph',
        'read previous',
        'मागील परिच्छेद',
      ])
    ) {
      return {
        type: 'action',
        action: 'read_prev_paragraph',
        displayText: '⏮ Going to previous paragraph...',
        spokenResponse: 'Reading previous paragraph.',
      };
    }

    if (
      this.matchesAny(text, [
        'read faster',
        'speak faster',
        'speed up reading',
        'speed up',
        'faster',
        'वेग वाढवा',
        'तेज पढ़ो',
      ])
    ) {
      return {
        type: 'action',
        action: 'speed_up_reading',
        displayText: '⏩ Increased reading speed',
        spokenResponse: 'Reading faster now.',
      };
    }

    if (
      this.matchesAny(text, [
        'read slower',
        'speak slower',
        'slow down reading',
        'slow down',
        'slower',
        'वेग कमी करा',
        'धीरे पढ़ो',
      ])
    ) {
      return {
        type: 'action',
        action: 'slow_down_reading',
        displayText: '⏪ Decreased reading speed',
        spokenResponse: 'Reading slower for comfort.',
      };
    }

    // ── 3. NATURAL NAVIGATION COMMANDS ───────────────────────────────────────
    // Dashboard & Sub-tabs
    if (
      this.matchesAny(text, [
        'open the dashboard',
        'open dashboard',
        'go to the dashboard',
        'go to dashboard',
        'take me to the dashboard',
        'take me to dashboard',
        'my dashboard',
        'डैशबोर्ड उघडा',
      ]) ||
      text === 'dashboard'
    ) {
      return {
        type: 'action',
        action: 'open_dashboard',
        parameters: { route: '/dashboard' },
        displayText: 'Navigating to Dashboard...',
        spokenResponse: 'Opening your student dashboard.',
      };
    }

    // Profile
    if (
      this.matchesAny(text, [
        'open my profile',
        'open profile',
        'go to my profile',
        'go to profile',
        'take me to my profile',
        'take me to profile',
        'show my profile',
        'my profile',
        'user profile',
        'माझे प्रोफाइल',
      ]) ||
      text === 'profile'
    ) {
      return {
        type: 'action',
        action: 'open_profile',
        parameters: { route: '/dashboard', tab: 'profile' },
        displayText: 'Opening Profile Settings...',
        spokenResponse: 'Opening your profile.',
      };
    }

    // Settings & Accessibility Preferences
    if (
      this.matchesAny(text, [
        'take me to settings',
        'open settings',
        'go to settings',
        'open preferences',
        'go to preferences',
        'user settings',
        'account settings',
        'सेटिंग्ज उघडा',
      ]) ||
      text === 'settings'
    ) {
      return {
        type: 'action',
        action: 'open_settings',
        parameters: { route: '/dashboard', tab: 'settings' },
        displayText: 'Opening Settings...',
        spokenResponse: 'Opening settings.',
      };
    }

    if (
      this.matchesAny(text, [
        'accessibility settings',
        'open accessibility',
        'accessibility options',
        'dyslexia settings',
        'font settings',
      ])
    ) {
      return {
        type: 'action',
        action: 'open_accessibility_settings',
        parameters: { route: '/dashboard', tab: 'accessibility' },
        displayText: 'Opening Accessibility Settings...',
        spokenResponse: 'Opening accessibility settings.',
      };
    }

    // Courses
    if (
      this.matchesAny(text, [
        'go to the courses section',
        'go to courses',
        'open courses section',
        'open courses',
        'open course catalog',
        'courses catalog',
        'show courses',
        'show my courses',
        'my courses',
        'take me to courses',
        'open my courses',
        'video lessons',
        'tutorials',
        'कोर्स उघडा',
      ]) ||
      text === 'courses'
    ) {
      return {
        type: 'action',
        action: 'open_courses',
        parameters: { route: '/dashboard/courses', tab: 'courses' },
        displayText: 'Navigating to Courses Catalog...',
        spokenResponse: 'Opening the courses catalog.',
      };
    }

    // AI Tools / Notebook
    if (
      this.matchesAny(text, [
        'open the ai tools page',
        'open ai tools',
        'ai tools',
        'open ai notebook',
        'open notebook',
        'ai notebook',
        'rag brain',
        'document search',
        'नोटबूक उघडा',
      ]) ||
      text === 'notebook'
    ) {
      return {
        type: 'action',
        action: 'open_ai_notebook',
        parameters: { route: '/dashboard', tab: 'notebook' },
        displayText: 'Opening AI Notebook...',
        spokenResponse: 'Opening AI Notebook.',
      };
    }

    // Learning Hub
    if (
      this.matchesAny(text, [
        'open learning hub',
        'open learn',
        'go to learn',
        'learning center',
        'practice reading',
        'study hub',
        'learning hub',
        'take me to learn',
        'take me to learning',
        'take me to the learning hub',
        'go to the learning hub',
        'open learning',
        'शिकणे',
      ]) ||
      text === 'learn'
    ) {
      return {
        type: 'action',
        action: 'open_learn',
        parameters: { route: '/learn' },
        displayText: 'Navigating to Learn Hub...',
        spokenResponse: 'Opening the learning hub.',
      };
    }

    // Opportunities & Jobs
    if (
      this.matchesAny(text, [
        'open opportunities',
        'go to opportunities',
        'show jobs',
        'open jobs',
        'job board',
        'careers',
        'find jobs',
        'internships',
        'नोकरी',
      ]) ||
      text === 'opportunities' ||
      text === 'jobs'
    ) {
      return {
        type: 'action',
        action: 'open_opportunities',
        parameters: { route: '/opportunities' },
        displayText: 'Navigating to Opportunities & Jobs...',
        spokenResponse: 'Opening career opportunities and jobs.',
      };
    }

    // Community
    if (
      this.matchesAny(text, [
        'open community',
        'go to community',
        'community hub',
        'community forum',
        'discussion forum',
        'peer discussions',
        'community discussions',
        'show community discussions',
        'open community discussions',
        'take me to community',
        'समुदाय',
      ]) ||
      text === 'community'
    ) {
      return {
        type: 'action',
        action: 'open_community',
        parameters: { route: '/community' },
        displayText: 'Navigating to Community...',
        spokenResponse: 'Opening peer community discussions.',
      };
    }

    // Cognitive Assessment
    if (
      this.matchesAny(text, [
        'take assessment',
        'go to assessment',
        'start assessment',
        'open assessment',
        'cognitive assessment',
        'dyslexia assessment',
        'open dyslexia assessment',
        'take dyslexia assessment',
        'start dyslexia assessment',
        'dyslexia test',
        'take the assessment',
        'चाचणी',
      ]) ||
      text === 'assessment'
    ) {
      return {
        type: 'action',
        action: 'open_assessment',
        parameters: { route: '/assessment' },
        displayText: 'Navigating to Cognitive Assessment...',
        spokenResponse: 'Opening the cognitive assessment.',
      };
    }

    // Nearby Care & Support
    if (
      this.matchesAny(text, [
        'nearby care',
        'open nearby care',
        'hospitals near me',
        'clinics near me',
        'find doctors',
        'support centers',
        'find nearby support',
        'nearby support',
        'find nearby',
        'support near me',
      ])
    ) {
      return {
        type: 'action',
        action: 'open_nearby',
        parameters: { route: '/dashboard', tab: 'nearby' },
        displayText: 'Opening Nearby Care...',
        spokenResponse: 'Opening nearby care and clinics.',
      };
    }

    // Game Zone / Progress / Arena
    if (
      this.matchesAny(text, [
        'game zone',
        'open games',
        'reading games',
        'progress tracking',
        'my progress',
        'arena',
      ])
    ) {
      return {
        type: 'action',
        action: 'open_progress',
        parameters: { route: '/dashboard', tab: 'progress' },
        displayText: 'Opening Progress & Games...',
        spokenResponse: 'Opening your progress and games.',
      };
    }

    // Creator Studio
    if (
      this.matchesAny(text, [
        'open creator studio',
        'creator studio',
        'create course',
        'course creator',
      ])
    ) {
      return {
        type: 'action',
        action: 'open_creator_studio',
        parameters: { route: '/creator/dashboard' },
        displayText: 'Opening Course Creator Studio...',
        spokenResponse: 'Opening the course creator studio.',
      };
    }

    // About Page
    if (
      this.matchesAny(text, [
        'about page',
        'open about',
        'go to about',
        'about neurobridge',
        'who built this',
        'our mission',
        'माहिती',
      ]) ||
      text === 'about'
    ) {
      return {
        type: 'action',
        action: 'open_about',
        parameters: { route: '/about' },
        displayText: 'Navigating to About NeuroBridge...',
        spokenResponse: 'Opening the About page.',
      };
    }

    // Chrome Extension
    if (
      this.matchesAny(text, [
        'chrome extension',
        'open chrome extension',
        'browser extension',
        'install extension',
      ])
    ) {
      return {
        type: 'action',
        action: 'open_chrome_extension',
        parameters: { route: '/chrome-extension' },
        displayText: 'Opening Chrome Extension Page...',
        spokenResponse: 'Opening the Chrome extension page.',
      };
    }

    // Login
    if (this.matchesAny(text, ['open login', 'go to login', 'sign in page', 'login page', 'लॉगिन'])) {
      return {
        type: 'action',
        action: 'open_login',
        parameters: { route: '/login' },
        displayText: 'Navigating to Login...',
        spokenResponse: 'Opening the login page.',
      };
    }

    // Home
    if (
      this.matchesAny(text, [
        'return to the home page',
        'return to home page',
        'return home',
        'go to home',
        'go home',
        'take me home',
        'take me to home',
        'take me to the home page',
        'open home',
        'home page',
        'landing page',
        'main page',
        'घर',
      ]) ||
      text === 'home'
    ) {
      return {
        type: 'action',
        action: 'navigate_home',
        parameters: { route: '/' },
        displayText: 'Navigating to Home...',
        spokenResponse: 'Returning to the home page.',
      };
    }

    // History: Go Back / Forward
    if (
      this.matchesAny(text, [
        'go back to the previous page',
        'go back to previous page',
        'go back',
        'previous page',
        'return back',
        'मागे जा',
      ]) ||
      text === 'back'
    ) {
      return {
        type: 'action',
        action: 'go_back',
        displayText: 'Navigating back...',
        spokenResponse: 'Going back to the previous page.',
      };
    }

    if (
      this.matchesAny(text, [
        'go forward to the next page',
        'go forward',
        'forward page',
        'next page in history',
        'पुढे जा',
      ]) ||
      text === 'forward'
    ) {
      return {
        type: 'action',
        action: 'go_forward',
        displayText: 'Navigating forward...',
        spokenResponse: 'Going forward.',
      };
    }

    // ── 4. ACCESSIBILITY & DYSLEXIA TOOLS ────────────────────────────────────

    // ── DARK MODE (must come before high contrast check) ─────────────────────
    if (
      this.matchesAny(text, [
        'enable dark mode',
        'turn on dark mode',
        'activate dark mode',
        'switch to dark mode',
        'switch to dark',
        'make it dark',
        'make the website dark',
        'make the site dark',
        'make everything dark',
        'go dark',
        'dark theme',
        'enable dark theme',
        'turn on dark theme',
        'use dark theme',
        'i want dark mode',
        'i want a dark interface',
        'i want it dark',
        'dark interface',
        'डार्क मोड चालू',
      ])
    ) {
      return {
        type: 'action',
        action: 'enable_dark_mode',
        displayText: 'Enabling dark mode...',
        spokenResponse: 'Enabling dark mode.',
      };
    }

    if (
      this.matchesAny(text, [
        'disable dark mode',
        'turn off dark mode',
        'deactivate dark mode',
        'switch to light mode',
        'switch to light',
        'make it light',
        'make the website light',
        'light theme',
        'enable light mode',
        'turn on light mode',
        'use light theme',
        'go light',
        'i want light mode',
        'डार्क मोड बंद',
      ])
    ) {
      return {
        type: 'action',
        action: 'disable_dark_mode',
        displayText: 'Switching to light mode...',
        spokenResponse: 'Switching to light mode.',
      };
    }

    if (
      this.matchesAny(text, [
        'toggle dark mode',
        'toggle theme',
        'change theme',
        'switch theme',
        'flip theme',
        'dark mode',
        'light mode',
        'थीम बदलणे',
      ]) ||
      text === 'dark' ||
      text === 'theme'
    ) {
      return {
        type: 'action',
        action: 'toggle_dark_mode',
        displayText: 'Toggling dark/light mode...',
        spokenResponse: 'Toggling theme.',
      };
    }

    if (this.matchesAny(text, ['what theme is active', 'is dark mode on', 'is dark mode enabled', 'current theme', 'check theme', 'theme status'])) {
      return {
        type: 'action',
        action: 'get_theme',
        displayText: 'Checking current theme...',
        spokenResponse: 'Checking theme.',
      };
    }

    // ── FUN MODE ──────────────────────────────────────────────────────────────
    if (
      this.matchesAny(text, [
        'enable fun mode',
        'turn on fun mode',
        'activate fun mode',
        'start fun mode',
        'switch to fun mode',
        'make the interface fun',
        'make it fun',
        'make the ui fun',
        'make it playful',
        'make the site playful',
        'playful mode',
        'fun reading mode',
        'fun font',
        'reading fun mode',
        'custom font mode',
        'फन मोड चालू',
      ]) ||
      text === 'fun mode'
    ) {
      return {
        type: 'action',
        action: 'enable_fun_mode',
        displayText: 'Enabling Fun mode...',
        spokenResponse: 'Enabling Fun mode.',
      };
    }

    if (
      !text.includes('restore') &&
      !text.includes('reset') &&
      this.matchesAny(text, [
        'disable fun mode',
        'turn off fun mode',
        'deactivate fun mode',
        'exit fun mode',
        'stop fun mode',
        'turn off fun',
        'disable fun',
        'normal mode',
        'standard reading',
        'standard font',
        'default font',
        'फन मोड बंद',
      ])
    ) {
      return {
        type: 'action',
        action: 'disable_fun_mode',
        displayText: 'Disabling Fun mode...',
        spokenResponse: 'Fun mode off. Standard reading style restored.',
      };
    }

    if (this.matchesAny(text, ['toggle fun mode', 'fun mode toggle'])) {
      return {
        type: 'action',
        action: 'toggle_fun_mode',
        displayText: 'Toggling Fun mode...',
        spokenResponse: 'Toggling Fun mode.',
      };
    }

    if (this.matchesAny(text, ['is fun mode on', 'is fun mode active', 'fun mode status', 'check fun mode'])) {
      return {
        type: 'action',
        action: 'get_fun_mode',
        displayText: 'Checking Fun mode status...',
        spokenResponse: 'Checking Fun mode.',
      };
    }

    // ── REDUCE MOTION ─────────────────────────────────────────────────────────
    if (this.matchesAny(text, ['reduce motion', 'enable reduce motion', 'turn on reduce motion', 'less animation', 'reduce animations', 'minimal animations'])) {
      return {
        type: 'action',
        action: 'enable_reduce_motion',
        displayText: 'Enabling reduce motion...',
        spokenResponse: 'Reducing animations.',
      };
    }

    if (this.matchesAny(text, ['disable reduce motion', 'turn off reduce motion', 'restore animations', 'more animation', 'enable animations'])) {
      return {
        type: 'action',
        action: 'disable_reduce_motion',
        displayText: 'Restoring animations...',
        spokenResponse: 'Animations restored.',
      };
    }

    // ── FONT FAMILY SELECTION & QUERIES ──────────────────────────────────────
    const fontNames = [
      { id: 'opendyslexic', patterns: ['opendyslexic', 'open dyslexic', 'dyslexic font'] },
      { id: 'lexend', patterns: ['lexend'] },
      { id: 'atkinson', patterns: ['atkinson', 'atkinson hyperlegible', 'hyperlegible'] },
      { id: 'comic-neue', patterns: ['comic neue', 'comic sans', 'comic'] },
      { id: 'andika', patterns: ['andika'] },
      { id: 'nunito', patterns: ['nunito'] },
      { id: 'verdana', patterns: ['verdana'] },
      { id: 'arial', patterns: ['arial'] },
    ];

    // Explicit font change requests like "change font to lexend"
    for (const f of fontNames) {
      const isTargeted = f.patterns.some((p) => {
        return (
          text.includes(`font to ${p}`) ||
          text.includes(`font ${p}`) ||
          text.includes(`switch to ${p}`) ||
          text.includes(`use ${p}`) ||
          text.includes(`set font to ${p}`) ||
          text === f.id ||
          text === p
        );
      });

      if (isTargeted) {
        return {
          type: 'action',
          action: 'set_font',
          parameters: { font: f.id },
          displayText: `Changing font to ${f.id}...`,
          spokenResponse: `Setting font to ${f.id}.`,
        };
      }
    }

    if (
      !text.includes('weight') &&
      !text.includes('size') &&
      this.matchesAny(text, [
        'tell me which font is currently selected',
        'tell me which font is selected',
        'what is my current font',
        'what font is currently selected',
        'what font is active',
        'which font am i using',
        'current font',
        'check font',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_font',
        displayText: 'Checking current font...',
        spokenResponse: 'Checking current font.',
      };
    }

    // ── LINE SPACING CONTROLS & QUERIES ───────────────────────────────────────
    // Check specific value like "set line spacing to 2", "set the line spacing to 1.5 times", etc.
    const lineSpacingMatch = text.match(/(?:line\s*spacing|line\s*height)(?:\s*(?:to|is|at))?\s*(\d+(?:\.\d+)?)/i);
    if (lineSpacingMatch && lineSpacingMatch[1]) {
      const val = parseFloat(lineSpacingMatch[1]);
      return {
        type: 'action',
        action: 'set_line_spacing',
        parameters: { value: val },
        displayText: `Setting line spacing to ${val}×...`,
        spokenResponse: `Setting line spacing to ${val}.`,
      };
    }

    if (
      this.matchesAny(text, [
        'set normal line spacing',
        'normal line spacing',
        'default line spacing',
        'reset line spacing',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_line_spacing',
        parameters: { preset: 'normal' },
        displayText: 'Setting normal line spacing...',
        spokenResponse: 'Setting normal line spacing.',
      };
    }

    if (
      this.matchesAny(text, [
        'increase line spacing',
        'give me more space between lines',
        'make the lines further apart',
        'i am having difficulty reading these lines spread them out',
        'spread them out',
        'difficulty reading these lines',
        'more space between lines',
        'spread the lines out',
        'spread out the lines',
        'spread lines',
        'make lines further apart',
        'expand line spacing',
        'bigger line spacing',
        'more line height',
        'ओळींमधील अंतर वाढवा',
      ])
    ) {
      return {
        type: 'action',
        action: 'increase_line_spacing',
        displayText: 'Increasing line spacing...',
        spokenResponse: 'Increasing line spacing.',
      };
    }

    if (
      this.matchesAny(text, [
        'decrease line spacing',
        'make the lines closer',
        'make the lines closer together',
        'less space between lines',
        'closer lines',
        'tighter lines',
        'reduce line spacing',
        'smaller line spacing',
        'ओळींमधील अंतर कमी करा',
      ])
    ) {
      return {
        type: 'action',
        action: 'decrease_line_spacing',
        displayText: 'Decreasing line spacing...',
        spokenResponse: 'Decreasing line spacing.',
      };
    }

    if (
      this.matchesAny(text, [
        'what is my current line spacing',
        'what is the current line spacing',
        'what is my line spacing',
        'tell me my current line spacing',
        'tell me line spacing',
        'check line spacing',
        'current line spacing',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_line_spacing',
        displayText: 'Checking line spacing...',
        spokenResponse: 'Checking line spacing.',
      };
    }

    // ── FONT WEIGHT CONTROLS & QUERIES ────────────────────────────────────────
    const weightNumMatch = text.match(/(?:font weight to|weight to|font weight)\s*(\d{3})/i);
    if (weightNumMatch && weightNumMatch[1]) {
      const val = parseInt(weightNumMatch[1], 10);
      return {
        type: 'action',
        action: 'set_font_weight',
        parameters: { weight: val },
        displayText: `Setting font weight to ${val}...`,
        spokenResponse: `Setting font weight to ${val}.`,
      };
    }

    if (
      this.matchesAny(text, [
        'make the font bold',
        'make the text bold',
        'make font bold',
        'set font to bold',
        'bold font',
        'bold text',
        'set font weight to bold',
        'बोल्ड फॉन्ट',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_font_weight',
        parameters: { weight: 'bold' },
        displayText: 'Setting font weight to Bold...',
        spokenResponse: 'Making font bold.',
      };
    }

    if (
      this.matchesAny(text, [
        'make the text lighter',
        'make the font lighter',
        'lighter text',
        'lighter font',
        'thin font',
        'set font weight to light',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_font_weight',
        parameters: { weight: 'light' },
        displayText: 'Setting font weight to Light...',
        spokenResponse: 'Making font lighter.',
      };
    }

    if (
      this.matchesAny(text, [
        'set font weight to regular',
        'regular font',
        'normal font weight',
        'set font weight to normal',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_font_weight',
        parameters: { weight: 'regular' },
        displayText: 'Setting font weight to Regular...',
        spokenResponse: 'Setting regular font weight.',
      };
    }

    if (
      this.matchesAny(text, [
        'set font weight to medium',
        'medium font',
        'medium text',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_font_weight',
        parameters: { weight: 'medium' },
        displayText: 'Setting font weight to Medium...',
        spokenResponse: 'Setting medium font weight.',
      };
    }

    if (
      this.matchesAny(text, [
        'what is the current font weight',
        'what is my font weight',
        'current font weight',
        'tell me current font weight',
        'check font weight',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_font_weight',
        displayText: 'Checking font weight...',
        spokenResponse: 'Checking font weight.',
      };
    }

    // ── LETTER SPACING CONTROLS & QUERIES ─────────────────────────────────────
    const letterSpacingMatch = text.match(/(?:letter spacing to|letter spacing)\s*(\d+)(?:\s*(?:percent|%))?/i);
    if (letterSpacingMatch && letterSpacingMatch[1]) {
      const val = parseFloat(letterSpacingMatch[1]);
      return {
        type: 'action',
        action: 'set_letter_spacing',
        parameters: { value: val },
        displayText: `Setting letter spacing to ${val}%...`,
        spokenResponse: `Setting letter spacing to ${val} percent.`,
      };
    }

    if (
      this.matchesAny(text, [
        'increase letter spacing',
        'more space between letters',
        'spread letters out',
        'spread the letters',
        'wider letters',
        'expand letter spacing',
        'अक्षरांमधील अंतर वाढवा',
      ])
    ) {
      return {
        type: 'action',
        action: 'increase_letter_spacing',
        displayText: 'Increasing letter spacing...',
        spokenResponse: 'Increasing letter spacing.',
      };
    }

    if (
      this.matchesAny(text, [
        'decrease letter spacing',
        'less space between letters',
        'closer letters',
        'tighten letters',
        'reduce letter spacing',
        'अक्षरांमधील अंतर कमी करा',
      ])
    ) {
      return {
        type: 'action',
        action: 'decrease_letter_spacing',
        displayText: 'Decreasing letter spacing...',
        spokenResponse: 'Decreasing letter spacing.',
      };
    }

    if (
      this.matchesAny(text, [
        'remove letter spacing',
        'set normal letter spacing',
        'normal letter spacing',
        'reset letter spacing',
        'no letter spacing',
      ])
    ) {
      return {
        type: 'action',
        action: 'set_letter_spacing',
        parameters: { preset: 'normal' },
        displayText: 'Resetting letter spacing to Normal...',
        spokenResponse: 'Resetting letter spacing to normal.',
      };
    }

    if (
      this.matchesAny(text, [
        'what is the current letter spacing',
        'what is my letter spacing',
        'tell me current letter spacing',
        'check letter spacing',
        'current letter spacing',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_letter_spacing',
        displayText: 'Checking letter spacing...',
        spokenResponse: 'Checking letter spacing.',
      };
    }

    // ── TEXT SIZE EXPLICIT VALUES & QUERIES ───────────────────────────────────
    const textSizeMatch = text.match(/(?:text size to|font size to|set text size to|size to)\s*(\d+)(?:\s*(?:percent|%))?/i);
    if (textSizeMatch && textSizeMatch[1]) {
      const val = parseInt(textSizeMatch[1], 10);
      return {
        type: 'action',
        action: 'set_text_size',
        parameters: { value: val },
        displayText: `Setting text size to ${val}%...`,
        spokenResponse: `Setting text size to ${val} percent.`,
      };
    }

    if (
      this.matchesAny(text, [
        'reset text size',
        'normal text size',
        'default text size',
        '100 percent text size',
      ])
    ) {
      return {
        type: 'action',
        action: 'reset_text_size',
        displayText: 'Resetting text size to 100%...',
        spokenResponse: 'Resetting text size to 100 percent.',
      };
    }

    if (
      this.matchesAny(text, [
        'what is my current text size',
        'what is the current text size',
        'what is my text size',
        'tell me my current text size',
        'check text size',
        'current text size',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_text_size',
        displayText: 'Checking current text size...',
        spokenResponse: 'Checking text size.',
      };
    }

    // ── RESET ALL READING SETTINGS & OVERVIEW ─────────────────────────────────
    if (
      this.matchesAny(text, [
        'reset reading settings',
        'reset all reading settings',
        'reset everything to default',
        'restore default font and spacing',
        'restore default settings',
        'restore reading defaults',
        'reset visual preferences',
        'सर्व सेटिंग्ज रीसेट करा',
      ])
    ) {
      return {
        type: 'action',
        action: 'reset_reading_settings',
        displayText: 'Resetting all reading settings to default...',
        spokenResponse: 'Resetting reading settings to default.',
      };
    }

    if (
      this.matchesAny(text, [
        'tell me my current reading settings',
        'tell me my reading settings',
        'what are my current reading settings',
        'what are my reading settings',
        'show reading settings',
        'current reading settings',
        'check reading settings',
      ])
    ) {
      return {
        type: 'action',
        action: 'get_reading_settings',
        displayText: 'Checking current reading settings...',
        spokenResponse: 'Checking your reading settings.',
      };
    }

    // ── DYSLEXIA FONT ─────────────────────────────────────────────────────────
    if (
      this.matchesAny(text, [
        'toggle dyslexia font',
        'opendyslexic font',
        'change font',
        'dyslexia font',
        'dyslexia mode',
        'accessible font',
        'फॉन्ट बदल',
      ])
    ) {
      return {
        type: 'action',
        action: 'toggle_dyslexia_font',
        displayText: 'Toggling OpenDyslexic accessible font...',
        spokenResponse: 'Toggling dyslexia readable font.',
      };
    }

    // ── HIGH CONTRAST ─────────────────────────────────────────────────────────
    if (this.matchesAny(text, ['enable high contrast', 'turn on high contrast', 'high contrast on', 'activate high contrast'])) {
      return {
        type: 'action',
        action: 'enable_high_contrast',
        displayText: 'Enabling high contrast...',
        spokenResponse: 'High contrast enabled.',
      };
    }

    if (this.matchesAny(text, ['disable high contrast', 'turn off high contrast', 'high contrast off', 'deactivate high contrast'])) {
      return {
        type: 'action',
        action: 'disable_high_contrast',
        displayText: 'Disabling high contrast...',
        spokenResponse: 'High contrast disabled.',
      };
    }

    if (
      this.matchesAny(text, [
        'high contrast',
        'toggle high contrast',
        'contrast mode',
        'dark contrast',
        'कंट्रास्ट',
      ])
    ) {
      return {
        type: 'action',
        action: 'toggle_high_contrast',
        displayText: 'Toggling high contrast mode...',
        spokenResponse: 'Toggling contrast mode.',
      };
    }

    if (
      this.matchesAny(text, [
        'bigger text',
        'larger text',
        'increase text size',
        'increase font size',
        'make text bigger',
        'make font bigger',
        'zoom in text',
        'मोठा फॉन्ट',
      ])
    ) {
      return {
        type: 'action',
        action: 'increase_text_size',
        displayText: 'Increasing text size...',
        spokenResponse: 'Making text larger.',
      };
    }

    if (
      this.matchesAny(text, [
        'smaller text',
        'decrease text size',
        'decrease font size',
        'make text smaller',
        'make font smaller',
        'zoom out text',
        'लहान फॉन्ट',
      ])
    ) {
      return {
        type: 'action',
        action: 'decrease_text_size',
        displayText: 'Decreasing text size...',
        spokenResponse: 'Making text smaller.',
      };
    }

    // ── 5. SENSITIVE ACTIONS (User Logout) ────────────────────────────────────
    if (this.matchesAny(text, ['logout', 'sign out', 'log me out', 'exit account', 'बाहेर पडा'])) {
      return {
        type: 'confirmation_required',
        action: 'user_logout',
        confirmationPrompt: 'Are you sure you want to log out of NeuroBridge?',
        spokenResponse: 'Are you sure you want to log out?',
        displayText: 'Are you sure you want to log out?',
      };
    }

    // ── 6. ASSISTANT WINDOW CONTROLS ─────────────────────────────────────────
    if (this.matchesAny(text, ['close assistant', 'minimize assistant', 'hide assistant', 'bye jarvis', 'dismiss jarvis'])) {
      return {
        type: 'action',
        action: 'close_assistant',
        displayText: 'Closing Jarvis...',
        spokenResponse: 'Minimizing. Say "Hey Jarvis" anytime.',
      };
    }

    // Not an immediate action command -> send to LLM
    return null;
  }

  private static matchesAny(input: string, patterns: string[]): boolean {
    return patterns.some((p) => {
      // Exact match or includes as distinct word / phrase
      if (input === p) return true;
      if (input.startsWith(p + ' ') || input.endsWith(' ' + p) || input.includes(' ' + p + ' ')) return true;
      return input.includes(p);
    });
  }
}
