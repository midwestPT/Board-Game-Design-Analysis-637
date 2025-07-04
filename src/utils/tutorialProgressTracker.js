// Tutorial Progress Tracker for PhysioTactics
export class TutorialProgressTracker {
  constructor() {
    this.storageKey = 'physiotactics_tutorial_progress'
    this.progress = this.loadProgress()
    this.stepDefinitions = this.initializeStepDefinitions()
  }

  // Initialize step definitions
  initializeStepDefinitions() {
    return {
      1: {
        id: 'basic_assessment',
        title: 'Basic Assessment',
        description: 'Learn how to perform fundamental patient assessments',
        objectives: [
          'Play an assessment card',
          'Observe clue revelation',
          'Understand energy costs'
        ],
        requiredActions: ['play_assessment_card', 'reveal_clue'],
        estimatedTime: 3
      },
      2: {
        id: 'patient_communication',
        title: 'Patient Communication',
        description: 'Master therapeutic communication techniques',
        objectives: [
          'Use communication cards effectively',
          'Build rapport with patient',
          'Counter emotional responses'
        ],
        requiredActions: ['play_communication_card', 'gain_rapport', 'counter_emotional'],
        estimatedTime: 4
      },
      3: {
        id: 'clinical_reasoning',
        title: 'Clinical Reasoning',
        description: 'Develop systematic clinical thinking',
        objectives: [
          'Combine clues for diagnosis',
          'Use evidence-based reasoning',
          'Build diagnostic confidence'
        ],
        requiredActions: ['play_reasoning_card', 'combine_clues', 'increase_confidence'],
        estimatedTime: 5
      },
      4: {
        id: 'energy_management',
        title: 'Energy Management',
        description: 'Learn to manage your energy resources efficiently',
        objectives: [
          'Plan energy expenditure',
          'Use low-cost cards strategically',
          'Maintain energy for critical moments'
        ],
        requiredActions: ['manage_energy', 'plan_sequence', 'strategic_play'],
        estimatedTime: 4
      },
      5: {
        id: 'patient_challenges',
        title: 'Patient Challenges',
        description: 'Handle difficult patient behaviors and responses',
        objectives: [
          'Counter deflection cards',
          'Manage emotional states',
          'Maintain therapeutic alliance'
        ],
        requiredActions: ['counter_deflection', 'manage_emotions', 'maintain_rapport'],
        estimatedTime: 6
      },
      6: {
        id: 'treatment_planning',
        title: 'Treatment Planning',
        description: 'Develop appropriate treatment interventions',
        objectives: [
          'Use assessment findings for treatment',
          'Select appropriate interventions',
          'Consider patient preferences'
        ],
        requiredActions: ['plan_treatment', 'use_findings', 'consider_preferences'],
        estimatedTime: 5
      },
      7: {
        id: 'complex_cases',
        title: 'Complex Cases',
        description: 'Handle cases with multiple complications',
        objectives: [
          'Manage complex patient presentations',
          'Adapt to unexpected challenges',
          'Maintain systematic approach'
        ],
        requiredActions: ['handle_complexity', 'adapt_strategy', 'stay_systematic'],
        estimatedTime: 7
      },
      8: {
        id: 'time_pressure',
        title: 'Time Pressure',
        description: 'Work efficiently under time constraints',
        objectives: [
          'Prioritize assessments',
          'Make quick decisions',
          'Maintain quality under pressure'
        ],
        requiredActions: ['prioritize', 'quick_decisions', 'maintain_quality'],
        estimatedTime: 5
      },
      9: {
        id: 'collaboration',
        title: 'Professional Collaboration',
        description: 'Work with other healthcare professionals',
        objectives: [
          'Communicate with team members',
          'Seek appropriate consultations',
          'Coordinate care effectively'
        ],
        requiredActions: ['team_communication', 'seek_consultation', 'coordinate_care'],
        estimatedTime: 4
      },
      10: {
        id: 'mastery_challenge',
        title: 'Mastery Challenge',
        description: 'Demonstrate comprehensive PT skills',
        objectives: [
          'Complete complex case efficiently',
          'Achieve high diagnostic accuracy',
          'Maintain excellent patient rapport'
        ],
        requiredActions: ['complete_complex_case', 'high_accuracy', 'excellent_rapport'],
        estimatedTime: 8
      }
    }
  }

  // Load progress from storage
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultProgress()
    } catch (error) {
      console.warn('Failed to load tutorial progress:', error)
      return this.getDefaultProgress()
    }
  }

  // Get default progress structure
  getDefaultProgress() {
    return {
      currentStep: 1,
      completedSteps: [],
      stepProgress: {},
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalTimeSpent: 0,
      achievements: [],
      settings: {
        showHints: true,
        autoAdvance: true,
        skipAnimations: false
      }
    }
  }

  // Save progress to storage
  saveProgress() {
    try {
      this.progress.lastActiveAt = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress))
    } catch (error) {
      console.warn('Failed to save tutorial progress:', error)
    }
  }

  // Start tutorial step
  startStep(stepNumber) {
    if (!this.stepDefinitions[stepNumber]) {
      throw new Error(`Invalid step number: ${stepNumber}`)
    }

    this.progress.currentStep = stepNumber
    this.progress.stepProgress[stepNumber] = {
      startedAt: new Date().toISOString(),
      completedActions: [],
      hintsUsed: 0,
      attempts: 0,
      timeSpent: 0
    }

    this.saveProgress()
    return this.getCurrentStepInfo()
  }

  // Record action completion
  completeAction(stepNumber, actionType, metadata = {}) {
    if (!this.progress.stepProgress[stepNumber]) {
      this.progress.stepProgress[stepNumber] = {
        startedAt: new Date().toISOString(),
        completedActions: [],
        hintsUsed: 0,
        attempts: 0,
        timeSpent: 0
      }
    }

    const stepProgress = this.progress.stepProgress[stepNumber]
    
    // Add action if not already completed
    if (!stepProgress.completedActions.includes(actionType)) {
      stepProgress.completedActions.push(actionType)
      stepProgress.attempts++
    }

    // Add metadata
    if (metadata) {
      stepProgress.metadata = { ...(stepProgress.metadata || {}), ...metadata }
    }

    // Check if step is complete
    if (this.isStepComplete(stepNumber)) {
      this.completeStep(stepNumber)
    }

    this.saveProgress()
    return this.getStepProgress(stepNumber)
  }

  // Check if step is complete
  isStepComplete(stepNumber) {
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]
    
    if (!stepDef || !stepProgress) return false

    return stepDef.requiredActions.every(action => 
      stepProgress.completedActions.includes(action)
    )
  }

  // Complete tutorial step
  completeStep(stepNumber) {
    if (!this.progress.completedSteps.includes(stepNumber)) {
      this.progress.completedSteps.push(stepNumber)
      
      // Calculate time spent
      const stepProgress = this.progress.stepProgress[stepNumber]
      if (stepProgress && stepProgress.startedAt) {
        const timeSpent = new Date() - new Date(stepProgress.startedAt)
        stepProgress.timeSpent = timeSpent
        this.progress.totalTimeSpent += timeSpent
      }

      // Award achievements
      this.checkAchievements(stepNumber)
      
      // Auto-advance if enabled
      if (this.progress.settings.autoAdvance && stepNumber < 10) {
        this.progress.currentStep = stepNumber + 1
      }
    }

    this.saveProgress()
    return this.getCompletionInfo(stepNumber)
  }

  // Check for achievements
  checkAchievements(stepNumber) {
    const stepProgress = this.progress.stepProgress[stepNumber]
    const achievements = []

    // Speed achievements
    if (stepProgress.timeSpent < this.stepDefinitions[stepNumber].estimatedTime * 60000 * 0.75) {
      achievements.push({
        id: `speed_${stepNumber}`,
        title: 'Speed Demon',
        description: `Completed step ${stepNumber} faster than expected`,
        type: 'speed',
        earnedAt: new Date().toISOString()
      })
    }

    // Efficiency achievements
    if (stepProgress.attempts === stepProgress.completedActions.length) {
      achievements.push({
        id: `efficient_${stepNumber}`,
        title: 'First Try',
        description: `Completed step ${stepNumber} without mistakes`,
        type: 'efficiency',
        earnedAt: new Date().toISOString()
      })
    }

    // Help usage achievements
    if (stepProgress.hintsUsed === 0) {
      achievements.push({
        id: `independent_${stepNumber}`,
        title: 'Independent Learner',
        description: `Completed step ${stepNumber} without hints`,
        type: 'independence',
        earnedAt: new Date().toISOString()
      })
    }

    // Add new achievements
    achievements.forEach(achievement => {
      if (!this.progress.achievements.find(a => a.id === achievement.id)) {
        this.progress.achievements.push(achievement)
      }
    })

    return achievements
  }

  // Use hint
  useHint(stepNumber, hintType = 'general') {
    if (!this.progress.stepProgress[stepNumber]) {
      this.startStep(stepNumber)
    }

    this.progress.stepProgress[stepNumber].hintsUsed++
    
    // Return appropriate hint
    const hint = this.getHint(stepNumber, hintType)
    this.saveProgress()
    
    return hint
  }

  // Get hint for step
  getHint(stepNumber, hintType) {
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]
    
    const hints = {
      1: {
        general: "Try playing an assessment card first. Look for cards with 'assessment' type.",
        specific: "The Range of Motion Test is a good starting assessment card.",
        energy: "Assessment cards cost energy. Make sure you have enough before playing."
      },
      2: {
        general: "Communication cards help build rapport and counter patient emotions.",
        specific: "Try the 'Actually Listen' card - it's free and builds rapport.",
        rapport: "Watch your rapport level in the game stats. Higher is better!"
      },
      3: {
        general: "Clinical reasoning cards help you make sense of discovered clues.",
        specific: "Use 'Differential Diagnosis' when you have enough clues.",
        confidence: "Your diagnostic confidence increases when you use reasoning effectively."
      }
    }

    return hints[stepNumber]?.[hintType] || hints[stepNumber]?.general || 
           "Keep exploring the available cards and their effects."
  }

  // Get current step information
  getCurrentStepInfo() {
    const stepNumber = this.progress.currentStep
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]

    return {
      stepNumber,
      definition: stepDef,
      progress: stepProgress,
      isComplete: this.isStepComplete(stepNumber),
      nextActions: this.getNextActions(stepNumber),
      estimatedTimeRemaining: this.getEstimatedTimeRemaining(stepNumber)
    }
  }

  // Get next required actions
  getNextActions(stepNumber) {
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]
    
    if (!stepDef || !stepProgress) return []

    return stepDef.requiredActions.filter(action => 
      !stepProgress.completedActions.includes(action)
    )
  }

  // Get estimated time remaining
  getEstimatedTimeRemaining(stepNumber) {
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]
    
    if (!stepDef || !stepProgress) return stepDef?.estimatedTime || 0

    const elapsed = stepProgress.timeSpent || 0
    const estimated = stepDef.estimatedTime * 60000 // Convert to milliseconds
    
    return Math.max(0, estimated - elapsed)
  }

  // Get step progress
  getStepProgress(stepNumber) {
    const stepDef = this.stepDefinitions[stepNumber]
    const stepProgress = this.progress.stepProgress[stepNumber]
    
    if (!stepDef) return null

    const totalActions = stepDef.requiredActions.length
    const completedActions = stepProgress?.completedActions.length || 0
    
    return {
      stepNumber,
      totalActions,
      completedActions,
      percentage: (completedActions / totalActions) * 100,
      isComplete: completedActions === totalActions,
      definition: stepDef,
      progress: stepProgress
    }
  }

  // Get completion info
  getCompletionInfo(stepNumber) {
    const stepProgress = this.progress.stepProgress[stepNumber]
    const stepDef = this.stepDefinitions[stepNumber]
    
    return {
      stepNumber,
      definition: stepDef,
      timeSpent: stepProgress?.timeSpent || 0,
      attempts: stepProgress?.attempts || 0,
      hintsUsed: stepProgress?.hintsUsed || 0,
      efficiency: this.calculateEfficiency(stepNumber),
      achievements: this.progress.achievements.filter(a => 
        a.id.includes(`_${stepNumber}`)
      )
    }
  }

  // Calculate efficiency score
  calculateEfficiency(stepNumber) {
    const stepProgress = this.progress.stepProgress[stepNumber]
    const stepDef = this.stepDefinitions[stepNumber]
    
    if (!stepProgress || !stepDef) return 0

    let score = 100
    
    // Deduct points for excessive attempts
    const expectedAttempts = stepDef.requiredActions.length
    const actualAttempts = stepProgress.attempts || 0
    if (actualAttempts > expectedAttempts) {
      score -= (actualAttempts - expectedAttempts) * 10
    }
    
    // Deduct points for hint usage
    score -= (stepProgress.hintsUsed || 0) * 5
    
    // Deduct points for taking too long
    const expectedTime = stepDef.estimatedTime * 60000
    const actualTime = stepProgress.timeSpent || 0
    if (actualTime > expectedTime * 1.5) {
      score -= 20
    }
    
    return Math.max(0, Math.min(100, score))
  }

  // Get overall progress
  getOverallProgress() {
    const totalSteps = Object.keys(this.stepDefinitions).length
    const completedSteps = this.progress.completedSteps.length
    
    return {
      totalSteps,
      completedSteps,
      currentStep: this.progress.currentStep,
      percentage: (completedSteps / totalSteps) * 100,
      totalTimeSpent: this.progress.totalTimeSpent,
      achievements: this.progress.achievements,
      averageEfficiency: this.calculateAverageEfficiency(),
      isComplete: completedSteps === totalSteps
    }
  }

  // Calculate average efficiency
  calculateAverageEfficiency() {
    const completedSteps = this.progress.completedSteps
    if (completedSteps.length === 0) return 0
    
    const efficiencies = completedSteps.map(step => this.calculateEfficiency(step))
    return efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
  }

  // Reset tutorial progress
  resetProgress() {
    this.progress = this.getDefaultProgress()
    this.saveProgress()
    return this.progress
  }

  // Skip to step
  skipToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 10) {
      throw new Error('Invalid step number')
    }
    
    this.progress.currentStep = stepNumber
    this.saveProgress()
    return this.getCurrentStepInfo()
  }

  // Update settings
  updateSettings(newSettings) {
    this.progress.settings = { ...this.progress.settings, ...newSettings }
    this.saveProgress()
    return this.progress.settings
  }
}

export default TutorialProgressTracker