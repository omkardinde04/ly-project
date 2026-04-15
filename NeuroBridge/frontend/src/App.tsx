import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { DyslexiaProvider, useDyslexia } from './contexts/DyslexiaContext';
import { AssistantProvider } from './contexts/AssistantContext';
import { AIAssistant } from './components/assistant/AIAssistant';
import { Navbar } from './components/layout/Navbar'
import Index from './components/pages/Index'
import { Login } from './components/pages/Login'
import { Footer } from './components/layout/Footer'
import { AssessmentPage } from './components/pages/Assessment'
import { Dashboard } from './components/pages/Dashboard'
import { Learn } from './components/pages/Learn'
import { OpportunitiesPage } from './components/pages/OpportunitiesPage'
import { CommunityPage } from './components/pages/CommunityPage'
import { AboutPage } from './components/pages/AboutPage'
import { GlobalReader } from './components/ui/GlobalReader'

function Layout({ children }: { children: ReactNode }) {
  const { isDyslexiaMode, dyslexiaLevel } = useDyslexia();

  // Apply class directly on <body> so our CSS token system works globally
  useEffect(() => {
    const body = document.body;

    // Reset all mode classes first
    body.classList.remove('dyslexia-mode', 'mild-dyslexia', 'high-contrast');

    if (isDyslexiaMode) {
      if (dyslexiaLevel === 'severe') {
        body.classList.add('dyslexia-mode', 'high-contrast');
      } else if (dyslexiaLevel === 'mild') {
        body.classList.add('dyslexia-mode', 'mild-dyslexia');
      } else {
        body.classList.add('dyslexia-mode');
      }
    }
  }, [isDyslexiaMode, dyslexiaLevel]);

  return <>{children}</>;
}


function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <Layout>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        {!isDashboard && <Navbar links={["Home", "Learn", "Opportunities", "Community", "About"]} showLogin={true} />}
        <main className={`flex-1 ${isDashboard ? "" : "max-w-7xl mx-auto py-6 w-full sm:px-6 lg:px-8"}`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
        <GlobalReader />
        <AIAssistant autoStart={true} />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <DyslexiaProvider>
      <AssistantProvider>
        <Router>
          <AppContent />
        </Router>
      </AssistantProvider>
    </DyslexiaProvider>
  )
}

export default App
