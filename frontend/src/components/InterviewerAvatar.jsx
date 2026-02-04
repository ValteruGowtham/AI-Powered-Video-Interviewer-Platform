import React from 'react';
import './InterviewerAvatar.css';

export default function InterviewerAvatar({ isTalking, isListening, isThinking }) {
  const isSpeaking = isTalking;
  
  return (
    <div className="interviewer-avatar-container">
      <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''} ${isThinking ? 'thinking' : ''}`}>
        {/* Professional interviewer illustration */}
        <div className="avatar-circle">
          <div className="avatar-face">
            {/* Head */}
            <div className="head">
              {/* Hair */}
              <div className="hair"></div>
              
              {/* Face */}
              <div className="face">
                {/* Eyes */}
                <div className="eyes">
                  <div className="eye left-eye">
                    <div className="pupil"></div>
                  </div>
                  <div className="eye right-eye">
                    <div className="pupil"></div>
                  </div>
                </div>
                
                {/* Nose */}
                <div className="nose"></div>
                
                {/* Mouth */}
                <div className={`mouth ${isSpeaking ? 'talking' : ''}`}></div>
              </div>
            </div>
            
            {/* Neck and Suit */}
            <div className="neck"></div>
            <div className="suit">
              <div className="collar"></div>
              <div className="tie"></div>
            </div>
          </div>
        </div>
        
        {/* Status indicator */}
        {isSpeaking && (
          <div className="speaking-indicator">
            <div className="sound-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="interviewer-info">
        <h3>AI Interviewer</h3>
        <p className="interviewer-role">Senior Hiring Manager</p>
        <div className="status-badge">
          <span className="status-dot"></span>
          Ready to interview
        </div>
      </div>
    </div>
  );
}
