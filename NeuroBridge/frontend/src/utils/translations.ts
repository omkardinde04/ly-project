import type { Language } from '../contexts/DyslexiaContext';

export interface Translation {
  // Navbar
  dyslexiaMode: string;
  on: string;
  off: string;
  listen: string;
  stop: string;
  
  // Hero Section
  inclusiveLearning: string;
  heroTitle: string;
  heroSubtitle: string;
  getStarted: string;
  exploreGrowth: string;
  usersReportBetterFocus: string;
  confidenceGrowth: string;
  skillBasedOpportunities: string;
  
  // Common
  next: string;
  previous: string;
  submit: string;
  cancel: string;
  continue: string;
  back: string;
  
  // Login Page
  loginTitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginButton: string;
  signupLink: string;
  
  // Assessment
  assessmentTitle: string;
  assessmentSubtitle: string;
  startAssessment: string;
  questionProgress: string;
  
  // Questions Section 1
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  
  // Questions Section 2
  q11: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  
  // Answer Options
  rarely: string;
  occasionally: string;
  often: string;
  mostOfTheTime: string;
  easy: string;
  challenging: string;
  difficult: string;
  veryDifficult: string;
  
  // Report
  reportTitle: string;
  yourLevel: string;
  recommendedSettings: string;
  learningStyle: string;
  recommendations: string;
  disclaimer: string;
  downloadPDF: string;
  retakeTest: string;
  goToDashboard: string;
  
  // Dyslexia Levels
  levelNone: string;
  levelMild: string;
  levelModerate: string;
  levelSevere: string;
  
  // Dashboard
  welcomeBack: string;
  yourPersonalizedDashboard: string;
  startLearning: string;
  trackProgress: string;
  dashboard: string;
  learningPlatform: string;
  resumeBuilder: string;
  opportunities: string;
  notebookLLM: string;
  community: string;
  profile: string;
  standard: string;
  support: string;
  assessmentScore: string;
  accessibilityMode: string;
  active: string;
  viewProgress: string;
  resumeDescription: string;
  openResumeBuilder: string;
  aiNotebook: string;
  smartLearningAssistant: string;
  connectWithPeers: string;
  jobsAndScholarships: string;
  customiseExperience: string;
  
  // Dashboard Menu
  navHome: string;
  navLearning: string;
  navQuizzes: string;
  navProgress: string;
  navSettings: string;
  
  // Accessibility
  accPreferences: string;
  accVisual: string;
  accAudio: string;
  saveChanges: string;
  customizeAppearance: string;
  readingVisualAdjustments: string;
  textSize: string;
  textSizeHelp: string;
  lineSpacing: string;
  lineSpacingHelp: string;
  letterSpacing: string;
  letterSpacingHelp: string;
  highContrast: string;
  highContrastHelp: string;
  reduceMotion: string;
  reduceMotionHelp: string;
  contentWidth: string;
  contentWidthHelp: string;
  livePreview: string;
  previewDescription: string;
  yourSettings: string;
  resetToDefault: string;
  
  // Preview
  previewTitle: string;
  previewText: string;
}

const translations: Record<Language, Translation> = {
  en: {
    // Navbar
    dyslexiaMode: 'Dyslexia Mode',
    on: 'ON',
    off: 'OFF',
    listen: '🔊 Listen',
    stop: '⏹ Stop',
    
    // Hero Section
    inclusiveLearning: 'Inclusive learning for dyslexic and general users',
    heroTitle: 'Learn skills. Unlock careers.',
    heroSubtitle: 'Visual learning and opportunities designed for the way you think.',
    getStarted: 'Get Started',
    exploreGrowth: 'Explore Growth',
    usersReportBetterFocus: 'users report better focus',
    confidenceGrowth: 'confidence growth in 4 weeks',
    skillBasedOpportunities: 'skill-based opportunities',
    
    // Common
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    cancel: 'Cancel',
    continue: 'Continue',
    back: 'Go Back',
    
    // Login Page
    loginTitle: 'Welcome Back',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email (example: abc@gmail.com)',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    signupLink: "Don't have an account? Sign up",
    
    // Assessment
    assessmentTitle: 'Personalized Dyslexia Assessment',
    assessmentSubtitle: 'This assessment helps us understand your learning style and customize the platform for you. Take your time and answer honestly.',
    startAssessment: 'Start Assessment',
    questionProgress: 'Question',
    
    // Questions Section 1
    q1: 'Do you confuse similar words (like "cat" vs "cot")?',
    q2: 'Do you lose your place while reading?',
    q3: 'Do you confuse object names?',
    q4: 'Do you have trouble distinguishing left from right?',
    q5: 'Do you find map reading difficult?',
    q6: 'Do you need to re-read paragraphs multiple times?',
    q7: 'Do you get confused by multiple instructions at once?',
    q8: 'Do you make mistakes in messages (texts, emails)?',
    q9: 'Do you have difficulty finding the right word?',
    q10: 'Are you good at creative problem solving?',
    
    // Questions Section 2
    q11: 'How easy is it for you to sound out words?',
    q12: 'How difficult is organizing your writing?',
    q13: 'How difficult was learning multiplication tables?',
    q14: 'How difficult was reciting the alphabet?',
    q15: 'Do you have difficulty reading aloud?',
    
    // Answer Options
    rarely: 'Rarely',
    occasionally: 'Occasionally',
    often: 'Often',
    mostOfTheTime: 'Most of the time',
    easy: 'Easy',
    challenging: 'Challenging',
    difficult: 'Difficult',
    veryDifficult: 'Very Difficult',
    
    // Report
    reportTitle: 'Your Personalized Accessibility Report',
    yourLevel: 'Your Dyslexia Level',
    recommendedSettings: 'Recommended UI Settings',
    learningStyle: 'Learning Style Insights',
    recommendations: 'Recommendations',
    disclaimer: 'This is not a medical diagnosis. It is an indicator. For professional assessment, consult a specialist.',
    downloadPDF: 'Download PDF',
    retakeTest: 'Retake Test',
    goToDashboard: 'Go to Dashboard',
    
    // Dyslexia Levels
    levelNone: 'Likely non-dyslexic',
    levelMild: 'Mild dyslexia indicators',
    levelModerate: 'Moderate dyslexia',
    levelSevere: 'Severe dyslexia',
    
    // Dashboard
    welcomeBack: 'Welcome Back!',
    yourPersonalizedDashboard: 'Your Personalized Dashboard',
    startLearning: 'Start Learning',
    trackProgress: 'Track Progress',
    dashboard: 'Dashboard', learningPlatform: 'Learning Platform', resumeBuilder: 'Resume Builder', opportunities: 'Opportunities', notebookLLM: 'Notebook LLM', community: 'Community', profile: 'Profile', standard: 'Standard', support: 'Support', assessmentScore: 'Assessment Score', accessibilityMode: 'Accessibility Mode', active: 'Active', viewProgress: 'View Progress', resumeDescription: 'Create a professional, ATS-friendly resume tailored to your strengths.', openResumeBuilder: 'Open Resume Builder', aiNotebook: 'AI Notebook', smartLearningAssistant: 'Smart learning assistant', connectWithPeers: 'Connect with peers', jobsAndScholarships: 'Jobs & scholarships', customiseExperience: 'Customise experience',
    
    // Dashboard Menu
    navHome: 'Home',
    navLearning: 'Learning',
    navQuizzes: 'Tests & Quizzes',
    navProgress: 'Progress',
    navSettings: 'Accessibility',
    
    // Accessibility
    accPreferences: 'Accessibility Preferences',
    accVisual: 'Visual Adjustments',
    accAudio: 'Audio & Localization',
    saveChanges: 'Save Changes',
    customizeAppearance: 'Customize how content looks and feels for you.', readingVisualAdjustments: 'Reading & Visual Adjustments', textSize: 'Text Size', textSizeHelp: 'Make text easier to read.', lineSpacing: 'Line Spacing', lineSpacingHelp: 'Increase space between lines for easier reading.', letterSpacing: 'Letter Spacing', letterSpacingHelp: 'Add space between letters to improve readability.', highContrast: 'High Contrast', highContrastHelp: 'Increase the contrast between text and backgrounds.', reduceMotion: 'Reduce Motion', reduceMotionHelp: 'Minimize animations and movement across the website.', contentWidth: 'Reading Comfort (Content Width)', contentWidthHelp: 'Controls the maximum width of long text paragraphs.', livePreview: 'Live Preview', previewDescription: 'See how your settings affect reading.', yourSettings: 'Your Settings', resetToDefault: 'Reset to Default',
    
    // Preview
    previewTitle: 'The Reading Brain',
    previewText: 'Neuroplasticity allows the brain to form new connections—proving that learning differences are pathways, not roadblocks. Our platform adapts to your visual processing speed and structural preferences seamlessly.',
  },
  
  hi: {
    // Navbar
    dyslexiaMode: 'डिस्लेक्सिया मोड',
    on: 'चालू',
    off: 'बंद',
    listen: '🔊 सुनें',
    stop: '⏹ रोकें',
    
    // Hero Section
    inclusiveLearning: 'डिस्लेक्सिक और सामान्य उपयोगकर्ताओं के लिए समावेशी शिक्षा',
    heroTitle: 'कौशल सीखने और आत्मविश्वास से करियर अनलॉक करने के लिए एक शांत, स्पष्ट मंच।',
    heroSubtitle: 'ClearPath पाठ-भारी बाधाओं को दृश्य शिक्षा, सहायक उपकरणों और अवसर मिलान के साथ बदल देता है जो आपके सोचने के तरीके के लिए डिज़ाइन किया गया है।',
    getStarted: 'शुरू करें',
    exploreGrowth: 'विकास का पता लगाएं',
    usersReportBetterFocus: 'उपयोगकर्ता बेहतर ध्यान की रिपोर्ट करते हैं',
    confidenceGrowth: '4 सप्ताह में आत्मविश्वास में वृद्धि',
    skillBasedOpportunities: 'कौशल-आधारित अवसर',
    
    // Common
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    continue: 'जारी रखें',
    back: 'वापस जाएं',
    
    // Login Page
    loginTitle: 'वापसी पर स्वागत है',
    emailLabel: 'ईमेल',
    emailPlaceholder: 'अपना ईमेल दर्ज करें (उदाहरण: abc@gmail.com)',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    loginButton: 'लॉगिन',
    signupLink: 'खाता नहीं है? साइन अप करें',
    
    // Assessment
    assessmentTitle: 'वैयक्तिकृत डिस्लेक्सिया मूल्यांकन',
    assessmentSubtitle: 'यह मूल्यांकन हमें आपकी सीखने की शैली को समझने और आपके लिए मंच को अनुकूलित करने में मदद करता है। अपना समय लें और ईमानदारी से उत्तर दें।',
    startAssessment: 'मूल्यांकन शुरू करें',
    questionProgress: 'प्रश्न',
    
    // Questions Section 1
    q1: 'क्या आप समान शब्दों को भ्रमित करते हैं (जैसे "cat" बनाम "cot")?',
    q2: 'क्या आप पढ़ते समय अपना स्थान खो देते हैं?',
    q3: 'क्या आप वस्तु के नामों को भ्रमित करते हैं?',
    q4: 'क्या आपको बाएं से दाएं में अंतर करने में कठिनाई होती है?',
    q5: 'क्या आपको मानचित्र पढ़ने में कठिनाई होती है?',
    q6: 'क्या आपको पैराग्राफ को कई बार फिर से पढ़ने की आवश्यकता होती है?',
    q7: 'क्या आप एक साथ कई निर्देशों से भ्रमित हो जाते हैं?',
    q8: 'क्या आप संदेशों (टेक्स्ट, ईमेल) में गलतियां करते हैं?',
    q9: 'क्या आपको सही शब्द खोजने में कठिनाई होती है?',
    q10: 'क्या आप रचनात्मक समस्या समाधान में अच्छे हैं?',
    
    // Questions Section 2
    q11: 'आपके लिए शब्दों की ध्वनि निकालना कितना आसान है?',
    q12: 'अपने लेखन को व्यवस्थित करना कितना कठिन है?',
    q13: 'गुणा सारणी सीखना कितना कठिन था?',
    q14: 'वर्णमाला का पाठ करना कितना कठिन था?',
    q15: 'क्या आपको जोर से पढ़ने में कठिनाई होती है?',
    
    // Answer Options
    rarely: 'कभी-कभी',
    occasionally: 'कभी-कभी',
    often: 'अक्सर',
    mostOfTheTime: 'ज्यादातर समय',
    easy: 'आसान',
    challenging: 'चुनौतीपूर्ण',
    difficult: 'कठिन',
    veryDifficult: 'बहुत कठिन',
    
    // Report
    reportTitle: 'आपकी वैयक्तिकृत पहुंच रिपोर्ट',
    yourLevel: 'आपका डिस्लेक्सिया स्तर',
    recommendedSettings: 'अनुशंसित UI सेटिंग्स',
    learningStyle: 'सीखने की शैली अंतर्दृष्टि',
    recommendations: 'सिफारिशें',
    disclaimer: 'यह चिकित्सा निदान नहीं है। यह एक संकेतक है। पेशेवर मूल्यांकन के लिए, विशेषज्ञ से परामर्श करें।',
    downloadPDF: 'PDF डाउनलोड करें',
    retakeTest: 'परीक्षा पुनः लें',
    goToDashboard: 'डैशबोर्ड पर जाएं',
    
    // Dyslexia Levels
    levelNone: 'संभावित रूप से गैर-डिस्लेक्सिक',
    levelMild: 'हल्के डिस्लेक्सिया संकेतक',
    levelModerate: 'मध्यम डिस्लेक्सिया',
    levelSevere: 'गंभीर डिस्लेक्सिया',
    
    // Dashboard
    welcomeBack: 'वापसी पर स्वागत है!',
    yourPersonalizedDashboard: 'आपका वैयक्तिकृत डैशबोर्ड',
    startLearning: 'सीखना शुरू करें',
    trackProgress: 'प्रगति ट्रैक करें',
    dashboard: 'डैशबोर्ड', learningPlatform: 'लर्निंग प्लेटफॉर्म', resumeBuilder: 'रिज्यूमे बिल्डर', opportunities: 'अवसर', notebookLLM: 'नोटबुक LLM', community: 'समुदाय', profile: 'प्रोफ़ाइल', standard: 'मानक', support: 'सहायता', assessmentScore: 'मूल्यांकन स्कोर', accessibilityMode: 'पहुंच मोड', active: 'सक्रिय', viewProgress: 'प्रगति देखें', resumeDescription: 'अपनी खूबियों के अनुसार पेशेवर, ATS-अनुकूल रिज्यूमे बनाएं।', openResumeBuilder: 'रिज्यूमे बिल्डर खोलें', aiNotebook: 'AI नोटबुक', smartLearningAssistant: 'स्मार्ट लर्निंग सहायक', connectWithPeers: 'साथियों से जुड़ें', jobsAndScholarships: 'नौकरियां और छात्रवृत्तियां', customiseExperience: 'अनुभव को अनुकूलित करें',
    
    // Dashboard Menu
    navHome: 'होम',
    navLearning: 'सीखना',
    navQuizzes: 'प्रश्नोत्तरी',
    navProgress: 'प्रगति',
    navSettings: 'पहुंच',
    
    // Accessibility
    accPreferences: 'पहुंच प्राथमिकताएं',
    accVisual: 'दृश्य समायोजन',
    accAudio: 'ऑडियो और भाषा',
    saveChanges: 'परिवर्तन सहेजें',
    customizeAppearance: 'सामग्री का रूप और अनुभव अपनी सुविधा के अनुसार बदलें।', readingVisualAdjustments: 'पठन और दृश्य समायोजन', textSize: 'पाठ का आकार', textSizeHelp: 'पाठ को पढ़ने में आसान बनाएं।', lineSpacing: 'पंक्ति रिक्ति', lineSpacingHelp: 'आसान पठन के लिए पंक्तियों के बीच जगह बढ़ाएं।', letterSpacing: 'अक्षर रिक्ति', letterSpacingHelp: 'पढ़ने में सुविधा के लिए अक्षरों के बीच जगह बढ़ाएं।', highContrast: 'उच्च कंट्रास्ट', highContrastHelp: 'पाठ और पृष्ठभूमि के बीच कंट्रास्ट बढ़ाएं।', reduceMotion: 'गतिशीलता कम करें', reduceMotionHelp: 'वेबसाइट पर एनिमेशन और गति कम करें।', contentWidth: 'पठन सुविधा (सामग्री की चौड़ाई)', contentWidthHelp: 'लंबे अनुच्छेदों की अधिकतम चौड़ाई नियंत्रित करें।', livePreview: 'लाइव प्रीव्यू', previewDescription: 'देखें कि आपकी सेटिंग्स पढ़ने को कैसे प्रभावित करती हैं।', yourSettings: 'आपकी सेटिंग्स', resetToDefault: 'डिफ़ॉल्ट पर रीसेट करें',
    
    // Preview
    previewTitle: 'पढ़ने वाला मस्तिष्क',
    previewText: 'न्यूरोप्लास्टी मस्तिष्क को नए संबंध बनाने की अनुमति देती है-यह साबित करते हुए कि सीखने के अंतर रास्ते हैं, बाधाएं नहीं। हमारा मंच आपके बिना किसी परेशानी के अनुकूल होता है।',
  },
  
  mr: {
    // Navbar
    dyslexiaMode: 'डिसलेक्सिया मोड',
    on: 'चालू',
    off: 'बंद',
    listen: '🔊 ऐका',
    stop: '⏹ थांबवा',
    
    // Hero Section
    inclusiveLearning: 'डिसलेक्सिक आणि सामान्य वापरकर्त्यांसाठी समावेशी शिक्षण',
    heroTitle: 'कौशल्ये शिकण्यासाठी आणि आत्मविश्वासाने करिअर अनलॉक करण्यासाठी एक शांत, स्पष्ट प्लॅटफॉर्म.',
    heroSubtitle: 'ClearPath मजकूर-भारी अडथळ्यांची जाग दृश्य शिक्षण, सहाय्यक साधने आणि संधी जुळवणे घेते जे तुमच्या विचार करण्याच्या पद्धतीसाठी डिझाइन केले आहे.',
    getStarted: 'सुरुवात करा',
    exploreGrowth: 'वाढ शोधा',
    usersReportBetterFocus: 'वापरकर्ते चांगल्या लक्ष्य देतात',
    confidenceGrowth: '४ आठवड्यांत आत्मविश्वासात वाढ',
    skillBasedOpportunities: 'कौशल्य-आधारित संधी',
    
    // Common
    next: 'पुढील',
    previous: 'मागील',
    submit: 'सबमिट करा',
    cancel: 'रद्द करा',
    continue: 'सुरू ठेवा',
    back: 'मागे जा',
    
    // Login Page
    loginTitle: 'स्वागत आहे',
    emailLabel: 'ईमेल',
    emailPlaceholder: 'तुमचा ईमेल प्रविष्ट करा (उदाहरण: abc@gmail.com)',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड प्रविष्ट करा',
    loginButton: 'लॉगिन',
    signupLink: 'खाते नाही? साइन अप करा',
    
    // Assessment
    assessmentTitle: 'वैयक्तिकृत डिसलेक्सिया मूल्यांकन',
    assessmentSubtitle: 'हे मूल्यांकन आम्हाला तुमची शिकण्याची शैली समजून घेण्यास आणि तुमच्यासाठी प्लॅटफॉर्म अनुकूलित करण्यास मदत करते. तुमचा वेळ घ्या आणि इमानदारपणे उत्तर द्या.',
    startAssessment: 'मूल्यांकन सुरू करा',
    questionProgress: 'प्रश्न',
    
    // Questions Section 1
    q1: 'तुम्ही समान शब्दांमध्ये गोंधळ करता का (जसे की "cat" बनाम "cot")?',
    q2: 'तुम्ही वाचताना तुमचे ठिकाण गमावता का?',
    q3: 'तुम्ही वस्तूंच्या नावांमध्ये गोंधळ करता का?',
    q4: 'तुम्हाला डावीकडे आणि उजवीकडे ओळखण्यात अडचण येते का?',
    q5: 'तुम्हाला नकाशा वाचण्यात अडचण येते का?',
    q6: 'तुम्हाला परिच्छेद अनेकदा पुन्हा वाचावे लागतात का?',
    q7: 'तुम्ही एकाच वेळी अनेक सूचनांमुळे गोंधळता का?',
    q8: 'तुम्ही संदेशांमध्ये (टेक्स्ट, ईमेल) चुका करता का?',
    q9: 'तुम्हाला योग्य शब्द शोधण्यात अडचण येते का?',
    q10: 'तुम्ही सर्जनशील समस्या सोडवण्यात चांगले आहात का?',
    
    // Questions Section 2
    q11: 'तुमच्यासाठी शब्दांचा उच्चार करणे किती सोपे आहे?',
    q12: 'तुमचे लेखन आयोजित करणे किती कठीण आहे?',
    q13: 'गुणाकार सारणी शिकणे किती कठीण होते?',
    q14: 'वर्णमाला म्हणणे किती कठीण होते?',
    q15: 'तुम्हाला जोरात वाचण्यात अडचण येते का?',
    
    // Answer Options
    rarely: 'क्वचित',
    occasionally: 'कधीकधी',
    often: 'नेहमी',
    mostOfTheTime: 'जास्त वेळा',
    easy: 'सोपे',
    challenging: 'आव्हानात्मक',
    difficult: 'कठीण',
    veryDifficult: 'खूप कठीण',
    
    // Report
    reportTitle: 'तुमचा वैयक्तिकृत ॲक्सेसिबिलिटी अहवाल',
    yourLevel: 'तुमची डिसलेक्सिया पातळी',
    recommendedSettings: 'शिफारस केलेले UI सेटिंग्ज',
    learningStyle: 'शिकण्याच्या शैलीची अंतर्दृष्टि',
    recommendations: 'शिफारसी',
    disclaimer: 'हे वैद्यकीय निदान नाही. हे एक सूचक आहे. व्यावसायिक मूल्यांकनासाठी, विशेषज्ञाचा सल्ला घ्या.',
    downloadPDF: 'PDF डाउनलोड करा',
    retakeTest: 'पुन्हा टेस्ट घ्या',
    goToDashboard: 'डॅशबोर्डवर जा',
    
    // Dyslexia Levels
    levelNone: 'संभाव्यतः नॉन-डिसलेक्सिक',
    levelMild: 'सौम्य डिसलेक्सिया सूचक',
    levelModerate: 'मध्यम डिसलेक्सिया',
    levelSevere: 'तीव्र डिसलेक्सिया',
    
    // Dashboard
    welcomeBack: 'स्वागत आहे!',
    yourPersonalizedDashboard: 'तुमचे वैयक्तिकृत डॅशबोर्ड',
    startLearning: 'शिकणे सुरू करा',
    trackProgress: 'प्रगती ट्रॅक करा',
    dashboard: 'डॅशबोर्ड', learningPlatform: 'लर्निंग प्लॅटफॉर्म', resumeBuilder: 'रेझ्युमे बिल्डर', opportunities: 'संधी', notebookLLM: 'नोटबुक LLM', community: 'समुदाय', profile: 'प्रोफाइल', standard: 'मानक', support: 'सहाय्य', assessmentScore: 'मूल्यांकन गुण', accessibilityMode: 'प्रवेशयोग्यता मोड', active: 'सक्रिय', viewProgress: 'प्रगती पहा', resumeDescription: 'तुमच्या सामर्थ्यानुसार व्यावसायिक, ATS-अनुकूल रेझ्युमे तयार करा.', openResumeBuilder: 'रेझ्युमे बिल्डर उघडा', aiNotebook: 'AI नोटबुक', smartLearningAssistant: 'स्मार्ट लर्निंग सहाय्यक', connectWithPeers: 'सहकाऱ्यांशी जोडा', jobsAndScholarships: 'नोकऱ्या आणि शिष्यवृत्ती', customiseExperience: 'अनुभव सानुकूलित करा',
    
    // Dashboard Menu
    navHome: 'मुख्यपृष्ठ',
    navLearning: 'शिक्षण',
    navQuizzes: 'प्रश्नमंजुषा',
    navProgress: 'प्रगती',
    navSettings: 'प्रवेशयोग्यता',
    
    // Accessibility
    accPreferences: 'प्रवेशयोग्यता प्राधान्ये',
    accVisual: 'दृश्य समायोजन',
    accAudio: 'ऑडिओ आणि भाषा',
    saveChanges: 'बदल जतन करा',
    customizeAppearance: 'सामग्रीचे स्वरूप आणि अनुभव तुमच्यासाठी सानुकूलित करा.', readingVisualAdjustments: 'वाचन आणि दृश्य समायोजन', textSize: 'मजकूर आकार', textSizeHelp: 'मजकूर वाचणे सोपे करा.', lineSpacing: 'ओळीतील अंतर', lineSpacingHelp: 'सोप्या वाचनासाठी ओळींमधील जागा वाढवा.', letterSpacing: 'अक्षरांमधील अंतर', letterSpacingHelp: 'वाचन सुधारण्यासाठी अक्षरांमध्ये जागा वाढवा.', highContrast: 'उच्च कॉन्ट्रास्ट', highContrastHelp: 'मजकूर आणि पार्श्वभूमीमधील कॉन्ट्रास्ट वाढवा.', reduceMotion: 'हालचाल कमी करा', reduceMotionHelp: 'वेबसाइटवरील अॅनिमेशन आणि हालचाल कमी करा.', contentWidth: 'वाचन सुविधा (सामग्रीची रुंदी)', contentWidthHelp: 'लांब परिच्छेदांची कमाल रुंदी नियंत्रित करा.', livePreview: 'लाइव्ह प्रीव्ह्यू', previewDescription: 'तुमच्या सेटिंग्जचा वाचनावर कसा परिणाम होतो ते पहा.', yourSettings: 'तुमच्या सेटिंग्ज', resetToDefault: 'डीफॉल्टवर रीसेट करा',
    
    // Preview
    previewTitle: 'वाचन करणारा मेंदू',
    previewText: 'न्यूरोप्लास्टिसिटी मेंदूला नवीन जोडणी बनवण्यास अनुमती देते - हे सिद्ध करते की शिकण्यातील फरक हे मार्ग आहेत, अडथळे नाहीत. आमचा प्लॅटफॉर्म आपल्यासाठी अखंडपणे अनुकूल करतो.',
  },
};

export function getTranslation(language: Language): Translation {
  return translations[language];
}

const dashboardHindi: Record<string, string> = {
  // The legacy one-line dictionary contains a repeated Progress entry.
  // @ts-ignore
  'Learning Platform': 'लर्निंग प्लेटफॉर्म', 'Student Account': 'छात्र खाता', 'Track Your Progress': 'अपनी प्रगति ट्रैक करें', 'See how far you\'ve come in your learning and career journey.': 'अपनी सीखने और करियर यात्रा में हुई प्रगति देखें।', 'Learning Progress': 'सीखने की प्रगति', 'Time Spent': 'बिताया गया समय', 'Completed': 'पूर्ण', 'Accuracy': 'सटीकता', 'Career Readiness': 'करियर की तैयारी', 'Matched': 'मिलान किए गए', 'Applied': 'आवेदन किए गए', 'Resume Score': 'रिज्यूमे स्कोर', 'Weekly Activity': 'साप्ताहिक गतिविधि', 'Skill Development': 'कौशल विकास', 'Recent Achievements': 'हाल की उपलब्धियां', 'My Learning': 'मेरी पढ़ाई', 'What This Offers': 'यह क्या प्रदान करता है', 'Course Categories': 'कोर्स श्रेणियां', 'Accessibility Features': 'पहुंच सुविधाएं', 'Personalized to Your Profile': 'आपकी प्रोफ़ाइल के अनुसार', 'Adaptive Content': 'अनुकूलित सामग्री', 'Targeted Support': 'लक्षित सहायता', 'Progress Tracking': 'प्रगति ट्रैकिंग', 'Coming Soon': 'जल्द आ रहा है', 'AI Notebook': 'AI नोटबुक', 'Community': 'समुदाय', 'Opportunities': 'अवसर', 'Profile': 'प्रोफ़ाइल', 'Resume Builder': 'रिज्यूमे बिल्डर', 'LinkedIn Jobs': 'LinkedIn नौकरियां', 'Unstop Opportunities': 'Unstop अवसर', 'Search': 'खोजें', 'No opportunities found right now. Check back later!': 'अभी कोई अवसर नहीं मिला। बाद में फिर देखें!', 'Research Brain': 'रिसर्च ब्रेन', 'Upload Research': 'रिसर्च अपलोड करें', 'Sources Grounding': 'स्रोत', 'Create a Post': 'पोस्ट बनाएं', 'Category': 'श्रेणी', 'Post Title': 'पोस्ट का शीर्षक', 'Your Post': 'आपकी पोस्ट', 'Submit': 'जमा करें', 'Cancel': 'रद्द करें', 'Personal': 'व्यक्तिगत', 'Education': 'शिक्षा', 'Skills': 'कौशल', 'Projects': 'प्रोजेक्ट', 'Preview': 'प्रीव्यू', 'Download': 'डाउनलोड', 'Apply': 'आवेदन करें', 'Progress': 'प्रगति', 'Add': 'जोड़ें', 'Add Project': 'प्रोजेक्ट जोड़ें', 'Upload PDF': 'PDF अपलोड करें', 'Download PDF': 'PDF डाउनलोड करें', 'Save to Profile': 'प्रोफ़ाइल में सेव करें', 'Back': 'वापस', 'Next': 'अगला', 'Start Resume Builder': 'रिज्यूमे बिल्डर शुरू करें', 'Edit Resume': 'रिज्यूमे संपादित करें', 'Create New Resume': 'नया रिज्यूमे बनाएं', 'Personal Details': 'व्यक्तिगत विवरण', 'Degree': 'डिग्री', 'College': 'कॉलेज', 'Year': 'वर्ष', 'Location': 'स्थान', 'Phone': 'फ़ोन', 'Description': 'विवरण', 'Project title': 'प्रोजेक्ट का शीर्षक', 'Tech stack': 'टेक स्टैक', 'Experience': 'अनुभव', 'Internship': 'इंटर्नशिप', 'Role': 'भूमिका', 'Listening...': 'सुन रहे हैं...', 'Progress': 'प्रगति', 'Live Preview': 'लाइव प्रीव्यू', 'Your Score': 'आपका स्कोर', 'Quiz Completed!': 'क्विज़ पूरा हुआ!', 'Tests & Quizzes': 'टेस्ट और क्विज़', 'Start Test': 'टेस्ट शुरू करें', 'Return to Quizzes': 'क्विज़ पर लौटें', 'Settings': 'सेटिंग्स', 'Log Out': 'लॉग आउट', 'Edit Profile': 'प्रोफ़ाइल संपादित करें', 'Full Name': 'पूरा नाम', 'Preferred Name': 'पसंदीदा नाम', 'Email Address': 'ईमेल पता', 'Phone Number': 'फ़ोन नंबर', 'Preferred Language': 'पसंदीदा भाषा', 'Time Zone': 'समय क्षेत्र', 'Notifications': 'सूचनाएं', 'Email Notifications': 'ईमेल सूचनाएं', 'Platform Reminders': 'प्लेटफॉर्म रिमाइंडर'
};

const dashboardMarathi: Record<string, string> = {
  'Learning Platform': 'लर्निंग प्लॅटफॉर्म', 'Student Account': 'विद्यार्थी खाते', 'Track Your Progress': 'तुमची प्रगती ट्रॅक करा', 'See how far you\'ve come in your learning and career journey.': 'तुमच्या शिक्षण आणि करिअरच्या प्रवासातील प्रगती पहा.', 'Learning Progress': 'शिक्षणाची प्रगती', 'Time Spent': 'घालवलेला वेळ', 'Completed': 'पूर्ण', 'Accuracy': 'अचूकता', 'Career Readiness': 'करिअरची तयारी', 'Matched': 'जुळलेल्या', 'Applied': 'अर्ज केलेले', 'Resume Score': 'रेझ्युमे गुण', 'Weekly Activity': 'साप्ताहिक उपक्रम', 'Skill Development': 'कौशल्य विकास', 'Recent Achievements': 'अलीकडील यश', 'My Learning': 'माझे शिक्षण', 'What This Offers': 'हे काय देते', 'Course Categories': 'अभ्यासक्रम श्रेणी', 'Accessibility Features': 'प्रवेशयोग्यता सुविधा', 'Personalized to Your Profile': 'तुमच्या प्रोफाइलनुसार', 'Adaptive Content': 'अनुकूल सामग्री', 'Targeted Support': 'लक्षित सहाय्य', 'Progress Tracking': 'प्रगती ट्रॅकिंग', 'Coming Soon': 'लवकरच येत आहे', 'AI Notebook': 'AI नोटबुक', 'Community': 'समुदाय', 'Opportunities': 'संधी', 'Profile': 'प्रोफाइल', 'Resume Builder': 'रेझ्युमे बिल्डर', 'LinkedIn Jobs': 'LinkedIn नोकऱ्या', 'Unstop Opportunities': 'Unstop संधी', 'Search': 'शोधा', 'No opportunities found right now. Check back later!': 'आत्ता कोणत्याही संधी सापडल्या नाहीत. नंतर पुन्हा पहा!', 'Research Brain': 'रिसर्च ब्रेन', 'Upload Research': 'रिसर्च अपलोड करा', 'Sources Grounding': 'स्रोत', 'Create a Post': 'पोस्ट तयार करा', 'Category': 'श्रेणी', 'Post Title': 'पोस्टचे शीर्षक', 'Your Post': 'तुमची पोस्ट', 'Submit': 'सबमिट करा', 'Cancel': 'रद्द करा', 'Personal': 'वैयक्तिक', 'Education': 'शिक्षण', 'Skills': 'कौशल्ये', 'Projects': 'प्रकल्प', 'Preview': 'पूर्वावलोकन', 'Download': 'डाउनलोड', 'Apply': 'अर्ज करा', 'Progress': 'प्रगती', 'Add': 'जोडा', 'Add Project': 'प्रकल्प जोडा', 'Upload PDF': 'PDF अपलोड करा', 'Download PDF': 'PDF डाउनलोड करा', 'Save to Profile': 'प्रोफाइलमध्ये जतन करा', 'Back': 'मागे', 'Next': 'पुढील', 'Start Resume Builder': 'रेझ्युमे बिल्डर सुरू करा', 'Edit Resume': 'रेझ्युमे संपादित करा', 'Create New Resume': 'नवीन रेझ्युमे तयार करा', 'Personal Details': 'वैयक्तिक तपशील', 'Degree': 'पदवी', 'College': 'महाविद्यालय', 'Year': 'वर्ष', 'Location': 'स्थान', 'Phone': 'फोन', 'Description': 'वर्णन', 'Project title': 'प्रकल्पाचे शीर्षक', 'Tech stack': 'टेक स्टॅक', 'Experience': 'अनुभव', 'Internship': 'इंटर्नशिप', 'Role': 'भूमिका', 'Listening...': 'ऐकत आहे...', 'Live Preview': 'लाइव्ह पूर्वावलोकन', 'Your Score': 'तुमचे गुण', 'Quiz Completed!': 'क्विझ पूर्ण झाले!', 'Tests & Quizzes': 'चाचण्या आणि क्विझ', 'Start Test': 'चाचणी सुरू करा', 'Return to Quizzes': 'क्विझकडे परत जा', 'Settings': 'सेटिंग्ज', 'Log Out': 'लॉग आउट', 'Edit Profile': 'प्रोफाइल संपादित करा', 'Full Name': 'पूर्ण नाव', 'Preferred Name': 'आवडते नाव', 'Email Address': 'ईमेल पत्ता', 'Phone Number': 'फोन नंबर', 'Preferred Language': 'पसंतीची भाषा', 'Time Zone': 'टाइम झोन', 'Notifications': 'सूचना', 'Email Notifications': 'ईमेल सूचना', 'Platform Reminders': 'प्लॅटफॉर्म स्मरणपत्रे'
};

const dashboardHindiAdditional: Record<string, string> = {
  'Track Your Progress': 'अपनी प्रगति ट्रैक करें', 'See how far you\'ve come in your learning and career journey.': 'अपनी सीखने और करियर यात्रा में हुई प्रगति देखें।',
  'Learning Progress': 'सीखने की प्रगति', 'Time Spent': 'बिताया गया समय', 'Reading Mode ON': 'रीडिंग मोड चालू', 'Reading Mode OFF': 'रीडिंग मोड बंद',
  'Search by title or skill...': 'शीर्षक या कौशल से खोजें...', 'Search': 'खोजें', 'View More Jobs': 'और नौकरियां देखें',
  'Professional opportunities tailored for you': 'आपके लिए तैयार पेशेवर अवसर', 'Competitions, hackathons, and internships': 'प्रतियोगिताएं, हैकाथॉन और इंटर्नशिप',
  'No opportunities found right now. Check back later!': 'अभी कोई अवसर नहीं मिला। बाद में फिर देखें!', 'My Learning': 'मेरी पढ़ाई', 'What This Offers': 'यह क्या प्रदान करता है',
  'Course Categories': 'कोर्स श्रेणियां', 'Visual Learning Fundamentals': 'दृश्य सीखने की मूल बातें', 'Audio-Based Comprehension': 'ऑडियो आधारित समझ',
  'Hands-On Problem Solving': 'व्यावहारिक समस्या समाधान', 'Memory Enhancement Techniques': 'याददाश्त बढ़ाने की तकनीकें',
  'Accessibility Features': 'पहुंच सुविधाएं', 'Text-to-speech for all content': 'सभी सामग्री के लिए टेक्स्ट-टू-स्पीच', 'Visual aids and diagrams': 'दृश्य सहायता और आरेख',
  'Personalized to Your Profile': 'आपकी प्रोफ़ाइल के अनुसार', 'Adaptive Content': 'अनुकूलित सामग्री', 'Targeted Support': 'लक्षित सहायता', 'Monitor your improvement with detailed analytics': 'विस्तृत विश्लेषण से अपनी प्रगति देखें',
  'Research Brain': 'रिसर्च ब्रेन', 'Service Online': 'सेवा ऑनलाइन', 'Service Offline': 'सेवा ऑफलाइन', 'Documents': 'दस्तावेज़', 'Chunks': 'खंड', 'Indexing...': 'इंडेक्स हो रहा है...',
  'Ask anything about your documents...': 'अपने दस्तावेज़ों के बारे में कुछ भी पूछें...', 'Sources Grounding': 'स्रोत', 'Insight': 'अंतर्दृष्टि', 'Upload Research': 'रिसर्च अपलोड करें',
  'AI Notebook': 'AI नोटबुक', 'Powered by Gemini AI · Dyslexia-friendly': 'Gemini AI द्वारा संचालित · डिस्लेक्सिया-अनुकूल', 'Clear All': 'सब साफ़ करें',
  'Upload a document (optional)': 'दस्तावेज़ अपलोड करें (वैकल्पिक)', 'Click to upload TXT, PDF, DOC, Audio, Video': 'TXT, PDF, DOC, ऑडियो या वीडियो अपलोड करने के लिए क्लिक करें',
  'Or type / paste your text here': 'या अपना टेक्स्ट यहां लिखें / पेस्ट करें', 'Summarize': 'सारांश', 'Explain': 'समझाएं', 'Simplify': 'सरल करें', 'Quiz Me': 'मेरा क्विज़ लें', 'Make Video': 'वीडियो बनाएं',
  'A kind space for everyone': 'सबके लिए एक स्नेहपूर्ण स्थान', 'Be respectful, share your experiences, and support others.': 'सम्मान रखें, अपने अनुभव साझा करें और दूसरों का सहयोग करें.',
  'View Community Guidelines': 'समुदाय दिशानिर्देश देखें', 'Categories': 'श्रेणियां', 'All Posts': 'सभी पोस्ट', 'Nothing here yet': 'अभी यहां कुछ नहीं है',
  'Be the first to start a conversation in this category.': 'इस श्रेणी में बातचीत शुरू करने वाले पहले व्यक्ति बनें.', 'Create Post': 'पोस्ट बनाएं',
  'Progress': 'प्रगति', 'Weekly Activity': 'साप्ताहिक गतिविधि', 'Skill Development': 'कौशल विकास', 'Recent Achievements': 'हाल की उपलब्धियां', 'Career Readiness': 'करियर की तैयारी',
  'Matched': 'मिलान किए गए', 'Applied': 'आवेदन किए गए', 'Resume Score': 'रिज्यूमे स्कोर', 'Recommended Career Paths': 'अनुशंसित करियर पथ', 'Your Learning Roadmap': 'आपका सीखने का रोडमैप', 'Match score': 'मिलान स्कोर',
  'Personal': 'व्यक्तिगत', 'Education': 'शिक्षा', 'Skills': 'कौशल', 'Projects': 'प्रोजेक्ट', 'Preview': 'प्रीव्यू', 'Download': 'डाउनलोड', 'Apply': 'आवेदन करें', 'Save': 'सहेजें',
  'Listening...': 'सुन रहे हैं...', 'Saving...': 'सहेजा जा रहा है...', 'Saved!': 'सहेजा गया!', 'Save PDF': 'PDF सहेजें', 'Live Preview': 'लाइव प्रीव्यू', 'Download PDF': 'PDF डाउनलोड करें',
  'Start Assessment': 'आकलन शुरू करें', 'Explore First': 'पहले देखें', 'Welcome to NeuroBridge!': 'NeuroBridge में आपका स्वागत है!', 'Personalized': 'व्यक्तिगत', 'Interactive': 'इंटरैक्टिव', 'Quick': 'त्वरित',
  'Opportunities': 'अवसर', 'Overview': 'अवलोकन', 'LinkedIn Integration': 'LinkedIn एकीकरण', 'Unstop Integration': 'Unstop एकीकरण', 'Our Opportunities platform connects you directly to real job listings from LinkedIn and competitions from Unstop, all with dyslexia-friendly enhancements.': 'हमारा अवसर प्लेटफॉर्म आपको LinkedIn की वास्तविक नौकरी सूचियों और Unstop की प्रतियोगिताओं से सीधे जोड़ता है, साथ ही डिस्लेक्सिया-अनुकूल सुविधाएं देता है।', 'Real-time job listings': 'रीयल-टाइम नौकरी सूचियां', 'Dyslexia-friendly mode toggle': 'डिस्लेक्सिया-अनुकूल मोड टॉगल', 'Audio summaries for each job': 'हर नौकरी के लिए ऑडियो सारांश', 'Simplified application process': 'सरल आवेदन प्रक्रिया', 'Latest competitions and hackathons': 'नवीनतम प्रतियोगिताएं और हैकाथॉन', 'Internship opportunities': 'इंटर्नशिप के अवसर', 'Clear deadline tracking': 'समय-सीमा की स्पष्ट जानकारी', 'Prize and eligibility highlights': 'पुरस्कार और पात्रता की मुख्य जानकारी', 'Browse LinkedIn Jobs': 'LinkedIn नौकरियां देखें', 'Explore Unstop Opportunities': 'Unstop अवसर देखें',
  'Profile': 'प्रोफ़ाइल', 'Member since': 'सदस्य बने', 'Edit Profile': 'प्रोफ़ाइल संपादित करें', 'Personal Information': 'व्यक्तिगत जानकारी', 'Edit': 'संपादित करें', 'Full Name': 'पूरा नाम', 'Preferred Name': 'पसंदीदा नाम', 'Phone Number': 'फ़ोन नंबर', 'Email Address': 'ईमेल पता', 'Location': 'स्थान', 'Optional': 'वैकल्पिक', 'City, Country': 'शहर, देश', 'Not provided': 'उपलब्ध नहीं', 'Cancel': 'रद्द करें', 'Save Changes': 'बदलाव सहेजें', 'Platform Preferences': 'प्लेटफॉर्म प्राथमिकताएं', 'Preferred Language': 'पसंदीदा भाषा', 'Time Zone': 'समय क्षेत्र', 'Notifications': 'सूचनाएं', 'Email Notifications': 'ईमेल सूचनाएं', 'Receive updates about new opportunities and features': 'नए अवसरों और सुविधाओं के अपडेट पाएं', 'Platform Reminders': 'प्लेटफॉर्म रिमाइंडर', 'In-app notifications for learning progress': 'सीखने की प्रगति के लिए ऐप में सूचनाएं', 'Account': 'खाता', 'Account Status': 'खाते की स्थिति', 'Active': 'सक्रिय', 'Sign-in Method': 'साइन-इन तरीका', 'Signed in with Google': 'Google से साइन इन', 'Signed in with Email': 'ईमेल से साइन इन', 'Security & Access': 'सुरक्षा और पहुंच', 'Password': 'पासवर्ड', 'Last changed': 'अंतिम बदलाव', 'months ago': 'महीने पहले', 'Change': 'बदलें', 'Active Sessions': 'सक्रिय सत्र', 'Current session': 'वर्तमान सत्र', 'Update profile picture': 'प्रोफ़ाइल तस्वीर अपडेट करें', 'Remove photo': 'तस्वीर हटाएं',
};

const dashboardMarathiAdditional: Record<string, string> = {
  'Track Your Progress': 'तुमची प्रगती ट्रॅक करा', 'See how far you\'ve come in your learning and career journey.': 'तुमच्या शिक्षण आणि करिअरच्या प्रवासातील प्रगती पहा.',
  'Learning Progress': 'शिक्षणाची प्रगती', 'Time Spent': 'घालवलेला वेळ', 'Reading Mode ON': 'वाचन मोड सुरू', 'Reading Mode OFF': 'वाचन मोड बंद',
  'Search by title or skill...': 'शीर्षक किंवा कौशल्यानुसार शोधा...', 'Search': 'शोधा', 'View More Jobs': 'अधिक नोकऱ्या पहा',
  'Professional opportunities tailored for you': 'तुमच्यासाठी तयार केलेल्या व्यावसायिक संधी', 'Competitions, hackathons, and internships': 'स्पर्धा, हॅकाथॉन आणि इंटर्नशिप',
  'No opportunities found right now. Check back later!': 'आत्ता कोणत्याही संधी सापडल्या नाहीत. नंतर पुन्हा पहा!', 'My Learning': 'माझे शिक्षण', 'What This Offers': 'हे काय देते',
  'Course Categories': 'अभ्यासक्रम श्रेणी', 'Visual Learning Fundamentals': 'दृश्य शिक्षणाची मूलतत्त्वे', 'Audio-Based Comprehension': 'ऑडिओ आधारित आकलन',
  'Hands-On Problem Solving': 'प्रात्यक्षिक समस्या निराकरण', 'Memory Enhancement Techniques': 'स्मरणशक्ती वाढवण्याच्या पद्धती',
  'Accessibility Features': 'प्रवेशयोग्यता सुविधा', 'Text-to-speech for all content': 'सर्व सामग्रीसाठी टेक्स्ट-टू-स्पीच', 'Visual aids and diagrams': 'दृश्य साधने आणि आकृत्या',
  'Personalized to Your Profile': 'तुमच्या प्रोफाइलनुसार', 'Adaptive Content': 'अनुकूल सामग्री', 'Targeted Support': 'लक्षित सहाय्य', 'Monitor your improvement with detailed analytics': 'तपशीलवार विश्लेषणासह तुमची प्रगती पहा',
  'Research Brain': 'रिसर्च ब्रेन', 'Service Online': 'सेवा ऑनलाइन', 'Service Offline': 'सेवा ऑफलाइन', 'Documents': 'दस्तऐवज', 'Chunks': 'भाग', 'Indexing...': 'इंडेक्स होत आहे...',
  'Ask anything about your documents...': 'तुमच्या दस्तऐवजांबद्दल काहीही विचारा...', 'Sources Grounding': 'स्रोत', 'Insight': 'अंतर्दृष्टी', 'Upload Research': 'रिसर्च अपलोड करा',
  'AI Notebook': 'AI नोटबुक', 'Powered by Gemini AI · Dyslexia-friendly': 'Gemini AI द्वारे समर्थित · डिस्लेक्सिया-अनुकूल', 'Clear All': 'सर्व साफ करा',
  'Upload a document (optional)': 'दस्तऐवज अपलोड करा (पर्यायी)', 'Click to upload TXT, PDF, DOC, Audio, Video': 'TXT, PDF, DOC, ऑडिओ किंवा व्हिडिओ अपलोड करण्यासाठी क्लिक करा',
  'Or type / paste your text here': 'किंवा तुमचा मजकूर येथे लिहा / पेस्ट करा', 'Summarize': 'सारांश', 'Explain': 'समजावून सांगा', 'Simplify': 'सोपे करा', 'Quiz Me': 'माझी क्विझ घ्या', 'Make Video': 'व्हिडिओ तयार करा',
  'A kind space for everyone': 'प्रत्येकासाठी आपुलकीची जागा', 'Be respectful, share your experiences, and support others.': 'आदर ठेवा, तुमचे अनुभव शेअर करा आणि इतरांना मदत करा.',
  'View Community Guidelines': 'समुदाय मार्गदर्शक तत्त्वे पहा', 'Categories': 'श्रेणी', 'All Posts': 'सर्व पोस्ट', 'Nothing here yet': 'अजून येथे काहीही नाही',
  'Be the first to start a conversation in this category.': 'या श्रेणीमध्ये संवाद सुरू करणारे पहिले व्हा.', 'Create Post': 'पोस्ट तयार करा',
  'Progress': 'प्रगती', 'Weekly Activity': 'साप्ताहिक उपक्रम', 'Skill Development': 'कौशल्य विकास', 'Recent Achievements': 'अलीकडील यश', 'Career Readiness': 'करिअरची तयारी',
  'Matched': 'जुळलेल्या', 'Applied': 'अर्ज केलेले', 'Resume Score': 'रेझ्युमे गुण', 'Recommended Career Paths': 'शिफारस केलेले करिअर मार्ग', 'Your Learning Roadmap': 'तुमचा शिक्षण रोडमॅप', 'Match score': 'जुळणी गुण',
  'Personal': 'वैयक्तिक', 'Education': 'शिक्षण', 'Skills': 'कौशल्ये', 'Projects': 'प्रकल्प', 'Preview': 'पूर्वावलोकन', 'Download': 'डाउनलोड', 'Apply': 'अर्ज करा', 'Save': 'जतन करा',
  'Listening...': 'ऐकत आहे...', 'Saving...': 'जतन होत आहे...', 'Saved!': 'जतन झाले!', 'Save PDF': 'PDF जतन करा', 'Live Preview': 'लाइव्ह पूर्वावलोकन', 'Download PDF': 'PDF डाउनलोड करा',
  'Start Assessment': 'आकलन सुरू करा', 'Explore First': 'आधी पहा', 'Welcome to NeuroBridge!': 'NeuroBridge मध्ये तुमचे स्वागत आहे!', 'Personalized': 'वैयक्तिक', 'Interactive': 'परस्परसंवादी', 'Quick': 'जलद',
  'Opportunities': 'संधी', 'Overview': 'आढावा', 'LinkedIn Integration': 'LinkedIn एकत्रीकरण', 'Unstop Integration': 'Unstop एकत्रीकरण', 'Our Opportunities platform connects you directly to real job listings from LinkedIn and competitions from Unstop, all with dyslexia-friendly enhancements.': 'आमचे संधी प्लॅटफॉर्म तुम्हाला LinkedIn वरील वास्तविक नोकरीच्या सूची आणि Unstop वरील स्पर्धांशी थेट जोडते, तसेच डिस्लेक्सिया-अनुकूल सुविधा देते.', 'Real-time job listings': 'रिअल-टाइम नोकरीच्या सूची', 'Dyslexia-friendly mode toggle': 'डिस्लेक्सिया-अनुकूल मोड टॉगल', 'Audio summaries for each job': 'प्रत्येक नोकरीसाठी ऑडिओ सारांश', 'Simplified application process': 'सुलभ अर्ज प्रक्रिया', 'Latest competitions and hackathons': 'नवीनतम स्पर्धा आणि हॅकाथॉन', 'Internship opportunities': 'इंटर्नशिपच्या संधी', 'Clear deadline tracking': 'अंतिम मुदतीचा स्पष्ट मागोवा', 'Prize and eligibility highlights': 'बक्षीस आणि पात्रतेची ठळक माहिती', 'Browse LinkedIn Jobs': 'LinkedIn नोकऱ्या पहा', 'Explore Unstop Opportunities': 'Unstop संधी पहा',
  'Profile': 'प्रोफाइल', 'Member since': 'सदस्यत्वाची सुरुवात', 'Edit Profile': 'प्रोफाइल संपादित करा', 'Personal Information': 'वैयक्तिक माहिती', 'Edit': 'संपादित करा', 'Full Name': 'पूर्ण नाव', 'Preferred Name': 'आवडते नाव', 'Phone Number': 'फोन नंबर', 'Email Address': 'ईमेल पत्ता', 'Location': 'स्थान', 'Optional': 'पर्यायी', 'City, Country': 'शहर, देश', 'Not provided': 'उपलब्ध नाही', 'Cancel': 'रद्द करा', 'Save Changes': 'बदल जतन करा', 'Platform Preferences': 'प्लॅटफॉर्म प्राधान्ये', 'Preferred Language': 'पसंतीची भाषा', 'Time Zone': 'वेळ क्षेत्र', 'Notifications': 'सूचना', 'Email Notifications': 'ईमेल सूचना', 'Receive updates about new opportunities and features': 'नवीन संधी आणि सुविधांचे अपडेट मिळवा', 'Platform Reminders': 'प्लॅटफॉर्म स्मरणपत्रे', 'In-app notifications for learning progress': 'शिक्षणाच्या प्रगतीसाठी अॅपमधील सूचना', 'Account': 'खाते', 'Account Status': 'खात्याची स्थिती', 'Active': 'सक्रिय', 'Sign-in Method': 'साइन-इन पद्धत', 'Signed in with Google': 'Google द्वारे साइन इन', 'Signed in with Email': 'ईमेलद्वारे साइन इन', 'Security & Access': 'सुरक्षा आणि प्रवेश', 'Password': 'पासवर्ड', 'Last changed': 'शेवटचा बदल', 'months ago': 'महिने पूर्वी', 'Change': 'बदला', 'Active Sessions': 'सक्रिय सत्रे', 'Current session': 'सध्याचे सत्र', 'Update profile picture': 'प्रोफाइल चित्र अपडेट करा', 'Remove photo': 'चित्र काढा',
};

export function getDashboardTextTranslations(language: Language): Record<string, string> {
  return language === 'hi' ? { ...dashboardHindi, ...dashboardHindiAdditional } : language === 'mr' ? { ...dashboardMarathi, ...dashboardMarathiAdditional } : {};
}
