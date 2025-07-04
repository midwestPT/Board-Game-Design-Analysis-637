// Utilities Index for PhysioTactics
// Centralized export of all utility classes and functions

export { default as CardEffectProcessor } from './cardEffectProcessor'
export { default as DeckBuilder } from './deckBuilder'
export { default as GameStateValidator } from './gameStateValidator'
export { default as TutorialProgressTracker } from './tutorialProgressTracker'

// Re-export commonly used functions for convenience
export {
  CardEffectProcessor as EffectProcessor,
  DeckBuilder as Builder,
  GameStateValidator as Validator,
  TutorialProgressTracker as ProgressTracker
} from './index'

// Utility helper functions
export const gameUtils = {
  // Format time in MM:SS format
  formatTime: (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Format percentage with proper rounding
  formatPercentage: (value, decimals = 0) => {
    return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`;
  },

  // Generate unique ID
  generateId: (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Clamp value between min and max
  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },

  // Get random integer between min and max (inclusive)
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Shuffle array
  shuffleArray: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },

  // Calculate card color based on rarity
  getCardRarityColor: (rarity) => {
    const colors = {
      common: { border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-700' },
      uncommon: { border: 'border-green-400', bg: 'bg-green-100', text: 'text-green-700' },
      rare: { border: 'border-blue-400', bg: 'bg-blue-100', text: 'text-blue-700' },
      epic: { border: 'border-purple-400', bg: 'bg-purple-100', text: 'text-purple-700' },
      legendary: { border: 'border-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-700' }
    };
    return colors[rarity] || colors.common;
  },

  // Calculate resource color based on percentage
  getResourceColor: (current, max, type = 'health') => {
    const percentage = (current / max) * 100;
    
    if (type === 'health' || type === 'energy') {
      if (percentage >= 70) return 'text-green-500';
      if (percentage >= 40) return 'text-yellow-500';
      return 'text-red-500';
    }
    
    if (type === 'progress') {
      if (percentage >= 80) return 'text-blue-500';
      if (percentage >= 50) return 'text-purple-500';
      return 'text-gray-500';
    }
    
    return 'text-gray-500';
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Local storage helpers with error handling
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn(`Failed to get ${key} from localStorage:`, error);
        return defaultValue;
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn(`Failed to set ${key} in localStorage:`, error);
        return false;
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
        return false;
      }
    }
  }
};

// Animation presets for framer-motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },

  slideInFromRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3 }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3 }
  },

  cardHover: {
    whileHover: { y: -5, scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },

  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Common validation patterns
export const validation = {
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phoneNumber: /^\+?[\d\s\-\(\)]{10,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    nameFormat: /^[a-zA-Z\s\-'\.]{2,50}$/
  },

  rules: {
    required: (value) => value && value.toString().trim().length > 0,
    minLength: (min) => (value) => value && value.length >= min,
    maxLength: (max) => (value) => value && value.length <= max,
    email: (value) => validation.patterns.email.test(value),
    numeric: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
    integer: (value) => Number.isInteger(Number(value)),
    positive: (value) => Number(value) > 0,
    range: (min, max) => (value) => {
      const num = Number(value);
      return num >= min && num <= max;
    }
  }
};

// Error handling utilities
export const errorUtils = {
  // Create standardized error object
  createError: (message, code = 'UNKNOWN_ERROR', details = {}) => {
    return {
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    };
  },

  // Handle async errors with try-catch wrapper
  withErrorHandling: (asyncFn) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        console.error('Error in async operation:', error);
        throw errorUtils.createError(
          error.message || 'An unexpected error occurred',
          error.code || 'ASYNC_ERROR',
          { originalError: error }
        );
      }
    };
  },

  // Extract user-friendly error messages
  getUserMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    return 'An unexpected error occurred. Please try again.';
  }
};

// Performance monitoring utilities
export const performanceUtils = {
  // Simple performance timer
  timer: () => {
    const start = performance.now();
    return {
      end: () => performance.now() - start,
      log: (label) => console.log(`${label}: ${performance.now() - start}ms`)
    };
  },

  // Memory usage (if available)
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }
};