import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Determine if scrolled enough for styling
      setScrolled(currentScrollY > 12)

      // Smart hide/show logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold -> Hide
        if (!menuOpen) setVisible(false)
      } else {
        // Scrolling up OR at top -> Show
        setVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setVisible(true)
  }, [location])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transform transition-all duration-500 ease-in-out ${scrolled ? 'py-2' : 'py-4'} ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <nav
        className={`max-w-5xl mx-auto px-4 transition-all duration-300 ${
          scrolled
            ? 'nav-pill rounded-2xl mx-4'
            : 'bg-transparent'
        }`}
      >
        <div className="h-12 flex items-center justify-between px-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: '#ff5f45' }}
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span
              className="font-semibold text-[15px] tracking-tight"
              style={{ color: '#1d1d1f' }}
            >
              One<span style={{ color: '#ff5f45' }}>Countdown</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/about"
              className="text-sm px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-black/5"
              style={{ color: '#6e6e73' }}
            >
              About
            </Link>
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-black/5"
                style={{ color: '#6e6e73' }}
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-black/5"
                style={{ color: '#6e6e73' }}
              >
                Log In
              </Link>
            )}
            <Link
              to="/generate"
              id="nav-cta"
              className="btn-coral text-sm py-2.5 px-5"
            >
              Create Wallpaper
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-black/5 transition-colors"
          >
            <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-52 pb-3' : 'max-h-0'}`}>
          <div className="flex flex-col gap-1 pt-2 border-t border-black/5">
            <Link to="/about" className="text-sm px-3 py-2.5 rounded-xl hover:bg-black/5 text-[#6e6e73] transition-colors">About</Link>
            {currentUser ? (
              <button onClick={handleLogout} className="text-sm px-3 py-2.5 rounded-xl hover:bg-black/5 text-[#6e6e73] transition-colors text-left">Log Out</button>
            ) : (
              <Link to="/login" className="text-sm px-3 py-2.5 rounded-xl hover:bg-black/5 text-[#6e6e73] transition-colors">Log In</Link>
            )}
            <Link to="/generate" className="btn-coral text-sm text-center mt-2">Create Wallpaper</Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
