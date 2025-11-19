import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Report.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  
  // Career Advisor states
  const [careerAdvice, setCareerAdvice] = useState(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState(null);
  const [showCareerSection, setShowCareerSection] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details
      const sessionResponse = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
      setSession(sessionResponse.data.session);

      // Generate summary if not already generated
      if (!sessionResponse.data.session.completedAt || !sessionResponse.data.session.overallScore) {
        const summaryResponse = await axios.post(`${API_BASE_URL}/summary/${sessionId}/generate-summary`);
        setSummary(summaryResponse.data.summary);
        setSession(summaryResponse.data.session);
      } else {
        // Extract summary from existing session data
        setSummary({
          overallScore: sessionResponse.data.session.overallScore,
          overallStrengths: sessionResponse.data.session.feedback.strengths || [],
          areasToImprove: sessionResponse.data.session.feedback.weaknesses || [],
          finalRecommendation: sessionResponse.data.session.feedback.summary?.join(' ') || ''
        });
      }

    } catch (err) {
      console.error('Error fetching session data:', err);
      setError('Failed to load interview report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate career advice
  const handleGenerateCareerAdvice = async () => {
    try {
      setIsGeneratingAdvice(true);
      setAdviceError(null);

      const response = await axios.post(`${API_BASE_URL}/career-advisor/generate/${sessionId}`);
      
      if (response.data.success) {
        setCareerAdvice(response.data.careerAdvice);
        setShowCareerSection(true);
      }
    } catch (err) {
      console.error('Error generating career advice:', err);
      setAdviceError(err.response?.data?.message || 'Failed to generate career advice. Please try again.');
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  // Load existing career advice if available
  useEffect(() => {
    if (session && session.careerAdvice) {
      setCareerAdvice(session.careerAdvice);
    }
  }, [session]);

  const handleVideoPlay = (responseId) => {
    if (playingVideo === responseId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(responseId);
    }
  };

  const handleDownloadReport = () => {
    alert('PDF download feature coming soon! For now, you can print this page (Ctrl+P) and save as PDF.');
  };

  const handleStartNewInterview = () => {
    navigate('/interview');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getCategoryScores = () => {
    if (!session || !session.responses) return {};
    
    const categories = {};
    session.responses.forEach(response => {
      const category = response.questionId?.category || 'Other';
      if (!categories[category]) {
        categories[category] = { total: 0, count: 0 };
      }
      if (response.score !== null && response.score !== undefined) {
        categories[category].total += response.score;
        categories[category].count += 1;
      }
    });

    const categoryScores = {};
    Object.entries(categories).forEach(([category, data]) => {
      categoryScores[category] = data.count > 0 ? Math.round(data.total / data.count) : 0;
    });

    return categoryScores;
  };

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-container">
          <div className="loading-state">
            <div className="spinner-large"></div>
            <h2>Generating Your Report...</h2>
            <p>Analyzing your interview performance</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="report-page">
        <div className="report-container">
          <div className="error-state">
            <h2>❌ Error Loading Report</h2>
            <p>{error || 'Session not found'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/interview')}>
              Back to Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryScores = getCategoryScores();
  const overallScore = summary?.overallScore || session.overallScore || 0;

  return (
    <div className="report-page">
      <div className="report-container">
        
        {/* Header Section */}
        <div className="report-header">
          <div className="report-title">
            <h1>📊 Interview Report</h1>
            <p className="report-subtitle">Performance Analysis & Feedback</p>
          </div>
          <div className="report-actions">
            <button className="btn btn-download" onClick={handleDownloadReport}>
              📄 Download PDF
            </button>
            <button className="btn btn-primary" onClick={handleStartNewInterview}>
              🎤 Start New Interview
            </button>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="candidate-info">
          <div className="info-item">
            <span className="info-label">Candidate:</span>
            <span className="info-value">{session.candidateName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date:</span>
            <span className="info-value">
              {new Date(session.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Questions Answered:</span>
            <span className="info-value">{session.responses.length} / {session.questions.length}</span>
          </div>
        </div>

        {/* Overall Score Section */}
        <div className="score-section">
          <div className="score-card-main">
            <h2>Overall Score</h2>
            <div className="score-circle" style={{ '--score-color': getScoreColor(overallScore) }}>
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="score-bg" />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="90" 
                  className="score-fill"
                  style={{
                    strokeDashoffset: 565 - (565 * overallScore) / 100
                  }}
                />
              </svg>
              <div className="score-value">
                <span className="score-number">{overallScore}</span>
                <span className="score-total">/100</span>
              </div>
            </div>
            <div className="score-grade" style={{ color: getScoreColor(overallScore) }}>
              {getScoreGrade(overallScore)}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="category-breakdown">
            <h3>Score by Category</h3>
            <div className="category-bars">
              {Object.entries(categoryScores).map(([category, score]) => (
                <div key={category} className="category-bar-item">
                  <div className="category-bar-header">
                    <span className="category-name">{category}</span>
                    <span className="category-score">{score}%</span>
                  </div>
                  <div className="category-bar-bg">
                    <div 
                      className="category-bar-fill"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="summary-section">
            <div className="summary-grid">
              {/* Strengths */}
              {summary.overallStrengths && summary.overallStrengths.length > 0 && (
                <div className="summary-card strengths-card">
                  <h3>✓ Key Strengths</h3>
                  <ul>
                    {summary.overallStrengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to Improve */}
              {summary.areasToImprove && summary.areasToImprove.length > 0 && (
                <div className="summary-card improve-card">
                  <h3>📈 Areas to Improve</h3>
                  <ul>
                    {summary.areasToImprove.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Final Recommendation */}
            {summary.finalRecommendation && (
              <div className="recommendation-card">
                <h3>💡 Final Recommendation</h3>
                <p>{summary.finalRecommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* Question-by-Question Review */}
        <div className="questions-review">
          <h2>Question-by-Question Analysis</h2>
          <div className="questions-list">
            {session.responses.map((response, index) => {
              const question = response.questionId;
              if (!question) return null;

              return (
                <div key={response._id} className="question-review-item">
                  <div className="question-review-header">
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-meta">
                      <span className={`badge badge-${question.category.toLowerCase()}`}>
                        {question.category}
                      </span>
                      <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
                        {question.difficulty}
                      </span>
                      {response.score !== null && response.score !== undefined && (
                        <span 
                          className="score-badge-small"
                          style={{ backgroundColor: getScoreColor(response.score) }}
                        >
                          {response.score}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="question-content">
                    <h4>{question.question}</h4>
                    
                    {/* Video Playback */}
                    {response.audioURL && (
                      <div className="video-player-container">
                        <button 
                          className={`btn-play ${playingVideo === response._id ? 'playing' : ''}`}
                          onClick={() => handleVideoPlay(response._id)}
                        >
                          {playingVideo === response._id ? '⏸' : '▶'} 
                          {playingVideo === response._id ? ' Pause' : ' Play'} Video Answer
                        </button>
                        {playingVideo === response._id && (
                          <video 
                            src={`http://localhost:5000${response.audioURL}`}
                            controls 
                            autoPlay
                            className="video-element"
                            onEnded={() => setPlayingVideo(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* Transcription */}
                    <div className="answer-transcription">
                      <h5>Your Answer:</h5>
                      <p>{response.transcription || 'No answer recorded'}</p>
                    </div>

                    {/* Timestamp */}
                    {response.answeredAt && (
                      <div className="answer-timestamp">
                        Answered at: {new Date(response.answeredAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Career Advisor Section */}
        <div className="career-advisor-section">
          <div className="career-advisor-header">
            <h2>🎯 Career Guidance</h2>
            <p>Get personalized career advice based on your interview performance</p>
          </div>

          {!careerAdvice && !showCareerSection ? (
            <div className="career-advisor-cta">
              <button 
                className="btn btn-career-advisor"
                onClick={handleGenerateCareerAdvice}
                disabled={isGeneratingAdvice}
              >
                {isGeneratingAdvice ? (
                  <>
                    <div className="spinner-small"></div>
                    Generating Career Advice...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🎯</span>
                    Get Personalized Career Advice
                  </>
                )}
              </button>
              {adviceError && (
                <div className="advice-error">
                  ⚠️ {adviceError}
                  <button className="btn-retry" onClick={handleGenerateCareerAdvice}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : careerAdvice ? (
            <div className="career-advice-content">
              {/* Performance Summary */}
              {careerAdvice.interview_performance_summary && (
                <div className="advice-card performance-summary">
                  <h3>📊 Interview Performance Summary</h3>
                  <p>{careerAdvice.interview_performance_summary}</p>
                </div>
              )}

              {/* Career Paths */}
              {careerAdvice.career_paths && careerAdvice.career_paths.length > 0 && (
                <div className="advice-card career-paths">
                  <h3>🚀 Suggested Career Paths</h3>
                  <div className="career-paths-grid">
                    {careerAdvice.career_paths.map((path, idx) => (
                      <div key={idx} className="career-path-item">
                        <div className="path-header">
                          <h4>{path.title}</h4>
                          {path.match_score && (
                            <span className="match-score">{path.match_score}% Match</span>
                          )}
                        </div>
                        <p className="path-description">{path.description}</p>
                        <span className="path-timeline">Timeline: {path.timeline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {careerAdvice.strengths && careerAdvice.strengths.length > 0 && (
                <div className="advice-card strengths-card">
                  <h3>💪 Your Strengths</h3>
                  <div className="strengths-list">
                    {careerAdvice.strengths.map((strength, idx) => (
                      <div key={idx} className="strength-item">
                        <div className="strength-name">{strength.strength}</div>
                        <div className="strength-evidence">{strength.evidence}</div>
                        <div className="strength-leverage">
                          <strong>How to leverage:</strong> {strength.leverage_how}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to Develop */}
              {careerAdvice.skills_to_develop && careerAdvice.skills_to_develop.length > 0 && (
                <div className="advice-card skills-card">
                  <h3>📈 Skills to Develop</h3>
                  <div className="skills-list">
                    {careerAdvice.skills_to_develop.map((skill, idx) => (
                      <div key={idx} className={`skill-item priority-${skill.priority.toLowerCase()}`}>
                        <div className="skill-header">
                          <span className="skill-name">{skill.skill}</span>
                          <span className={`priority-badge priority-${skill.priority.toLowerCase()}`}>
                            {skill.priority} Priority
                          </span>
                        </div>
                        <p className="skill-reason">{skill.reason}</p>
                        {skill.learning_resources && skill.learning_resources.length > 0 && (
                          <div className="learning-resources">
                            <strong>Resources:</strong>
                            <ul>
                              {skill.learning_resources.map((resource, ridx) => (
                                <li key={ridx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Learning */}
              {careerAdvice.recommended_learning && careerAdvice.recommended_learning.length > 0 && (
                <div className="advice-card learning-card">
                  <h3>📚 Recommended Courses & Certifications</h3>
                  <div className="learning-grid">
                    {careerAdvice.recommended_learning.map((course, idx) => (
                      <div key={idx} className="learning-item">
                        <div className="course-name">{course.course_name}</div>
                        <div className="course-provider">Provider: {course.provider}</div>
                        <div className="course-timeline">Duration: {course.timeline}</div>
                        <div className="course-relevance">{course.relevance}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Timeline */}
              {careerAdvice.improvement_timeline && (
                <div className="advice-card timeline-card">
                  <h3>⏱️ Improvement Roadmap</h3>
                  <div className="timeline">
                    {careerAdvice.improvement_timeline['3_months'] && careerAdvice.improvement_timeline['3_months'].length > 0 && (
                      <div className="timeline-period">
                        <h4>Next 3 Months</h4>
                        <ul>
                          {careerAdvice.improvement_timeline['3_months'].map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {careerAdvice.improvement_timeline['6_months'] && careerAdvice.improvement_timeline['6_months'].length > 0 && (
                      <div className="timeline-period">
                        <h4>6 Months</h4>
                        <ul>
                          {careerAdvice.improvement_timeline['6_months'].map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {careerAdvice.improvement_timeline['12_months'] && careerAdvice.improvement_timeline['12_months'].length > 0 && (
                      <div className="timeline-period">
                        <h4>12 Months</h4>
                        <ul>
                          {careerAdvice.improvement_timeline['12_months'].map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Industry Insights */}
              {careerAdvice.industry_insights && careerAdvice.industry_insights.length > 0 && (
                <div className="advice-card insights-card">
                  <h3>🔍 Industry Insights</h3>
                  <div className="insights-list">
                    {careerAdvice.industry_insights.map((insight, idx) => (
                      <div key={idx} className="insight-item">
                        <div className="insight-text">{insight.insight}</div>
                        <div className="insight-impact">
                          <strong>Impact:</strong> {insight.impact}
                        </div>
                        <div className="insight-action">
                          <strong>Action:</strong> {insight.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="report-footer">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button className="btn btn-download" onClick={handleDownloadReport}>
            📄 Download Report
          </button>
          <button className="btn btn-primary" onClick={handleStartNewInterview}>
            🎤 Start New Interview
          </button>
        </div>

      </div>
    </div>
  );
}
