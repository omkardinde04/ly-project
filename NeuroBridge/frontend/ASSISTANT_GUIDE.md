# Jarvis-like AI Assistant Implementation Guide

## 📋 Overview

This is a comprehensive, production-ready AI assistant system for a dyslexia-focused platform. Built with React, TypeScript, and modern web APIs, it provides:

- **Voice-first interaction** with text as fallback
- **Multilingual support** (English, Hindi, Marathi)
- **Auto-start on page load** with smooth animations
- **Intelligent conversation flows** for different use cases
- **Confusion detection** with adaptive responses
- **Accessibility-first design** for dyslexic users

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│        AIAssistant Component (UI)            │
│  - Auto-starts with dim & blur effect        │
│  - Voice-first with text fallback            │
│  - Displays messages with animations         │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴──────────┐
       │                  │
   ┌───▼──────────┐  ┌───▼──────────────┐
   │ Speech       │  │ Assistant        │
   │ Service      │  │ Response         │
   │             │  │ Generator        │
   │ - TTS       │  │                  │
   │ - STT       │  │ - Processes user │
   │ - Voice     │  │   input          │
   │   control   │  │ - Generates      │
   └───┬─────────┘  │   responses      │
       │            │ - Manages state  │
       └────┬───────┴──────────────────┘
            │
      ┌─────▼─────────────────┐
      │ Assistant Context     │
      │ & State Management    │
      │                       │
      │ - Global state        │
      │ - Conversation state  │
      │ - User profile        │
      │ - Session data        │
      └─────────────────────┬─┘
                            │
      ┌──────────┬──────────┼──────────┐
      │          │          │          │
    ┌─▼──┐    ┌─▼──┐    ┌─▼──┐    ┌─▼──┐
    │Prom│    │Conv│    │Prof│    │Ass │
    │pts │    │Flow│    │ile │    │essm│
    │Templ│    │Flow│    │Flow│    │ent │
    │ates │    │ Flow│    │Flow │    │Flow│
    └─────┘    └────┘    └────┘    └────┘

```

---

## 📦 File Structure

```
src/
├── types/
│   └── assistant.ts                # Type definitions
├── services/
│   ├── assistantEngine.ts          # Core response generator & conversation manager
│   ├── speechService.ts            # Text-to-speech & speech recognition
│   └── conversationFlows.ts        # Specialized flows
├── contexts/
│   └── AssistantContext.tsx        # Global state management
├── utils/
│   └── assistantPrompts.ts         # All conversation templates & prompts
└── components/
    └── assistant/
        └── AIAssistant.tsx         # Main UI component
```

---

## 🚀 Quick Start

### 1. **Installation**

The system uses only standard APIs and included dependencies:
- Web Speech API (modern browsers)
- React Context API
- Framer Motion (animations)
- Lucide React (icons)

### 2. **Integration**

The assistant is already integrated into the main App. It:
- Auto-starts on page load
- Wraps all content with AssistantProvider
- Shows as a floating button if closed
- Displays with backdrop dim & blur

```tsx
// In App.tsx - Already done!
<DyslexiaProvider>
  <AssistantProvider>
    <Router>
      <AppContent />
      <AIAssistant autoStart={true} />
    </Router>
  </AssistantProvider>
</DyslexiaProvider>
```

---

## 💬 Conversation Flows

### **1. Welcome Flow**
- **Purpose**: Greet user and offer options
- **Steps**: 
  - Greeting with voice-first message
  - Display available options
- **Template ID**: `welcome-greeting`, `welcome-options`

### **2. Website Guide Flow**
- **Purpose**: Explain platform features
- **Steps**:
  - Explain what the platform does
  - Show available features
- **Template ID**: `guide-intro`, `guide-features`

### **3. Profile Builder Flow**
- **Purpose**: Collect user info for profile
- **Steps**:
  - Ask for name
  - Ask for education
  - Ask for skills
  - Ask for interests
  - Confirm completion
- **Uses**: `ProfileBuilderFlow` class
- **Storage**: Session data + user profile context

### **4. Opportunity Assistant Flow**
- **Purpose**: Show personalized job/internship recommendations
- **Steps**:
  - Explain opportunities
  - Show each opportunity with simple explanation
  - Ask for interest
- **Uses**: `OpportunityFlow` class
- **Smart**: Simplifies complex job descriptions

### **5. Assessment Guide Flow**
- **Purpose**: Conduct dyslexia assessment
- **Steps**:
  - Explain assessment
  - Ask questions one by one
  - Calculate score
  - Show results
- **Uses**: `AssessmentFlow` class

### **6. Community Guide Flow**
- **Purpose**: Encourage community connection
- **Steps**:
  - Explain community benefits
  - Offer connection options

---

## 🎙️ Voice Interaction

The assistant uses Web Speech APIs for voice:

### **Text-to-Speech (TTS)**
```typescript
// Automatic in AIAssistant component
const speechService = getSpeechService();
await speechService.speak("Your message here", {
  language: 'en',
  speed: 0.9,      // Slightly slower for clarity
  pitch: 1.0,
  volume: 0.8
});
```

### **Speech Recognition (STR)**
```typescript
// Automatic in AIAssistant component
speechService.startListening(
  (transcript, isFinal) => {
    if (isFinal) {
      // Process final user input
    }
  },
  (error) => console.error(error),
  'en'
);
```

---

## 🧠 Processing User Input

### **Flow**

1. **User speaks** → Speech Recognition captures text
2. **Assistant processes** → Response Generator analyzes input
3. **Generate response** → Based on current flow and context
4. **Speak response** → TTS speaks the response
5. **Listen again** → If waiting for input, restart listening

### **Confusion Detection**

The system automatically detects when a user is confused:

```typescript
// In confusionDetector.ts
detector.detectFromInput(userInput);
// Returns: { isConfused: boolean, reason: string }

// Reasons:
// - 'silence': No response
// - 'minimal_response': Only 1-word answers
// - 'explicit_confusion': User says "confused", "what", etc.
```

---

## 🌐 Multilingual Support

### **Supported Languages**
- English (en)
- Hindi (hi) 
- Marathi (mr)

### **Automatic Detection & Switching**

```tsx
// In AIAssistant component
const { language, setLanguage } = useAssistant();

// Users can switch via language button in header
const handleLanguageChange = (lang: Language) => {
  setLanguage(lang);
  // Assistant immediately switches voice & text
};
```

### **Adding New Language**

1. **Update type**:
```typescript
// In types/assistant.ts
export type Language = 'en' | 'hi' | 'mr' | 'new-lang';
```

2. **Add prompt translations**:
```typescript
// In utils/assistantPrompts.ts
const template: PromptTemplate = {
  text: {
    en: "English text",
    hi: "हिंदी पाठ",
    mr: "मराठी पाठ",
    'new-lang': "New language text"  // Add here
  }
};
```

3. **Update language mapping**:
```typescript
// In speechService.ts
const languageMap: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
  'new-lang': 'xx-XX'  // Add code here
};
```

---

## 📝 Creating Custom Prompts

### **Add New Prompt Template**

```typescript
// In utils/assistantPrompts.ts
export const customFlowTemplates: PromptTemplate[] = [
  {
    id: 'custom-step-1',
    flow: 'custom-flow',
    step: 0,
    text: {
      en: "Your message in English",
      hi: "आपका संदेश हिंदी में",
      mr: "आपचा संदेश मराठीत"
    },
    voiceStyle: 'warm',  // or 'encouraging', 'calm', 'playful'
    waitForResponse: true,
    alternativePhrasings: {
      en: [
        "Alternative way to say it",
        "Another way to phrase it"
      ],
      hi: [
        "यह कहने का एक और तरीका",
        "इसे कहने का दूसरा तरीका"
      ],
      mr: [
        "हे सांगण्याचा एक और तरीका",
        "यास सांगण्याचा दूसरा मार्ग"
      ]
    }
  }
];

// Add to allTemplates array
export const allTemplates: PromptTemplate[] = [
  ...welcomeFlowTemplates,
  ...customFlowTemplates  // Add here
];
```

---

## 🔧 Extending the System

### **Add New Conversation Flow**

1. **Define Flow Type**:
```typescript
// In types/assistant.ts
export type ConversationFlow = 
  | 'welcome' 
  | 'your-new-flow'  // Add here
  | ...;
```

2. **Create Prompts**:
```typescript
// In utils/assistantPrompts.ts
export const yourNewFlowTemplates: PromptTemplate[] = [
  // Define all steps
];

export const allTemplates = [
  ...yourNewFlowTemplates  // Add
];
```

3. **Create Flow Class** (if complex):
```typescript
// In conversationFlows.ts
export class YourNewFlow {
  // Implement logic
}
```

4. **Use in Response Generator**:
```typescript
// In assistantEngine.ts
// Add case in processFlowStep() or create new method
```

---

## 🎯 Using Conversation Flows

### **Profile Builder**
```typescript
import { ProfileBuilderFlow } from '../services/conversationFlows';

const builder = new ProfileBuilderFlow('en');
const response = builder.processFieldResponse('name', userInput);
// Returns: AssistantResponse with follow-up message

const profile = builder.getProfile();
// Returns: { name: "...", education: "...", ... }
```

### **Opportunity Finder**
```typescript
import { OpportunityFlow } from '../services/conversationFlows';

const flow = new OpportunityFlow('en');

// Simplify complex job description
const simpleDesc = flow.simplifyJobDescription(
  "Senior Analyst",
  "Candidate must demonstrate analytical proficiency in complex systems..."
);

// Generate personalized explanation
const explanation = flow.generateOpportunityExplanation(
  "Senior Analyst",
  userProfile,
  complexDescription
);
```

### **Confusion Detection**
```typescript
import { ConfusionDetector } from '../services/conversationFlows';

const detector = new ConfusionDetector('en');

const { isConfused, reason } = detector.detectFromInput(userInput);
if (isConfused) {
  const adaptiveResponse = detector.generateAdaptiveResponse(reason);
  // Use response to support user
}
```

---

## 📊 State Management

### **Using Assistant Context**

```typescript
import { useAssistant } from '../contexts/AssistantContext';

function MyComponent() {
  const {
    conversationState,     // Current conversation state
    userProfile,          // User's profile data
    isAssistantActive,    // Is assistant open?
    language,            // Current language
    
    addMessage,          // Add message to conversation
    processUserInput,    // Process user input
    switchFlow,         // Switch to different flow
    setLanguage,        // Change language
    setUserProfile      // Update user profile
  } = useAssistant();

  // Use these in your components
}
```

### **Adding Message**
```typescript
addMessage('user', userInput);
addMessage('assistant', assistantResponse);
// Messages auto-appear in greeting bubble
```

### **Processing Input**
```typescript
const response = await processUserInput("user typed this");
// Returns: AssistantResponse with next step

// Access state after processing
const { currentFlow, stepIndex, sessionData } = conversationState;
```

---

## 🎨 Customizing UI

### **Change Assistant Appearance**

Edit [AIAssistant.tsx](../components/assistant/AIAssistant.tsx):

```tsx
// Colors
const gradient = "from-purple-600 to-blue-600";  // Change colors

// Size
className="w-full sm:w-96 h-screen sm:h-auto sm:max-h-[600px]"
// Adjust width/height

// Animation speed
transition={{ type: 'spring', damping: 25, stiffness: 300 }}
// Adjust damping/stiffness
```

### **Change Voice Properties**

```typescript
// In speechService.ts
const options: TextToSpeechOptions = {
  language: 'en',
  speed: 0.9,    // 0.5 (slow) to 2.0 (fast)
  pitch: 1.0,    // 0.5 to 2.0
  volume: 0.8    // 0 to 1
};
```

---

## 🧪 Testing

### **Test Scenarios**

1. **Auto-start**: Page loads → assistant appears
2. **Voice input**: Speak → recognized and processed
3. **Text fallback**: Type message → processed same way
4. **Language switch**: Click language button → responds in new language
5. **Confusion detection**: Say "confused" → simplified response
6. **Full flow**: Landing → Profile → Opportunities → Community

### **Browser Requirements**

- Modern browser with Web Speech API support
- Microphone access (prompt on first use)
- Speaker for audio output

### **Testing Web Speech APIs**

```typescript
// Check support
const SpeechRecognition = window.SpeechRecognition 
  || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition && 'speechSynthesis' in window;

if (!supported) {
  // Fallback to text-only mode
}
```

---

## 📱 Accessibility Features

### **Dyslexia-Friendly**

- ✓ Voice-first (no forced reading)
- ✓ Short sentences  
- ✓ Simple language
- ✓ Natural pauses
- ✓ Encouragement
- ✓ Large fonts
- ✓ High contrast
- ✓ Emoji for emotion

### **Supported Dyslexia Modes**

Works with existing DyslexiaContext:
```typescript
const { isDyslexiaMode, dyslexiaLevel } = useDyslexia();

// Automatically applies:
// - Font adjustments
// - Color/contrast changes
// - Spacing modifications
// - Letter spacing
```

---

## 🐛 Debugging

### **Enable Logging**

```typescript
// Add to assistantEngine.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Flow:', currentFlow);
  console.log('Step:', stepIndex);
  console.log('User input:', userInput);
  console.log('Generated response:', response);
}
```

### **Check State**

```typescript
// In browser console
const state = conversationState;
console.log(state.messages);        // All messages
console.log(state.currentFlow);     // Current flow
console.log(state.sessionData);     // Stored data
```

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Speech not working | Check browser support, microphone permissions |
| No audio | Check speaker volume, browser audio permissions |
| Wrong language | Click language button, restart conversation |
| Assistant not starting | Check console for errors, ensure AssistantProvider wraps app |

---

## 📈 Performance Optimization

### **Lazy Load Speech Service**
```typescript
// Already done with getSpeechService()
let speechServiceInstance: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService();
  }
  return speechServiceInstance;
}
```

### **Memoize Expensive Operations**
```typescript
const responseGenerator = useMemo(
  () => new AssistantResponseGenerator(conversationState, userProfile),
  [conversationState, userProfile]
);
```

---

## 🚀 Deployment

### **Requirements**
- HTTPS (required for Web Speech API)
- Browser with Web Speech API support
- Microphone access permissions

### **Browser Support**
```
Chrome/Edge:    ✓ Full support
Safari:         ✓ Speech synthesis only
Firefox:        ✓ With extensions
IE/Edge Legacy: ✗ Not supported
```

---

## 📚 Additional Resources

- [Web Speech API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [React Context Documentation](https://react.dev/reference/react/createContext)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📞 Support

For issues or questions:

1. Check the debugging section above
2. Review example flows in `conversationFlows.ts`
3. Check browser console for detailed error messages
4. Ensure all dependencies are installed (`npm install`)

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅
