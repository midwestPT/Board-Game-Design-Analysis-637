export class ProgressiveOnboardingSystem {
  constructor() {
    this.onboardingProgression = {
      phase_1_basics: {
        duration: 10, // minutes
        content: [
          "Single-card interactions (PT asks question, Patient responds)",
          "Basic resource management (Energy vs. Deflection Points)",
          "Simple case: Obvious ankle sprain with cooperative patient"
        ],
        success_metric: "Complete one full interaction cycle"
      },
      
      phase_2_complexity: {
        duration: 15,
        content: [
          "Card combinations and synergies",
          "Ongoing effects and counters",
          "Intermediate case: Chronic pain with mild emotional complexity"
        ],
        success_metric: "Successfully navigate one deflection-counter sequence"
      },
      
      phase_3_realism: {
        duration: 20,
        content: [
          "Full card ecosystem with weakness cards",
          "Cultural and social complexity factors",
          "Advanced case: Multiple comorbidities with realistic barriers"
        ],
        success_metric: "Complete game with satisfactory educational outcome"
      }
    };

    this.currentPhase = 'phase_1_basics';
    this.completedPhases = [];
  }

  initializeOnboarding(playerRole, experience_level) {
    const customizedPath = this.createRoleBasedPath(playerRole, experience_level);
    
    return {
      path: customizedPath,
      estimated_duration: this.calculateTotalDuration(customizedPath),
      checkpoint_system: this.setupCheckpoints(customizedPath),
      adaptive_features: this.enableAdaptiveFeatures()
    };
  }

  createRoleBasedPath(role, experience) {
    const basePath = { ...this.onboardingProgression };
    
    if (role === 'pt_student') {
      basePath.phase_1_basics.focus = "Assessment and diagnostic skills";
      basePath.phase_2_complexity.focus = "Clinical reasoning patterns";
      basePath.phase_3_realism.focus = "Professional decision-making";
    } else if (role === 'patient') {
      basePath.phase_1_basics.focus = "Realistic patient responses";
      basePath.phase_2_complexity.focus = "Emotional and cultural factors";
      basePath.phase_3_realism.focus = "Complex medical histories";
    }

    if (experience === 'beginner') {
      // Add extra practice scenarios
      Object.values(basePath).forEach(phase => {
        phase.practice_scenarios = phase.practice_scenarios || [];
        phase.practice_scenarios.push("Additional guided practice");
      });
    }

    return basePath;
  }

  setupCheckpoints(path) {
    return {
      auto_save: "Every 2 minutes or after significant actions",
      resume_capability: "Return to exact point of interruption",
      progress_indicators: "Visual progress bars and achievement markers",
      confidence_building: "Early success moments and positive reinforcement"
    };
  }

  enableAdaptiveFeatures() {
    return {
      concept_reinforcement: "Repeat key concepts in multiple contexts",
      difficulty_adjustment: "Adapt based on player success rate",
      help_system: "Context-sensitive hints and guidance",
      peer_examples: "Anonymous examples from successful players"
    };
  }

  evaluatePhaseCompletion(playerActions, currentPhase) {
    const phase = this.onboardingProgression[currentPhase];
    const successCriteria = this.getSuccessCriteria(phase.success_metric);
    
    const completion = this.assessPlayerProgress(playerActions, successCriteria);
    
    if (completion.passed) {
      this.completedPhases.push(currentPhase);
      return this.advanceToNextPhase();
    }
    
    return {
      phase_complete: false,
      areas_for_improvement: completion.improvement_areas,
      additional_practice: completion.recommended_practice
    };
  }
}