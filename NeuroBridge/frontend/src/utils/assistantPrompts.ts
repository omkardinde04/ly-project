// Comprehensive Prompt Templates for Jarvis-like AI Assistant
// Organized by flow, step, and language

import type { PromptTemplate, Language } from '../types/assistant';

const VOICE_STYLE = {
  warm: '😊',
  encouraging: '👍',
  calm: '✨',
  playful: '🌟'
} as const;

// ============================================================================
// WELCOME FLOW - First time user meets the assistant
// ============================================================================

export const welcomeFlowTemplates: PromptTemplate[] = [
  {
    id: 'welcome-greeting',
    flow: 'welcome',
    step: 0,
    text: {
      en: "Hi 😊 I'm here to help you.\nYou don't need to read anything... just talk to me.\nWhat would you like to do today?",
      hi: "नमस्ते 😊 मैं आपकी मदद करने के लिए यहाँ हूँ।\nआपको कुछ भी पढ़ने की जरूरत नहीं... बस मुझसे बात करें।\nआप आज क्या करना चाहते हैं?",
      mr: "नमस्कार 😊 मी तुमच्या मदतीसाठी येथे आहे।\nतुम्हाला काही वाचण्याची गरज नाही... फक्त माझ्याशी बोला।\nतुम्हाला आज काय करायचे आहे?"
    },
    voiceStyle: 'warm',
    waitForResponse: true,
    alternativePhrasings: {
      en: [
        "Hey, I'm here to help! What can I do for you? 😊",
        "Hi there! I'm your assistant. What would you like help with?",
        "Welcome! I'm here to help you navigate everything."
      ],
      hi: [
        "सलाम! मैं यहाँ हूँ। मैं आपकी क्या मदद कर सकता हूँ?",
        "नमस्ते! आपका स्वागत है। आइए शुरू करते हैं।"
      ],
      mr: [
        "आहा! मी तुमच्या साथी आहे। मग सुरु करायला?",
        "नमस्कार! तुम्हाला कसली मदत चाहिए?"
      ]
    }
  },

  {
    id: 'welcome-options',
    flow: 'welcome',
    step: 1,
    text: {
      en: "I can help you with:\n\n1. Learn about this platform\n2. Build your profile\n3. Find jobs and opportunities\n4. Take a quick assessment\n5. Connect with others\n\nJust tell me which one, or say 'one', 'two', etc.",
      hi: "मैं आपको इसमें मदद कर सकता हूँ:\n\n1. इस प्लेटफॉर्म के बारे में जानें\n2. अपनी प्रोफाइल बनाएं\n3. नौकरियां खोजें\n4. एक त्वरित परीक्षण लें\n5. दूसरों से जुड़ें\n\nबस मुझे बताएं कौन सा, या 'एक', 'दो' कहें।",
      mr: "मी तुम्हाला यात मदत करू शकतो:\n\n1. या प्लेटफॉर्मबद्दल जाणून घ्या\n2. तुमची प्रोफाइल तयार करा\n3. नोकऱ्या शोधा\n4. एक परीक्षा घ्या\n5. इतरांशी जोडलं\n\nफक्त बोला कोणता, किंवा 'एक', 'दो' म्हणा।"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  }
];

// ============================================================================
// WEBSITE GUIDE FLOW
// ============================================================================

export const websiteGuideTemplates: PromptTemplate[] = [
  {
    id: 'guide-intro',
    flow: 'website-guide',
    step: 0,
    text: {
      en: "Welcome! Let me give you a quick tour. Here at the top is where you can start your journey. We adapt everything to make reading and learning easy for you.",
      hi: "स्वागत है! मैं आपको एक त्वरित दौरा कराता हूँ। यहाँ शीर्ष पर आप अपनी यात्रा शुरू कर सकते हैं। हम आपके लिए पढ़ने और सीखने को आसान बनाते हैं।",
      mr: "स्वागत आहे! मी तुम्हाला एक जलद फेरफटका मारून देतो. येथे शीर्षस्थानी तुम्ही तुमचा प्रवास सुरू करू शकता. आम्ही तुमच्यासाठी वाचणे सोपे करतो."
    },
    voiceStyle: 'warm',
    waitForResponse: true,
    spotlightTarget: 'hero-section'
  },
  {
    id: 'guide-how-it-works',
    flow: 'website-guide',
    step: 1,
    text: {
      en: "Scroll down a bit, and you will see how it works! We use voice assistant, dyslexia mode, and audio tools to help you daily. Should I continue to the features?",
      hi: "थोड़ा नीचे स्क्रॉल करें, और आप देखेंगे कि यह कैसे काम करता है! हम आपकी मदद के लिए वॉयस असिस्टेंट, डिस्लेक्सिया मोड और ऑडियो टूल का उपयोग करते हैं। क्या मैं सुविधाएँ दिखाना जारी रखूं?",
      mr: "थोडं खाली स्क्रोल करा, आणि तुम्हाला दिसेल ते कसं काम करतं! आम्ही तुम्हाला मदत करण्यासाठी व्हॉइस असिस्टंट आणि डिस्लेक्सिया मोड वापरतो. मी वैशिष्ट्ये सांगणे पुढे ठेवू का?"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true,
    spotlightTarget: 'how-it-works-section'
  },
  {
    id: 'guide-features',
    flow: 'website-guide',
    step: 2,
    text: {
      en: "Finally, here are our features! Find jobs, join our community, and build your confidence. What would you like to explore first?",
      hi: "अंत में, यहाँ हमारी सुविधाएँ हैं! नौकरियां खोजें, हमारे समुदाय में शामिल हों, और अपना आत्मविश्वास बढ़ाएं। आप पहले क्या देखना चाहेंगे?",
      mr: "शेवटी, येथे आमची वैशिष्ट्ये आहेत! नोकरी शोधा, आमच्या समुदायात सामील व्हा आणि तुमचा आत्मविश्वास वाढवा. तुम्हाला प्रथम काय एक्सप्लोर करायला आवडेल?"
    },
    voiceStyle: 'warm',
    waitForResponse: true,
    spotlightTarget: 'features-section'
  }
];

// ============================================================================
// PROFILE BUILDER FLOW
// ============================================================================

export const profileBuilderTemplates: PromptTemplate[] = [
  {
    id: 'profile-start',
    flow: 'profile-builder',
    step: 0,
    text: {
      en: "Perfect! Let's build your profile.\n\nI'll ask you a few simple questions. Just answer in your own words. No perfect answers needed 😊",
      hi: "बिल्कुल! आपकी प्रोफाइल बनाते हैं।\n\nमैं आपसे कुछ आसान सवाल पूछूंगा। बस अपने शब्दों में जवाब दें। सही जवाब की जरूरत नहीं 😊",
      mr: "अगदी! तुमची प्रोफाइल बनवू।\n\nमी तुम्हाला काही आसान प्रश्न विचारीन। फक्त तुमच्या शब्दांत उत्तर दे। परफेक्ट उत्तरांची गरज नाही 😊"
    },
    voiceStyle: 'warm',
    waitForResponse: false
  },

  {
    id: 'profile-name',
    flow: 'profile-builder',
    step: 1,
    text: {
      en: "First, what's your name?",
      hi: "पहले, आपका नाम क्या है?",
      mr: "पहिले, तुमचे नाव काय आहे?"
    },
    voiceStyle: 'calm',
    waitForResponse: true
  },

  {
    id: 'profile-education',
    flow: 'profile-builder',
    step: 2,
    text: {
      en: "Nice to meet you, {name}! 👍\n\nNow, tell me about your education. What are you studying, or what's the highest level you studied?",
      hi: "{name} को मिलकर खुशी हुई! 👍\n\nअब, अपनी शिक्षा के बारे में बताएं। आप क्या अध्ययन कर रहे हैं, या सबसे बड़ा स्तर क्या है?",
      mr: "{name} को भेटल्यात खुशी! 👍\n\nआता, तुमच्या शिक्षेबद्दल सांगा। तुम काय शिकत आहात किंवा सर्वोच्च स्तर काय आहे?"
    },
    voiceStyle: 'warm',
    waitForResponse: true
  },

  {
    id: 'profile-skills',
    flow: 'profile-builder',
    step: 3,
    text: {
      en: "Great! 👍\n\nNow, what are you good at? Tell me about your skills or things you enjoy doing.",
      hi: "बहुत अच्छा! 👍\n\nअब, आप क्या अच्छे हैं? अपने कौशल या पसंदीदा चीजों के बारे में बताएं।",
      mr: "खूप छान! 👍\n\nआता, तुम काय चांगले आहात? तुमचे कौशल किंवा पसंद असलेल्या गोष्टींबद्दल सांगा।"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  },

  {
    id: 'profile-interests',
    flow: 'profile-builder',
    step: 4,
    text: {
      en: "Awesome! 👍\n\nWhat are you interested in? Like... what makes you happy or what would you like to do for work?",
      hi: "शानदार! 👍\n\nआप में क्या रुचि है? जैसे... क्या आपको खुश करता है या काम के लिए क्या करना चाहते हैं?",
      mr: "अप्रतिम! 👍\n\nतुम काय करत आहात? जसे... काय तुम्हाला आनंद देते किंवा काम करायला काय करायचे?"
    },
    voiceStyle: 'warm',
    waitForResponse: true
  },

  {
    id: 'profile-complete',
    flow: 'profile-builder',
    step: 5,
    text: {
      en: "Wonderful! 🎉 We're done!\n\nI've saved your profile. This will help us find opportunities that match YOU perfectly.\n\nWhat would you like to do next?",
      hi: "शानदार! 🎉 हम हो गए!\n\nमैंने आपकी प्रोफाइल सेव की है। यह हमें आपके लिए सही अवसर खोजने में मदद करेगा।\n\nआप आगे क्या करना चाहते हैं?",
      mr: "असाधारण! 🎉 आम झाले!\n\nमी तुमची प्रोफाइल सेव केली आहे। यास्तव तुम्हाला योग्य संधी शोधण्यात मदत होणार।\n\nतुम पुढे काय करायचे आहे?"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  }
];

// ============================================================================
// OPPORTUNITY ASSISTANT FLOW
// ============================================================================

export const opportunityAssistantTemplates: PromptTemplate[] = [
  {
    id: 'opportunity-intro',
    flow: 'opportunity-assistant',
    step: 0,
    text: {
      en: "Wonderful! Let me show you opportunities that match your skills.\n\nI've found some jobs and internships perfect for you. Let me explain each one simply.",
      hi: "शानदार! आपके कौशल से मेल खाने वाले अवसर दिखाता हूँ।\n\nमुझे आपके लिए कुछ नौकरियां और इंटर्नशिप मिली हैं। मैं प्रत्येक को सरलता से समझाता हूँ।",
      mr: "अप्रतिम! तुमच्या कौशलशी जुळणाऱ्या संधी दाखवू।\n\nमी तुम्हाला योग्य नोकऱ्या आणि इंटर्नशिप सापडल्या आहेत। प्रत्येक सरलरीत्या समजवून सांगेन।"
    },
    voiceStyle: 'warm',
    waitForResponse: false
  },

  {
    id: 'opportunity-recommendation',
    flow: 'opportunity-assistant',
    step: 1,
    text: {
      en: "Here's a role that would be great for you:\n\n{opportunityTitle}\n\nWhy this is good for you: {reason}\n\nDo you want to know more about this?",
      hi: "यह एक भूमिका है जो आपके लिए शानदार होगी:\n\n{opportunityTitle}\n\nयह आपके लिए क्यों अच्छा है: {reason}\n\nक्या आप इसके बारे में और जानना चाहते हैं?",
      mr: "हे तुम्हाला छान असणारी भूमिका आहे:\n\n{opportunityTitle}\n\nहे तुम्हाला का चांगले आहे: {reason}\n\nतुम याबद्दल आणखी जाणू शकताहे?"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  }
];

// ============================================================================
// ASSESSMENT GUIDE FLOW
// ============================================================================

export const assessmentGuideTemplates: PromptTemplate[] = [
  {
    id: 'assessment-start',
    flow: 'assessment-guide',
    step: 0,
    text: {
      en: "Let's do a quick assessment! 📝\n\nThis helps us understand how you learn best. There are no wrong answers. Just pick what feels right.\n\nReady?",
      hi: "चलिए एक त्वरित परीक्षण करते हैं! 📝\n\nयह हमें समझने में मदद करता है कि आप कैसे सीखते हैं। कोई गलत जवाब नहीं। बस जो सही लगे चुनें।\n\nतैयार?",
      mr: "चला एक त्वरित परीक्षा घेऊ! 📝\n\nहे आमच्यास समजण्यात मदत करते की तुम कसे शिक्षा घेता. कोणताही चुकीचा उत्तर नाही. फक्त सरळ-सारळ जे योग्य वाटते निवडा.\n\nतयार आहे?"
    },
    voiceStyle: 'calm',
    waitForResponse: true
  },

  {
    id: 'assessment-question',
    flow: 'assessment-guide',
    step: 1,
    text: {
      en: "Question {questionNumber}:\n\n{question}\n\nJust tell me your answer.",
      hi: "प्रश्न {questionNumber}:\n\n{question}\n\nबस अपना जवाब बताएं।",
      mr: "प्रश्न {questionNumber}:\n\n{question}\n\nफक्त तुमचे उत्तर सांगा।"
    },
    voiceStyle: 'calm',
    waitForResponse: true
  },

  {
    id: 'assessment-confirmation',
    flow: 'assessment-guide',
    step: 2,
    text: {
      en: "Got it 👍 Moving to next question.",
      hi: "समझ गया 👍 अगले सवाल पर जा रहे हैं।",
      mr: "समजला 👍 पुढच्या प्रश्नाकडे जात आहे।"
    },
    voiceStyle: 'encouraging',
    waitForResponse: false
  },

  {
    id: 'assessment-complete',
    flow: 'assessment-guide',
    step: 3,
    text: {
      en: "Awesome! You finished! 🎉\n\nYour score: {score}%\n\nYou're doing great. This helps us understand your learning style better.\n\nLet's continue!",
      hi: "शानदार! आप तैयार हैं! 🎉\n\nआपका स्कोर: {score}%\n\nआप अच्छा कर रहे हैं। यह हमें आपकी सीखने की शैली को बेहतर समझने में मदद करता है।\n\nचलिए जारी रखें!",
      mr: "अप्रतिम! तुम तयार झाला! 🎉\n\nतुमचे स्कोर: {score}%\n\nतुम चांगले करत आहे. यास्तव आमच्यास तुमचा शिक्षण शैली बेहतर समजण्यात मदत होते.\n\nचला पुढे जाऊ!"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  }
];

// ============================================================================
// COMMUNITY GUIDE FLOW
// ============================================================================

export const communityGuideTemplates: PromptTemplate[] = [
  {
    id: 'community-intro',
    flow: 'community-guide',
    step: 0,
    text: {
      en: "You're not alone! 💜\n\nThere's a whole community of people here who understand exactly what you're going through.\n\nYou can:\n• Chat with people like you\n• Share your experiences\n• Learn from their stories\n• Get motivation\n\nWould you like to connect?",
      hi: "आप अकेले नहीं हैं! 💜\n\nयहाँ लोगों का एक पूरा समुदाय है जो समझता है।\n\nआप कर सकते हैं:\n• अपने जैसे लोगों से बात करें\n• अपने अनुभव साझा करें\n• उनकी कहानियों से सीखें\n• प्रेरणा पाएं\n\nक्या आप जुड़ना चाहते हैं?",
      mr: "तुम एकेले नाही! 💜\n\nयेथे संपूर्ण समुदाय आहे जो समजते \n\nतुम करू शकता:\n• तुमच्या जसे लोकांशी बोला\n• तुमचे अनुभव शेअर करा\n• त्यांच्या कहानीतून शिका\n• प्रेरणा मिळवा\n\nतुम जोडू शकताहे?"
    },
    voiceStyle: 'warm',
    waitForResponse: true
  }
];

// ============================================================================
// CONFUSION DETECTION & SUPPORT
// ============================================================================

export const confusionSupportTemplates: PromptTemplate[] = [
  {
    id: 'simplify-request',
    flow: 'general-help',
    step: 0,
    text: {
      en: "I get it, let me explain that more simply.\n\n{simplifiedExplanation}",
      hi: "मैं समझता हूँ, मुझे यह और सरलता से समझाने दें।\n\n{simplifiedExplanation}",
      mr: "मी समजतो, मुझे हे आणखी सरलरीत्या समजावून सांगू दे.\n\n{simplifiedExplanation}"
    },
    voiceStyle: 'calm',
    waitForResponse: true
  },

  {
    id: 'repeat-request',
    flow: 'general-help',
    step: 1,
    text: {
      en: "Sure! Let me say that again...\n\n{previousMessage}",
      hi: "बिल्कुल! मुझे फिर से कहने दीजिए...\n\n{previousMessage}",
      mr: "नक्की! मुझे पुन्हा सांगू दे...\n\n{previousMessage}"
    },
    voiceStyle: 'warm',
    waitForResponse: true
  },

  {
    id: 'silence-gentle-prompt',
    flow: 'general-help',
    step: 2,
    text: {
      en: "Take your time... I'm listening 😊",
      hi: "अपना समय लें... मैं सुन रहा हूँ 😊",
      mr: "तुमचा वेळ घे... मी ऐकत आहे 😊"
    },
    voiceStyle: 'calm',
    waitForResponse: true
  },

  {
    id: 'second-silence-prompt',
    flow: 'general-help',
    step: 3,
    text: {
      en: "No rush! We can go step by step. What would you like to do?\n\n1. Try again\n2. Move on\n3. Get help",
      hi: "कोई जल्दबाजी नहीं! हम धीरे-धीरे जा सकते हैं। आप क्या करना चाहते हैं?\n\n1. फिर कोशिश करें\n2. आगे बढ़ें\n3. मदद पाएं",
      mr: "काही जास्ती नाही! आम धीरे-धीरे जाऊ शकतो. तुम काय करायचे आहे?\n\n1. पुन्हा प्रयत्न करा\n2. पुढे जा\n3. मदत मिळवा"
    },
    voiceStyle: 'encouraging',
    waitForResponse: true
  }
];

// ============================================================================
// HELPER FUNCTION TO GET TEMPLATES
// ============================================================================

export const allTemplates: PromptTemplate[] = [
  ...welcomeFlowTemplates,
  ...websiteGuideTemplates,
  ...profileBuilderTemplates,
  ...opportunityAssistantTemplates,
  ...assessmentGuideTemplates,
  ...communityGuideTemplates,
  ...confusionSupportTemplates
];

export const getTemplate = (flow: string, step: number): PromptTemplate | undefined => {
  return allTemplates.find(t => t.flow === flow && t.step === step);
};

export const getFlowTemplates = (flow: string): PromptTemplate[] => {
  return allTemplates.filter(t => t.flow === flow);
};
