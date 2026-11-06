import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { DyslexiaProvider, useDyslexia } from './contexts/DyslexiaContext';
import { fontStack } from './utils/funFonts';
import { AssistantProvider } from './contexts/AssistantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SpotlightReaderProvider } from './contexts/SpotlightReaderContext';
import { OnPageWordSpotlight } from './components/ui/OnPageWordSpotlight';
import { AIAssistant } from './components/assistant/AIAssistant';
import { Navbar } from './components/layout/Navbar';
import { GlobalLanguageBridge } from './components/layout/GlobalLanguageBridge';
import Index from './components/pages/Index';
import { Login } from './components/pages/Login';
import { Footer } from './components/layout/Footer';
import { AssessmentPage } from './components/pages/Assessment';
import { Dashboard } from './components/pages/Dashboard';
import { Learn } from './components/pages/Learn';
import { OpportunitiesPage } from './components/pages/OpportunitiesPage';
import { CommunityPage } from './components/pages/CommunityPage';
import { AboutPage } from './components/pages/AboutPage';
import { ChromeExtensionPage } from './components/pages/ChromeExtensionPage';
import { ForgotPassword } from './components/pages/ForgotPassword';
import { ResetPassword } from './components/pages/ResetPassword';
import { VerifyEmail } from './components/pages/VerifyEmail';
import { AuthRedirect } from './components/auth/AuthRedirect';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CourseDetail } from './components/pages/CourseDetail';
import { CoursePlayer } from './components/pages/CoursePlayer';
import { CourseCreator } from './components/pages/CourseCreator';
import { AdminModeration } from './components/pages/AdminModeration';
function Layout({ children }: { children: ReactNode }) {
  const {
    isDyslexiaMode,
    dyslexiaLevel,
    textSize,
    lineSpacing,
    letterSpacing,
    highContrast,
    reduceMotion,
    contentWidth,
    language,
    funFont,
    funLineHeight,
    funWeight,
    funLetterSpacing,
  } = useDyslexia();

  // Apply class directly on <body> so our CSS token system works globally
  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;

    // Reset all mode classes first
    body.classList.remove(
      'dyslexia-mode',
      'mild-dyslexia',
      'high-contrast',
      'accessibility-high-contrast',
      'accessibility-reduce-motion',
      'fun-mode',
    );
    root.classList.remove('accessibility-reduce-motion');

    // Fun mode: the reader's chosen font / spacing / weight, applied site-wide
    if (isDyslexiaMode) {
      body.classList.add('fun-mode');
      root.style.setProperty('--fun-font', fontStack(funFont));
      root.style.setProperty('--fun-line-height', String(funLineHeight));
      root.style.setProperty('--fun-weight', String(funWeight));
      root.style.setProperty('--fun-letter-spacing', `${funLetterSpacing}em`);
    }

    if (isDyslexiaMode) {
      if (dyslexiaLevel === 'severe') {
        body.classList.add('dyslexia-mode', 'high-contrast');
      } else if (dyslexiaLevel === 'mild') {
        body.classList.add('dyslexia-mode', 'mild-dyslexia');
      } else {
        body.classList.add('dyslexia-mode');
      }
    }

    if (highContrast) body.classList.add('high-contrast', 'accessibility-high-contrast');
    if (reduceMotion) {
      body.classList.add('accessibility-reduce-motion');
      root.classList.add('accessibility-reduce-motion');
    }

    const lineHeights = { normal: '1.5', comfortable: '1.8', spacious: '2.2' };
    const letterSpacings = { normal: 'normal', comfortable: '0.05em', wide: '0.1em' };
    const contentWidths = { normal: '100%', comfortable: '85%', narrow: '65%' };
    
    // Indic scripts (Hindi, Marathi) completely break if letter-spacing is applied
    const isIndic = language === 'hi' || language === 'mr';
    
    root.style.fontSize = `${textSize}%`;
    root.style.setProperty('--accessibility-line-height', lineHeights[lineSpacing]);
    root.style.setProperty('--accessibility-letter-spacing', isIndic ? '0px' : letterSpacings[letterSpacing]);
    root.style.setProperty('--accessibility-content-width', contentWidths[contentWidth]);

    return () => {
      root.style.fontSize = '';
      root.style.removeProperty('--accessibility-line-height');
      root.style.removeProperty('--accessibility-letter-spacing');
      root.style.removeProperty('--accessibility-content-width');
      ['--fun-font', '--fun-line-height', '--fun-weight', '--fun-letter-spacing'].forEach((v) => root.style.removeProperty(v));
    };
  }, [isDyslexiaMode, dyslexiaLevel, textSize, lineSpacing, letterSpacing, highContrast, reduceMotion, contentWidth, language, funFont, funLineHeight, funWeight, funLetterSpacing]);

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthRoute = location.pathname.startsWith('/auth-redirect') || location.pathname.startsWith('/login');
  const isAssessment = location.pathname.startsWith('/assessment');
  const isLandingPage = location.pathname === '/';

  // Show loading screen while checking authentication (skip for auth routes so they don't unmount mid-login)
  if (isLoading && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: 'var(--color-text)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        {!isDashboard && <Navbar links={["Home", "Learn", "Chrome Extension", "Community", "About"]} showLogin={true} />}
        <main className={`flex-1 ${isDashboard ? "" : "w-full"}`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            {/* Resume builder & opportunities were removed from the dashboard */}
            <Route path="/dashboard/resume-builder" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard/opportunities" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard/courses" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learn" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <Learn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <OpportunitiesPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/courses" element={<Navigate to="/dashboard/courses" replace />} />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id/learn" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <CoursePlayer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/creator/dashboard" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <CourseCreator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <AdminModeration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute requireAssessment={true}>
                  <CommunityPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/chrome-extension" element={<ChromeExtensionPage />} />
            <Route path="/resume-builder" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth-redirect" element={<AuthRedirect />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
        {isLandingPage && <Footer />}
        <AIAssistant autoStart={true} />
        {/* On-Page Word Spotlight Overlay */}
        <OnPageWordSpotlight />
        <GlobalLanguageBridge />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DyslexiaProvider>
        <SpotlightReaderProvider>
          <Router>
            <AssistantProvider>
              <AppContent />
            </AssistantProvider>
          </Router>
        </SpotlightReaderProvider>
      </DyslexiaProvider>
    </AuthProvider>
  );
}

export default App;
