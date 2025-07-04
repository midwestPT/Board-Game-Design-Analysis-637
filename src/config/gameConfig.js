// Game Configuration for PhysioTactics
// Centralized configuration for all game systems

export const GAME_CONFIG = {
  // Basic Game Settings
  game: {
    name: 'PhysioTactics',
    version: '2.0.0',
    defaultLanguage: 'en',
    maxPlayers: 2,
    minAge: 18,
    estimatedPlayTime: '15-30 minutes'
  },

  // Resource Limits and Defaults
  resources: {
    pt: {
      energy: { min: 0, max: 15, default: 10 },
      rapport: { min: 0, max: 10, default: 5 },
      diagnosticConfidence: { min: 0, max: 100, default: 0 }
    },
    patient: {
      cooperation: { min: 0, max: 10, default: 7 },
      deflection: { min: 0, max: 15, default: 8 },
      emotional: { min: 0, max: 12, default: 6 }
    }
  },

  // Turn and Time Limits
  turns: {
    beginner: { min: 8, max: 12, default: 10 },
    intermediate: { min: 6, max: 10, default: 8 },
    advanced: { min: 5, max: 8, default: 6 },
    expert: { min: 4, max: 6, default: 5 }
  },

  // Hand and Deck Sizes
  cards: {
    handSize: {
      min: 3,
      max: 7,
      default: 5
    },
    deckSize: {
      beginner: 25,
      intermediate: 30,
      advanced: 35,
      expert: 40
    },
    maxCopies: 3,
    maxHandSize: 10
  },

  // Tutorial System Configuration
  tutorial: {
    totalSteps: 10,
    autoSave: true,
    showHints: true,
    autoAdvance: true,
    skipAnimations: false,
    estimatedTotalTime: 45, // minutes
    steps: {
      1: { id: 'basic_assessment', estimatedTime: 3, difficulty: 'easy' },
      2: { id: 'patient_communication', estimatedTime: 4, difficulty: 'easy' },
      3: { id: 'clinical_reasoning', estimatedTime: 5, difficulty: 'medium' },
      4: { id: 'energy_management', estimatedTime: 4, difficulty: 'medium' },
      5: { id: 'patient_challenges', estimatedTime: 6, difficulty: 'medium' },
      6: { id: 'treatment_planning', estimatedTime: 5, difficulty: 'medium' },
      7: { id: 'complex_cases', estimatedTime: 7, difficulty: 'hard' },
      8: { id: 'time_pressure', estimatedTime: 5, difficulty: 'hard' },
      9: { id: 'collaboration', estimatedTime: 4, difficulty: 'medium' },
      10: { id: 'mastery_challenge', estimatedTime: 8, difficulty: 'expert' }
    },
    achievements: {
      speedDemon: { threshold: 0.75, points: 100 },
      perfectionist: { mistakes: 0, points: 150 },
      independent: { hintsUsed: 0, points: 125 },
      efficient: { attempts: 1, points: 100 },
      persistent: { completedWithHelp: true, points: 50 }
    }
  },

  // Modifier System Configuration
  modifiers: {
    maxActive: 5,
    difficulties: {
      easy: { count: 1, rarityLimit: 'common' },
      medium: { count: 2, rarityLimit: 'uncommon' },
      hard: { count: 3, rarityLimit: 'rare' },
      mixed: { count: 4, rarityLimit: 'epic' }
    },
    categories: [
      'clinical_realism',
      'time_pressure',
      'patient_complexity',
      'environmental_factors',
      'educational_focus'
    ],
    effects: {
      energyCost: { min: -2, max: 3 },
      successRate: { min: 0.5, max: 1.5 },
      cooperation: { min: -3, max: 2 },
      assessmentFailure: { min: 0, max: 0.3 }
    }
  },

  // Difficulty Scaling
  difficulty: {
    beginner: {
      ptResourceMultiplier: 1.2,
      patientAggressionMultiplier: 0.8,
      hintAvailability: true,
      timerPressure: false,
      complexityLimit: 'low'
    },
    intermediate: {
      ptResourceMultiplier: 1.0,
      patientAggressionMultiplier: 1.0,
      hintAvailability: true,
      timerPressure: false,
      complexityLimit: 'medium'
    },
    advanced: {
      ptResourceMultiplier: 0.9,
      patientAggressionMultiplier: 1.2,
      hintAvailability: false,
      timerPressure: true,
      complexityLimit: 'high'
    },
    expert: {
      ptResourceMultiplier: 0.8,
      patientAggressionMultiplier: 1.4,
      hintAvailability: false,
      timerPressure: true,
      complexityLimit: 'unlimited'
    }
  },

  // Victory Conditions
  victory: {
    primary: {
      diagnosticAccuracy: 85,
      patientRapport: 8,
      timeEfficiency: 0.75
    },
    bonus: {
      perfectAssessment: { threshold: 95, bonus: 200 },
      speedRun: { timeMultiplier: 0.5, bonus: 150 },
      excellentCommunication: { rapportThreshold: 9, bonus: 100 },
      noMistakes: { errorCount: 0, bonus: 125 }
    },
    failure: {
      energyDepletion: { ptEnergy: 0 },
      rapportLoss: { rapport: 0 },
      timeExpired: { turnsExceeded: true },
      criticalError: { severityLevel: 'critical' }
    }
  },

  // Scoring System
  scoring: {
    base: {
      diagnosticAccuracy: 10, // points per percentage
      rapport: 25, // points per point
      turnEfficiency: 50, // bonus for finishing early
      timeBonus: 5 // points per second under target
    },
    penalties: {
      wrongAssessment: -50,
      rapportLoss: -25,
      energyWaste: -10,
      patientFrustration: -15
    },
    multipliers: {
      difficulty: {
        beginner: 1.0,
        intermediate: 1.2,
        advanced: 1.5,
        expert: 2.0
      },
      modifiers: {
        none: 1.0,
        easy: 1.1,
        medium: 1.3,
        hard: 1.6,
        mixed: 1.8
      }
    }
  },

  // Animation and UI Settings
  ui: {
    animations: {
      cardPlay: { duration: 600, easing: 'easeOut' },
      resourceChange: { duration: 400, easing: 'easeInOut' },
      turnTransition: { duration: 800, easing: 'easeInOut' },
      modalOpen: { duration: 300, easing: 'easeOut' },
      tooltipDelay: 500
    },
    sounds: {
      cardPlay: 'card_play.wav',
      success: 'success.wav',
      error: 'error.wav',
      victory: 'victory.wav',
      newTurn: 'turn_change.wav'
    },
    themes: {
      default: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#F8FAFC'
      },
      dark: {
        primary: '#60A5FA',
        secondary: '#A78BFA',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        background: '#1E293B'
      }
    }
  },

  // Accessibility Settings
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindFriendly: true,
    keyboardNavigation: true
  },

  // Analytics and Tracking
  analytics: {
    trackGameplay: true,
    trackLearning: true,
    trackPerformance: true,
    anonymizeData: true,
    retentionDays: 30
  },

  // Multiplayer Settings
  multiplayer: {
    maxLobbySize: 4,
    maxGameDuration: 45, // minutes
    reconnectTimeout: 30, // seconds
    syncInterval: 1000, // milliseconds
    heartbeatInterval: 5000 // milliseconds
  },

  // Faculty Dashboard Settings
  faculty: {
    maxStudentsPerClass: 50,
    gradingScale: {
      A: { min: 90, color: '#10B981' },
      B: { min: 80, color: '#3B82F6' },
      C: { min: 70, color: '#F59E0B' },
      D: { min: 60, color: '#EF4444' },
      F: { min: 0, color: '#6B7280' }
    },
    reportingPeriods: ['daily', 'weekly', 'monthly', 'semester'],
    competencyTracking: true,
    learningAnalytics: true
  },

  // Storage and Caching
  storage: {
    gameState: {
      autoSave: true,
      saveInterval: 30000, // milliseconds
      maxSaves: 5
    },
    userProgress: {
      syncToCloud: true,
      localBackup: true,
      compressionEnabled: true
    },
    cache: {
      cardDatabase: true,
      userAssets: true,
      maxSize: '50MB',
      ttl: 86400000 // 24 hours in milliseconds
    }
  },

  // Development and Debug Settings
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    showPerformanceMetrics: false,
    logGameActions: false,
    enableCheatCodes: false,
    skipAnimations: false,
    mockData: false
  },

  // API and Service Configuration
  api: {
    baseUrl: process.env.VITE_API_URL || 'https://api.physiotactics.com',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Feature Flags
  features: {
    tutorialSystem: true,
    modifierSystem: true,
    multiplayerMode: true,
    facultyDashboard: true,
    analyticsTracking: true,
    achievementSystem: true,
    customDecks: false, // Coming soon
    voiceControl: false, // Future feature
    vr: false // Future feature
  }
};

// Environment-specific overrides
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const overrides = {
    development: {
      debug: {
        enabled: true,
        showPerformanceMetrics: true,
        logGameActions: true
      },
      api: {
        baseUrl: 'http://localhost:3001'
      }
    },
    testing: {
      animations: {
        duration: 0 // Speed up tests
      },
      storage: {
        autoSave: false
      }
    },
    production: {
      debug: {
        enabled: false,
        showPerformanceMetrics: false,
        logGameActions: false
      },
      analytics: {
        trackGameplay: true,
        trackLearning: true,
        trackPerformance: true
      }
    }
  };

  return {
    ...GAME_CONFIG,
    ...overrides[env]
  };
};

// Helper functions to access configuration
export const getConfig = (path) => {
  const config = getEnvironmentConfig();
  return path.split('.').reduce((obj, key) => obj?.[key], config);
};

export const isFeatureEnabled = (feature) => {
  return getConfig(`features.${feature}`) === true;
};

export const getResourceLimits = (resourceType, playerType) => {
  return getConfig(`resources.${playerType}.${resourceType}`);
};

export const getDifficultySettings = (difficulty) => {
  return getConfig(`difficulty.${difficulty}`);
};

export const getUITheme = (themeName = 'default') => {
  return getConfig(`ui.themes.${themeName}`);
};

export default GAME_CONFIG;