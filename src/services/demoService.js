// Demo service for offline gameplay without Supabase
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
    
    return {
      user: this.currentUser,
      session: { access_token: 'demo-token' }
    }
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
    
    return {
      user: newUser,
      session: { access_token: 'demo-token' }
    }
  }

  async signOut() {
    await this.delay(300)
    this.currentUser = null
  }

  async getCurrentUser() {
    return this.currentUser
  }

  // Mock game creation
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
      turnNumber: 1,
      maxTurns: config.difficulty === 'beginner' ? 10 : config.difficulty === 'intermediate' ? 8 : 6,
      currentCase: {
        id: config.case,
        title: this.getCaseTitle(config.case),
        difficulty: config.difficulty
      },
      ptResources: {
        energy: 10,
        rapport: 5
      },
      patientResources: {
        cooperation: 7,
        deflection: 8,
        emotional: 6
      },
      playerHands: {
        pt_student: this.generateStartingHand('pt_student'),
        patient: this.generateStartingHand('patient')
      },
      discoveredClues: [],
      activeEffects: {
        pt_student: [],
        patient: []
      },
      gameLog: [],
      currentPlayer: 'pt_student'
    }
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

  generateStartingHand(playerType) {
    const ptCards = [
      {
        id: 'rom_test_1',
        name: 'Range of Motion Test',
        type: 'assessment',
        energy_cost: 2,
        rarity: 'common',
        card_text: 'Reveal 1 Physical Finding. Patient may play 1 Deflection card in response.',
        flavor_text: 'A systematic approach to understanding joint mobility limitations.'
      },
      {
        id: 'pain_scale_1',
        name: 'Pain Scale Assessment',
        type: 'history_taking',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Reveals current pain level (1-10). Patient may modify by ±2.',
        flavor_text: 'Understanding the patient\'s subjective experience of pain.'
      },
      {
        id: 'empathy_1',
        name: 'Therapeutic Empathy',
        type: 'communication',
        energy_cost: 0,
        rarity: 'common',
        card_text: 'Counters Patient emotional cards. Maintains cooperation level.',
        flavor_text: 'The foundation of effective therapeutic relationships.'
      },
      {
        id: 'functional_test_1',
        name: 'Functional Movement Screen',
        type: 'assessment',
        energy_cost: 3,
        rarity: 'uncommon',
        card_text: 'Reveal 2 Movement Patterns. Costs 1 less energy if patient cooperation > 7.',
        flavor_text: 'Observing how the patient moves in real-world contexts.'
      },
      {
        id: 'active_listening_1',
        name: 'Active Listening',
        type: 'communication',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Draw 1 card. Patient reveals 1 additional clue this turn.',
        flavor_text: 'Sometimes the most important information comes from truly hearing the patient.'
      }
    ]

    const patientCards = [
      {
        id: 'minimize_1',
        name: 'Minimize Symptoms',
        type: 'deflection',
        deflection_cost: 1,
        rarity: 'common',
        card_text: 'Reduce reported pain/dysfunction by 50%. "It\'s not that bad, really."',
        flavor_text: 'Many patients downplay their symptoms to avoid seeming weak.'
      },
      {
        id: 'anxiety_1',
        name: 'Performance Anxiety',
        type: 'emotional_state',
        emotional_cost: 2,
        rarity: 'common',
        card_text: 'PT must play Communication card or lose 1 rapport point.',
        flavor_text: 'Being observed during movement can make anyone self-conscious.'
      },
      {
        id: 'previous_bad_experience_1',
        name: 'Previous Bad Experience',
        type: 'deflection',
        deflection_cost: 2,
        rarity: 'uncommon',
        card_text: 'Counter any Assessment card. "Last time they did that test, it made everything worse."',
        flavor_text: 'Past negative experiences with healthcare can create lasting hesitation.'
      },
      {
        id: 'stoic_presentation_1',
        name: 'Stoic Presentation',
        type: 'emotional_state',
        emotional_cost: 1,
        rarity: 'common',
        card_text: 'All pain ratings reduced by 2. "I can handle it."',
        flavor_text: 'Cultural or personal beliefs about showing weakness affect symptom reporting.'
      }
    ]

    return playerType === 'pt_student' ? ptCards : patientCards
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