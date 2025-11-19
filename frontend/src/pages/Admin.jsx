import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Admin.css'

const API_BASE_URL = 'http://localhost:5000/api'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('questions')
  const [questions, setQuestions] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Question Bank States
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterSource, setFilterSource] = useState('All') // New: AI/Manual filter
  const [searchTerm, setSearchTerm] = useState('')
  
  // Question Form States
  const [questionForm, setQuestionForm] = useState({
    question: '',
    category: 'HR',
    difficulty: 'Medium',
    keywords: ''
  })

  // AI Generator States
  const [aiGeneratorForm, setAiGeneratorForm] = useState({
    topic: '',
    category: 'Mixed',
    difficulty: 'Mixed',
    count: 5
  })
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  // Session Detail State
  const [selectedSession, setSelectedSession] = useState(null)

  // Settings States - Load from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('interviewSettings')
    return saved ? JSON.parse(saved) : {
      defaultNumQuestions: 5,
      minQuestions: 3,
      maxQuestions: 10,
      allowUserQuestionCount: false
    }
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/questions`)
      setQuestions(response.data.questions)
    } catch (err) {
      setError('Failed to fetch questions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/sessions`)
      setSessions(response.data.sessions)
    } catch (err) {
      setError('Failed to fetch sessions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions()
    } else if (activeTab === 'sessions') {
      fetchSessions()
    }
  }, [activeTab])

  // Add or Update Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...questionForm,
        keywords: questionForm.keywords.split(',').map(k => k.trim()).filter(k => k)
      }

      if (editingQuestion) {
        await axios.put(`${API_BASE_URL}/questions/${editingQuestion._id}`, data)
      } else {
        await axios.post(`${API_BASE_URL}/questions`, data)
      }

      setShowQuestionModal(false)
      setEditingQuestion(null)
      setQuestionForm({ question: '', category: 'HR', difficulty: 'Medium', keywords: '' })
      fetchQuestions()
    } catch (err) {
      alert('Failed to save question: ' + err.message)
    }
  }

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    try {
      await axios.delete(`${API_BASE_URL}/questions/${id}`)
      fetchQuestions()
    } catch (err) {
      alert('Failed to delete question: ' + err.message)
    }
  }

  // Edit Question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setQuestionForm({
      question: question.question,
      category: question.category,
      difficulty: question.difficulty,
      keywords: question.keywords.join(', ')
    })
    setShowQuestionModal(true)
  }

  // Open Add Modal
  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({ question: '', category: 'HR', difficulty: 'Medium', keywords: '' })
    setShowQuestionModal(true)
  }

  // AI Question Generation Functions
  const handleGenerateAIQuestions = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    setGenerateError(null)
    setGeneratedQuestions([])

    try {
      const response = await axios.post(`${API_BASE_URL}/ai-questions/generate`, aiGeneratorForm)
      setGeneratedQuestions(response.data.questions)
    } catch (err) {
      setGenerateError(err.response?.data?.message || 'Failed to generate questions. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveGeneratedQuestion = async (question, index) => {
    try {
      await axios.post(`${API_BASE_URL}/ai-questions/save`, {
        questions: [question]
      })
      
      // Remove from generated list
      setGeneratedQuestions(prev => prev.filter((_, i) => i !== index))
      
      // Refresh question bank
      fetchQuestions()
      
      alert('Question added to bank successfully!')
    } catch (err) {
      alert('Failed to save question: ' + err.message)
    }
  }

  const handleRegenerateQuestion = async (index) => {
    try {
      const question = generatedQuestions[index]
      const response = await axios.post(`${API_BASE_URL}/ai-questions/regenerate`, {
        topic: aiGeneratorForm.topic,
        difficulty: question.difficulty,
        category: question.category,
        originalQuestion: question.question
      })

      // Replace the question at the index
      setGeneratedQuestions(prev => {
        const newQuestions = [...prev]
        newQuestions[index] = response.data.question
        return newQuestions
      })
    } catch (err) {
      alert('Failed to regenerate question: ' + err.message)
    }
  }

  const handleDiscardQuestion = (index) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveAllGenerated = async () => {
    if (generatedQuestions.length === 0) return

    try {
      await axios.post(`${API_BASE_URL}/ai-questions/save`, {
        questions: generatedQuestions
      })
      
      setGeneratedQuestions([])
      fetchQuestions()
      
      alert(`Successfully added ${generatedQuestions.length} questions to the bank!`)
    } catch (err) {
      alert('Failed to save questions: ' + err.message)
    }
  }

  // Filter Questions
  const filteredQuestions = questions.filter(q => {
    const matchesCategory = filterCategory === 'All' || q.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty
    const matchesSource = filterSource === 'All' || 
      (filterSource === 'AI' && q.isAIGenerated) ||
      (filterSource === 'Manual' && !q.isAIGenerated)
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesDifficulty && matchesSource && matchesSearch
  })

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Admin Panel</h1>
          <p>Manage interview questions and view sessions</p>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            📚 Question Bank
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai-generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-generator')}
          >
            🤖 AI Generator
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            📊 Interview Sessions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Error Display */}
        {error && <div className="error-banner">{error}</div>}

        {/* Question Bank Tab */}
        {activeTab === 'questions' && (
          <div className="tab-content">
            <div className="content-header">
              <div className="filters">
                <input 
                  type="text"
                  placeholder="🔍 Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option>All</option>
                  <option>HR</option>
                  <option>Technical</option>
                  <option>Behavioral</option>
                </select>
                <select 
                  value={filterDifficulty} 
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="filter-select"
                >
                  <option>All</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <select 
                  value={filterSource} 
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="filter-select"
                >
                  <option>All</option>
                  <option>AI</option>
                  <option>Manual</option>
                </select>
              </div>
              <button className="btn-add" onClick={handleAddQuestion}>
                + Add Question
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading questions...</div>
            ) : (
              <div className="questions-grid">
                {filteredQuestions.map(q => (
                  <div key={q._id} className="question-card">
                    <div className="card-header">
                      <span className={`badge badge-${q.category.toLowerCase()}`}>
                        {q.category}
                      </span>
                      <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                        {q.difficulty}
                      </span>
                      <span className={`badge ${q.isAIGenerated ? 'badge-ai' : 'badge-manual'}`}>
                        {q.isAIGenerated ? '🤖 AI' : '✍️ Manual'}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="question-text">{q.question}</p>
                      <div className="keywords">
                        {q.keywords.map((kw, idx) => (
                          <span key={idx} className="keyword-tag">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => handleEditQuestion(q)} className="btn-edit">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteQuestion(q._id)} className="btn-delete">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredQuestions.length === 0 && !loading && (
              <div className="empty-state">No questions found</div>
            )}
          </div>
        )}

        {/* AI Generator Tab */}
        {activeTab === 'ai-generator' && (
          <div className="tab-content">
            <div className="ai-generator-section">
              <div className="generator-header">
                <h2>🤖 AI Question Generator</h2>
                <p>Generate contextual interview questions using AI for specific roles and topics</p>
              </div>

              <form onSubmit={handleGenerateAIQuestions} className="generator-form">
                <div className="form-group-ai">
                  <label htmlFor="topic">Job Role / Topic *</label>
                  <input
                    type="text"
                    id="topic"
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Scientist"
                    value={aiGeneratorForm.topic}
                    onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, topic: e.target.value})}
                    required
                    className="topic-input"
                  />
                  <small>Enter the job role or specific topic for which you want to generate questions</small>
                </div>

                <div className="form-row-ai">
                  <div className="form-group-ai">
                    <label htmlFor="ai-category">Category</label>
                    <select
                      id="ai-category"
                      value={aiGeneratorForm.category}
                      onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, category: e.target.value})}
                    >
                      <option value="Mixed">Mixed (All Types)</option>
                      <option value="HR">HR Questions</option>
                      <option value="Technical">Technical Questions</option>
                      <option value="Behavioral">Behavioral Questions</option>
                    </select>
                  </div>

                  <div className="form-group-ai">
                    <label htmlFor="ai-difficulty">Difficulty</label>
                    <select
                      id="ai-difficulty"
                      value={aiGeneratorForm.difficulty}
                      onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, difficulty: e.target.value})}
                    >
                      <option value="Mixed">Mixed Levels</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group-ai">
                    <label htmlFor="ai-count">Number of Questions: {aiGeneratorForm.count}</label>
                    <input
                      type="range"
                      id="ai-count"
                      min="1"
                      max="10"
                      value={aiGeneratorForm.count}
                      onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, count: parseInt(e.target.value)})}
                      className="count-slider"
                    />
                    <div className="slider-labels">
                      <span>1</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-generate"
                  disabled={isGenerating || !aiGeneratorForm.topic.trim()}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Questions
                    </>
                  )}
                </button>
              </form>

              {generateError && (
                <div className="error-banner generate-error">
                  ⚠️ {generateError}
                  <button onClick={() => setGenerateError(null)} className="close-error">×</button>
                </div>
              )}

              {generatedQuestions.length > 0 && (
                <div className="generated-questions-section">
                  <div className="generated-header">
                    <h3>Generated Questions ({generatedQuestions.length})</h3>
                    <button className="btn-save-all" onClick={handleSaveAllGenerated}>
                      💾 Save All to Bank
                    </button>
                  </div>

                  <div className="generated-questions-grid">
                    {generatedQuestions.map((q, index) => (
                      <div key={index} className="generated-question-card">
                        <div className="card-header">
                          <span className={`badge badge-${q.category.toLowerCase()}`}>
                            {q.category}
                          </span>
                          <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                            {q.difficulty}
                          </span>
                          <span className="badge badge-ai">
                            🤖 AI Generated
                          </span>
                        </div>

                        <div className="card-body">
                          <p className="question-text">{q.question}</p>
                          
                          {q.keywords && q.keywords.length > 0 && (
                            <div className="keywords">
                              <strong>Keywords:</strong>
                              {q.keywords.map((kw, idx) => (
                                <span key={idx} className="keyword-tag">{kw}</span>
                              ))}
                            </div>
                          )}

                          {q.generatedFor && (
                            <div className="generated-for">
                              <small>Generated for: <strong>{q.generatedFor}</strong></small>
                            </div>
                          )}
                        </div>

                        <div className="card-actions">
                          <button 
                            className="btn-action btn-save"
                            onClick={() => handleSaveGeneratedQuestion(q, index)}
                            title="Add to question bank"
                          >
                            ✓ Add to Bank
                          </button>
                          <button 
                            className="btn-action btn-regenerate"
                            onClick={() => handleRegenerateQuestion(index)}
                            title="Regenerate this question"
                          >
                            🔄 Regenerate
                          </button>
                          <button 
                            className="btn-action btn-discard"
                            onClick={() => handleDiscardQuestion(index)}
                            title="Discard this question"
                          >
                            ✕ Discard
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isGenerating && generatedQuestions.length === 0 && !generateError && (
                <div className="empty-state">
                  <div className="empty-icon">🤖</div>
                  <h3>Generate AI-Powered Questions</h3>
                  <p>Enter a job role or topic above and click "Generate Questions" to get started.</p>
                  <p className="tip">💡 Tip: Be specific with your topic for better results!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Interview Sessions ({sessions.length})</h2>
            </div>

            {loading ? (
              <div className="loading">Loading sessions...</div>
            ) : (
              <div className="sessions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Date</th>
                      <th>Questions</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(session => (
                      <tr key={session._id}>
                        <td>{session.candidateName}</td>
                        <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                        <td>{session.responses.length}/{session.questions.length}</td>
                        <td>
                          {session.overallScore !== null ? (
                            <span className="score-badge">{session.overallScore}/100</span>
                          ) : (
                            <span className="status-incomplete">In Progress</span>
                          )}
                        </td>
                        <td>
                          {session.completedAt ? (
                            <span className="status-complete">Completed</span>
                          ) : (
                            <span className="status-incomplete">Incomplete</span>
                          )}
                        </td>
                        <td>
                          <button 
                            onClick={() => setSelectedSession(session)}
                            className="btn-view"
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sessions.length === 0 && !loading && (
              <div className="empty-state">No sessions found</div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-placeholder">
              <h2>📈 Analytics Dashboard</h2>
              <p>Coming soon: Interview statistics, trends, and insights</p>
              <ul>
                <li>Average scores by category</li>
                <li>Most common questions</li>
                <li>Candidate performance trends</li>
                <li>Keyword analysis</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setShowQuestionModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSaveQuestion}>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea 
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                  required
                  rows={4}
                  placeholder="Enter the interview question..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                  >
                    <option>HR</option>
                    <option>Technical</option>
                    <option>Behavioral</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty *</label>
                  <select 
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input 
                  type="text"
                  value={questionForm.keywords}
                  onChange={(e) => setQuestionForm({...questionForm, keywords: e.target.value})}
                  placeholder="e.g., leadership, teamwork, communication"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Interview Session Details</h2>
              <button onClick={() => setSelectedSession(null)} className="btn-close">×</button>
            </div>
            <div className="session-details">
              <div className="session-info">
                <p><strong>Candidate:</strong> {selectedSession.candidateName}</p>
                <p><strong>Date:</strong> {new Date(selectedSession.createdAt).toLocaleString()}</p>
                <p><strong>Overall Score:</strong> {selectedSession.overallScore || 'N/A'}/100</p>
                <p><strong>Status:</strong> {selectedSession.completedAt ? 'Completed' : 'In Progress'}</p>
              </div>

              <h3>Questions & Responses</h3>
              <div className="responses-list">
                {selectedSession.questions.map((q, idx) => {
                  const response = selectedSession.responses.find(r => 
                    r.questionId?._id === q._id || r.questionId === q._id
                  )
                  return (
                    <div key={idx} className="response-item">
                      <div className="response-header">
                        <h4>Q{idx + 1}: {q.question}</h4>
                        <div className="response-badges">
                          <span className={`badge badge-${q.category.toLowerCase()}`}>{q.category}</span>
                          {response?.score !== null && response?.score !== undefined && (
                            <span className="score-badge">{response.score}/100</span>
                          )}
                        </div>
                      </div>
                      {response ? (
                        <div className="response-content">
                          <p><strong>Answer:</strong> {response.transcription}</p>
                          {response.answeredAt && (
                            <p className="timestamp">
                              Answered: {new Date(response.answeredAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="no-response">Not answered yet</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedSession.feedback?.summary && (
                <div className="feedback-section">
                  <h3>Overall Feedback</h3>
                  <p>{selectedSession.feedback.summary}</p>
                  {selectedSession.feedback.strengths?.length > 0 && (
                    <div>
                      <strong>Strengths:</strong>
                      <ul>
                        {selectedSession.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedSession.feedback.weaknesses?.length > 0 && (
                    <div>
                      <strong>Areas for Improvement:</strong>
                      <ul>
                        {selectedSession.feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  onClick={() => alert('PDF export feature coming soon!')}
                  className="btn-export"
                >
                  📄 Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="tab-content">
          <div className="settings-container">
            <h2>⚙️ Interview Configuration</h2>
            <p className="settings-subtitle">Configure default interview settings</p>

            {settingsSaved && (
              <div className="success-message">
                ✅ Settings saved successfully!
              </div>
            )}

            <div className="settings-form">
              <div className="setting-card">
                <div className="setting-header">
                  <h3>📝 Question Count Settings</h3>
                  <p>Control how many questions are presented in each interview</p>
                </div>

                <div className="setting-field">
                  <label htmlFor="defaultNumQuestions">
                    Default Number of Questions
                    <span className="label-hint">This will be used for all new interviews</span>
                  </label>
                  <div className="slider-container">
                    <input
                      type="range"
                      id="defaultNumQuestions"
                      min={settings.minQuestions}
                      max={settings.maxQuestions}
                      value={settings.defaultNumQuestions}
                      onChange={(e) => setSettings({...settings, defaultNumQuestions: parseInt(e.target.value)})}
                      className="range-slider"
                    />
                    <div className="slider-value">{settings.defaultNumQuestions} questions</div>
                  </div>
                  <div className="range-labels">
                    <span>{settings.minQuestions}</span>
                    <span>{settings.maxQuestions}</span>
                  </div>
                </div>

                <div className="setting-field">
                  <label htmlFor="minQuestions">Minimum Questions</label>
                  <input
                    type="number"
                    id="minQuestions"
                    min="1"
                    max="5"
                    value={settings.minQuestions}
                    onChange={(e) => setSettings({...settings, minQuestions: parseInt(e.target.value)})}
                    className="number-input"
                  />
                </div>

                <div className="setting-field">
                  <label htmlFor="maxQuestions">Maximum Questions</label>
                  <input
                    type="number"
                    id="maxQuestions"
                    min="5"
                    max="20"
                    value={settings.maxQuestions}
                    onChange={(e) => setSettings({...settings, maxQuestions: parseInt(e.target.value)})}
                    className="number-input"
                  />
                </div>

                <div className="setting-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.allowUserQuestionCount}
                      onChange={(e) => setSettings({...settings, allowUserQuestionCount: e.target.checked})}
                    />
                    <span>Allow users to choose question count</span>
                    <span className="label-hint">If disabled, the default count will always be used</span>
                  </label>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <h3>ℹ️ Current Configuration</h3>
                </div>
                <div className="config-summary">
                  <div className="config-item">
                    <span className="config-label">Default Questions:</span>
                    <span className="config-value">{settings.defaultNumQuestions}</span>
                  </div>
                  <div className="config-item">
                    <span className="config-label">Question Range:</span>
                    <span className="config-value">{settings.minQuestions} - {settings.maxQuestions}</span>
                  </div>
                  <div className="config-item">
                    <span className="config-label">User Selection:</span>
                    <span className="config-value">{settings.allowUserQuestionCount ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  onClick={() => {
                    // Save to localStorage for now (later can be saved to backend)
                    localStorage.setItem('interviewSettings', JSON.stringify(settings))
                    setSettingsSaved(true)
                    setTimeout(() => setSettingsSaved(false), 3000)
                  }}
                  className="btn-save-settings"
                >
                  💾 Save Settings
                </button>
                <button 
                  onClick={() => {
                    setSettings({
                      defaultNumQuestions: 5,
                      minQuestions: 3,
                      maxQuestions: 10,
                      allowUserQuestionCount: false
                    })
                  }}
                  className="btn-reset-settings"
                >
                  🔄 Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
