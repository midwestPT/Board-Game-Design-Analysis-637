// Enhanced demo service with complete game functionality
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
    const baseCards = [
      {
        id: 'pt_history_1',
        name: 'History Taking',
        type: 'history_taking',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Ask about onset, duration, and aggravating factors. Gain 1 clue.',
        flavor_text: 'A thorough history is the foundation of diagnosis.',
        clues_revealed: 1,
        assessment_category: 'history'
      },
      {
        id: 'pt_observation_1',
        name: 'Visual Observation',
        type: 'assessment',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Observe posture, gait, and visible signs. Gain 1 clue.',
        flavor_text: 'Sometimes the most important information is what you can see.',
        clues_revealed: 1,
        assessment_category: 'observation'
      },
      {
        id: 'pt_palpation_1',
        name: 'Palpation Assessment',
        type: 'assessment',
        energy_cost: 2,
        rarity: 'common',
        card_text: 'Palpate for tenderness, swelling, and temperature. Gain 1-2 clues.',
        flavor_text: 'Skilled hands can detect what eyes cannot see.',
        clues_revealed: 2,
        assessment_category: 'physical_exam'
      },
      {
        id: 'pt_empathy_1',
        name: 'Show Empathy',
        type: 'communication',
        energy_cost: 0,
        rarity: 'common',
        card_text: 'Demonstrate understanding and validation. +1 Rapport.',
        flavor_text: 'Empathy is the cornerstone of therapeutic relationships.',
        rapport_change: 1,
        counters_emotional: true
      },
      {
        id: 'pt_explanation_1',
        name: 'Clear Explanation',
        type: 'communication',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Explain procedures and findings clearly. +1 Rapport, reduces patient anxiety.',
        flavor_text: 'Knowledge shared is fear reduced.',
        rapport_change: 1
      }
    ]

    // Add case-specific cards
    const caseSpecificCards = this.getCaseSpecificPTCards(caseId)
    
    return [...baseCards, ...caseSpecificCards].slice(0, 5)
  }

  getCaseSpecificPTCards(caseId) {
    const caseCards = {
      ankle_sprain: [
        {
          id: 'pt_ottawa_rules',
          name: 'Ottawa Ankle Rules',
          type: 'assessment',
          energy_cost: 2,
          rarity: 'uncommon',
          card_text: 'Apply evidence-based decision rules. High accuracy clue about fracture risk.',
          flavor_text: 'Evidence-based practice guides clinical decisions.',
          clues_revealed: 1,
          assessment_category: 'special_test',
          confidence_boost: 20
        },
        {
          id: 'pt_stress_test',
          name: 'Ligament Stress Test',
          type: 'assessment',
          energy_cost: 3,
          rarity: 'uncommon',
          card_text: 'Test ligament integrity. May cause discomfort.',
          flavor_text: 'Careful testing reveals the extent of injury.',
          clues_revealed: 2,
          assessment_category: 'special_test'
        }
      ],
      low_back_pain: [
        {
          id: 'pt_red_flags',
          name: 'Red Flag Screening',
          type: 'assessment',
          energy_cost: 2,
          rarity: 'uncommon',
          card_text: 'Screen for serious pathology. Critical safety assessment.',
          flavor_text: 'Some things cannot be missed.',
          clues_revealed: 1,
          assessment_category: 'safety',
          confidence_boost: 25
        }
      ]
    }

    return caseCards[caseId] || []
  }

  generatePatientCards(caseId) {
    const baseCards = [
      {
        id: 'patient_minimize_1',
        name: 'Minimize Symptoms',
        type: 'deflection',
        deflection_cost: 1,
        rarity: 'common',
        card_text: 'Downplay pain and dysfunction. "It\'s not that bad, really."',
        flavor_text: 'Many patients minimize symptoms to avoid appearing weak.',
        information_reduction: 0.5
      },
      {
        id: 'patient_anxiety_1',
        name: 'Test Anxiety',
        type: 'emotional_state',
        emotional_cost: 2,
        rarity: 'common',
        card_text: 'Feel anxious about examination. PT must use communication or lose rapport.',
        flavor_text: 'Being examined can trigger vulnerability and fear.',
        emotion_type: 'anxiety',
        requires_response: 'communication'
      },
      {
        id: 'patient_cooperate_1',
        name: 'Full Cooperation',
        type: 'cooperation',
        energy_cost: 1,
        rarity: 'common',
        card_text: 'Provide complete and honest responses. PT gains bonus clue.',
        flavor_text: 'When trust is established, patients open up.',
        cooperation_bonus: true
      },
      {
        id: 'patient_previous_exp_1',
        name: 'Previous Bad Experience',
        type: 'deflection',
        deflection_cost: 2,
        rarity: 'uncommon',
        card_text: 'Counter assessment card. "Last time they did that, it made things worse."',
        flavor_text: 'Past negative experiences create lasting hesitation.',
        counters: ['assessment']
      },
      {
        id: 'patient_pain_focus_1',
        name: 'Pain-Focused Response',
        type: 'emotional_state',
        emotional_cost: 1,
        rarity: 'common',
        card_text: 'Emphasize pain above all else. May miss other important symptoms.',
        flavor_text: 'When pain dominates, other symptoms fade into background.',
        emotion_type: 'pain_focus',
        information_reduction: 0.3
      }
    ]

    // Add case-specific patient cards
    const caseSpecificCards = this.getCaseSpecificPatientCards(caseId)
    
    return [...baseCards, ...caseSpecificCards].slice(0, 5)
  }

  getCaseSpecificPatientCards(caseId) {
    const caseCards = {
      ankle_sprain: [
        {
          id: 'patient_athlete_impatience',
          name: 'Athletic Impatience',
          type: 'emotional_state',
          emotional_cost: 2,
          rarity: 'uncommon',
          card_text: 'Focus only on return-to-play timeline. "When can I get back out there?"',
          flavor_text: 'Athletes often prioritize performance over proper healing.',
          emotion_type: 'impatience'
        }
      ],
      low_back_pain: [
        {
          id: 'patient_chronic_frustration',
          name: 'Chronic Frustration',
          type: 'emotional_state',
          emotional_cost: 2,
          rarity: 'uncommon',
          card_text: 'Express frustration with ongoing pain. "Nothing seems to help."',
          flavor_text: 'Chronic conditions test both body and spirit.',
          emotion_type: 'frustration',
          rapport_change: -1
        }
      ]
    }

    return caseCards[caseId] || []
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