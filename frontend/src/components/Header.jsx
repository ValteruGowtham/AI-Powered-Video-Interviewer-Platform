import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Interview', path: '/interview', icon: '🎤' },
  { label: 'Admin', path: '/admin', icon: '🛠️' }
]

export default function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="app-header" aria-label="Primary">
      <div className="header-glow" aria-hidden="true"></div>
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">AI</span>
          <span className="brand-copy">
            <span className="brand-title">Mock Interviewer</span>
            <span className="brand-tagline">Practice smarter with AI</span>
          </span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(prev => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navLinks.map(({ label, path, icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
          <Link to="/interview" className="nav-cta">
            Launch Interview
            <span className="cta-icon" aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
