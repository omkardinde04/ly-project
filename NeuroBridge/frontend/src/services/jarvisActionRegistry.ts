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
  open_resume_builder: {
    id: 'open_resume_builder',
    name: 'Resume Builder',
    description: 'Navigate to the AI-assisted Resume & CV Builder',
    category: 'navigation',
    safetyLevel: 'safe',
    synonyms: ['resume builder', 'resume', 'cv', 'build resume', 'बायोडाटा'],
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
    synonyms: ['high contrast', 'contrast mode', 'dark mode', 'कंट्रास्ट'],
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
