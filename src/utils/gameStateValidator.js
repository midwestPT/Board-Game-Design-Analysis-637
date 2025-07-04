// Game State Validation Utility for PhysioTactics
export class GameStateValidator {
  constructor() {
    this.validationRules = {
      energy: { min: 0, max: 15 },
      rapport: { min: 0, max: 10 },
      cooperation: { min: 0, max: 10 },
      deflection: { min: 0, max: 15 },
      emotional: { min: 0, max: 12 },
      diagnosticConfidence: { min: 0, max: 100 },
      maxTurns: { min: 5, max: 20 },
      handSize: { min: 0, max: 10 }
    }
  }

  // Validate complete game state
  validateGameState(gameState) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: []
    }

    // Validate basic structure
    this.validateStructure(gameState, validation)
    
    // Validate resource values
    this.validateResources(gameState, validation)
    
    // Validate turn logic
    this.validateTurnLogic(gameState, validation)
    
    // Validate card states
    this.validateCardStates(gameState, validation)
    
    // Validate active effects
    this.validateActiveEffects(gameState, validation)
    
    // Validate victory conditions
    this.validateVictoryConditions(gameState, validation)

    return validation
  }

  // Validate basic game state structure
  validateStructure(gameState, validation) {
    const requiredFields = [
      'turnNumber', 'maxTurns', 'currentPlayer', 'ptResources', 
      'patientResources', 'playerHands', 'discoveredClues', 'gameLog'
    ]

    requiredFields.forEach(field => {
      if (!(field in gameState)) {
        validation.isValid = false
        validation.errors.push(`Missing required field: ${field}`)
        validation.fixes.push(`Add ${field} to game state`)
      }
    })

    // Validate nested structures
    if (gameState.ptResources) {
      this.validateResourceStructure(gameState.ptResources, 'ptResources', validation)
    }

    if (gameState.patientResources) {
      this.validateResourceStructure(gameState.patientResources, 'patientResources', validation)
    }

    if (gameState.playerHands) {
      if (!Array.isArray(gameState.playerHands.pt_student)) {
        validation.errors.push('ptResources.pt_student must be an array')
      }
      if (!Array.isArray(gameState.playerHands.patient)) {
        validation.errors.push('patientResources.patient must be an array')
      }
    }
  }

  // Validate resource structure
  validateResourceStructure(resources, resourceType, validation) {
    const requiredFields = resourceType === 'ptResources' 
      ? ['energy', 'rapport'] 
      : ['cooperation', 'deflection', 'emotional']

    requiredFields.forEach(field => {
      if (!(field in resources)) {
        validation.errors.push(`Missing ${field} in ${resourceType}`)
      } else if (typeof resources[field] !== 'number') {
        validation.errors.push(`${field} in ${resourceType} must be a number`)
      }
    })
  }

  // Validate resource values
  validateResources(gameState, validation) {
    if (gameState.ptResources) {
      this.validateResourceValues(gameState.ptResources, 'PT', validation)
    }

    if (gameState.patientResources) {
      this.validateResourceValues(gameState.patientResources, 'Patient', validation)
    }

    // Validate diagnostic confidence
    if ('diagnosticConfidence' in gameState) {
      this.validateRange(
        gameState.diagnosticConfidence, 
        'diagnosticConfidence', 
        this.validationRules.diagnosticConfidence,
        validation
      )
    }
  }

  // Validate individual resource values
  validateResourceValues(resources, playerType, validation) {
    Object.keys(resources).forEach(resourceKey => {
      const value = resources[resourceKey]
      const rule = this.validationRules[resourceKey]
      
      if (rule) {
        this.validateRange(value, `${playerType} ${resourceKey}`, rule, validation)
      }
    })
  }

  // Validate value is within range
  validateRange(value, fieldName, rule, validation) {
    if (value < rule.min) {
      validation.warnings.push(`${fieldName} below minimum: ${value} < ${rule.min}`)
      validation.fixes.push(`Set ${fieldName} to minimum value ${rule.min}`)
    }
    
    if (value > rule.max) {
      validation.warnings.push(`${fieldName} above maximum: ${value} > ${rule.max}`)
      validation.fixes.push(`Set ${fieldName} to maximum value ${rule.max}`)
    }
  }

  // Validate turn logic
  validateTurnLogic(gameState, validation) {
    // Validate turn number
    if (gameState.turnNumber < 1) {
      validation.errors.push('Turn number must be at least 1')
      validation.fixes.push('Set turn number to 1')
    }

    if (gameState.turnNumber > gameState.maxTurns) {
      validation.warnings.push(`Turn number (${gameState.turnNumber}) exceeds max turns (${gameState.maxTurns})`)
    }

    // Validate max turns
    this.validateRange(
      gameState.maxTurns, 
      'maxTurns', 
      this.validationRules.maxTurns, 
      validation
    )

    // Validate current player
    const validPlayers = ['pt_student', 'patient']
    if (!validPlayers.includes(gameState.currentPlayer)) {
      validation.errors.push(`Invalid current player: ${gameState.currentPlayer}`)
      validation.fixes.push('Set current player to pt_student or patient')
    }
  }

  // Validate card states
  validateCardStates(gameState, validation) {
    if (gameState.playerHands) {
      // Validate PT hand
      if (gameState.playerHands.pt_student) {
        this.validateHand(gameState.playerHands.pt_student, 'PT Student', validation)
      }

      // Validate Patient hand  
      if (gameState.playerHands.patient) {
        this.validateHand(gameState.playerHands.patient, 'Patient', validation)
      }
    }

    // Validate discovered clues
    if (gameState.discoveredClues && !Array.isArray(gameState.discoveredClues)) {
      validation.errors.push('discoveredClues must be an array')
    }
  }

  // Validate individual hand
  validateHand(hand, playerType, validation) {
    if (!Array.isArray(hand)) {
      validation.errors.push(`${playerType} hand must be an array`)
      return
    }

    // Validate hand size
    this.validateRange(hand.length, `${playerType} hand size`, this.validationRules.handSize, validation)

    // Validate individual cards
    hand.forEach((card, index) => {
      this.validateCard(card, `${playerType} card ${index}`, validation)
    })
  }

  // Validate individual card
  validateCard(card, cardIdentifier, validation) {
    const requiredFields = ['id', 'name', 'type']
    
    requiredFields.forEach(field => {
      if (!(field in card)) {
        validation.errors.push(`${cardIdentifier} missing required field: ${field}`)
      }
    })

    // Validate card type
    const validTypes = [
      'assessment', 'history_taking', 'clinical_reasoning', 'communication', 
      'treatment', 'deflection', 'emotional_state', 'complexity'
    ]
    
    if (card.type && !validTypes.includes(card.type)) {
      validation.warnings.push(`${cardIdentifier} has unknown type: ${card.type}`)
    }

    // Validate energy costs are non-negative
    const costFields = ['energy_cost', 'deflection_cost', 'emotional_cost']
    costFields.forEach(field => {
      if (field in card && card[field] < 0) {
        validation.errors.push(`${cardIdentifier} has negative ${field}: ${card[field]}`)
      }
    })
  }

  // Validate active effects
  validateActiveEffects(gameState, validation) {
    if (gameState.activeEffects) {
      Object.keys(gameState.activeEffects).forEach(playerType => {
        const effects = gameState.activeEffects[playerType]
        
        if (!Array.isArray(effects)) {
          validation.errors.push(`Active effects for ${playerType} must be an array`)
          return
        }

        effects.forEach((effect, index) => {
          this.validateEffect(effect, `${playerType} effect ${index}`, validation)
        })
      })
    }

    // Validate active modifiers
    if (gameState.activeModifiers) {
      if (!Array.isArray(gameState.activeModifiers)) {
        validation.errors.push('activeModifiers must be an array')
      } else {
        gameState.activeModifiers.forEach((modifier, index) => {
          this.validateModifier(modifier, `modifier ${index}`, validation)
        })
      }
    }
  }

  // Validate individual effect
  validateEffect(effect, effectIdentifier, validation) {
    const requiredFields = ['type', 'duration']
    
    requiredFields.forEach(field => {
      if (!(field in effect)) {
        validation.errors.push(`${effectIdentifier} missing required field: ${field}`)
      }
    })

    if (effect.duration && effect.duration < 0) {
      validation.errors.push(`${effectIdentifier} has negative duration: ${effect.duration}`)
    }
  }

  // Validate individual modifier
  validateModifier(modifier, modifierIdentifier, validation) {
    const requiredFields = ['id', 'name', 'difficulty']
    
    requiredFields.forEach(field => {
      if (!(field in modifier)) {
        validation.errors.push(`${modifierIdentifier} missing required field: ${field}`)
      }
    })

    if (modifier.duration && modifier.duration < 0) {
      validation.errors.push(`${modifierIdentifier} has negative duration: ${modifier.duration}`)
    }
  }

  // Validate victory conditions
  validateVictoryConditions(gameState, validation) {
    // Check for game end conditions
    const gameEnded = this.checkGameEndConditions(gameState)
    
    if (gameEnded.hasEnded && !gameState.gameEnded) {
      validation.warnings.push(`Game should have ended: ${gameEnded.reason}`)
    }

    // Validate diagnostic confidence progression
    if (gameState.diagnosticConfidence > 90 && gameState.discoveredClues.length < 3) {
      validation.warnings.push('High diagnostic confidence with few clues discovered')
    }

    // Validate rapport vs cooperation consistency
    if (gameState.ptResources?.rapport > 8 && gameState.patientResources?.cooperation < 5) {
      validation.warnings.push('High rapport but low patient cooperation - inconsistent state')
    }
  }

  // Check game end conditions
  checkGameEndConditions(gameState) {
    // Turn limit reached
    if (gameState.turnNumber >= gameState.maxTurns) {
      return { hasEnded: true, reason: 'Maximum turns reached' }
    }

    // Victory conditions met
    if (gameState.diagnosticConfidence >= 85 && gameState.ptResources?.rapport >= 8) {
      return { hasEnded: true, reason: 'Victory conditions met' }
    }

    // Failure conditions
    if (gameState.ptResources?.energy <= 0) {
      return { hasEnded: true, reason: 'PT energy depleted' }
    }

    if (gameState.ptResources?.rapport <= 0) {
      return { hasEnded: true, reason: 'Patient rapport lost' }
    }

    return { hasEnded: false, reason: null }
  }

  // Apply automatic fixes
  applyFixes(gameState, validation) {
    const fixedState = { ...gameState }

    // Fix resource ranges
    if (fixedState.ptResources) {
      fixedState.ptResources = this.fixResourceRanges(fixedState.ptResources)
    }

    if (fixedState.patientResources) {
      fixedState.patientResources = this.fixResourceRanges(fixedState.patientResources)
    }

    // Fix diagnostic confidence
    if (fixedState.diagnosticConfidence) {
      fixedState.diagnosticConfidence = Math.max(0, Math.min(100, fixedState.diagnosticConfidence))
    }

    // Fix turn number
    if (fixedState.turnNumber < 1) {
      fixedState.turnNumber = 1
    }

    return fixedState
  }

  // Fix resource values to be within valid ranges
  fixResourceRanges(resources) {
    const fixed = { ...resources }
    
    Object.keys(fixed).forEach(key => {
      const rule = this.validationRules[key]
      if (rule && typeof fixed[key] === 'number') {
        fixed[key] = Math.max(rule.min, Math.min(rule.max, fixed[key]))
      }
    })

    return fixed
  }

  // Get validation summary
  getValidationSummary(validation) {
    return {
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      fixCount: validation.fixes.length,
      severity: validation.errors.length > 0 ? 'error' : 
                validation.warnings.length > 0 ? 'warning' : 'success'
    }
  }

  // Quick validation for performance-critical scenarios
  quickValidate(gameState) {
    const errors = []

    // Check critical fields only
    if (!gameState.turnNumber || gameState.turnNumber < 1) {
      errors.push('Invalid turn number')
    }

    if (!gameState.ptResources?.energy && gameState.ptResources?.energy !== 0) {
      errors.push('Missing PT energy')
    }

    if (!gameState.currentPlayer) {
      errors.push('Missing current player')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default GameStateValidator