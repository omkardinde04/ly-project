// Advanced Conversation Flows - Specific implementations for complex tasks

import type {
  Language,
  AssistantResponse,
  UserProfile
} from '../types/assistant';

/**
 * Handles multi-step profile building with intelligent follow-ups
 */
export class ProfileBuilderFlow {
  private profile: Partial<UserProfile> = {};
  private language: Language;

  constructor(language: Language = 'en') {
    this.language = language;
  }

  /**
   * Process profile field response
   */
  processFieldResponse(field: string, userInput: string): AssistantResponse {
    const cleaned = userInput.trim();
    let formattedInput: string | string[] = cleaned;

    if (field === 'skills' || field === 'interests') {
      formattedInput = cleaned.split(',').map(item => item.trim()).filter(Boolean);
    }

    // Validate and store response
    this.profile[field as keyof UserProfile] = formattedInput as any;

    // Generate intelligent follow-up
    const followUpMessages = {
      name: {
        en: `Nice to meet you, ${cleaned}! 👋`,
        hi: `आपसे मिलकर खुशी हुई, ${cleaned}! 👋`,
        mr: `आपसे मिलून्या साठी खुशी, ${cleaned}! 👋`
      },
      education: {
        en: `That's great! So you're studying ${cleaned}. Nice! 👍`,
        hi: `बहुत अच्छा! तो आप ${cleaned} का अध्ययन कर रहे हैं। बढ़िया! 👍`,
        mr: `खूप छान! तर तुम ${cleaned} अध्ययन करत आहे. बढ़िया! 👍`
      },
      skills: {
        en: `Awesome! ${cleaned} is a great skill to have. 💪`,
        hi: `शानदार! ${cleaned} होना एक बढ़िया कौशल है। 💪`,
        mr: `अप्रतिम! ${cleaned} असणे एक बढ़िया कौशल आहे. 💪`
      },
      interests: {
        en: `I see! You're interested in ${cleaned}. That's perfect for opportunities we have. 🎯`,
        hi: `मैं समझता हूँ! आप ${cleaned} में रुचि रखते हैं। यह सही है। 🎯`,
        mr: `मी समजतो! तुम ${cleaned} मध्ये रुची घेता. हे परफेक्ट आहे. 🎯`
      }
    };

    const followUpKey = field as keyof typeof followUpMessages;
    const followUp = followUpMessages[followUpKey]?.[this.language] || '';

    return {
      text: followUp,
      nextAction: 'ask',
      sessionData: { ...this.profile }
    };
  }

  /**
   * Check if profile is complete
   */
  isComplete(): boolean {
    return !!(
      this.profile.name &&
      this.profile.education &&
      this.profile.skills &&
      this.profile.interests
    );
  }

  /**
   * Get complete profile
   */
  getProfile(): Partial<UserProfile> {
    return { ...this.profile };
  }
}

/**
 * Handles opportunity recommendations with intelligent explanations
 */
export class OpportunityFlow {
  private language: Language;

  constructor(language: Language = 'en') {
    this.language = language;
  }

  /**
   * Simplify job description for dyslexic users
   */
  simplifyJobDescription(complexDescription: string): string {
    const simplifications = {
      en: {
        'analytical proficiency': 'comfortable with data and solving problems',
        'excellent communication': 'good at talking to people',
        'strong organizational skills': 'good at keeping things organized',
        'collaborative environment': 'working with a team',
        'strategic thinking': 'planning ahead',
        'demonstrated ability': 'proven you can do',
        'innovative solutions': 'creative ideas that work'
      },
      hi: {
        'analytical proficiency': 'डेटा समझने और समस्या हल करने में सहज',
        'excellent communication': 'लोगों से अच्छी तरह बातचीत करना',
        'strong organizational skills': 'चीजों को व्यवस्थित रखना अच्छा',
        'collaborative environment': 'एक टीम के साथ काम करना'
      },
      mr: {
        'analytical proficiency': 'डेटा समजणे आणि समस्या सोडविणे सहज',
        'excellent communication': 'लोकांशी चांगलं बोलणे',
        'strong organizational skills': 'गोष्टी व्यवस्थित ठेवणे चांगले'
      }
    };

    let simplified = complexDescription.toLowerCase();
    const mapping = simplifications[this.language] || simplifications.en;

    Object.entries(mapping).forEach(([complex, simple]) => {
      simplified = simplified.replace(
        new RegExp(complex, 'gi'),
        simple
      );
    });

    return simplified;
  }

  /**
   * Generate personalized opportunity explanation
   */
  generateOpportunityExplanation(
    title: string,
    userProfile: Partial<UserProfile>,
    description: string
  ): string {
    const simplified = this.simplifyJobDescription(description);

    const explanations = {
      en: `This job is called "${title}".\n\nWhat you'll do:\n${simplified}\n\nWhy this is good for you:\n✓ Matches your interest in ${userProfile.interests?.[0] || 'this field'}\n✓ Uses skills like ${userProfile.skills?.join(', ') || 'your talents'}\n✓ Great for someone with your background`,
      hi: `यह नौकरी "${title}" कहलाती है।\n\nआप क्या करेंगे:\n${simplified}\n\nयह आपके लिए क्यों अच्छा है:\n✓ आपके रुचि से मेल खाता है ${userProfile.interests?.[0] || 'इस क्षेत्र में'}\n✓ कौशल का उपयोग करता है ${userProfile.skills?.join(', ') || 'आपकी प्रतिभा'}\n✓ आपके पृष्ठभूमि के लिए बढ़िया`,
      mr: `ही नोकरी "${title}" असे म्हणतात.\n\nतुम काय करशील:\n${simplified}\n\nहे तुम्हाला का चांगले आहे:\n✓ तुमच्या रुचीशी जुळते ${userProfile.interests?.[0] || 'या क्षेत्रात'}\n✓ कौशल वापरते ${userProfile.skills?.join(', ') || 'तुमची प्रतिभा'}\n✓ तुमच्या पार्श्वभूमीसाठी बढ़िया`
    };

    return explanations[this.language] || explanations.en;
  }
}

/**
 * Handles confusion detection and adaptive explanations
 */
export class ConfusionDetector {
  private consecutiveSilences = 0;
  private language: Language;

  constructor(language: Language = 'en') {
    this.language = language;
  }

  /**
   * Check if user is confused based on input patterns
   */
  detectFromInput(input: string): { isConfused: boolean; reason: string } {
    // Empty input
    if (!input || input.trim().length === 0) {
      return { isConfused: true, reason: 'silence' };
    }

    // Single word responses to complex questions
    if (input.trim().split(' ').length === 1) {
      this.consecutiveSilences++;
      if (this.consecutiveSilences > 2) {
        return { isConfused: true, reason: 'minimal_response' };
      }
    } else {
      this.consecutiveSilences = 0;
    }

    // Confusion indicators
    const confusionMarkers = ['what', 'huh', 'confused', 'dont understand', 'again', 'repeat'];
    const hasMarker = confusionMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );

    if (hasMarker) {
      return { isConfused: true, reason: 'explicit_confusion' };
    }

    return { isConfused: false, reason: '' };
  }

  /**
   * Generate adaptive response based on confusion
   */
  generateAdaptiveResponse(reason: string): string {
    const responses = {
      silence: {
        en: 'Take your time... I\'m listening 😊',
        hi: 'अपना समय लें... मैं सुन रहा हूँ 😊',
        mr: 'तुमचा वेळ घे... मी ऐकत आहे 😊'
      },
      minimal_response: {
        en: 'Let me explain this more clearly...',
        hi: 'मुझे इसे और स्पष्ट रूप से समझाने दीजिए...',
        mr: 'मुझे हे अधिक स्पष्टतेने समजावून सांगू दे...'
      },
      explicit_confusion: {
        en: 'No problem! Let me break this down into simple steps for you...',
        hi: 'कोई समस्या नहीं! मुझे इसे आपके लिए सरल चरणों में विभाजित करने दीजिए...',
        mr: 'काही समस्या नाही! मुझे हे तुमच्यासाठी सरल पायऱ्यात विभाजित करू दे...'
      }
    };

    return responses[reason as keyof typeof responses]?.[this.language] ||
           responses.explicit_confusion[this.language];
  }
}

/**
 * Assessment guide with question adaptation
 */
export class AssessmentFlow {
  private currentQuestion = 0;
  private responses: string[] = [];
  private language: Language;

  constructor(language: Language = 'en') {
    this.language = language;
  }

  /**
   * Get next question
   */
  getNextQuestion(): string | null {
    const questions = {
      en: [
        'Do you find it hard to read quickly?',
        'Do letters sometimes look mixed up or jumbled?',
        'Is it hard to remember things you just read?',
        'Do you struggle with spelling?',
        'Is it hard to follow instructions?'
      ],
      hi: [
        'क्या आपको तेजी से पढ़ना मुश्किल लगता है?',
        'क्या अक्षर कभी आपको गड़बड़ा हुआ दिखते हैं?',
        'क्या आप जो अभी पढ़ा है उसे याद रखना मुश्किल है?',
        'क्या आप स्पेलिंग में संघर्ष करते हैं?',
        'क्या निर्देशों का पालन करना कठिन है?'
      ],
      mr: [
        'तुम्हाला वेगाने वाचणे मुश्किल वाटते का?',
        'अक्षर कधी गडबडलेले वाटतात का?',
        'तुमने काही वाचले ते लक्षात ठेवणे कठीण का?',
        'तुम्हाला स्पेलिंगमध्ये संघर्ष करायचा का?',
        'निर्देशांचे पालन करणे कठीण का?'
      ]
    };

    const qList = questions[this.language] || questions.en;
    if (this.currentQuestion >= qList.length) {
      return null;
    }
    return qList[this.currentQuestion];
  }

  /**
   * Record response and move to next
   */
  recordResponse(response: string): void {
    this.responses.push(response);
    this.currentQuestion++;
  }

  /**
   * Calculate assessment score
   */
  calculateScore(): number {
    const yesCount = this.responses.filter(r =>
      ['yes', 'हाँ', 'हा'].includes(r.toLowerCase())
    ).length;

    return Math.round((yesCount / this.responses.length) * 100);
  }
}
