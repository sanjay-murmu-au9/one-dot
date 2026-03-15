import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <div className="min-h-screen relative" style={{ background: '#fafafa' }}>
      {/* Apple-style page glare */}
      <div className="page-glare" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/generate/:style" element={<GeneratorPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </div>
  )
}
