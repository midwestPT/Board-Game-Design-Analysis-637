// Enhanced demo service with complete game functionality
import { PHYSIOTACTICS_CARD_DATABASE } from '../data/expandedCardDatabase.js'

export class DemoService {
  constructor() {
    this.isDemo = true
    this.currentUser = null
    this.gameData = this.initializeDemoData()
  }

  initializeDemoData() {
    return {
      users: {
        'demo-user-123': {
          id: 'demo-user-123',
          email: 'demo@physiotactics.com',
          full_name: 'Demo Student',
          role: 'student',
          institution_id: 'demo-university'
        },
        'demo-faculty-123': {
          id: 'demo-faculty-123',
          email: 'faculty@physiotactics.com',
          full_name: 'Dr. Demo Faculty',
          role: 'faculty',
          institution_id: 'demo-university'
        }
      },
      games: [],
      gameHistory: [
        {
          id: 'demo-game-1',
          case_id: 'ankle_sprain',
          accuracy_score: 85,
          efficiency_score: 78,
          communication_score: 92,
          completion_time: 1245,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'demo-game-2',
          case_id: 'low_back_pain',
          accuracy_score: 78,
          efficiency_score: 82,
          communication_score: 88,
          completion_time: 1456,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      userProgress: {
        competency_scores: {
          diagnostic_accuracy: 82,
          communication_skills: 88,
          clinical_reasoning: 75,
          efficiency: 79
        },
        performance_metrics: {
          total_games: 12,
          avg_accuracy: 81,
          improvement_trend: 'improving'
        }
      }
    }
  }

  // Mock authentication
  async signIn(email, password) {
    await this.delay(500) // Simulate network delay
    
    if (email.includes('faculty')) {
      this.currentUser = this.gameData.users['demo-faculty-123']
    } else {
      this.currentUser = this.gameData.users['demo-user-123']
    }
    
    return { user: this.currentUser, session: { access_token: 'demo-token' } }
  }

  async signUp(email, password, userData) {
    await this.delay(500)
    
    const newUser = {
      id: `demo-user-${Date.now()}`,
      email,
      full_name: userData.full_name,
      role: userData.role,
      institution_id: userData.institution_id
    }
    
    this.gameData.users[newUser.id] = newUser
    this.currentUser = newUser
    
    return { user: newUser, session: { access_token: 'demo-token' } }
  }

  async signOut() {
    await this.delay(300)
    this.currentUser = null
  }

  async getCurrentUser() {
    return this.currentUser
  }

  // Enhanced game creation with complete card sets
  async createGame(gameConfig) {
    await this.delay(300)
    
    const game = {
      id: `demo-game-${Date.now()}`,
      creator_id: this.currentUser?.id,
      game_mode: gameConfig.mode || 'ai',
      difficulty: gameConfig.difficulty || 'beginner',
      case_id: gameConfig.case || 'ankle_sprain',
      player_role: gameConfig.playerRole || 'pt',
      status: 'active',
      created_at: new Date().toISOString(),
      game_state: this.generateInitialGameState(gameConfig)
    }
    
    this.gameData.games.push(game)
    return game
  }

  generateInitialGameState(config) {
    return {
      id: `game-${Date.now()}`,
      turnNumber: 1,
      maxTurns: config.difficulty === 'beginner' ? 12 : config.difficulty === 'intermediate' ? 10 : 8,
      currentPlayer: 'pt_student',
      currentPhase: 'assessment',
      isMultiplayer: false,
      
      currentCase: {
        id: config.case,
        title: this.getCaseTitle(config.case),
        difficulty: config.difficulty,
        description: this.getCaseDescription(config.case)
      },
      
      // Player resources
      ptResources: {
        energy: 10,
        rapport: 5,
        confidence: 50
      },
      
      patientResources: {
        cooperation: this.getInitialCooperation(config.difficulty),
        deflection: 8,
        emotional: 6,
        energy: 10
      },
      
      // Player hands with complete card sets
      playerHands: {
        pt_student: this.generateStartingHand('pt_student', config.case),
        patient: this.generateStartingHand('patient', config.case)
      },
      
      // Game state tracking
      discoveredClues: [],
      activeEffects: {
        pt_student: [],
        patient: []
      },
      gameLog: [{
        timestamp: Date.now(),
        action: 'game_started',
        player: 'system',
        message: `Game started: ${this.getCaseTitle(config.case)} (${config.difficulty})`
      }],
      cardsPlayedThisTurn: [],
      
      // Victory tracking
      competencyProgress: {
        diagnostic_accuracy: 50,
        communication_skills: 50,
        clinical_reasoning: 50,
        efficiency: 50
      }
    }
  }

  getInitialCooperation(difficulty) {
    const cooperationLevels = {
      'beginner': 8,
      'intermediate': 6,
      'advanced': 4
    }
    return cooperationLevels[difficulty] || 7
  }

  getCaseTitle(caseId) {
    const cases = {
      ankle_sprain: 'Lateral Ankle Sprain',
      low_back_pain: 'Chronic Low Back Pain',
      shoulder_impingement: 'Shoulder Impingement',
      fibromyalgia: 'Fibromyalgia Syndrome'
    }
    return cases[caseId] || 'Unknown Case'
  }

  getCaseDescription(caseId) {
    const descriptions = {
      ankle_sprain: 'A 23-year-old basketball player presents with acute ankle pain following an inversion injury during practice.',
      low_back_pain: 'A 45-year-old office worker with a 6-month history of lower back pain and functional limitations.',
      shoulder_impingement: 'A 28-year-old swimmer experiencing gradual onset shoulder pain with overhead activities.',
      fibromyalgia: 'A 38-year-old patient with widespread pain and fatigue affecting daily activities.'
    }
    return descriptions[caseId] || 'Patient case description'
  }

  generateStartingHand(playerType, caseId) {
    if (playerType === 'pt_student') {
      return this.generatePTCards(caseId)
    } else {
      return this.generatePatientCards(caseId)
    }
  }

  generatePTCards(caseId) {
    // Get general PT cards from enhanced database
    const baseCards = [...PHYSIOTACTICS_CARD_DATABASE.pt_student_cards]
    
    // Add case-specific cards
    const caseSpecificCards = this.getCaseSpecificPTCards(caseId)
    
    // Mix in some advanced cards for variety
    const advancedCards = [...PHYSIOTACTICS_CARD_DATABASE.advanced_pt_cards].slice(0, 2)
    
    // Combine and return 5 cards
    const allCards = [...baseCards, ...caseSpecificCards, ...advancedCards]
    return this.shuffleArray(allCards).slice(0, 5)
  }

  getCaseSpecificPTCards(caseId) {
    const caseData = PHYSIOTACTICS_CARD_DATABASE.case_specific_cards[caseId]
    return caseData ? [...caseData.pt_cards] : []
  }

  generatePatientCards(caseId) {
    // Get general patient cards from enhanced database
    const baseCards = [...PHYSIOTACTICS_CARD_DATABASE.patient_cards]
    
    // Add case-specific cards
    const caseSpecificCards = this.getCaseSpecificPatientCards(caseId)
    
    // Mix in some advanced cards for variety
    const advancedCards = [...PHYSIOTACTICS_CARD_DATABASE.advanced_patient_cards].slice(0, 2)
    
    // Combine and return 5 cards
    const allCards = [...baseCards, ...caseSpecificCards, ...advancedCards]
    return this.shuffleArray(allCards).slice(0, 5)
  }

  getCaseSpecificPatientCards(caseId) {
    const caseData = PHYSIOTACTICS_CARD_DATABASE.case_specific_cards[caseId]
    return caseData ? [...caseData.patient_cards] : []
  }

  // Utility method for shuffling arrays
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Mock analytics
  async getUserProgress(userId) {
    await this.delay(200)
    return this.gameData.userProgress
  }

  async getUserGameHistory(userId, limit = 10) {
    await this.delay(200)
    return this.gameData.gameHistory.slice(0, limit)
  }

  async saveGamePerformance(gameId, userId, performanceData) {
    await this.delay(300)
    
    const gameRecord = {
      id: `perf-${Date.now()}`,
      game_id: gameId,
      user_id: userId,
      ...performanceData,
      created_at: new Date().toISOString()
    }
    
    this.gameData.gameHistory.unshift(gameRecord)
    return gameRecord
  }

  // Utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const demoService = new DemoService()