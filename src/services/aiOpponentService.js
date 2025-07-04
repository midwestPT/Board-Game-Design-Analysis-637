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
    try {
      console.log('AI generating response...')
      
      // Simulate thinking time
      await this.delay(this.responsePatterns[this.difficultyLevel].response_delay)

      const availableCards = gameState.playerHands.patient || []
      console.log('Available AI cards:', availableCards.length)

      if (availableCards.length === 0) {
        console.log('AI has no cards, passing turn')
        return {
          action: 'pass',
          message: 'Patient has no cards to play'
        }
      }

      // Analyze PT action and determine best response
      const responseStrategy = this.analyzeAndDecideResponse(gameState, ptAction)
      const selectedCard = this.selectBestCard(availableCards, responseStrategy, gameState)

      if (!selectedCard) {
        console.log('AI could not select a card, passing turn')
        return {
          action: 'pass',
          message: 'Patient chooses not to respond'
        }
      }

      console.log('AI selected card:', selectedCard.name)
      
      return {
        action: 'play_card',
        cardId: selectedCard.id,
        reasoning: `AI played ${selectedCard.name} - ${responseStrategy.reasoning}`,
        personality_context: this.getPersonalityContext(selectedCard)
      }
    } catch (error) {
      console.error('Error in AI response generation:', error)
      return {
        action: 'pass',
        message: 'AI encountered an error'
      }
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
      reasoning: 'Patient considers response'
    }

    // Simple strategy: 50% chance to deflect, 50% chance to cooperate
    const randomChoice = Math.random()
    
    if (randomChoice < 0.3) {
      strategy.should_deflect = true
      strategy.reasoning = 'Patient feels defensive'
    } else if (randomChoice < 0.7) {
      strategy.should_cooperate = true
      strategy.reasoning = 'Patient willing to participate'
    } else {
      strategy.emotional_response = 'anxiety'
      strategy.reasoning = 'Patient shows emotional response'
    }

    return strategy
  }

  selectBestCard(availableCards, strategy, gameState) {
    try {
      // Filter cards based on strategy and resources
      const playableCards = availableCards.filter(card => {
        return this.canAffordCard(card, gameState.patientResources)
      })

      console.log('Playable cards:', playableCards.length)

      if (playableCards.length === 0) {
        console.log('No affordable cards available')
        return null
      }

      // Simple selection: prioritize based on strategy
      let prioritizedCards = [...playableCards]

      if (strategy.should_deflect) {
        const deflectionCards = prioritizedCards.filter(card => card.type === 'deflection')
        if (deflectionCards.length > 0) {
          return deflectionCards[0]
        }
      }

      if (strategy.emotional_response) {
        const emotionalCards = prioritizedCards.filter(card => card.type === 'emotional_state')
        if (emotionalCards.length > 0) {
          return emotionalCards[0]
        }
      }

      if (strategy.should_cooperate) {
        const cooperationCards = prioritizedCards.filter(card => card.type === 'cooperation')
        if (cooperationCards.length > 0) {
          return cooperationCards[0]
        }
      }

      // If no strategy-specific cards, pick randomly
      const randomIndex = Math.floor(Math.random() * prioritizedCards.length)
      return prioritizedCards[randomIndex]
    } catch (error) {
      console.error('Error selecting card:', error)
      return availableCards.length > 0 ? availableCards[0] : null
    }
  }

  canAffordCard(card, resources) {
    if (card.energy_cost && resources.energy < card.energy_cost) {
      console.log(`Cannot afford ${card.name}: need ${card.energy_cost} energy, have ${resources.energy}`)
      return false
    }
    if (card.deflection_cost && resources.deflection < card.deflection_cost) {
      console.log(`Cannot afford ${card.name}: need ${card.deflection_cost} deflection, have ${resources.deflection}`)
      return false
    }
    if (card.emotional_cost && resources.emotional < card.emotional_cost) {
      console.log(`Cannot afford ${card.name}: need ${card.emotional_cost} emotional, have ${resources.emotional}`)
      return false
    }
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
      'cooperation': [
        "Let me explain what I'm experiencing",
        "I need to tell you something important",
        "Can you help me understand this?"
      ]
    }

    const typeContexts = contexts[card.type] || ["Patient responds thoughtfully"]
    return typeContexts[Math.floor(Math.random() * typeContexts.length)]
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const aiOpponent = new AIOpponentService()