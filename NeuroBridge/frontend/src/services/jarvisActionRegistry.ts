// Action Registry for Jarvis Web Agent
// Stores all registered capabilities, route definitions, and page action mappings

import type { JarvisActionDefinition } from '../types/jarvisAgent';

export const GLOBAL_ACTIONS: Record<string, JarvisActionDefinition> = {
  // ── Navigation Actions ──────────────────────────────────────────────────────
  navigate_home: {
    id: 'navigate_home',
    name: 'Home Page',
    description: 'Navigate to the NeuroBridge home/landing page',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['home', 'landing page', 'main page', 'start page', 'घर', 'मुख्य पृष्ठ'],
  },
  open_dashboard: {
    id: 'open_dashboard',
    name: 'Student Dashboard',
    description: 'Open the user dashboard overview and metrics',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['dashboard', 'my dashboard', 'overview', 'student dashboard', 'डैशबोर्ड'],
  },
  open_learn: {
    id: 'open_learn',
    name: 'Learning Hub',
    description: 'Navigate to the interactive dyslexia reading and practice learning hub',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['learn', 'learning', 'practice', 'study', 'study center', 'अभ्यास', 'शिकणे'],
  },
  open_opportunities: {
    id: 'open_opportunities',
    name: 'Opportunities & Jobs',
    description: 'Navigate to the career opportunities, dyslexia-friendly jobs, and internships page',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['opportunities', 'jobs', 'careers', 'internships', 'job board', 'नोकरी', 'रोजगार'],
  },
  open_community: {
    id: 'open_community',
    name: 'Community Page',
    description: 'Navigate to the NeuroBridge peer community and discussions',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['community', 'forum', 'discussions', 'peers', 'कक्षा', 'समुदाय'],
  },
  open_courses: {
    id: 'open_courses',
    name: 'Courses Catalog',
    description: 'Navigate to the courses and video tutorials catalog',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['courses', 'classes', 'tutorials', 'video lessons', 'कोर्स', 'धडे'],
  },
  open_assessment: {
    id: 'open_assessment',
    name: 'Dyslexia Cognitive Assessment',
    description: 'Navigate to the dyslexia cognitive assessment questionnaire and tests',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['assessment', 'test', 'dyslexia test', 'cognitive test', 'take test', 'चाचणी'],
  },
  open_about: {
    id: 'open_about',
    name: 'About Page',
    description: 'Navigate to the About NeuroBridge mission and team page',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['about', 'about us', 'mission', 'माहिती'],
  },
  open_login: {
    id: 'open_login',
    name: 'Login / Register Page',
    description: 'Navigate to the login or registration page',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['login', 'sign in', 'register', 'create account', 'लॉगिन'],
  },
  open_profile: {
    id: 'open_profile',
    name: 'User Profile',
    description: 'Open the user profile and account details',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['profile', 'my profile', 'account', 'user settings', 'माझे प्रोफाइल'],
  },
  open_accessibility_settings: {
    id: 'open_accessibility_settings',
    name: 'Accessibility Settings',
    description: 'Open accessibility tools, font size, contrast, and spacing controls',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['settings', 'accessibility', 'accessibility settings', 'preferences', 'फॉन्ट सेटिंग'],
  },
  open_ai_notebook: {
    id: 'open_ai_notebook',
    name: 'AI Notebook & RAG Brain',
    description: 'Open the NotebookLM-style AI document summarizer and cognitive search',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['notebook', 'ai notebook', 'rag brain', 'brain', 'document search', 'नोटबूक'],
  },
  open_creator_studio: {
    id: 'open_creator_studio',
    name: 'Course Creator Studio',
    description: 'Navigate to the educator course creation studio',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['creator studio', 'create course', 'course creator', 'शिक्षक'],
  },

  // ── History & Navigation Control ──────────────────────────────────────────
  go_back: {
    id: 'go_back',
    name: 'Go Back',
    description: 'Navigate back to the previous page in history',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['back', 'go back', 'previous page', 'return', 'मागे जा'],
  },
  go_forward: {
    id: 'go_forward',
    name: 'Go Forward',
    description: 'Navigate forward to the next page in history',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['forward', 'go forward', 'next page', 'पुढे जा'],
  },

  // ── Page Scrolling Actions ────────────────────────────────────────────────
  scroll_down: {
    id: 'scroll_down',
    name: 'Scroll Down',
    description: 'Scroll smoothly down the current page',
    category: 'scrolling',
    safetyLevel: 'safe',
    synonyms: ['scroll down', 'down', 'page down', 'खाली जा', 'खाली स्क्रोल'],
  },
  scroll_up: {
    id: 'scroll_up',
    name: 'Scroll Up',
    description: 'Scroll smoothly up the current page',
    category: 'scrolling',
    safetyLevel: 'safe',
    synonyms: ['scroll up', 'up', 'page up', 'वर जा', 'वर स्क्रोल'],
  },
  scroll_to_top: {
    id: 'scroll_to_top',
    name: 'Scroll to Top',
    description: 'Scroll smoothly to the very top of the page',
    category: 'scrolling',
    safetyLevel: 'safe',
    synonyms: ['scroll to top', 'top of page', 'go to top', 'सुरुवातीला जा'],
  },
  scroll_to_bottom: {
    id: 'scroll_to_bottom',
    name: 'Scroll to Bottom',
    description: 'Scroll smoothly to the bottom of the page or footer',
    category: 'scrolling',
    safetyLevel: 'safe',
    synonyms: ['scroll to bottom', 'bottom of page', 'go to footer', 'तळाशी जा'],
  },

  // ── Dark Mode ────────────────────────────────────────────────────────────
  enable_dark_mode: {
    id: 'enable_dark_mode',
    name: 'Enable Dark Mode',
    description: 'Switch the application to dark theme',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['turn on dark mode', 'dark mode on', 'enable dark theme', 'switch to dark mode', 'activate dark mode', 'go dark'],
  },
  disable_dark_mode: {
    id: 'disable_dark_mode',
    name: 'Disable Dark Mode',
    description: 'Switch the application to light theme',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['turn off dark mode', 'dark mode off', 'disable dark theme', 'light mode', 'switch to light mode', 'enable light mode'],
  },
  toggle_dark_mode: {
    id: 'toggle_dark_mode',
    name: 'Toggle Dark Mode',
    description: 'Toggle the dark/light theme',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['toggle dark mode', 'dark mode', 'switch theme', 'change theme'],
  },
  get_theme: {
    id: 'get_theme',
    name: 'Get Current Theme',
    description: 'Report whether dark mode or light mode is currently active',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['is dark mode on', 'what theme is active', 'current theme', 'dark mode status'],
  },

  // ── Fun Mode ──────────────────────────────────────────────────────────────
  enable_fun_mode: {
    id: 'enable_fun_mode',
    name: 'Enable Fun Mode',
    description: 'Activate fun reading font and dyslexia-friendly spacing',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['turn on fun mode', 'fun mode on', 'activate fun mode', 'enable dyslexia mode', 'dyslexia font on'],
  },
  disable_fun_mode: {
    id: 'disable_fun_mode',
    name: 'Disable Fun Mode',
    description: 'Deactivate fun reading font and return to standard style',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['turn off fun mode', 'fun mode off', 'exit fun mode', 'disable dyslexia mode', 'dyslexia font off'],
  },
  toggle_fun_mode: {
    id: 'toggle_fun_mode',
    name: 'Toggle Fun Mode',
    description: 'Toggle fun reading font on or off',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['toggle fun mode', 'fun mode'],
  },
  get_fun_mode: {
    id: 'get_fun_mode',
    name: 'Get Fun Mode Status',
    description: 'Report whether fun mode is currently active',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['is fun mode on', 'fun mode status'],
  },

  // ── Font Controls ─────────────────────────────────────────────────────────
  set_font: {
    id: 'set_font',
    name: 'Set Reading Font',
    description: 'Switch between accessible fonts like Lexend, OpenDyslexic, Atkinson, Comic Neue, Andika, Nunito, Verdana, or Arial',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['change font', 'set font', 'switch font', 'use font'],
  },
  get_font: {
    id: 'get_font',
    name: 'Get Current Font',
    description: 'Report which reading font is currently active',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['what is my font', 'which font is selected', 'current font'],
  },

  // ── Line Spacing Controls ─────────────────────────────────────────────────
  set_line_spacing: {
    id: 'set_line_spacing',
    name: 'Set Line Spacing',
    description: 'Adjust distance between lines of text',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['set line spacing', 'line spacing to', 'line height'],
  },
  increase_line_spacing: {
    id: 'increase_line_spacing',
    name: 'Increase Line Spacing',
    description: 'Expand distance between lines of text for easier reading',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['increase line spacing', 'more space between lines', 'spread lines out'],
  },
  decrease_line_spacing: {
    id: 'decrease_line_spacing',
    name: 'Decrease Line Spacing',
    description: 'Reduce distance between lines of text',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['decrease line spacing', 'closer lines', 'less space between lines'],
  },
  get_line_spacing: {
    id: 'get_line_spacing',
    name: 'Get Line Spacing',
    description: 'Report current line spacing multiplier',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['what is my line spacing', 'current line spacing'],
  },

  // ── Font Weight Controls ──────────────────────────────────────────────────
  set_font_weight: {
    id: 'set_font_weight',
    name: 'Set Font Weight',
    description: 'Set text thickness (bold, regular, medium, light, or numeric weight)',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['make font bold', 'set font weight', 'lighter text'],
  },
  get_font_weight: {
    id: 'get_font_weight',
    name: 'Get Font Weight',
    description: 'Report current font weight',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['what is the current font weight', 'current font weight'],
  },

  // ── Letter Spacing Controls ───────────────────────────────────────────────
  set_letter_spacing: {
    id: 'set_letter_spacing',
    name: 'Set Letter Spacing',
    description: 'Set spacing between individual characters',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['set letter spacing', 'letter spacing'],
  },
  increase_letter_spacing: {
    id: 'increase_letter_spacing',
    name: 'Increase Letter Spacing',
    description: 'Expand spacing between letters for dyslexia clarity',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['increase letter spacing', 'more space between letters', 'wider letters'],
  },
  decrease_letter_spacing: {
    id: 'decrease_letter_spacing',
    name: 'Decrease Letter Spacing',
    description: 'Reduce spacing between letters',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['decrease letter spacing', 'closer letters'],
  },
  get_letter_spacing: {
    id: 'get_letter_spacing',
    name: 'Get Letter Spacing',
    description: 'Report current letter spacing value',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['what is the letter spacing', 'current letter spacing'],
  },

  // ── Text Size Explicit & Reset ────────────────────────────────────────────
  set_text_size: {
    id: 'set_text_size',
    name: 'Set Text Size',
    description: 'Set text size to a specific percentage (90% to 150%)',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['set text size', 'text size to'],
  },
  reset_text_size: {
    id: 'reset_text_size',
    name: 'Reset Text Size',
    description: 'Restore text size to default 100%',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['reset text size', 'default text size'],
  },
  get_text_size: {
    id: 'get_text_size',
    name: 'Get Text Size',
    description: 'Report current text size percentage',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['what is my text size', 'current text size'],
  },

  // ── Reset & Overview ──────────────────────────────────────────────────────
  reset_reading_settings: {
    id: 'reset_reading_settings',
    name: 'Reset All Reading Settings',
    description: 'Restore font, line spacing, font weight, letter spacing, and text size to defaults',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['reset reading settings', 'reset everything to default', 'restore default font and spacing'],
  },
  get_reading_settings: {
    id: 'get_reading_settings',
    name: 'Get All Reading Settings',
    description: 'Report complete summary of all active reading settings',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['tell me my current reading settings', 'what are my reading settings', 'show reading settings'],
  },

  // ── Word Spotlight Controls ───────────────────────────────────────────────
  next_word: {
    id: 'next_word',
    name: 'Next Word',
    description: 'Advance spotlight reading to the next word',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['next word', 'advance word', 'skip word'],
  },
  prev_word: {
    id: 'prev_word',
    name: 'Previous Word',
    description: 'Move spotlight reading back to the previous word',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['previous word', 'prev word', 'go back a word'],
  },
  restart_reading: {
    id: 'restart_reading',
    name: 'Restart Reading',
    description: 'Restart reading aloud from the very beginning of the page',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['restart reading', 'read from beginning', 'start reading again'],
  },

  // ── Reduce Motion ─────────────────────────────────────────────────────────
  enable_reduce_motion: {
    id: 'enable_reduce_motion',
    name: 'Enable Reduce Motion',
    description: 'Reduce animations and motion for accessibility',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['reduce motion', 'turn off animations', 'disable animations', 'less motion'],
  },
  disable_reduce_motion: {
    id: 'disable_reduce_motion',
    name: 'Disable Reduce Motion',
    description: 'Re-enable animations and motion effects',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['enable animations', 'turn on animations', 'restore motion'],
  },

  // ── High Contrast (idempotent variants) ───────────────────────────────────
  enable_high_contrast: {
    id: 'enable_high_contrast',
    name: 'Enable High Contrast',
    description: 'Turn on high contrast mode',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['high contrast on', 'turn on high contrast', 'activate high contrast'],
  },
  disable_high_contrast: {
    id: 'disable_high_contrast',
    name: 'Disable High Contrast',
    description: 'Turn off high contrast mode',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['high contrast off', 'turn off high contrast', 'deactivate high contrast'],
  },

  // ── Accessibility & UI Toggles ────────────────────────────────────────────
  toggle_dyslexia_mode: {
    id: 'toggle_dyslexia_mode',
    name: 'Toggle Dyslexia Mode',
    description: 'Turn OpenDyslexic accessible font and spacing on or off',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['toggle dyslexia font', 'dyslexia mode', 'opendyslexic font', 'accessible font'],
  },
  toggle_high_contrast: {
    id: 'toggle_high_contrast',
    name: 'Toggle High Contrast',
    description: 'Switch high contrast color mode for better readability',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['high contrast', 'contrast mode', 'कंट्रास्ट'],
  },
  increase_text_size: {
    id: 'increase_text_size',
    name: 'Increase Font Size',
    description: 'Make text larger on screen',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['increase font size', 'bigger text', 'larger font', 'zoom text', 'फॉन्ट वाढवा'],
  },
  decrease_text_size: {
    id: 'decrease_text_size',
    name: 'Decrease Font Size',
    description: 'Make text smaller on screen',
    category: 'accessibility',
    safetyLevel: 'safe',
    synonyms: ['decrease font size', 'smaller text', 'smaller font', 'फॉन्ट कमी करा'],
  },

  // ── Page Reading & Audio Controls (Spotlight Reader) ──────────────────────
  read_page: {
    id: 'read_page',
    name: 'Read Whole Page',
    description: 'Read the active page text aloud with real-time word spotlight highlighting',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['read page', 'read this page', 'read aloud', 'read out loud', 'read the whole page', 'read article', 'read to me', 'वाचा', 'हे पान वाचा', 'पढ़ो'],
  },
  pause_reading: {
    id: 'pause_reading',
    name: 'Pause Reading',
    description: 'Pause the current page speech reading',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['pause reading', 'pause', 'hold on', 'थांबा', 'विराम'],
  },
  resume_reading: {
    id: 'resume_reading',
    name: 'Resume Reading',
    description: 'Resume paused page speech reading',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['resume reading', 'resume', 'continue reading', 'continue', 'चालू ठेवा', 'पुन्हा सुरू करा'],
  },
  stop_reading: {
    id: 'stop_reading',
    name: 'Stop Reading',
    description: 'Stop speaking or reading the page and close spotlight reader',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['stop reading', 'stop speaking', 'stop', 'be quiet', 'quiet', 'silence', 'cancel reading', 'बंद करा', 'शांत रहा'],
  },
  summarize_page: {
    id: 'summarize_page',
    name: 'Summarize Page',
    description: 'Extract and summarize what is on the current page in simple terms',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['summarize', 'summarize this page', 'what is on this page', 'what does this page say', 'page summary', 'सारांश'],
  },
  explain_page: {
    id: 'explain_page',
    name: 'Explain Page & Actions',
    description: 'Explain what this page is for and what the user can do here',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['what can i do here', 'explain this page', 'where am i', 'help with this page', 'मार्गदर्शन'],
  },
  read_selection: {
    id: 'read_selection',
    name: 'Read Selected Text',
    description: 'Read aloud the text currently selected by the user',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['read selected', 'read selection', 'read this text', 'read highlighted text'],
  },
  speed_up_reading: {
    id: 'speed_up_reading',
    name: 'Read Faster',
    description: 'Increase the speed of page reading',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['read faster', 'faster', 'speed up reading', 'वेग वाढवा'],
  },
  slow_down_reading: {
    id: 'slow_down_reading',
    name: 'Read Slower',
    description: 'Decrease the speed of page reading for easier comprehension',
    category: 'page_interaction',
    safetyLevel: 'safe',
    synonyms: ['read slower', 'slower', 'slow down reading', 'वेग कमी करा'],
  },
  search_page: {
    id: 'search_page',
    name: 'Find on Page',
    description: 'Search for text or keyword and scroll it into view',
    category: 'page_interaction',
    safetyLevel: 'safe',
    parametersSchema: {
      query: { type: 'string', description: 'Keyword or section to find on the page', required: true },
    },
    synonyms: ['find', 'search for', 'locate', 'शोधा'],
  },

  // ── Generic Dynamic Page Interactions ─────────────────────────────────────
  click_element: {
    id: 'click_element',
    name: 'Click Interactive Element',
    description: 'Click a registered button, link, or card on the current page',
    category: 'page_interaction',
    safetyLevel: 'safe',
    parametersSchema: {
      targetId: { type: 'string', description: 'data-jarvis-id or label of the element to click', required: true },
    },
    synonyms: ['click', 'press', 'tap', 'select', 'क्लिक'],
  },
  close_assistant: {
    id: 'close_assistant',
    name: 'Close Jarvis Assistant',
    description: 'Minimize or close the Jarvis voice assistant overlay',
    category: 'system',
    safetyLevel: 'safe',
    synonyms: ['close', 'minimize', 'bye', 'goodbye', 'dismiss', 'बंद करा'],
  },

  // ── Sensitive Actions (Require Confirmation) ──────────────────────────────
  user_logout: {
    id: 'user_logout',
    name: 'Log Out',
    description: 'Sign out of the current user account (requires confirmation)',
    category: 'system',
    safetyLevel: 'sensitive',
    synonyms: ['logout', 'sign out', 'log me out', 'बाहेर पडा'],
  },
};

/**
 * Maps standard routes and tabs to action identifiers
 */
export const ROUTE_ACTION_MAP: Record<string, string> = {
  '/': 'navigate_home',
  '/dashboard': 'open_dashboard',
  '/dashboard/courses': 'open_courses',
  '/dashboard/resume-builder': 'open_resume_builder',
  '/learn': 'open_learn',
  '/opportunities': 'open_opportunities',
  '/community': 'open_community',
  '/assessment': 'open_assessment',
  '/about': 'open_about',
  '/login': 'open_login',
  '/creator/dashboard': 'open_creator_studio',
};

/**
 * Returns a human-friendly page title for any given route
 */
export function getPageTitleForRoute(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname.startsWith('/dashboard/resume-builder') || pathname === '/resume-builder') return 'Resume Builder';
  if (pathname.startsWith('/dashboard/courses') || pathname.startsWith('/courses')) return 'Courses Catalog';
  if (pathname.startsWith('/dashboard')) return 'Student Dashboard';
  if (pathname.startsWith('/learn')) return 'Learning Hub';
  if (pathname.startsWith('/opportunities')) return 'Opportunities & Jobs';
  if (pathname.startsWith('/community')) return 'Community Discussions';
  if (pathname.startsWith('/assessment')) return 'Cognitive Assessment';
  if (pathname.startsWith('/about')) return 'About NeuroBridge';
  if (pathname.startsWith('/login')) return 'Login / Register';
  if (pathname.startsWith('/creator')) return 'Course Creator Studio';
  return 'NeuroBridge';
}

/**
 * Builds the list of available actions and descriptions for the current page context
 */
export function getAvailableActionsForContext(currentRoute: string): JarvisActionDefinition[] {
  const actions = Object.values(GLOBAL_ACTIONS);
  return actions;
}
