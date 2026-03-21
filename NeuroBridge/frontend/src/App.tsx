import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DyslexiaProvider, useDyslexia } from './contexts/DyslexiaContext';
import { Navbar } from './components/layout/Navbar'
import Index from './components/pages/Index'
import { Login } from './components/pages/Login'
import { Footer } from './components/layout/Footer'
import { AssessmentPage } from './components/pages/Assessment'
import { Dashboard } from './components/pages/Dashboard'

function Layout({ children }: { children: ReactNode }) {
  const { isDyslexiaMode, dyslexiaLevel } = useDyslexia();
  
  const getDyslexiaClass = () => {
    if (!isDyslexiaMode) return '';
    if (dyslexiaLevel === 'severe') return 'dyslexia-mode high-contrast';
    if (dyslexiaLevel === 'moderate') return 'dyslexia-mode';
    if (dyslexiaLevel === 'mild') return 'mild-dyslexia';
    return 'dyslexia-mode';
  };

  return (
    <div className={getDyslexiaClass()}>
      {children}
    </div>
  );
}

function AppContent() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#DBEAF5]">
        <Navbar links={["Home", "Learn", "Opportunities", "Community", "About"]} showLogin={true} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <DyslexiaProvider>
      <Router>
        <AppContent />
      </Router>
    </DyslexiaProvider>
  )
}

export default App
