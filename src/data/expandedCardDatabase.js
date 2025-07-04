// Enhanced card database with Camp Grizzly-style professional sarcasm
export const PHYSIOTACTICS_CARD_DATABASE = {
  pt_student_cards: [
    {
      id: 'pt_rom_assessment',
      name: 'Range of Motion Test',
      type: 'assessment',
      energy_cost: 2,
      rarity: 'common',
      card_text: 'Reveal 1 Physical Finding clue. Patient may play 1 Deflection response.',
      flavor_text: 'Because asking "can you move it?" is apparently rocket science.',
      image_description: 'A PT with a goniometer looking professionally skeptical',
      clues_revealed: 1,
      assessment_category: 'physical_exam'
    },
    {
      id: 'pt_active_listening',
      name: 'Actually Listen',
      type: 'communication',
      energy_cost: 0,
      rarity: 'common',
      card_text: 'Counter Patient emotional cards. Gain +1 Rapport. Revolutionary concept.',
      flavor_text: 'Who knew that paying attention could be therapeutic?',
      image_description: 'A PT with exaggerated listening pose, hand cupped to ear',
      rapport_change: 1,
      counters_emotional: true
    },
    {
      id: 'pt_pain_scale_reality',
      name: 'Pain Scale Reality Check',
      type: 'history_taking',
      energy_cost: 1,
      rarity: 'uncommon',
      card_text: 'Reveal pain level (1-10). Patient cannot modify result. Apply evidence-based interpretation.',
      flavor_text: 'Finally, a pain scale that means something beyond "it hurts."',
      image_description: 'Pain scale chart with realistic annotations',
      clues_revealed: 1,
      confidence_boost: 10
    },
    {
      id: 'pt_differential_diagnosis',
      name: 'Differential Diagnosis',
      type: 'clinical_reasoning',
      energy_cost: 3,
      rarity: 'rare',
      card_text: 'Narrow to 3 possible conditions. +15 diagnostic confidence. Requires 4+ clues.',
      flavor_text: 'Because ruling things out is just as important as ruling them in. Mind-blowing.',
      image_description: 'Flowchart with multiple pathways, some crossed out',
      requires_clues: 4,
      confidence_boost: 15
    },
    {
      id: 'pt_therapeutic_exercise',
      name: 'Evidence-Based Exercise',
      type: 'treatment',
      energy_cost: 2,
      rarity: 'uncommon',
      card_text: 'Address functional limitation. Requires proper assessment first.',
      flavor_text: 'Revolutionary idea: base treatment on actual findings.',
      image_description: 'Exercise demonstration with proper form annotations',
      requires_assessment: true
    }
  ],
  
  patient_cards: [
    {
      id: 'patient_dr_google',
      name: 'WebMD Consultation',
      type: 'deflection',
      deflection_cost: 2,
      rarity: 'common',
      card_text: 'Counter assessment card. "I already know what this is from the internet."',
      flavor_text: 'Because 10 minutes on WebMD obviously trumps years of education.',
      image_description: 'Phone screen showing medical website with dramatic diagnoses',
      counters: ['assessment']
    },
    {
      id: 'patient_previous_provider',
      name: 'My Last Therapist Said...',
      type: 'deflection',
      deflection_cost: 1,
      rarity: 'common',
      card_text: 'Redirect conversation to previous treatment. PT loses focus.',
      flavor_text: 'Every previous provider was either amazing or terrible. No middle ground.',
      image_description: 'Nostalgic thought bubble with idealized PT figure',
      information_reduction: 0.4
    },
    {
      id: 'patient_time_constraint',
      name: 'Running Late Drama',
      type: 'complexity',
      emotional_cost: 1,
      rarity: 'common',
      card_text: 'Add time pressure. PT must prioritize assessments.',
      flavor_text: 'Because proper evaluation is so much better under pressure.',
      image_description: 'Clock with stressed expressions surrounding it',
      adds_complexity: true,
      complexity_type: 'time_pressure'
    },
    {
      id: 'patient_insurance_anxiety',
      name: 'Coverage Concerns',
      type: 'emotional_state',
      emotional_cost: 2,
      rarity: 'uncommon',
      card_text: 'PT must address financial concerns or lose rapport.',
      flavor_text: 'Healthcare anxiety: now with extra bureaucratic flavor.',
      image_description: 'Insurance forms with question marks and worried expressions',
      emotion_type: 'anxiety',
      requires_response: 'communication'
    },
    {
      id: 'patient_miracle_cure',
      name: 'Quick Fix Expectation',
      type: 'deflection',
      deflection_cost: 2,
      rarity: 'uncommon',
      card_text: 'Demand immediate solution. PT must educate about realistic timelines.',
      flavor_text: 'Because healing should obviously work like software updates.',
      image_description: 'Magic wand pointed at injury with sparkles',
      requires_education: true
    }
  ],
  
  case_specific_cards: {
    ankle_sprain: {
      pt_cards: [
        {
          id: 'pt_ottawa_ankle_rules',
          name: 'Ottawa Ankle Rules',
          type: 'assessment',
          energy_cost: 2,
          rarity: 'rare',
          card_text: 'Apply evidence-based fracture screening. High-confidence clue about bone integrity.',
          flavor_text: 'Evidence-based decision making. What a concept.',
          image_description: 'Ankle anatomy with decision tree overlay',
          clues_revealed: 1,
          confidence_boost: 25,
          assessment_category: 'special_test'
        },
        {
          id: 'pt_weight_bearing_test',
          name: 'Weight Bearing Assessment',
          type: 'assessment',
          energy_cost: 1,
          rarity: 'common',
          card_text: 'Observe functional weight bearing. Simple but revealing.',
          flavor_text: 'Sometimes the most basic tests tell you everything.',
          image_description: 'Patient attempting to stand on injured ankle',
          clues_revealed: 1,
          assessment_category: 'functional'
        }
      ],
      patient_cards: [
        {
          id: 'patient_athlete_invincibility',
          name: 'Athletic Invincibility Complex',
          type: 'deflection',
          deflection_cost: 2,
          rarity: 'uncommon',
          card_text: 'Minimize injury significance. "I can play through anything."',
          flavor_text: 'Because pain is just weakness leaving the body, right?',
          image_description: 'Superhero pose with injured ankle poorly hidden',
          information_reduction: 0.6
        },
        {
          id: 'patient_ankle_sprain_expert',
          name: 'Ankle Sprain Expert',
          type: 'deflection',
          deflection_cost: 1,
          rarity: 'common',
          card_text: 'Dismiss assessment. "It\'s just a sprain, I know what those feel like."',
          flavor_text: 'Self-diagnosis: because medical training is apparently optional.',
          image_description: 'Patient pointing to ankle with confident expression',
          information_reduction: 0.3
        }
      ]
    },
    
    lower_back_pain: {
      pt_cards: [
        {
          id: 'pt_red_flag_screening',
          name: 'Red Flag Screening',
          type: 'assessment',
          energy_cost: 2,
          rarity: 'rare',
          card_text: 'Screen for serious pathology. Critical for patient safety.',
          flavor_text: 'Because some things actually are serious. Shocking.',
          image_description: 'Checklist with warning symbols',
          clues_revealed: 1,
          confidence_boost: 30,
          assessment_category: 'screening'
        },
        {
          id: 'pt_movement_screen',
          name: 'Movement Analysis',
          type: 'assessment',
          energy_cost: 2,
          rarity: 'uncommon',
          card_text: 'Assess movement patterns. Reveal functional limitations.',
          flavor_text: 'Movement tells a story. If you bother to watch.',
          image_description: 'Stick figure movement sequence with notes',
          clues_revealed: 1,
          assessment_category: 'movement'
        }
      ],
      patient_cards: [
        {
          id: 'patient_back_pain_veteran',
          name: 'Chronic Pain Veteran',
          type: 'complexity',
          emotional_cost: 2,
          rarity: 'uncommon',
          card_text: 'Add complexity from previous treatments. "I\'ve tried everything."',
          flavor_text: 'The healthcare system tour guide, unwillingly experienced.',
          image_description: 'Patient with stack of medical records',
          adds_complexity: true,
          complexity_type: 'medical_history'
        }
      ]
    }
  },
  
  // Advanced PT Student Cards for experienced gameplay
  advanced_pt_cards: [
    {
      id: 'pt_motivational_interviewing',
      name: 'Motivational Interviewing',
      type: 'communication',
      energy_cost: 3,
      rarity: 'rare',
      card_text: 'Counter patient resistance. Build intrinsic motivation for treatment.',
      flavor_text: 'Psychology meets PT. Revolutionary combination.',
      image_description: 'PT and patient in engaged conversation',
      rapport_change: 2,
      counters_resistance: true
    },
    {
      id: 'pt_clinical_prediction_rules',
      name: 'Clinical Prediction Rules',
      type: 'clinical_reasoning',
      energy_cost: 3,
      rarity: 'rare',
      card_text: 'Apply validated screening tools. High confidence diagnostic boost.',
      flavor_text: 'Evidence-based practice in action. What a concept.',
      image_description: 'Decision tree with statistical validation markers',
      confidence_boost: 20,
      requires_clues: 3
    },
    {
      id: 'pt_patient_education',
      name: 'Proper Patient Education',
      type: 'communication',
      energy_cost: 2,
      rarity: 'uncommon',
      card_text: 'Educate about condition and treatment. Counter misinformation.',
      flavor_text: 'Fighting the good fight against Dr. Google, one patient at a time.',
      image_description: 'Educational diagrams and patient nodding in understanding',
      counters_misinformation: true,
      rapport_change: 1
    }
  ],
  
  // Advanced Patient Cards for complex scenarios
  advanced_patient_cards: [
    {
      id: 'patient_litigation_concern',
      name: 'Legal Anxiety',
      type: 'emotional_state',
      emotional_cost: 3,
      rarity: 'rare',
      card_text: 'Patient worried about legal implications. Communication becomes critical.',
      flavor_text: 'When healthcare meets the legal system. Joy.',
      image_description: 'Balance scales with medical and legal symbols',
      emotion_type: 'anxiety',
      requires_response: 'communication'
    },
    {
      id: 'patient_secondary_gain',
      name: 'Secondary Gain Complexity',
      type: 'complexity',
      emotional_cost: 2,
      rarity: 'rare',
      card_text: 'Multiple motivations affect presentation. Requires advanced clinical reasoning.',
      flavor_text: 'Human psychology: more complicated than anatomy charts.',
      image_description: 'Multiple arrows pointing in different directions',
      adds_complexity: true,
      complexity_type: 'psychosocial'
    },
    {
      id: 'patient_cultural_considerations',
      name: 'Cultural Health Beliefs',
      type: 'complexity',
      emotional_cost: 1,
      rarity: 'uncommon',
      card_text: 'Different cultural perspective on pain and healing. Requires cultural competence.',
      flavor_text: 'One size fits all? Not in healthcare.',
      image_description: 'Diverse healing symbols from different cultures',
      adds_complexity: true,
      complexity_type: 'cultural'
    }
  ],
  
  // Victory condition cards
  victory_cards: [
    {
      id: 'pt_accurate_diagnosis',
      name: 'Accurate Diagnosis',
      type: 'victory',
      energy_cost: 4,
      rarity: 'epic',
      card_text: 'Achieve diagnostic accuracy ≥85%. Requires comprehensive assessment.',
      flavor_text: 'Getting it right. The entire point of this exercise.',
      image_description: 'Lightbulb moment with diagnostic clarity',
      victory_condition: 'diagnostic_accuracy',
      required_confidence: 85
    },
    {
      id: 'pt_patient_buy_in',
      name: 'Patient Buy-in',
      type: 'victory',
      energy_cost: 3,
      rarity: 'epic',
      card_text: 'Achieve high rapport and treatment compliance. The holy grail.',
      flavor_text: 'When the patient actually wants to get better. Miraculous.',
      image_description: 'Handshake between PT and motivated patient',
      victory_condition: 'patient_engagement',
      required_rapport: 8
    }
  ]
}
