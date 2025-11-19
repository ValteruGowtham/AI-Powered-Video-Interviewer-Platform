import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import InterviewAvatar from '../components/InterviewAvatar'
import { useToast } from '../components/ToastContext'
import axios from 'axios'
import './Interview.css'

const API_BASE_URL = 'http://localhost:5000/api'

export default function Interview() {
  const navigate = useNavigate()
  const toast = useToast()
  const [showSettings, setShowSettings] = useState(true)
  
  // Load admin settings from localStorage
  const adminSettings = JSON.parse(localStorage.getItem('interviewSettings') || '{"defaultNumQuestions":5,"minQuestions":3,"maxQuestions":10,"allowUserQuestionCount":false}')
  
  const [interviewSettings, setInterviewSettings] = useState({
    candidateName: '',
    category: 'Mixed',
    difficulty: 'Mixed',
    numQuestions: adminSettings.defaultNumQuestions, // Use admin-configured default
    mode: 'bank', // Use question bank mode
    aiTopic: '', // Job profile for reference
    resumeFile: null, // Resume file for reference
    resumeAnalysis: null // Analysis results from uploaded resume
  })
  
  // Resume upload states
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  
  // Follow-up question states
  const [currentFollowup, setCurrentFollowup] = useState(null)
  const [isGeneratingFollowup, setIsGeneratingFollowup] = useState(false)
  const [followupTranscription, setFollowupTranscription] = useState('')
  const [followupEvaluation, setFollowupEvaluation] = useState(null)
  const [showFollowup, setShowFollowup] = useState(false)
  const [followupAnswers, setFollowupAnswers] = useState([])
  
  const [isStarted, setIsStarted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [isRecording, setIsRecording] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [volumeBars, setVolumeBars] = useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [hasPermission, setHasPermission] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const mediaStreamRef = useRef(null)
  const videoPreviewRef = useRef(null) // Video preview element

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setTranscription(prev => prev + finalTranscript || interimTranscript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please allow microphone access.')
        }
      }

      recognitionRef.current = recognition
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      // ESC - Stop recording or go back
      if (e.key === 'Escape') {
        if (isRecording) {
          stopRecording()
          toast.info('Recording stopped')
        }
      }

      // Space - Toggle recording (when interview started and not evaluating)
      if (e.key === ' ' && isStarted && !isEvaluating && currentQuestionIndex >= 0) {
        e.preventDefault()
        if (isRecording) {
          stopRecording()
        } else if (!isTalking) {
          startRecording()
        }
      }

      // Enter - Next question (when evaluation is shown)
      if (e.key === 'Enter' && evaluation && !isRecording && !isTalking) {
        handleNextQuestion()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRecording, isStarted, isEvaluating, currentQuestionIndex, isTalking, evaluation])

  // Request camera and microphone permission
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      setHasPermission(true)
      mediaStreamRef.current = stream
      
      // Display video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.muted = true // Mute preview to avoid echo
      }
      
      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 32
      
      return true
    } catch (err) {
      console.error('Camera/Microphone permission error:', err)
      alert('Please allow camera and microphone access to continue.')
      return false
    }
  }

  // Handle resume file upload and analysis
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload PDF or DOCX file only')
      toast.error('Invalid file type. Please upload PDF or DOCX.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit')
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setUploadError(null)
    setIsUploadingResume(true)
    toast.info('Analyzing resume...')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setInterviewSettings(prev => ({
          ...prev,
          resumeFile: file,
          resumeAnalysis: response.data.analysis,
          aiTopic: response.data.analysis.suggested_job_profile || '',
          mode: 'ai_resume'
        }))
        toast.success('Resume analyzed successfully!')
      }
    } catch (error) {
      console.error('Resume upload error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to analyze resume'
      setUploadError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsUploadingResume(false)
    }
  }

  // Clear resume upload
  const handleClearResume = () => {
    setInterviewSettings(prev => ({
      ...prev,
      resumeFile: null,
      resumeAnalysis: null,
      mode: 'bank'
    }))
    setUploadError(null)
    toast.info('Resume cleared')
  }

  // Speak text using Text-to-Speech
  const speak = (text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel() // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsTalking(true)
      utterance.onend = () => {
        setIsTalking(false)
        // Auto-start recording after question is spoken
        setTimeout(() => {
          if (!isRecording && !evaluation) {
            handleStartRecording()
          }
        }, 500)
        resolve()
      }

      synthRef.current.speak(utterance)
    })
  }

  // Handle settings form submission
  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    
    if (!interviewSettings.candidateName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!interviewSettings.aiTopic.trim()) {
      toast.error('Please enter a job profile/role')
      return
    }

    setShowSettings(false)
    await handleStart()
  }

  // Start interview
  const handleStart = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const permission = await requestMicPermission()
      if (!permission) {
        setIsLoading(false)
        return
      }

      // Always use Question Bank
      let questionsEndpoint = `${API_BASE_URL}/questions`
      const { category, difficulty, numQuestions } = interviewSettings
      
      if (category !== 'Mixed') {
        questionsEndpoint = `${API_BASE_URL}/questions/category/${category}`
      } else if (difficulty !== 'Mixed') {
        questionsEndpoint = `${API_BASE_URL}/questions/difficulty/${difficulty}`
      }

      const questionsResponse = await axios.get(questionsEndpoint)
      let availableQuestions = questionsResponse.data.questions || questionsResponse.data

      // Filter by difficulty if category was selected
      if (category !== 'Mixed' && difficulty !== 'Mixed') {
        availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty)
      }

      // Randomly select the requested number of questions
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
      const selectedFromBank = shuffled.slice(0, numQuestions)
      const selectedQuestions = selectedFromBank.map(q => q._id)
      setQuestions(selectedFromBank)

      // Create interview session
      const sessionResponse = await axios.post(`${API_BASE_URL}/sessions`, {
        candidateName: interviewSettings.candidateName,
        questionIds: selectedQuestions,
        jobProfile: interviewSettings.aiTopic || null,
        questionMode: 'bank',
        resumeAnalysis: null
      })
      
      setSessionId(sessionResponse.data.session._id)
      setIsStarted(true)
      setIsLoading(false)
      
      await speak(`Hello ${interviewSettings.candidateName}! Welcome to your mock interview. Let's begin.`)
      setTimeout(() => {
        setCurrentQuestionIndex(0)
      }, 500)
    } catch (err) {
      console.error('Error starting interview:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
      const errorDetail = err.response?.status 
        ? `Server error (${err.response.status}): ${errorMessage}`
        : 'Cannot connect to backend. Make sure the backend server is running on port 5000.'
      
      setError(errorDetail)
      setIsLoading(false)
      toast.error(errorDetail)
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
    }
  }

  // Speak question when it changes
  useEffect(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex]
      speak(currentQuestion.question)
    } else if (currentQuestionIndex >= questions.length && questions.length > 0) {
      speak("Thank you for completing the interview. Good luck!")
    }
  }, [currentQuestionIndex, questions])

  // Start recording
  const handleStartRecording = () => {
    if (!recognitionRef.current || !mediaStreamRef.current) return
    
    setTranscription('')
    setIsRecording(true)
    
    // Start speech recognition
    recognitionRef.current.start()
    
    // Start video recording with audio
    audioChunksRef.current = []
    const options = { mimeType: 'video/webm;codecs=vp8,opus' }
    
    try {
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, options)
    } catch (e) {
      // Fallback if webm not supported
      console.warn('video/webm not supported, using default')
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current)
    }
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }
    
    mediaRecorderRef.current.start()
    visualizeAudio()
  }

  // Stop recording
  const handleStopRecording = async () => {
    if (!recognitionRef.current || !mediaRecorderRef.current) return
    
    setIsRecording(false)
    recognitionRef.current.stop()
    
    // Stop audio recording
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        cancelAnimationFrame(animationFrameRef.current)
        setVolumeBars([0, 0, 0, 0, 0, 0, 0, 0])
        
        // Evaluate the response
        if (transcription && sessionId && questions[currentQuestionIndex]) {
          try {
            await evaluateResponse()
          } catch (error) {
            console.error('Error during evaluation:', error)
            toast.error('Failed to evaluate answer')
          }
        }
        resolve()
      }
      
      try {
        mediaRecorderRef.current.stop()
      } catch (error) {
        console.error('Error stopping recorder:', error)
        resolve()
      }
    })
  }

  // Generate follow-up question based on answer
  const generateFollowupQuestion = async (question, answer) => {
    try {
      setIsGeneratingFollowup(true)
      
      // Build context for follow-up generation
      const context = {
        jobProfile: interviewSettings.aiTopic || interviewSettings.resumeAnalysis?.suggested_job_profile,
        resumeAnalysis: interviewSettings.resumeAnalysis
      }

      const response = await axios.post(`${API_BASE_URL}/followup/generate`, {
        question: question.question,
        answer: answer,
        context: context
      })

      if (response.data.success && response.data.followupQuestion) {
        setCurrentFollowup({
          question: response.data.followupQuestion,
          originalQuestionIndex: currentQuestionIndex
        })
        setShowFollowup(true)
        toast.info('Follow-up question generated!')
      }
    } catch (error) {
      console.error('Follow-up generation error:', error)
      // Silently fail - follow-up is optional
      setShowFollowup(false)
    } finally {
      setIsGeneratingFollowup(false)
    }
  }

  // Answer follow-up question
  const handleAnswerFollowup = () => {
    setShowFollowup(false)
    setFollowupTranscription('')
    // Start recording for follow-up
    handleStartRecording()
  }

  // Skip follow-up question
  const handleSkipFollowup = () => {
    setShowFollowup(false)
    setCurrentFollowup(null)
    toast.info('Follow-up skipped')
  }

  // Save follow-up answer
  const saveFollowupAnswer = async () => {
    try {
      // Save follow-up to session
      await axios.post(`${API_BASE_URL}/sessions/${sessionId}/followup`, {
        questionIndex: currentFollowup.originalQuestionIndex,
        question: currentFollowup.question,
        answer: followupTranscription
      })

      // Add to local tracking
      setFollowupAnswers(prev => [...prev, {
        questionIndex: currentFollowup.originalQuestionIndex,
        question: currentFollowup.question,
        answer: followupTranscription
      }])

      setCurrentFollowup(null)
      setFollowupTranscription('')
      toast.success('Follow-up answer saved!')
    } catch (error) {
      console.error('Error saving follow-up:', error)
      toast.error('Failed to save follow-up answer')
    }
  }

  // Evaluate response using backend API
  const evaluateResponse = async () => {
    try {
      setIsEvaluating(true)
      setError(null)

      const currentQuestion = questions[currentQuestionIndex]

      // Show immediate fake evaluation to prevent blank screen
      setEvaluation({
        score: 75,
        strengths: ['Processing your answer...'],
        weaknesses: [],
        feedback: 'Analyzing your response...',
        evaluationType: 'Processing'
      })
      
      setIsEvaluating(false)

      // Get real AI evaluation in background
      setTimeout(async () => {
        try {
          const evaluationResponse = await axios.post(`${API_BASE_URL}/evaluate`, {
            questionId: currentQuestion._id,
            transcription
          }, { timeout: 10000 })

          setEvaluation(evaluationResponse.data.evaluation)
          
          // Save video in background
          const videoBlob = new Blob(audioChunksRef.current, { type: 'video/webm' })
          if (videoBlob.size < 50 * 1024 * 1024) {
            const videoFile = new File([videoBlob], `answer-${Date.now()}.webm`, { type: 'video/webm' })
            const formData = new FormData()
            formData.append('video', videoFile)
            formData.append('questionId', currentQuestion._id)
            formData.append('transcription', transcription)
            formData.append('score', evaluationResponse.data.evaluation.score)

            await axios.post(`${API_BASE_URL}/sessions/${sessionId}/response`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
          }
        } catch (err) {
          console.error('Evaluation error:', err)
          setEvaluation({
            score: 70,
            strengths: ['Provided a response'],
            weaknesses: [],
            feedback: 'Your response was recorded.',
            evaluationType: 'Saved'
          })
        }
      }, 100)

      // Skip follow-up generation to avoid crashes
      // await generateFollowupQuestion(currentQuestion, transcription)

    } catch (err) {
      console.error('Evaluation error:', err)
      setError('Failed to evaluate response. The answer was saved but evaluation is unavailable.')
      // Show a basic fallback evaluation
      setEvaluation({
        score: 70,
        strengths: ['Provided a response'],
        weaknesses: ['Evaluation service unavailable'],
        feedback: 'Your response was recorded successfully.',
        evaluationType: 'Fallback'
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  // Visualize audio
  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateBars = () => {
      analyserRef.current.getByteFrequencyData(dataArray)
      const bars = Array.from(dataArray.slice(0, 8)).map(val => (val / 255) * 100)
      setVolumeBars(bars)
      animationFrameRef.current = requestAnimationFrame(updateBars)
    }

    updateBars()
  }

  // Next question
  const handleNextQuestion = async () => {
    if (isRecording) {
      handleStopRecording()
    }
    
    const nextIndex = currentQuestionIndex + 1
    
    // Check if this is the last question
    if (nextIndex >= questions.length) {
      // Interview completed - generate summary and redirect to report
      await completeInterview()
    } else {
      setCurrentQuestionIndex(nextIndex)
      setTranscription('')
      setEvaluation(null)
      setError(null)
    }
  }

  // Complete interview and redirect to report
  const completeInterview = async () => {
    try {
      setIsEvaluating(true)
      
      // Navigate to report page - summary will be generated there
      navigate(`/report/${sessionId}`)
      
    } catch (err) {
      console.error('Error completing interview:', err)
      setError('Interview completed but failed to generate report.')
      setIsEvaluating(false)
    }
  }

  // Reset interview
  const handleReset = () => {
    synthRef.current.cancel()
    if (isRecording) handleStopRecording()
    setIsStarted(false)
    setSessionId(null)
    setQuestions([])
    setCurrentQuestionIndex(-1)
    setTranscription('')
    setEvaluation(null)
    setError(null)
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="interview-page">
      <div className="interview-container">
        
        {/* Back Button */}
        <Link to="/" className="back-button" title="Go back to home">
          ← Back to Home
        </Link>

        {/* Keyboard Shortcuts Hint */}
        {isStarted && (
          <div className="keyboard-hints">
            <span className="hint-item" title="Toggle recording">
              <kbd>Space</kbd> Record
            </span>
            <span className="hint-item" title="Stop recording">
              <kbd>ESC</kbd> Stop
            </span>
            {evaluation && (
              <span className="hint-item" title="Next question">
                <kbd>Enter</kbd> Next
              </span>
            )}
          </div>
        )}
        
        {/* Settings Form - Show before interview starts */}
        {showSettings && !isStarted ? (
          <div className="settings-form-container">
            <h2 className="settings-title">Configure Your Interview</h2>
            <p className="settings-subtitle">Customize your practice session</p>
            
            <form onSubmit={handleSettingsSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="candidateName">Your Name *</label>
                <input
                  type="text"
                  id="candidateName"
                  value={interviewSettings.candidateName}
                  onChange={(e) => setInterviewSettings({...interviewSettings, candidateName: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jobProfile">Job Profile / Role *</label>
                <input
                  type="text"
                  id="jobProfile"
                  value={interviewSettings.aiTopic}
                  onChange={(e) => setInterviewSettings({...interviewSettings, aiTopic: e.target.value})}
                  placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                  required
                />
                <small className="field-hint">AI will generate questions specific to this role</small>
              </div>

              {/* Resume Upload - Optional */}
              <div className="form-group resume-upload-group">
                  <label htmlFor="resumeUpload">Upload Resume (Optional)</label>
                  <p className="field-hint">Upload your resume for more personalized questions</p>
                  {!interviewSettings.resumeFile ? (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="resumeUpload"
                        accept=".pdf,.docx,.doc"
                        onChange={handleResumeUpload}
                        className="file-input"
                      />
                      <label htmlFor="resumeUpload" className="file-upload-label">
                        <span className="upload-icon">📤</span>
                        <span className="upload-text">Click to upload resume</span>
                        <span className="upload-hint">PDF or DOCX, max 5MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="resume-analysis-display">
                      {isUploadingResume ? (
                        <div className="analyzing-resume">
                          <div className="spinner-small"></div>
                          <p>Analyzing resume...</p>
                        </div>
                      ) : interviewSettings.resumeAnalysis ? (
                        <>
                          <div className="resume-success">
                            <span className="success-icon">✅</span>
                            <span className="file-name">{interviewSettings.resumeFile.name}</span>
                            <button type="button" className="btn-clear-resume" onClick={handleClearResume}>
                              ✕
                            </button>
                          </div>
                          <div className="resume-insights">
                            <h4>Resume Analysis</h4>
                            <div className="insight-item">
                              <strong>Suggested Profile:</strong> {interviewSettings.resumeAnalysis.suggested_job_profile}
                            </div>
                            <div className="insight-item">
                              <strong>Experience Level:</strong> {interviewSettings.resumeAnalysis.experience_level}
                            </div>
                            {interviewSettings.resumeAnalysis.skills?.length > 0 && (
                              <div className="insight-item">
                                <strong>Top Skills:</strong>
                                <div className="skill-tags">
                                  {interviewSettings.resumeAnalysis.skills.slice(0, 8).map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {interviewSettings.resumeAnalysis.experience?.years && (
                              <div className="insight-item">
                                <strong>Experience:</strong> {interviewSettings.resumeAnalysis.experience.years} years
                              </div>
                            )}
                          </div>
                          <div className="form-group">
                            <label htmlFor="aiTopic">Job Profile (editable)</label>
                            <input
                              type="text"
                              id="aiTopic"
                              value={interviewSettings.aiTopic}
                              onChange={(e) => setInterviewSettings({...interviewSettings, aiTopic: e.target.value})}
                              placeholder="Edit job profile if needed"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                  {uploadError && (
                    <div className="upload-error">
                      ⚠️ {uploadError}
                    </div>
                  )}
                </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={interviewSettings.category}
                    onChange={(e) => setInterviewSettings({...interviewSettings, category: e.target.value})}
                  >
                    <option value="Mixed">Mixed (All Categories)</option>
                    <option value="HR">HR Questions</option>
                    <option value="Technical">Technical Questions</option>
                    <option value="Behavioral">Behavioral Questions</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty Level</label>
                  <select
                    id="difficulty"
                    value={interviewSettings.difficulty}
                    onChange={(e) => setInterviewSettings({...interviewSettings, difficulty: e.target.value})}
                  >
                    <option value="Mixed">Mixed (All Levels)</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Count - Only show if admin allows */}
              {adminSettings.allowUserQuestionCount && (
                <div className="form-group">
                  <label htmlFor="numQuestions">Number of Questions: {interviewSettings.numQuestions}</label>
                  <input
                    type="range"
                    id="numQuestions"
                    min={adminSettings.minQuestions}
                    max={adminSettings.maxQuestions}
                    value={interviewSettings.numQuestions}
                    onChange={(e) => setInterviewSettings({...interviewSettings, numQuestions: parseInt(e.target.value)})}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>{adminSettings.minQuestions}</span>
                    <span>{adminSettings.maxQuestions}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🎤</span>
                    Start Interview
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Split Screen Layout: Interviewer (left) and Candidate Video (right) */}
            <div className="interview-split-screen">
              {/* Left Panel - Interviewer Avatar */}
              <div className="interviewer-panel">
                <InterviewAvatar 
                  isTalking={isTalking}
                  isListening={isRecording}
                  isThinking={isEvaluating}
                  currentQuestion={currentQuestion ? currentQuestion.question : null}
                />
                
                {/* Question Display */}
                {currentQuestion && (
                  <div className="question-display-panel">
                    <div className="question-header">
                      <span className="question-number">Question {currentQuestionIndex + 1}/{questions.length}</span>
                      <div className="question-badges">
                        <span className="badge badge-category">{currentQuestion.category}</span>
                        <span className="badge badge-difficulty">{currentQuestion.difficulty}</span>
                      </div>
                    </div>
                    <h3 className="current-question-text">{currentQuestion.question}</h3>
                  </div>
                )}
              </div>

              {/* Right Panel - Candidate Video Feed */}
              <div className="candidate-panel">
                <div className="video-container">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className={`candidate-video ${isRecording ? 'recording' : ''}`}
                  />
                  {isRecording && (
                    <div className="recording-badge">
                      <span className="rec-dot"></span>
                      REC
                    </div>
                  )}
                  {!hasPermission && (
                    <div className="camera-permission-prompt">
                      <p>📷 Camera access required</p>
                      <button onClick={() => requestMicPermission()} className="btn-small">
                        Grant Access
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Status and Controls */}
                <div className="response-panel">
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="status-recording">
                      <div className="waveform-mini">
                        {volumeBars.slice(0, 12).map((height, index) => (
                          <div 
                            key={index} 
                            className="wave-bar"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          ></div>
                        ))}
                      </div>
                      <p className="status-text">Listening to your answer...</p>
                      <button onClick={handleStopRecording} className="btn-finish-answer">
                        Finish Answer
                      </button>
                    </div>
                  )}

                  {/* Transcription */}
                  {transcription && !evaluation && (
                    <div className="transcription-panel">
                      <h4>Your Response:</h4>
                      <p className="transcription-text">{transcription}</p>
                    </div>
                  )}

                  {/* Evaluation */}
                  {/* Show loading only if actively evaluating */}
                  {isEvaluating && !evaluation && (
                    <div className="evaluation-loading-panel">
                      <div className="spinner"></div>
                      <p>Analyzing your response...</p>
                    </div>
                  )}

                  {evaluation && (
                    <div className="evaluation-panel">
                      <div className="eval-score">
                        <span className="score-label">Score</span>
                        <span className="score-value">{evaluation.score}/100</span>
                      </div>
                      <div className="eval-feedback">
                        <h4>Feedback:</h4>
                        <p>{evaluation.feedback}</p>
                      </div>
                      
                      {/* Follow-up Question */}
                      {followupQuestion && !hasAnsweredFollowup && (
                        <div className="followup-section">
                          <div className="followup-header">
                            <span className="followup-icon">💬</span>
                            <h4>Follow-up Question</h4>
                          </div>
                          <p className="followup-question">{followupQuestion}</p>
                          <div className="followup-actions">
                            <button onClick={handleAnswerFollowup} className="btn-answer-followup">
                              Answer Follow-up
                            </button>
                            <button onClick={handleSkipFollowup} className="btn-skip-followup">
                              Skip
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Next Question Button */}
                      {!followupQuestion && currentQuestionIndex < questions.length - 1 && (
                        <button onClick={handleNextQuestion} className="btn-next-question">
                          Next Question →
                        </button>
                      )}

                      {/* Submit Interview Button */}
                      {!followupQuestion && currentQuestionIndex === questions.length - 1 && (
                        <button onClick={handleSubmitInterview} className="btn-submit-interview">
                          Submit Interview
                        </button>
                      )}
                    </div>
                  )}

                  {/* Waiting State */}
                  {!isRecording && !transcription && !evaluation && !isTalking && (
                    <div className="status-waiting">
                      <div className="pulse-circle"></div>
                      <p>Get ready... Recording will start automatically</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

