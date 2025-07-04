export class GameEngine {
  constructor() {
    this.validators = new CardValidationEngine()
    this.stateManager = new GameStateManager()
    this.victorySystem = new PatientVictorySystem()
    this.interactionEngine = new CardInteractionEngine()
    this.predictionEngine = new PredictiveGameStateEngine()
  }

  // Core game flow management
  async processCardPlay(gameState, cardId, playerId, targetId = null) {
    try {
      // Find the card being played
      const player = gameState.players?.find(p => p.id === playerId) || { id: playerId, role: playerId }
      const playerHand = gameState.playerHands[playerId] || []
      const card = playerHand.find(c => c.id === cardId)

      if (!card) {
        return { success: false, error: 'Card not found in hand' }
      }

      // 1. Validate the card play
      const validation = await this.validators.validateCardPlay(gameState, cardId, playerId, targetId)
      if (!validation.isValid) {
        return { 
          success: false, 
          error: validation.error, 
          suggestions: validation.suggestions 
        }
      }

      // 2. Calculate card interactions and effects
      const interactions = await this.interactionEngine.calculateInteractions(gameState, cardId, playerId, targetId)

      // 3. Apply card effects to game state
      const newGameState = await this.stateManager.applyCardEffects(gameState, interactions, card, playerId)

      // 4. Check for triggered effects and chains
      const chainedEffects = await this.interactionEngine.processChainedEffects(newGameState, interactions)

      // 5. Apply any chained effects
      const finalGameState = await this.stateManager.applyChainedEffects(newGameState, chainedEffects)

      // 6. Update victory conditions and scoring
      const victoryUpdate = await this.victorySystem.updateVictoryConditions(finalGameState, interactions)

      // 7. Generate predictions for next turn
      const predictions = await this.predictionEngine.generatePredictions(finalGameState)

      return {
        success: true,
        gameState: finalGameState,
        interactions: interactions,
        chainedEffects: chainedEffects,
        victoryUpdate: victoryUpdate,
        predictions: predictions,
        educationalFeedback: interactions.educationalImpact
      }
    } catch (error) {
      console.error('Game engine error:', error)
      return { success: false, error: error.message }
    }
  }

  // Multiplayer synchronization
  async synchronizeGameState(gameState, playerId, action) {
    const syncData = {
      gameId: gameState.id,
      playerId: playerId,
      action: action,
      timestamp: Date.now(),
      gameStateChecksum: this.stateManager.generateChecksum(gameState)
    }

    // Broadcast to all connected players
    return this.broadcastToPlayers(gameState.players, syncData)
  }

  broadcastToPlayers(players, data) {
    // WebSocket foundation - will be expanded for real multiplayer
    players.forEach(player => {
      if (player.connection && player.connection.readyState === WebSocket.OPEN) {
        player.connection.send(JSON.stringify({
          type: 'game_state_update',
          data: data
        }))
      }
    })
  }
}

// Card Validation Engine
class CardValidationEngine {
  async validateCardPlay(gameState, cardId, playerId, targetId) {
    const card = this.findCard(gameState, cardId, playerId)
    const player = { id: playerId, role: playerId }

    if (!card) {
      return { isValid: false, error: 'Card not found', suggestions: ['Check your hand'] }
    }

    // Check basic play conditions
    const basicValidation = this.validateBasicConditions(gameState, card, player)
    if (!basicValidation.isValid) return basicValidation

    // Check resource costs
    const resourceValidation = this.validateResourceCosts(gameState, card, player)
    if (!resourceValidation.isValid) return resourceValidation

    // Check targeting requirements
    const targetValidation = this.validateTargeting(gameState, card, player, targetId)
    if (!targetValidation.isValid) return targetValidation

    // Check timing restrictions
    const timingValidation = this.validateTiming(gameState, card, player)
    if (!timingValidation.isValid) return timingValidation

    return { isValid: true }
  }

  validateBasicConditions(gameState, card, player) {
    // Check if it's player's turn
    if (gameState.currentPlayer !== player.id) {
      return { isValid: false, error: 'Not your turn', suggestions: ['Wait for your turn'] }
    }

    // Check if card is in player's hand
    const playerHand = gameState.playerHands[player.id] || []
    if (!playerHand.find(c => c.id === card.id)) {
      return { isValid: false, error: 'Card not in hand', suggestions: ['Select a card from your hand'] }
    }

    return { isValid: true }
  }

  validateResourceCosts(gameState, card, player) {
    const playerResources = player.id === 'pt_student'
      ? gameState.ptResources
      : gameState.patientResources

    // Calculate actual card cost with modifiers
    const actualEnergyCost = this.calculateModifiedCardCost(gameState, card, player.id)

    // Check energy cost (with modifiers)
    if (actualEnergyCost > 0 && playerResources.energy < actualEnergyCost) {
      return {
        isValid: false,
        error: `Insufficient energy (need ${actualEnergyCost}, have ${playerResources.energy})`,
        suggestions: ['End turn to regenerate energy', 'Use a lower cost card']
      }
    }

    // Check deflection cost
    if (card.deflection_cost && playerResources.deflection < card.deflection_cost) {
      return { 
        isValid: false, 
        error: `Insufficient deflection points (need ${card.deflection_cost}, have ${playerResources.deflection})`, 
        suggestions: ['Use cards that generate deflection', 'Choose a different strategy'] 
      }
    }

    // Check emotional cost
    if (card.emotional_cost && playerResources.emotional < card.emotional_cost) {
      return { 
        isValid: false, 
        error: `Insufficient emotional resources (need ${card.emotional_cost}, have ${playerResources.emotional})`, 
        suggestions: ['Wait for emotional recovery', 'Use communication cards'] 
      }
    }

    return { isValid: true }
  }

  calculateModifiedCardCost(gameState, card, playerId) {
    let cost = card.energy_cost || 0
    const legacyModifiers = gameState.modifiers || {}
    const activeModifiers = gameState.activeModifiers || []

    // Apply legacy modifiers (for backward compatibility)
    if (legacyModifiers.cardCostIncrease) {
      cost += legacyModifiers.cardCostIncrease
    }
    if (card.type === 'treatment' && legacyModifiers.treatmentCostIncrease) {
      cost += legacyModifiers.treatmentCostIncrease
    }

    // Apply new active modifiers
    activeModifiers.forEach(modifier => {
      if (modifier.effect.type === 'card_cost' && modifier.effect.target === 'all') {
        cost += modifier.effect.modifier
      }
      if (modifier.effect.type === 'card_cost' && modifier.effect.target === card.type) {
        cost += modifier.effect.modifier
      }
      if (modifier.effect.type === 'assessment_cost' && card.type === 'assessment') {
        cost += modifier.effect.modifier
      }
    })

    // Check treatment limits (legacy and new)
    if (card.type === 'treatment') {
      const legacyLimit = legacyModifiers.treatmentLimit
      const activeLimit = activeModifiers.find(m => m.effect.type === 'treatment_limit')?.effect.modifier
      const treatmentLimit = activeLimit || legacyLimit
      
      if (treatmentLimit) {
        const treatmentCardsPlayed = gameState.gameLog?.filter(log =>
          log.action === 'card_played' &&
          (log.cardType === 'treatment' || log.effects?.some(e => e.type === 'assessment'))
        ).length || 0
        
        if (treatmentCardsPlayed >= treatmentLimit) {
          return Infinity // Cannot play more treatment cards
        }
      }
    }

    return Math.max(0, cost)
  }

  validateTargeting(gameState, card, player, targetId) {
    // Check if card requires a target
    if (card.requires_target && !targetId) {
      return { 
        isValid: false, 
        error: 'This card requires a target', 
        suggestions: ['Select a valid target'] 
      }
    }

    // Check if target is valid
    if (targetId && !this.isValidTarget(gameState, card, targetId)) {
      return { 
        isValid: false, 
        error: 'Invalid target for this card', 
        suggestions: ['Select a different target'] 
      }
    }

    return { isValid: true }
  }

  validateTiming(gameState, card, player) {
    // Check phase restrictions
    if (card.phase_restrictions && !card.phase_restrictions.includes(gameState.currentPhase)) {
      return { 
        isValid: false, 
        error: `Cannot play this card during ${gameState.currentPhase} phase`, 
        suggestions: [`Wait for ${card.phase_restrictions.join(' or ')} phase`] 
      }
    }

    // Check once-per-turn restrictions
    if (card.once_per_turn && gameState.cardsPlayedThisTurn.includes(card.id)) {
      return { 
        isValid: false, 
        error: 'Card already played this turn', 
        suggestions: ['Choose a different card'] 
      }
    }

    return { isValid: true }
  }

  findCard(gameState, cardId, playerId) {
    const playerHand = gameState.playerHands[playerId] || []
    return playerHand.find(c => c.id === cardId)
  }

  isValidTarget(gameState, card, targetId) {
    // Implementation depends on card targeting rules
    return true // Simplified for now
  }
}

// Card Interaction Engine
class CardInteractionEngine {
  async calculateInteractions(gameState, cardId, playerId, targetId) {
    const card = this.findCard(gameState, cardId, playerId)
    const player = { id: playerId, role: playerId }

    const interactions = {
      primaryEffects: await this.calculatePrimaryEffects(card, gameState, player, targetId),
      secondaryEffects: await this.calculateSecondaryEffects(card, gameState),
      counterableEffects: await this.identifyCounterableEffects(card, gameState),
      educationalImpact: await this.calculateEducationalImpact(card, gameState, player),
      clinicalRealism: await this.assessClinicalRealism(card, gameState)
    }

    return interactions
  }

  async calculatePrimaryEffects(card, gameState, player, targetId) {
    const effects = []

    // Resource changes with modifiers
    const actualEnergyCost = this.calculateModifiedCardCost(gameState, card, player.id)
    if (actualEnergyCost > 0) {
      effects.push({
        type: 'resource_change',
        target: player.id === 'pt_student' ? 'ptResources' : 'patientResources',
        property: 'energy',
        change: -actualEnergyCost,
        description: `Spend ${actualEnergyCost} energy${actualEnergyCost !== card.energy_cost ? ' (modified)' : ''}`
      })
    }

    // Rapport changes
    if (card.rapport_change) {
      effects.push({
        type: 'resource_change',
        target: 'ptResources',
        property: 'rapport',
        change: card.rapport_change,
        description: `${card.rapport_change > 0 ? 'Increase' : 'Decrease'} rapport by ${Math.abs(card.rapport_change)}`
      })
    }

    // Card-specific effects based on type
    switch (card.type) {
      case 'assessment':
        effects.push(...await this.calculateAssessmentEffects(card, gameState))
        break
      case 'communication':
        effects.push(...await this.calculateCommunicationEffects(card, gameState))
        break
      case 'deflection':
        effects.push(...await this.calculateDeflectionEffects(card, gameState))
        break
      case 'emotional_state':
        effects.push(...await this.calculateEmotionalEffects(card, gameState))
        break
    }

    return effects
  }

  async calculateAssessmentEffects(card, gameState) {
    const effects = []

    // Check for assessment failure chance from modifiers
    const modifiers = gameState.modifiers || {}
    const failureChance = modifiers.assessmentFailureChance || 0
    
    if (failureChance > 0 && Math.random() < failureChance) {
      effects.push({
        type: 'assessment_failed',
        description: 'Assessment failed due to equipment malfunction',
        failure_reason: 'equipment_malfunction'
      })
      return effects
    }

    // Reveal clues based on card power (with potential bonuses)
    let cluesRevealed = card.clues_revealed || 1
    if (modifiers.assessmentBonus) {
      cluesRevealed += modifiers.assessmentBonus
    }

    effects.push({
      type: 'reveal_clues',
      count: cluesRevealed,
      category: card.assessment_category || 'general',
      description: `Reveal ${cluesRevealed} ${card.assessment_category || 'general'} finding(s)${modifiers.assessmentBonus ? ' (bonus clue)' : ''}`
    })

    // Increase diagnostic confidence
    effects.push({
      type: 'diagnostic_progress',
      category: card.assessment_category,
      confidence_increase: card.confidence_boost || 10,
      description: 'Increase diagnostic confidence'
    })

    return effects
  }

  async calculateCommunicationEffects(card, gameState) {
    const effects = []

    // Improve rapport
    const rapportChange = card.rapport_change || 1
    effects.push({
      type: 'resource_change',
      target: 'ptResources',
      property: 'rapport',
      change: rapportChange,
      description: `${rapportChange > 0 ? 'Increase' : 'Decrease'} rapport by ${Math.abs(rapportChange)}`
    })

    // Counter emotional states
    if (card.counters_emotional) {
      effects.push({
        type: 'counter_effects',
        target: 'emotional_states',
        description: 'Counter active emotional states'
      })
    }

    return effects
  }

  async calculateDeflectionEffects(card, gameState) {
    const effects = []

    // Reduce information revealed
    effects.push({
      type: 'information_reduction',
      reduction_factor: card.information_reduction || 0.5,
      description: 'Reduce information clarity'
    })

    // Increase complexity
    if (card.adds_complexity) {
      effects.push({
        type: 'add_complexity',
        complexity_type: card.complexity_type,
        description: 'Add clinical complexity'
      })
    }

    return effects
  }

  async calculateEmotionalEffects(card, gameState) {
    const effects = []

    // Emotional state changes
    effects.push({
      type: 'emotional_state_change',
      emotion: card.emotion_type,
      intensity: card.intensity || 'moderate',
      description: `Patient experiences ${card.emotion_type}`
    })

    // Require specific responses
    if (card.requires_response) {
      effects.push({
        type: 'response_requirement',
        required_response: card.requires_response,
        timeout: card.response_timeout || 30,
        description: `PT must respond with ${card.requires_response}`
      })
    }

    return effects
  }

  async processChainedEffects(gameState, primaryInteractions) {
    const chainedEffects = []

    // Check for triggered abilities
    for (const effect of primaryInteractions.primaryEffects) {
      const triggers = await this.checkForTriggers(gameState, effect)
      chainedEffects.push(...triggers)
    }

    // Check for opponent responses
    const responseOpportunities = await this.identifyResponseOpportunities(gameState, primaryInteractions)
    chainedEffects.push(...responseOpportunities)

    return chainedEffects
  }

  async checkForTriggers(gameState, effect) {
    const triggers = []

    // Check active effects for triggers
    const activeEffects = gameState.activeEffects || { pt_student: [], patient: [] }
    Object.values(activeEffects).flat().forEach(activeEffect => {
      if (this.effectTriggers(activeEffect, effect)) {
        triggers.push({
          type: 'triggered_effect',
          source: activeEffect.id,
          trigger: effect.type,
          effect: activeEffect.triggered_effect
        })
      }
    })

    return triggers
  }

  async identifyResponseOpportunities(gameState, interactions) {
    const opportunities = []

    // Check if opponent can counter
    const opponentRole = gameState.currentPlayer === 'pt_student' ? 'patient' : 'pt_student'
    const opponentHand = gameState.playerHands[opponentRole] || []

    opponentHand.forEach(card => {
      if (this.canCounter(card, interactions)) {
        opportunities.push({
          type: 'counter_opportunity',
          card: card.id,
          player: opponentRole,
          window: 10, // seconds to respond
          description: `${card.name} can counter this effect`
        })
      }
    })

    return opportunities
  }

  effectTriggers(activeEffect, newEffect) {
    return activeEffect.triggers && activeEffect.triggers.includes(newEffect.type)
  }

  canCounter(card, interactions) {
    return card.counters && interactions.counterableEffects.some(effect => 
      card.counters.includes(effect.type)
    )
  }

  async calculateEducationalImpact(card, gameState, player) {
    return {
      competency_targeted: this.identifyTargetedCompetency(card),
      learning_objective: this.mapToLearningObjective(card),
      difficulty_level: this.assessDifficultyLevel(card, gameState),
      clinical_relevance: this.assessClinicalRelevance(card),
      teaching_moment: this.identifyTeachingMoment(card, gameState)
    }
  }

  identifyTargetedCompetency(card) {
    const competencyMap = {
      'assessment': 'diagnostic_accuracy',
      'communication': 'therapeutic_communication',
      'clinical_reasoning': 'clinical_reasoning',
      'history_taking': 'information_gathering'
    }
    return competencyMap[card.type] || 'general_practice'
  }

  mapToLearningObjective(card) {
    return `Practice ${card.type.replace('_', ' ')} skills`
  }

  assessDifficultyLevel(card, gameState) {
    return gameState.currentCase?.difficulty || 'beginner'
  }

  assessClinicalRelevance(card) {
    return 'high' // Simplified for now
  }

  identifyTeachingMoment(card, gameState) {
    if (card.type === 'assessment' && gameState.discoveredClues.length === 0) {
      return 'First assessment - foundation of clinical reasoning'
    }
    return null
  }

  findCard(gameState, cardId, playerId) {
    const playerHand = gameState.playerHands[playerId] || []
    return playerHand.find(c => c.id === cardId)
  }

  async calculateSecondaryEffects(card, gameState) {
    return [] // Simplified for now
  }

  async identifyCounterableEffects(card, gameState) {
    return [] // Simplified for now
  }

  async assessClinicalRealism(card, gameState) {
    return { score: 85 } // Simplified for now
  }
}

// Game State Manager
class GameStateManager {
  async applyCardEffects(gameState, interactions, card, playerId) {
    const newGameState = JSON.parse(JSON.stringify(gameState)) // Deep clone

    // Remove card from player's hand
    const playerHand = newGameState.playerHands[playerId] || []
    const cardIndex = playerHand.findIndex(c => c.id === card.id)
    if (cardIndex !== -1) {
      playerHand.splice(cardIndex, 1)
    }

    // Apply primary effects
    for (const effect of interactions.primaryEffects) {
      await this.applyEffect(newGameState, effect)
    }

    // Update game log with enhanced formatting
    const playerName = playerId === 'pt_student' ? 'Therapist' : 'Patient'
    newGameState.gameLog = newGameState.gameLog || []
    newGameState.gameLog.push({
      timestamp: Date.now(),
      action: 'card_played',
      player: playerId,
      cardName: card.name,
      cardText: card.card_text,
      flavorText: card.flavor_text,
      message: `${playerName} played ${card.name}.`,
      effects: interactions.primaryEffects,
      educational_impact: interactions.educationalImpact
    })

    // Update turn state
    newGameState.cardsPlayedThisTurn = newGameState.cardsPlayedThisTurn || []
    newGameState.cardsPlayedThisTurn.push(card.id)

    // Add card combo checking
    newGameState.lastCardPlayed = {
      id: card.id,
      type: card.type,
      playerId: playerId,
      turnPlayed: newGameState.turnNumber
    }

    return newGameState
  }

  async applyEffect(gameState, effect) {
    switch (effect.type) {
      case 'resource_change':
        this.applyResourceChange(gameState, effect)
        break
      case 'reveal_clues':
        this.revealClues(gameState, effect)
        break
      case 'diagnostic_progress':
        this.updateDiagnosticProgress(gameState, effect)
        break
      case 'emotional_state_change':
        this.updateEmotionalState(gameState, effect)
        break
      case 'add_complexity':
        this.addComplexity(gameState, effect)
        break
      case 'assessment_failed':
        this.handleAssessmentFailure(gameState, effect)
        break
    }
  }

  handleAssessmentFailure(gameState, effect) {
    // Add failure to game log
    gameState.gameLog = gameState.gameLog || []
    gameState.gameLog.push({
      timestamp: Date.now(),
      action: 'assessment_failed',
      player: 'system',
      message: `Assessment failed: ${effect.description}`,
      failure_reason: effect.failure_reason
    })
  }

  applyResourceChange(gameState, effect) {
    const target = gameState[effect.target]
    if (target && target[effect.property] !== undefined) {
      // Apply modifier effects for cooperation bonus
      let change = effect.change
      if (effect.property === 'cooperation' && gameState.modifiers?.cooperationBonus) {
        change += gameState.modifiers.cooperationBonus
      }
      
      target[effect.property] = Math.max(0, target[effect.property] + change)
    }
  }

  revealClues(gameState, effect) {
    gameState.discoveredClues = gameState.discoveredClues || []
    
    for (let i = 0; i < effect.count; i++) {
      const clue = this.generateClue(gameState, effect.category)
      if (clue) {
        gameState.discoveredClues.push(clue)
      }
    }
  }

  generateClue(gameState, category) {
    const clueDatabase = {
      'physical_exam': [
        { id: 'pe_1', description: 'Swelling noted in lateral ankle', category: 'physical_exam', reliability: 0.9 },
        { id: 'pe_2', description: 'Tenderness over ATFL', category: 'physical_exam', reliability: 0.85 },
        { id: 'pe_3', description: 'Limited dorsiflexion ROM', category: 'physical_exam', reliability: 0.8 }
      ],
      'history': [
        { id: 'h_1', description: 'Pain began immediately after injury', category: 'history', reliability: 0.95 },
        { id: 'h_2', description: 'Heard a "pop" when injury occurred', category: 'history', reliability: 0.7 },
        { id: 'h_3', description: 'Unable to bear weight initially', category: 'history', reliability: 0.8 }
      ]
    }

    const categoryClues = clueDatabase[category] || clueDatabase['physical_exam']
    const availableClues = categoryClues.filter(clue => 
      !gameState.discoveredClues.find(discovered => discovered.id === clue.id)
    )

    if (availableClues.length === 0) return null

    const randomClue = availableClues[Math.floor(Math.random() * availableClues.length)]
    return {
      ...randomClue,
      discovered_at: Date.now(),
      confidence: this.calculateClueConfidence(gameState, randomClue)
    }
  }

  calculateClueConfidence(gameState, clue) {
    // Base confidence on patient cooperation and PT rapport
    const baseConfidence = clue.reliability
    const cooperationModifier = (gameState.patientResources.cooperation - 5) * 0.05
    const rapportModifier = (gameState.ptResources.rapport - 5) * 0.03
    
    return Math.max(0.1, Math.min(1.0, baseConfidence + cooperationModifier + rapportModifier))
  }

  updateDiagnosticProgress(gameState, effect) {
    // Update diagnostic confidence
    gameState.competencyProgress = gameState.competencyProgress || {}
    gameState.competencyProgress.diagnostic_accuracy = 
      (gameState.competencyProgress.diagnostic_accuracy || 50) + effect.confidence_increase
  }

  updateEmotionalState(gameState, effect) {
    gameState.activeEffects = gameState.activeEffects || { pt_student: [], patient: [] }
    gameState.activeEffects.patient.push({
      id: `emotion_${Date.now()}`,
      name: effect.emotion,
      description: effect.description,
      duration: 3 // turns
    })
  }

  addComplexity(gameState, effect) {
    gameState.complexity = gameState.complexity || []
    gameState.complexity.push({
      type: effect.complexity_type,
      description: effect.description,
      active: true
    })
  }

  async applyChainedEffects(gameState, chainedEffects) {
    const newGameState = { ...gameState }
    
    for (const effect of chainedEffects) {
      await this.applyEffect(newGameState, effect)
    }
    
    return newGameState
  }

  generateChecksum(gameState) {
    // Simple checksum for state validation
    const stateString = JSON.stringify({
      turnNumber: gameState.turnNumber,
      currentPlayer: gameState.currentPlayer,
      resources: { ...gameState.ptResources, ...gameState.patientResources },
      clueCount: gameState.discoveredClues.length
    })
    
    let hash = 0
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }
}

// Predictive Game State Engine
class PredictiveGameStateEngine {
  async generatePredictions(gameState) {
    return {
      nextTurnProbabilities: await this.calculateNextTurnProbabilities(gameState),
      optimalPlays: await this.suggestOptimalPlays(gameState),
      riskAssessment: await this.assessRisks(gameState),
      learningOpportunities: await this.identifyLearningOpportunities(gameState),
      gameEndPredictions: await this.predictGameEnd(gameState)
    }
  }

  async calculateNextTurnProbabilities(gameState) {
    const currentPlayer = gameState.currentPlayer
    const opponentRole = currentPlayer === 'pt_student' ? 'patient' : 'pt_student'
    const opponentHand = gameState.playerHands[opponentRole] || []

    const probabilities = {}

    opponentHand.forEach(card => {
      const playProbability = this.calculateCardPlayProbability(card, gameState)
      probabilities[card.id] = {
        card: card.name,
        probability: playProbability,
        impact: this.assessCardImpact(card, gameState),
        counter_strategies: this.suggestCounterStrategies(card, gameState)
      }
    })

    return probabilities
  }

  calculateCardPlayProbability(card, gameState) {
    let probability = 0.5 // Base probability

    // Adjust based on game state
    const player = gameState.currentPlayer === 'pt_student' ? gameState.ptResources : gameState.patientResources

    // Resource availability
    if (card.energy_cost && player.energy >= card.energy_cost) {
      probability += 0.2
    } else if (card.energy_cost && player.energy < card.energy_cost) {
      probability = 0 // Cannot play
    }

    // Strategic value
    if (this.isStrategicallyValuable(card, gameState)) {
      probability += 0.3
    }

    // Urgency factors
    if (this.isUrgentPlay(card, gameState)) {
      probability += 0.2
    }

    return Math.max(0, Math.min(1, probability))
  }

  isStrategicallyValuable(card, gameState) {
    // Check if card addresses current game state needs
    if (card.type === 'communication' && gameState.ptResources.rapport < 3) {
      return true
    }
    if (card.type === 'assessment' && gameState.discoveredClues.length < 3) {
      return true
    }
    return false
  }

  isUrgentPlay(card, gameState) {
    // Check for urgent situations
    if (gameState.turnNumber > gameState.maxTurns - 3) {
      return card.type === 'assessment' || card.type === 'clinical_reasoning'
    }
    return false
  }

  assessCardImpact(card, gameState) {
    // Assess the potential impact of playing this card
    let impact = 5 // Base impact

    if (card.type === 'assessment') {
      impact += card.clues_revealed || 1
    }

    if (card.type === 'communication') {
      impact += Math.abs(card.rapport_change || 1)
    }

    if (card.type === 'deflection') {
      impact += 3
    }

    return impact
  }

  suggestCounterStrategies(card, gameState) {
    const strategies = []

    if (card.type === 'deflection') {
      strategies.push('Use empathy or explanation cards to address concerns')
    }

    if (card.type === 'emotional_state') {
      strategies.push('Respond with therapeutic communication')
    }

    return strategies
  }

  async suggestOptimalPlays(gameState) {
    const currentPlayer = gameState.currentPlayer
    const playerHand = gameState.playerHands[currentPlayer] || []

    const playOptions = []

    for (const card of playerHand) {
      const value = await this.calculatePlayValue(card, gameState)
      const risk = await this.calculatePlayRisk(card, gameState)

      playOptions.push({
        card: card,
        value: value,
        risk: risk,
        netBenefit: value - risk,
        reasoning: this.generatePlayReasoning(card, gameState, value, risk)
      })
    }

    // Sort by net benefit
    return playOptions.sort((a, b) => b.netBenefit - a.netBenefit)
  }

  async calculatePlayValue(card, gameState) {
    let value = 0

    // Educational value
    value += this.calculateEducationalValue(card, gameState)

    // Strategic value
    value += this.calculateStrategicValue(card, gameState)

    // Progress value
    value += this.calculateProgressValue(card, gameState)

    return value
  }

  calculateEducationalValue(card, gameState) {
    // Higher value for cards that target learning objectives
    const competency = this.identifyTargetedCompetency(card)
    const playerProgress = gameState.competencyProgress?.[competency] || 0

    // More value for competencies that need improvement
    return (100 - playerProgress) / 10
  }

  calculateStrategicValue(card, gameState) {
    let value = 0

    // Value based on current game state needs
    if (card.type === 'assessment' && gameState.discoveredClues.length < 5) {
      value += 15
    }

    if (card.type === 'communication' && gameState.ptResources.rapport < 5) {
      value += 12
    }

    return value
  }

  calculateProgressValue(card, gameState) {
    // Value based on game progress
    const turnProgress = gameState.turnNumber / gameState.maxTurns

    if (turnProgress > 0.7 && card.type === 'assessment') {
      return 20 // High value for assessments late in game
    }

    return 5
  }

  async calculatePlayRisk(card, gameState) {
    let risk = 0

    // Resource cost risk
    if (card.energy_cost) {
      const playerResources = gameState.currentPlayer === 'pt_student' 
        ? gameState.ptResources 
        : gameState.patientResources
      
      const energyRatio = card.energy_cost / playerResources.energy
      if (energyRatio > 0.5) {
        risk += 10
      }
    }

    // Opponent counter risk
    const opponentRole = gameState.currentPlayer === 'pt_student' ? 'patient' : 'pt_student'
    const opponentHand = gameState.playerHands[opponentRole] || []
    
    const canBeCountered = opponentHand.some(opponentCard => 
      opponentCard.counters && opponentCard.counters.includes(card.type)
    )
    
    if (canBeCountered) {
      risk += 15
    }

    return risk
  }

  generatePlayReasoning(card, gameState, value, risk) {
    if (value > risk + 10) {
      return `Strong play - ${card.name} addresses key learning objectives`
    }
    
    if (risk > value + 5) {
      return `Risky play - ${card.name} may be countered or too costly`
    }
    
    return `Balanced play - ${card.name} offers moderate benefit`
  }

  identifyTargetedCompetency(card) {
    const competencyMap = {
      'assessment': 'diagnostic_accuracy',
      'communication': 'therapeutic_communication',
      'clinical_reasoning': 'clinical_reasoning'
    }
    return competencyMap[card.type] || 'general'
  }

  async assessRisks(gameState) {
    return [] // Simplified for now
  }

  async identifyLearningOpportunities(gameState) {
    return [] // Simplified for now
  }

  async predictGameEnd(gameState) {
    return {} // Simplified for now
  }
}

// Patient Victory System
class PatientVictorySystem {
  constructor() {
    this.victoryConditions = {
      educational_catalyst: {
        description: "Create meaningful learning moments for PT student",
        points: 50,
        criteria: {
          learning_moments_created: 3,
          bias_recognition_triggered: 1,
          communication_improvement_demonstrated: 1
        }
      },
      authentic_representation: {
        description: "Maintain clinical realism while extending engagement",
        points: 40,
        criteria: {
          realism_score_threshold: 85,
          engagement_duration_bonus: 20,
          deflection_appropriateness: 0.8
        }
      },
      collaborative_achievement: {
        description: "Help PT student improve during the game",
        points: 35,
        criteria: {
          pt_accuracy_improvement: 0.15,
          rapport_maintenance: 6,
          constructive_feedback_provided: 2
        }
      }
    }
  }

  async updateVictoryConditions(gameState, interactions) {
    const update = {
      patient_score: 0,
      pt_score: 0,
      learning_moments: [],
      victory_progress: {},
      game_end_triggered: false
    }

    // Calculate patient victory progress
    update.victory_progress = await this.calculateVictoryProgress(gameState, interactions)
    update.patient_score = this.calculatePatientScore(update.victory_progress)

    // Calculate PT victory progress
    update.pt_score = this.calculatePTScore(gameState)

    // Check for learning moments
    update.learning_moments = this.identifyLearningMoments(interactions)

    // Check for game end conditions
    update.game_end_triggered = this.checkGameEndConditions(gameState, update)

    return update
  }

  async calculateVictoryProgress(gameState, interactions) {
    const progress = {}

    // Educational catalyst progress
    progress.educational_catalyst = {
      learning_moments: this.countLearningMomentsCreated(gameState),
      bias_recognition: this.countBiasRecognitionEvents(gameState),
      communication_improvement: this.measureCommunicationImprovement(gameState),
      progress_percentage: 0
    }

    // Authentic representation progress
    progress.authentic_representation = {
      realism_score: this.calculateCurrentRealismScore(gameState),
      engagement_duration: gameState.turnNumber,
      deflection_appropriateness: this.calculateDeflectionAppropriateness(gameState),
      progress_percentage: 0
    }

    // Collaborative achievement progress
    progress.collaborative_achievement = {
      pt_improvement: this.measurePTImprovement(gameState),
      rapport_level: gameState.ptResources.rapport,
      constructive_feedback: this.countConstructiveFeedback(gameState),
      progress_percentage: 0
    }

    // Calculate progress percentages
    Object.keys(progress).forEach(condition => {
      progress[condition].progress_percentage = this.calculateProgressPercentage(
        condition, 
        progress[condition]
      )
    })

    return progress
  }

  calculatePatientScore(victoryProgress) {
    let score = 0

    Object.keys(this.victoryConditions).forEach(condition => {
      const progress = victoryProgress[condition]
      const maxPoints = this.victoryConditions[condition].points
      score += (progress.progress_percentage / 100) * maxPoints
    })

    return Math.round(score)
  }

  calculatePTScore(gameState) {
    let score = 0

    // Diagnostic accuracy
    const diagnosticAccuracy = this.calculateDiagnosticAccuracy(gameState)
    score += diagnosticAccuracy * 0.4

    // Communication effectiveness
    const communicationScore = this.calculateCommunicationScore(gameState)
    score += communicationScore * 0.3

    // Efficiency
    const efficiencyScore = this.calculateEfficiencyScore(gameState)
    score += efficiencyScore * 0.2

    // Learning demonstration
    const learningScore = this.calculateLearningScore(gameState)
    score += learningScore * 0.1

    return Math.round(score)
  }

  identifyLearningMoments(interactions) {
    const moments = []

    // Check for educational impact in interactions
    if (interactions.educationalImpact) {
      if (interactions.educationalImpact.teaching_moment) {
        moments.push({
          type: 'teaching_moment',
          description: interactions.educationalImpact.teaching_moment,
          competency: interactions.educationalImpact.competency_targeted,
          timestamp: Date.now()
        })
      }
    }

    return moments
  }

  checkGameEndConditions(gameState, update) {
    // Check if maximum turns reached
    if (gameState.turnNumber >= gameState.maxTurns) {
      return {
        reason: 'max_turns_reached',
        winner: this.determineWinner(update)
      }
    }

    // Check if patient achieved major victory condition
    const patientVictoryAchieved = Object.values(update.victory_progress).some(
      progress => progress.progress_percentage >= 100
    )

    if (patientVictoryAchieved) {
      return {
        reason: 'patient_victory',
        winner: 'patient'
      }
    }

    // Check if PT achieved diagnostic success
    const diagnosticAccuracy = this.calculateDiagnosticAccuracy(gameState)
    if (diagnosticAccuracy >= 90 && gameState.discoveredClues.length >= 5) {
      return {
        reason: 'diagnostic_success',
        winner: 'pt_student'
      }
    }

    return false
  }

  determineWinner(update) {
    if (update.patient_score > update.pt_score) {
      return 'patient'
    } else if (update.pt_score > update.patient_score) {
      return 'pt_student'
    } else {
      return 'draw'
    }
  }

  // Helper methods for scoring calculations
  countLearningMomentsCreated(gameState) {
    return gameState.gameLog?.filter(log => 
      log.educational_impact?.teaching_moment
    ).length || 0
  }

  countBiasRecognitionEvents(gameState) {
    return gameState.gameLog?.filter(log => 
      log.educational_impact?.competency_targeted === 'bias_recognition'
    ).length || 0
  }

  measureCommunicationImprovement(gameState) {
    const logs = gameState.gameLog || []
    const communicationLogs = logs.filter(log => 
      log.educational_impact?.competency_targeted === 'therapeutic_communication'
    )
    return communicationLogs.length > 0 ? 1 : 0
  }

  calculateCurrentRealismScore(gameState) {
    // Calculate based on deflection appropriateness and patient behavior consistency
    const deflectionAppropriate = this.calculateDeflectionAppropriateness(gameState)
    const behaviorConsistent = this.calculateBehaviorConsistency(gameState)
    return (deflectionAppropriate * 0.6 + behaviorConsistent * 0.4) * 100
  }

  calculateDeflectionAppropriateness(gameState) {
    // Analyze deflection cards played for clinical appropriateness
    const deflectionActions = gameState.gameLog?.filter(log => 
      log.action === 'card_played' && 
      log.effects?.some(effect => effect.type === 'deflection')
    ) || []

    if (deflectionActions.length === 0) return 1.0

    let appropriateCount = 0
    deflectionActions.forEach(action => {
      // Check if deflection was contextually appropriate
      if (this.isDeflectionAppropriate(action, gameState)) {
        appropriateCount++
      }
    })

    return appropriateCount / deflectionActions.length
  }

  isDeflectionAppropriate(action, gameState) {
    // Simplified check - in real implementation, this would analyze
    // clinical context, patient profile, and timing
    return true // Placeholder
  }

  calculateBehaviorConsistency(gameState) {
    // Check if patient behavior remains consistent with established profile
    return 0.85 // Placeholder
  }

  measurePTImprovement(gameState) {
    const logs = gameState.gameLog || []
    if (logs.length < 6) return 0

    const earlyPerformance = logs.slice(0, 3)
    const latePerformance = logs.slice(-3)

    const earlyAccuracy = this.calculateLogAccuracy(earlyPerformance)
    const lateAccuracy = this.calculateLogAccuracy(latePerformance)

    return Math.max(0, (lateAccuracy - earlyAccuracy) / earlyAccuracy)
  }

  calculateLogAccuracy(logs) {
    // Simplified accuracy calculation based on successful actions
    const successfulActions = logs.filter(log => log.success !== false).length
    return logs.length > 0 ? successfulActions / logs.length : 0
  }

  countConstructiveFeedback(gameState) {
    return gameState.gameLog?.filter(log => 
      log.feedback_type === 'constructive'
    ).length || 0
  }

  calculateProgressPercentage(condition, progress) {
    const criteria = this.victoryConditions[condition].criteria

    switch (condition) {
      case 'educational_catalyst':
        const learningProgress = Math.min(100, 
          (progress.learning_moments / criteria.learning_moments_created) * 100
        )
        return learningProgress

      case 'authentic_representation':
        return Math.min(100, progress.realism_score)

      case 'collaborative_achievement':
        const improvementProgress = Math.min(100, 
          (progress.pt_improvement / criteria.pt_accuracy_improvement) * 100
        )
        return improvementProgress

      default:
        return 0
    }
  }

  calculateDiagnosticAccuracy(gameState) {
    // Calculate based on correct clues found vs total possible
    const totalPossibleClues = 10 // For this case
    const correctClues = gameState.discoveredClues?.filter(clue => 
      clue.confidence > 0.7
    ).length || 0

    return Math.min(100, (correctClues / totalPossibleClues) * 100)
  }

  calculateCommunicationScore(gameState) {
    const rapport = gameState.ptResources.rapport || 0
    const maxRapport = 10
    return (rapport / maxRapport) * 100
  }

  calculateEfficiencyScore(gameState) {
    const optimalTurns = gameState.maxTurns * 0.7 // 70% of max turns is optimal
    const actualTurns = gameState.turnNumber

    if (actualTurns <= optimalTurns) {
      return 100
    } else {
      return Math.max(0, 100 - ((actualTurns - optimalTurns) / optimalTurns) * 50)
    }
  }

  calculateLearningScore(gameState) {
    const learningMoments = this.countLearningMomentsCreated(gameState)
    return Math.min(100, learningMoments * 25) // 4 learning moments = 100%
  }
}

export const gameEngine = new GameEngine()