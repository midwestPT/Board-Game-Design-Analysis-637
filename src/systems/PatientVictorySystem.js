export class PatientVictorySystem {
  constructor() {
    this.victoryConditions = {
      primary_victories: {
        educational_catalyst: {
          description: "Successfully create 3+ meaningful learning moments",
          points: 50,
          examples: ["trigger_bias_recognition", "demonstrate_communication_importance", "reveal_assessment_gaps"]
        },
        authentic_representation: {
          description: "Maintain realism score >85% while extending game naturally",
          points: 45,
          metrics: ["deflection_appropriateness", "emotional_authenticity", "complexity_timing"]
        },
        collaborative_achievement: {
          description: "PT player improves performance during game due to patient feedback",
          points: 40,
          measurement: "pt_accuracy_improvement_mid_game"
        }
      },
      
      anti_frustration_mechanics: {
        constructive_deflection_bonus: "Extra points for deflections that teach rather than obstruct",
        empathy_recognition_reward: "Bonus when PT demonstrates improved empathy",
        clinical_insight_catalyst: "Points for helping PT recognize important patterns"
      },
      
      shared_victory_conditions: {
        mutual_learning: "Both players achieve learning objectives = highest point total",
        professional_growth: "PT demonstrates improved clinical reasoning = bonus for both",
        therapeutic_relationship: "High rapport maintained throughout = collaboration bonus"
      }
    };
  }

  evaluatePatientPerformance(gameState, actions) {
    let score = 0;
    const learningMoments = this.identifyLearningMoments(actions);
    const realismScore = this.calculateRealismScore(actions, gameState);
    const ptImprovement = this.measurePTImprovement(gameState);

    // Educational catalyst scoring
    if (learningMoments.length >= 3) {
      score += this.victoryConditions.primary_victories.educational_catalyst.points;
    }

    // Authentic representation scoring
    if (realismScore > 85) {
      score += this.victoryConditions.primary_victories.authentic_representation.points;
    }

    // Collaborative achievement scoring
    if (ptImprovement > 0.15) {
      score += this.victoryConditions.primary_victories.collaborative_achievement.points;
    }

    return {
      totalScore: score,
      breakdown: {
        learningMoments,
        realismScore,
        ptImprovement,
        constructiveActions: this.identifyConstructiveActions(actions)
      }
    };
  }

  identifyLearningMoments(actions) {
    const learningMoments = [];
    
    actions.forEach(action => {
      if (action.type === 'deflection' && action.educational_value > 0.7) {
        learningMoments.push({
          type: 'constructive_deflection',
          description: `Helped PT recognize ${action.learning_point}`,
          timestamp: action.timestamp
        });
      }
      
      if (action.triggers_reflection && action.pt_response_quality > 0.8) {
        learningMoments.push({
          type: 'insight_catalyst',
          description: `Prompted PT to reconsider ${action.focus_area}`,
          timestamp: action.timestamp
        });
      }
    });

    return learningMoments;
  }

  calculateRealismScore(actions, gameState) {
    let realismTotal = 0;
    let actionCount = 0;

    actions.forEach(action => {
      if (action.realism_rating) {
        realismTotal += action.realism_rating;
        actionCount++;
      }
    });

    const contextualBonus = this.evaluateContextualRealism(gameState);
    return actionCount > 0 ? (realismTotal / actionCount) * 100 + contextualBonus : 0;
  }

  measurePTImprovement(gameState) {
    const earlyPerformance = gameState.performance_history.slice(0, 3);
    const latePerformance = gameState.performance_history.slice(-3);
    
    const earlyAvg = earlyPerformance.reduce((sum, p) => sum + p.accuracy, 0) / earlyPerformance.length;
    const lateAvg = latePerformance.reduce((sum, p) => sum + p.accuracy, 0) / latePerformance.length;
    
    return (lateAvg - earlyAvg) / earlyAvg;
  }
}