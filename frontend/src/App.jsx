import React, { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/ToastContext'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Header from './components/Header'
import './PageTransitions.css'

// Lazy load heavy pages
const Admin = lazy(() => import('./pages/Admin'))
const Report = lazy(() => import('./pages/Report'))

// Loading component
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner-large"></div>
    <p>Loading...</p>
  </div>
)

export default function App() {
  const location = useLocation()

  return (
    <ToastProvider>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/report/:sessionId" element={<Report />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ToastProvider>
  )
}
