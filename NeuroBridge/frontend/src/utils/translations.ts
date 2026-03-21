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
    heroTitle: 'A calm, clear platform to learn skills and unlock careers confidently.',
    heroSubtitle: 'ClearPath replaces text-heavy friction with visual learning, assistive tools, and opportunity matching designed for the way you think.',
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
    
    // Preview
    previewTitle: 'वाचन करणारा मेंदू',
    previewText: 'न्यूरोप्लास्टिसिटी मेंदूला नवीन जोडणी बनवण्यास अनुमती देते - हे सिद्ध करते की शिकण्यातील फरक हे मार्ग आहेत, अडथळे नाहीत. आमचा प्लॅटफॉर्म आपल्यासाठी अखंडपणे अनुकूल करतो.',
  },
};

export function getTranslation(language: Language): Translation {
  return translations[language];
}
