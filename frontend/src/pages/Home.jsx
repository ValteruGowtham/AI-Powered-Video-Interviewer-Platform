import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glimmer" aria-hidden="true"></div>
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-pill">✨ New: Multi-modal feedback reports</div>
            <h1 className="hero-title">
              AI-Powered Mock Interview Platform
            </h1>
            <p className="hero-tagline">
              Practice, perfect, and ace your next interview with immersive voice interactions,
              instant coaching, and beautiful reports.
            </p>
            <div className="hero-buttons">
              <Link to="/interview" className="btn btn-primary btn-large">
                <span className="btn-icon">🎤</span>
                Start Practice Interview
              </Link>
              <Link to="/admin" className="btn btn-secondary btn-large">
                <span className="btn-icon">⚙️</span>
                Admin Panel
              </Link>
            </div>

            <ul className="hero-highlights">
              <li>Adaptive AI interviewer tuned to your role</li>
              <li>Voice-first experience with camera confidence checks</li>
              <li>Actionable summaries, follow-ups, and insight heatmaps</li>
            </ul>

            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-number">AI-Powered</div>
                <div className="stat-label">Smart Evaluation</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Voice-Based</div>
                <div className="stat-label">Natural Interview</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Instant</div>
                <div className="stat-label">Feedback Report</div>
              </div>
            </div>
          </div>

          <div className="hero-showcase">
            <div className="hero-showcase-card hero-score-card">
              <p className="card-label">Average Confidence Score</p>
              <div className="score-value">92</div>
              <p className="card-meta">+18 pts after 2 sessions</p>
              <div className="score-wave">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div className="hero-showcase-card hero-report-card">
              <h3>Live Coaching Stack</h3>
              <div className="report-pill">✅ Voice clarity</div>
              <div className="report-pill">⚡ Keyword coverage</div>
              <div className="report-pill">🧠 Behavioral cues</div>
              <p>AI co-pilot tracks your performance & suggests follow-ups in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trusted-section">
        <p className="trusted-label">Trusted by candidates from</p>
        <div className="trusted-logos">
          <span>FAANG-ready</span>
          <span>Big 4 Consulting</span>
          <span>Hyper-growth Startups</span>
          <span>University Career Labs</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Our Platform?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI-Powered Evaluation</h3>
            <p className="feature-description">
              Get intelligent feedback powered by OpenAI GPT-3.5. Receive detailed analysis on your strengths, weaknesses, and areas for improvement.
            </p>
            <div className="feature-badge">Smart Analysis</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3 className="feature-title">Voice-Based Interview</h3>
            <p className="feature-description">
              Experience realistic voice interactions with speech recognition and text-to-speech. Practice as if you're in a real interview setting.
            </p>
            <div className="feature-badge">Natural Experience</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Detailed Feedback Reports</h3>
            <p className="feature-description">
              Review comprehensive reports with audio playback, transcriptions, scores, and actionable recommendations for each response.
            </p>
            <div className="feature-badge">Comprehensive Insights</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Question Bank Management</h3>
            <p className="feature-description">
              Access curated questions across HR, Technical, and Behavioral categories. Admins can easily add, edit, and manage the question database.
            </p>
            <div className="feature-badge">Customizable Content</div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          
          <div className="step-item">
            <div className="step-number">1</div>
            <h3 className="step-title">Configure Interview</h3>
            <p className="step-description">
              Enter your name, select category and difficulty level, choose number of questions
            </p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">2</div>
            <h3 className="step-title">Answer Questions</h3>
            <p className="step-description">
              Listen to AI avatar ask questions, record your voice answers naturally
            </p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">3</div>
            <h3 className="step-title">Get AI Feedback</h3>
            <p className="step-description">
              Receive instant evaluation with scores, strengths, and improvement areas
            </p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">4</div>
            <h3 className="step-title">Review Report</h3>
            <p className="step-description">
              Access comprehensive report with audio playback and detailed analysis
            </p>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3 className="faq-question">How does the AI evaluation work?</h3>
            <p className="faq-answer">
              Our platform uses OpenAI's GPT-3.5 to analyze your responses based on relevance, clarity, and keyword matching. 
              You'll receive detailed feedback and actionable suggestions for improvement.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Can I review my past interviews?</h3>
            <p className="faq-answer">
              Yes! After completing an interview, you can access a comprehensive report with audio playback, 
              scores, and AI-generated feedback. Navigate to the Admin panel to view all sessions.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Which browsers are supported?</h3>
            <p className="faq-answer">
              We recommend using Chrome or Edge for the best experience. These browsers have full support 
              for Web Speech API features including voice recognition and text-to-speech.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">How long does an interview take?</h3>
            <p className="faq-answer">
              Interview duration varies based on your settings (3-10 questions). On average, expect 15-30 minutes. 
              Take your time to provide thoughtful answers - there's no rush!
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Is my data secure and private?</h3>
            <p className="faq-answer">
              Your interview responses and audio recordings are stored securely. We use industry-standard 
              encryption and never share your data with third parties.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Can I customize the interview difficulty?</h3>
            <p className="faq-answer">
              Absolutely! Before starting, you can select your preferred category (HR, Technical, Behavioral), 
              difficulty level (Easy, Medium, Hard), and the number of questions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Ace Your Interview?</h2>
        <p className="cta-subtitle">Start practicing now and boost your confidence</p>
        <Link to="/interview" className="btn btn-cta">
          Begin Your Practice Interview
          <span className="btn-arrow">→</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 AI Mock Interviewer. Built with React, Node.js, and OpenAI.</p>
        <div className="footer-links">
          <Link to="/admin">Admin Panel</Link>
          <span>•</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to Top</a>
        </div>
      </footer>
    </div>
  )
}
