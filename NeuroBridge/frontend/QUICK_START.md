# 🚀 Quick Start Guide - Jarvis AI Assistant

Get the AI Assistant running in 5 minutes!

## ⚡ 30-Second Overview

The Jarvis AI Assistant is **already integrated and auto-starts** on your website. Here's what happens:

1. User visits website
2. Backdrop dims + assistant appears
3. "Hi 😊 I'm here to help you..." plays
4. System listens for voice input
5. User can talk, type, switch languages
6. Natural conversation builds user profile, shows opportunities, etc.

**That's it. It just works.**

---

## ✅ Quick Verification

To verify the assistant is working:

```bash
# 1. Start development server
npm run dev

# 2. Open http://localhost:5173 in browser
# 3. Wait 1 second
# 4. You should see:
#    ✓ Screen dims
#    ✓ Assistant window appears
#    ✓ Audio plays greeting
#    ✓ Red listening indicator shows
```

---

## 🎯 Use in Your Code

### **Import wherever needed:**
```typescript
import { useAssistant } from '@/contexts/AssistantContext';

function MyComponent() {
  const { 
    processUserInput,      // Main way to interact
    addMessage,           // Add to conversation
    switchFlow,          // Change what assistant does
    language,            // Current language
    conversationState    // See current state
  } = useAssistant();

  // That's it! Now you can use the assistant
}
```

### **Process user input:**
```typescript
// When user says or types something
const response = await processUserInput("I want to build my profile");

// Response includes:
// - text: The assistant's reply
// - nextAction: 'wait', 'ask', 'guide', etc.
// - nextFlow: Which conversation flow to use next
// - sessionData: Any data collected
```

### **Switch between flows:**
```typescript
// These are the built-in flows:
switchFlow('welcome');                // Main greeting
switchFlow('website-guide');          // Explain platform
switchFlow('profile-builder');        // Build user profile
switchFlow('opportunity-assistant');  // Show jobs
switchFlow('assessment-guide');       // Conduct assessment
switchFlow('community-guide');        // Social connections
```

### **Add messages manually:**
```typescript
// If you want to add a message to the chat
addMessage('assistant', 'Hello! How can I help?');
addMessage('user', 'I need help');
```

---

## 🌐 Language Support

Users can switch languages in the header. All 100+ prompts are translated:

```typescript
// English
"Hi 😊 I'm here to help you"

// Hindi
"नमस्ते 😊 मैं आपकी मदद करने के लिए यहाँ हूँ"

// Marathi  
"नमस्कार 😊 मी आपकी मदद करने के लिए यहाँ आहे"
```

---

## 🎤 Voice Features

### **Speak (Text-to-Speech)**
```typescript
import { getSpeechService } from '@/services/speechService';

const speech = getSpeechService();
await speech.speak("Hello there!", {
  language: 'en',
  speed: 0.9,        // Slightly slower (1.0 = normal)
  pitch: 1.0,
  volume: 0.8
});
```

### **Listen (Speech Recognition)**
```typescript
speech.startListening(
  (transcript, isFinal) => {
    console.log('You said:', transcript);
  },
  (error) => {
    console.error('Error:', error);
  },
  'en'  // language
);

// Later: stop listening
speech.stopListening();
```

---

## 🧠 Advanced Flows

### **Profile Builder**
```typescript
import { ProfileBuilderFlow } from '@/services/conversationFlows';

const builder = new ProfileBuilderFlow('en');

// Process each field
builder.processFieldResponse('name', 'John Doe');
builder.processFieldResponse('education', 'Bachelor in CS');
builder.processFieldResponse('skills', 'Python, JavaScript');

// Get the complete profile
const profile = builder.getProfile();
// Returns: { name, education, skills, interests }
```

### **Opportunity Finder**
```typescript
import { OpportunityFlow } from '@/services/conversationFlows';

const flow = new OpportunityFlow('en');

// Simplify complex job descriptions
const simple = flow.simplifyJobDescription(
  "Senior Analyst",
  "Must demonstrate analytical proficiency..."
);
// Returns: "You should be comfortable understanding data..."

// Generate personalized explanation
const explanation = flow.generateOpportunityExplanation(
  "Senior Analyst",
  userProfile,
  basicDescription
);
```

### **Assessment Test**
```typescript
import { AssessmentFlow } from '@/services/conversationFlows';

const test = new AssessmentFlow('en');

// Get questions one by one
const question = test.getNextQuestion();
// Returns: "Do you find it hard to read quickly?"

// Record response and move to next
test.recordResponse('yes');

// Calculate score when done
const score = test.calculateScore();
// Returns: 80 (percentage)
```

### **Confusion Detection**
```typescript
import { ConfusionDetector } from '@/services/conversationFlows';

const detector = new ConfusionDetector('en');

// Check if user is confused
const { isConfused, reason } = detector.detectFromInput(
  userMessage
);

if (isConfused) {
  // Generate appropriate help response
  const help = detector.generateAdaptiveResponse(reason);
  // reason could be: 'silence', 'minimal_response', 'explicit_confusion'
}
```

---

## 📱 Pages/Routes Integration

### **On Profile Page**
```typescript
import { useAssistant } from '@/contexts/AssistantContext';

export function ProfilePage() {
  const { switchFlow, addMessage } = useAssistant();

  useEffect(() => {
    // Guide user through profile building
    switchFlow('profile-builder');
    addMessage('assistant', "Let's build your profile together! 👍");
  }, []);

  return <div>Profile form...</div>;
}
```

### **On Opportunities Page**
```typescript
export function OpportunitiesPage() {
  const { switchFlow } = useAssistant();

  useEffect(() => {
    switchFlow('opportunity-assistant');
  }, []);

  return <div>Show opportunities...</div>;
}
```

### **On Assessment Page**
```typescript
export function AssessmentPage() {
  const { switchFlow } = useAssistant();

  useEffect(() => {
    switchFlow('assessment-guide');
  }, []);

  return <div>Assessment content...</div>;
}
```

---

## 🎨 Customization

### **Change Colors**
Edit [AIAssistant.tsx](src/components/assistant/AIAssistant.tsx):
```tsx
// Change from purple-600 to your color
className="bg-gradient-to-r from-YOUR-COLOR-600 to-YOUR-COLOR-700"
```

### **Change Voice Speed**
Edit [speechService.ts](src/services/speechService.ts):
```typescript
// Make slower (default 0.9)
utterance.rate = 0.7;  // Slower
utterance.rate = 1.2;  // Faster
```

### **Add Custom Prompts**
Edit [assistantPrompts.ts](src/utils/assistantPrompts.ts):
```typescript
export const myFlowTemplates: PromptTemplate[] = [
  {
    id: 'my-flow-step-1',
    flow: 'my-flow',
    step: 0,
    text: {
      en: "Your English text",
      hi: "आपका हिंदी पाठ",
      mr: "आपचा मराठी पाठ"
    },
    waitForResponse: true
  }
];
```

---

## 🧪 Test Scenarios

### **Test Auto-Start**
1. Open website
2. See background dim
3. Hear greeting
4. See listening indicator

### **Test Voice**
1. Click "Start Voice" or wait for listening
2. Speak: "I want to build my profile"
3. See text appear
4. Hear response
5. See next step

### **Test Language Switch**
1. Click language button (EN, HI, MR)
2. Hear confirmation in new language
3. New responses in that language

### **Test Full Flow**
1. Start → Choose option
2. Build profile → Answer questions  
3. See opportunities → Choose interest
4. Take assessment → Get score
5. Community → Express interest

---

## 📚 File Reference

| File | What It Does | When You Need It |
|------|--------------|------------------|
| `AIAssistant.tsx` | UI + voice interaction | Customizing appearance |
| `assistantPrompts.ts` | All conversation text | Adding new flows/languages |
| `assistantEngine.ts` | Logic + response generation | Understanding how it works |
| `speechService.ts` | Voice features | Adjusting voice settings |
| `conversationFlows.ts` | Advanced flows (profiles, tests, etc) | Complex conversation logic |
| `AssistantContext.tsx` | Global state | Using in components |

---

## 🐛 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Assistant not showing | Check AssistantProvider wraps `<App>` |
| No voice | Allow microphone permission |
| Wrong language | Switch via language button |
| Can't hear | Check speaker volume |
| TypeScript errors | Run `npm run build` |
| Blank messages | Check browser console |

---

## 🔗 Important Imports

```typescript
// Main hook - use everywhere
import { useAssistant } from '@/contexts/AssistantContext';

// Speech features
import { getSpeechService } from '@/services/speechService';

// Advanced flows
import { 
  ProfileBuilderFlow,
  OpportunityFlow,
  AssessmentFlow,
  ConfusionDetector
} from '@/services/conversationFlows';

// Types
import type { Language, ConversationFlow } from '@/types/assistant';
```

---

## ✨ Pro Tips

1. **Test in different browsers** - Some have better voice support
2. **Use natural language** - User can say "build my profile" or "opportunities"
3. **Confusion auto-detects** - No need to ask if user is confused, system figures it out
4. **It remembers** - Session data persists through conversation
5. **Emoji enhances tone** - Light use keeps it friendly

---

## 📖 Full Documentation

For more details, see:
- [ASSISTANT_GUIDE.md](./ASSISTANT_GUIDE.md) - Complete implementation guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing checklist
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - What was built

---

## 🚀 Ready to Go!

Your assistant is ready to use. Here's what to do next:

1. ✅ Run `npm run dev`
2. ✅ Test that it auto-starts
3. ✅ Try speaking to it
4. ✅ Switch languages
5. ✅ Integrate into your pages
6. ✅ Customize colors/text
7. ✅ Deploy!

**That's it. Go build amazing things!** 💜
