import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import AboutPage from './pages/AboutPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ShockOnboarding from './pages/ShockOnboarding'
import { useWallpaperSync } from './hooks/useWallpaperSync'

export default function App() {
  useWallpaperSync()
  const location = useLocation()

  // Hide navbar on shock onboarding page for immersive experience
  const hideNavbar = location.pathname === '/onboarding'

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      {!hideNavbar && <Navbar />}
      <main className="relative">
        {/* Apple-style page glare */}
        {!hideNavbar && <div className="page-glare" aria-hidden="true" />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<ShockOnboarding />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/generate/:style" element={<GeneratorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  )
}
