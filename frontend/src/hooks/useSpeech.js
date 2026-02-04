/**
 * Custom hook for Web Speech API (Speech Recognition + Synthesis)
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition - Hook for speech-to-text functionality
 */
export function useSpeechRecognition(options = {}) {
  const { 
    continuous = true, 
    interimResults = true, 
    lang = 'en-US',
    onResult,
    onError 
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result + ' ';
        } else {
          interim += result;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        if (onResult) onResult(finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [continuous, interimResults, lang, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

/**
 * useSpeechSynthesis - Hook for text-to-speech functionality
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      setVoices(synthRef.current.getVoices());
    };

    loadVoices();
    synthRef.current.addEventListener('voiceschanged', loadVoices);

    return () => {
      synthRef.current.removeEventListener('voiceschanged', loadVoices);
      synthRef.current.cancel();
    };
  }, [isSupported]);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (options.onEnd) options.onEnd();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (options.onError) options.onError();
    };

    synthRef.current.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) synthRef.current.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) synthRef.current.resume();
  }, [isSupported]);

  return {
    isSpeaking,
    voices,
    isSupported,
    speak,
    cancel,
    pause,
    resume
  };
}

export default { useSpeechRecognition, useSpeechSynthesis };
