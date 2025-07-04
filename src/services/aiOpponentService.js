// AI Opponent Service for realistic patient simulation
export class AIOpponentService {
  constructor() {
    this.patientPersonality = null
    this.difficultyLevel = 'beginner'
    this.gameContext = null
    this.responsePatterns = this.initializeResponsePatterns()
  }

  initializeResponsePatterns() {
    return {
      beginner: {
        cooperation_base: 7,
        deflection_likelihood: 0.3,
        emotional_complexity: 0.4,
        response_delay: 1000 // 1 second
      },
      intermediate: {
        cooperation_base: 5,
        deflection_likelihood: 0.6,
        emotional_complexity: 0.7,
        response_delay: 1500
      },
      advanced: {
        cooperation_base: 3,
        deflection_likelihood: 0.8,
        emotional_complexity: 0.9,
        response_delay: 2000
      }
    }
  }

  async initializeAI(gameConfig, gameState) {
    this.difficultyLevel = gameConfig.difficulty || 'beginner'
    this.gameContext = gameState.currentCase
    
    // Create patient personality based on case and difficulty
    this.patientPersonality = this.generatePatientPersonality(gameConfig)
    
    console.log('AI Opponent initialized:', {
      difficulty: this.difficultyLevel,
      personality: this.patientPersonality.type,
      case: this.gameContext.id
    })
  }

  generatePatientPersonality(gameConfig) {
    const personalities = {
      'ankle_sprain': [
        { type: 'athlete', traits: ['competitive', 'impatient', 'goal-oriented'] },
        { type: 'cautious', traits: ['worried', 'detailed', 'cooperative'] },
        { type: 'stoic', traits: ['minimizing', 'independent', 'resistant'] }
      ],
      'low_back_pain': [
        { type: 'chronic_pain', traits: ['frustrated', 'skeptical', 'experienced'] },
        { type: 'anxious', traits: ['worried', 'talkative', 'seeking_reassurance'] },
        { type: 'depressed', traits: ['withdrawn', 'hopeless', 'minimal_effort'] }
      ]
    }

    const casePersonalities = personalities[gameConfig.case] || personalities['ankle_sprain']
    const randomPersonality = casePersonalities[Math.floor(Math.random() * casePersonalities.length)]
    
    return {
      ...randomPersonality,
      cooperation_modifier: Math.random() * 2 - 1, // -1 to +1
      pain_tolerance: Math.random(),
      communication_style: Math.random() > 0.5 ? 'direct' : 'indirect'
    }
  }

  async generateAIResponse(gameState, ptAction) {
    // Simulate thinking time
    await this.delay(this.responsePatterns[this.difficultyLevel].response_delay)

    const availableCards = gameState.playerHands.patient || []
    if (availableCards.length === 0) {
      return { action: 'no_cards', message: 'Patient has no cards to play' }
    }

    // Analyze PT action and determine best response
    const responseStrategy = this.analyzeAndDecideResponse(gameState, ptAction)
    const selectedCard = this.selectBestCard(availableCards, responseStrategy, gameState)

    if (!selectedCard) {
      return { action: 'pass', message: 'Patient chooses not to respond' }
    }

    return {
      action: 'play_card',
      cardId: selectedCard.id,
      reasoning: `AI played ${selectedCard.name} - ${responseStrategy.reasoning}`,
      personality_context: this.getPersonalityContext(selectedCard)
    }
  }

  analyzeAndDecideResponse(gameState, ptAction) {
    const patterns = this.responsePatterns[this.difficultyLevel]
    const currentCooperation = gameState.patientResources.cooperation
    const rapport = gameState.ptResources.rapport

    // Base decision on patient personality and current game state
    let strategy = {
      should_deflect: false,
      should_cooperate: false,
      should_add_complexity: false,
      emotional_response: null,
      reasoning: ''
    }

    // Cooperation vs deflection decision
    const cooperationChance = (currentCooperation / 10) + (rapport / 10) * 0.5
    const deflectionChance = patterns.deflection_likelihood - (rapport / 10) * 0.3

    if (ptAction?.type === 'assessment') {
      if (Math.random() < deflectionChance) {
        strategy.should_deflect = true
        strategy.reasoning = 'Patient feels uncomfortable with examination'
      } else if (Math.random() < cooperationChance) {
        strategy.should_cooperate = true
        strategy.reasoning = 'Patient willing to participate in assessment'
      }
    }

    if (ptAction?.type === 'communication') {
      if (rapport > 6) {
        strategy.should_cooperate = true
        strategy.reasoning = 'Good rapport encourages openness'
      } else if (this.patientPersonality.traits.includes('anxious')) {
        strategy.emotional_response = 'anxiety'
        strategy.reasoning = 'Patient shows anxiety about condition'
      }
    }

    // Add complexity based on difficulty
    if (gameState.turnNumber > 3 && Math.random() < patterns.emotional_complexity) {
      strategy.should_add_complexity = true
    }

    return strategy
  }

  selectBestCard(availableCards, strategy, gameState) {
    // Filter cards based on strategy and resources
    const playableCards = availableCards.filter(card => {
      const canAfford = this.canAffordCard(card, gameState.patientResources)
      return canAfford
    })

    if (playableCards.length === 0) return null

    // Prioritize cards based on strategy
    let prioritizedCards = [...playableCards]

    if (strategy.should_deflect) {
      prioritizedCards = prioritizedCards.sort((a, b) => {
        const aDeflection = a.type === 'deflection' ? 10 : 0
        const bDeflection = b.type === 'deflection' ? 10 : 0
        return bDeflection - aDeflection
      })
    }

    if (strategy.emotional_response) {
      prioritizedCards = prioritizedCards.sort((a, b) => {
        const aEmotional = a.type === 'emotional_state' ? 8 : 0
        const bEmotional = b.type === 'emotional_state' ? 8 : 0
        return bEmotional - aEmotional
      })
    }

    if (strategy.should_add_complexity) {
      prioritizedCards = prioritizedCards.sort((a, b) => {
        const aComplex = a.adds_complexity ? 6 : 0
        const bComplex = b.adds_complexity ? 6 : 0
        return bComplex - aComplex
      })
    }

    // Add some randomness to make AI less predictable
    const topCards = prioritizedCards.slice(0, Math.min(3, prioritizedCards.length))
    return topCards[Math.floor(Math.random() * topCards.length)]
  }

  canAffordCard(card, resources) {
    if (card.energy_cost && resources.energy < card.energy_cost) return false
    if (card.deflection_cost && resources.deflection < card.deflection_cost) return false
    if (card.emotional_cost && resources.emotional < card.emotional_cost) return false
    return true
  }

  getPersonalityContext(card) {
    const contexts = {
      'deflection': [
        "I don't think that's really necessary...",
        "Can we skip that part?",
        "I'm not comfortable with that test"
      ],
      'emotional_state': [
        "I'm feeling a bit overwhelmed",
        "This is making me anxious",
        "I'm worried about what you might find"
      ],
      'communication': [
        "Let me explain what I'm experiencing",
        "I need to tell you something important",
        "Can you help me understand this?"
      ]
    }

    const typeContexts = contexts[card.type] || ["Patient responds thoughtfully"]
    return typeContexts[Math.floor(Math.random() * typeContexts.length)]
  }

  // Educational feedback for AI moves
  generateEducationalFeedback(aiMove, gameState) {
    const feedback = {
      move_explanation: `The AI patient ${aiMove.reasoning}`,
      clinical_insight: this.getClinicalInsight(aiMove, gameState),
      learning_opportunity: this.identifyLearningOpportunity(aiMove, gameState),
      suggested_response: this.suggestPTResponse(aiMove, gameState)
    }

    return feedback
  }

  getClinicalInsight(aiMove, gameState) {
    const insights = {
      'deflection': 'Patients often deflect when feeling vulnerable or scared. This is normal defensive behavior.',
      'emotional_state': 'Emotional responses provide valuable information about the patient\'s mental state and coping mechanisms.',
      'cooperation': 'When patients cooperate, it indicates growing trust in the therapeutic relationship.'
    }

    return insights[aiMove.action] || 'Patient behavior provides insight into their emotional and psychological state.'
  }

  identifyLearningOpportunity(aiMove, gameState) {
    if (aiMove.action === 'deflection' && gameState.ptResources.rapport < 5) {
      return 'Low rapport may be contributing to deflection. Consider using communication cards to build trust.'
    }

    if (aiMove.action === 'emotional_state') {
      return 'Emotional responses are opportunities to demonstrate empathy and therapeutic communication skills.'
    }

    return 'Consider how your approach affects patient responses and adjust your strategy accordingly.'
  }

  suggestPTResponse(aiMove, gameState) {
    const suggestions = {
      'deflection': 'Try empathy or explanation cards to address patient concerns',
      'emotional_state': 'Use therapeutic communication to validate and support',
      'cooperation': 'Take advantage of cooperation to gather more information'
    }

    return suggestions[aiMove.action] || 'Adapt your approach based on patient response'
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const aiOpponent = new AIOpponentService()