import React from 'react'
import './InterviewAvatar.css'

export default function InterviewAvatar({ isTalking, isListening, isThinking, currentQuestion }) {
  // Determine avatar state
  const getAvatarState = () => {
    if (isThinking) return 'thinking'
    if (isListening) return 'listening'
    if (isTalking) return 'talking'
    return 'idle'
  }

  const avatarState = getAvatarState()

  return (
    <div className="avatar-container" role="region" aria-label="Interview assistant">
      <div 
        className={`avatar ${avatarState}`}
        role="img"
        aria-label={`Interview avatar - currently ${avatarState}`}
      >
        {/* Avatar Face */}
        <div className="avatar-face" aria-hidden="true">
          {/* Eyes */}
          <div className="eyes">
            <div className="eye left-eye">
              <div className="pupil"></div>
              <div className="eyelid"></div>
            </div>
            <div className="eye right-eye">
              <div className="pupil"></div>
              <div className="eyelid"></div>
            </div>
          </div>
          
          {/* Mouth */}
          <div className="mouth">
            <div className="mouth-shape"></div>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="avatar-glow" aria-hidden="true"></div>

        {/* Audio waves for listening state */}
        {isListening && (
          <div className="audio-waves" aria-hidden="true">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
        )}

        {/* Loading dots for thinking state */}
        {isThinking && (
          <div className="thinking-dots" aria-hidden="true">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>
      
      {/* Speech bubble for current question */}
      {currentQuestion && (
        <div className="speech-bubble" role="alert" aria-live="polite">
          <p>{currentQuestion}</p>
          <div className="bubble-arrow" aria-hidden="true"></div>
        </div>
      )}

      {/* State indicator */}
      <div className="state-indicator" role="status" aria-live="polite">
        {isThinking && <span className="state-text">🤔 Analyzing your response...</span>}
        {isListening && <span className="state-text">👂 Listening...</span>}
        {isTalking && <span className="state-text">💬 Speaking...</span>}
      </div>
    </div>
  )
}
