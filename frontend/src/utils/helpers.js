/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Format date to readable string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date, { hour: undefined, minute: undefined });
};

/**
 * Format duration in seconds to MM:SS
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format duration in seconds to human readable (e.g., "5 min 30 sec")
 */
export const formatDurationHuman = (seconds) => {
  if (seconds < 60) return `${seconds} sec`;
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Calculate average of an array of numbers
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + (num || 0), 0);
  return Math.round(sum / numbers.length);
};

/**
 * Group array items by a key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

/**
 * Sort array of objects by key
 */
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key];
    const valueB = typeof key === 'function' ? key(b) : b[key];
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Parse keywords from comma-separated string
 */
export const parseKeywords = (str) => {
  if (!str) return [];
  return str.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

/**
 * Format keywords array to comma-separated string
 */
export const formatKeywords = (keywords) => {
  if (!keywords || !Array.isArray(keywords)) return '';
  return keywords.join(', ');
};

/**
 * Check if browser supports required features
 */
export const checkBrowserSupport = () => {
  const support = {
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    mediaRecorder: 'MediaRecorder' in window,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
  
  return {
    ...support,
    allSupported: Object.values(support).every(Boolean)
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Download data as JSON file
 */
export const downloadAsJson = (data, filename = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatDurationHuman,
  truncateText,
  capitalizeWords,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  calculateAverage,
  groupBy,
  sortBy,
  parseKeywords,
  formatKeywords,
  checkBrowserSupport,
  copyToClipboard,
  downloadAsJson
};
