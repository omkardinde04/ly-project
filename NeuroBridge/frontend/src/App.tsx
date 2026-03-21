import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar'
import Index from './components/pages/Index'
import { Login } from './components/pages/Login'
import { Footer } from './components/layout/Footer'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#DBEAF5]">
        <Navbar links={["Home", "Learn", "Opportunities", "Community", "About"]} showLogin={true} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
