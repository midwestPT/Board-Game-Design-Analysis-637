import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlay, FiRotateCcw, FiCheckCircle, FiX } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Welcome to PhysioTactics",
    content: "You're about to learn the art of clinical reasoning through card-based gameplay. As a PT student, you'll assess patients, build rapport, and reach accurate diagnoses.",
    highlight: null,
    visual: "game-overview",
    action: null
  },
  {
    id: 2,
    title: "Your Role: The PT Student",
    content: "You play as a PT student facing real clinical scenarios. Your goal is to gather clues, build patient rapport, and achieve diagnostic confidence through evidence-based assessment.",
    highlight: "pt-role",
    visual: "pt-student-cards",
    action: "Click on PT student cards to see your assessment and treatment options"
  },
  {
    id: 3,
    title: "Energy System",
    content: "Each turn, you have Energy to spend on cards. Energy regenerates at the start of your turn. Manage it wisely - complex assessments cost more but reveal valuable information.",
    highlight: "energy-display",
    visual: "energy-system",
    action: "Notice the energy cost on each card (blue number in corner)"
  },
  {
    id: 4,
    title: "Assessment Cards",
    content: "Assessment cards reveal clues about the patient's condition. The more clues you gather, the higher your diagnostic confidence. Different assessment types reveal different information.",
    highlight: "assessment-cards",
    visual: "card-types",
    action: "Play 'Range of Motion Test' to reveal a physical finding clue"
  },
  {
    id: 5,
    title: "Patient Responses",
    content: "Patients aren't passive! They play deflection cards, express emotions, and add complexity. You'll need communication skills to counter their resistance and build rapport.",
    highlight: "patient-area",
    visual: "patient-cards",
    action: "Watch as the AI patient responds to your assessment"
  },
  {
    id: 6,
    title: "Building Rapport",
    content: "Rapport is crucial for patient compliance. Use communication cards to build trust, counter emotional distress, and maintain the therapeutic relationship.",
    highlight: "rapport-meter",
    visual: "rapport-system",
    action: "Play 'Actually Listen' to gain rapport and counter patient emotions"
  },
  {
    id: 7,
    title: "Diagnostic Confidence",
    content: "Your diagnostic confidence increases as you gather clues and apply clinical reasoning. Reach 85% confidence to achieve victory through accurate diagnosis.",
    highlight: "confidence-meter",
    visual: "confidence-system",
    action: "Notice how confidence changes as you play assessment cards"
  },
  {
    id: 8,
    title: "Card Interactions & Combos",
    content: "Some cards work better together. Look for combo opportunities and card synergies. The game log shows detailed reasoning for each action.",
    highlight: "game-log",
    visual: "card-interactions",
    action: "Check the game log to see AI reasoning and card effects"
  },
  {
    id: 9,
    title: "Victory Conditions",
    content: "Win by achieving high diagnostic confidence (85%+) or excellent patient rapport (8+). Different scenarios may have specific requirements.",
    highlight: "victory-section",
    visual: "victory-conditions",
    action: "Monitor your progress toward victory conditions"
  },
  {
    id: 10,
    title: "Clinical Scenarios",
    content: "Each scenario presents unique challenges with condition-specific cards and patient personalities. Apply your PT knowledge and adapt your strategy.",
    highlight: "scenario-info",
    visual: "scenario-types",
    action: "Ready to start your first clinical encounter?"
  }
];

const TutorialHighlight = ({ children, isActive, description }) => (
  <div className={`relative ${isActive ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}>
    {children}
    {isActive && (
      <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-lg shadow-lg max-w-xs z-50">
        <div className="text-sm">{description}</div>
        <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500 transform translate-y-full"></div>
      </div>
    )}
  </div>
);

const TutorialVisual = ({ visual, step }) => {
  const visuals = {
    "game-overview": (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🏥</div>
          <h3 className="text-xl font-bold mb-2">Clinical Reasoning Game</h3>
          <p className="text-gray-600">Learn PT assessment through strategic card play</p>
        </div>
      </div>
    ),
    "pt-student-cards": (
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 p-3 rounded border-2 border-blue-200">
          <div className="text-xs text-blue-600 font-semibold">ASSESSMENT</div>
          <div className="font-bold text-sm">Range of Motion Test</div>
          <div className="text-xs mt-1">Cost: 2 Energy</div>
          <div className="text-xs text-gray-600">Reveals physical findings</div>
        </div>
        <div className="bg-green-50 p-3 rounded border-2 border-green-200">
          <div className="text-xs text-green-600 font-semibold">COMMUNICATION</div>
          <div className="font-bold text-sm">Actually Listen</div>
          <div className="text-xs mt-1">Cost: 0 Energy</div>
          <div className="text-xs text-gray-600">Counter emotions, gain rapport</div>
        </div>
      </div>
    ),
    "energy-system": (
      <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Energy</span>
          <span className="text-2xl font-bold text-yellow-600">⚡ 6/12</span>
        </div>
        <div className="text-sm text-gray-600">
          Regenerates +3 each turn. Spend wisely on assessments and treatments.
        </div>
      </div>
    ),
    "patient-cards": (
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 p-3 rounded border-2 border-red-200">
          <div className="text-xs text-red-600 font-semibold">DEFLECTION</div>
          <div className="font-bold text-sm">WebMD Consultation</div>
          <div className="text-xs mt-1">Cost: 2 Deflection</div>
          <div className="text-xs text-gray-600">"I already know what this is..."</div>
        </div>
        <div className="bg-orange-50 p-3 rounded border-2 border-orange-200">
          <div className="text-xs text-orange-600 font-semibold">EMOTIONAL</div>
          <div className="font-bold text-sm">Movement Anxiety</div>
          <div className="text-xs mt-1">Cost: 2 Emotional</div>
          <div className="text-xs text-gray-600">Fear limits participation</div>
        </div>
      </div>
    ),
    "rapport-system": (
      <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Patient Rapport</span>
          <span className="text-2xl font-bold text-purple-600">💜 5/10</span>
        </div>
        <div className="text-sm text-gray-600">
          Higher rapport = better compliance and treatment outcomes
        </div>
      </div>
    ),
    "confidence-system": (
      <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Diagnostic Confidence</span>
          <span className="text-2xl font-bold text-indigo-600">🎯 65%</span>
        </div>
        <div className="text-sm text-gray-600">
          Gather clues and apply reasoning to reach 85% for victory
        </div>
      </div>
    ),
    "victory-conditions": (
      <div className="space-y-2">
        <div className="bg-green-50 p-3 rounded border-2 border-green-200">
          <div className="font-bold text-green-800">🏆 Accurate Diagnosis</div>
          <div className="text-sm text-green-600">Reach 85%+ diagnostic confidence</div>
        </div>
        <div className="bg-blue-50 p-3 rounded border-2 border-blue-200">
          <div className="font-bold text-blue-800">🤝 Patient Buy-in</div>
          <div className="text-sm text-blue-600">Achieve 8+ rapport for compliance</div>
        </div>
      </div>
    )
  };

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
      <h4 className="font-bold mb-3 text-center">Visual Guide</h4>
      {visuals[visual] || (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>Interactive demonstration for step {step.id}</p>
        </div>
      )}
    </div>
  );
};

const Tutorial = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startInteractiveDemo = () => {
    setIsPlaying(true);
    // This would trigger the actual game demo
    setTimeout(() => {
      setIsPlaying(false);
      nextStep();
    }, 3000);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">PhysioTactics Tutorial</h2>
              <p className="text-blue-100">Learn the fundamentals of clinical reasoning gameplay</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Step {currentStep + 1} of {TUTORIAL_STEPS.length}</div>
                <div className="w-32 bg-blue-400 rounded-full h-2 mt-1">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={onSkip}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{step.content}</p>
              
              {step.action && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                  <div className="flex items-start">
                    <SafeIcon icon={FiPlay} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-blue-800">Try This:</div>
                      <div className="text-blue-700 text-sm">{step.action}</div>
                    </div>
                  </div>
                </div>
              )}

              {step.id === TUTORIAL_STEPS.length && (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center">
                    <SafeIcon icon={FiCheckCircle} className="text-green-600 mr-2" />
                    <div className="font-semibold text-green-800">Ready to Play!</div>
                  </div>
                  <p className="text-green-700 text-sm mt-1">You now understand the core mechanics. Time to put your skills to the test!</p>
                </div>
              )}
            </div>

            <div>
              <TutorialVisual visual={step.visual} step={step} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex items-center justify-between border-t">
          <div className="flex items-center space-x-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              Skip Tutorial
            </button>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <SafeIcon icon={FiChevronLeft} className="mr-1" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {step.action && !isPlaying && (
              <button
                onClick={startInteractiveDemo}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <SafeIcon icon={FiPlay} className="mr-1" />
                Demo
              </button>
            )}
            
            {isPlaying && (
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center"
              >
                <SafeIcon icon={FiRotateCcw} className="mr-1 animate-spin" />
                Playing...
              </button>
            )}

            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? (
                <>
                  Next
                  <SafeIcon icon={FiChevronRight} className="ml-1" />
                </>
              ) : (
                <>
                  Start Playing
                  <SafeIcon icon={FiPlay} className="ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Tutorial;