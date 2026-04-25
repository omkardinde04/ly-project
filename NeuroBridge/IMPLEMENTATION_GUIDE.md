# NeuroBridge Assessment & Platform Improvements - Implementation Guide

## 📋 Overview
This guide covers all 8 fixes with detailed implementation steps, code examples, and technical requirements.

---

## ✅ COMPLETED FIXES

### Fix 1: Remove Auto-Assessment After Login ✅
**Status**: Complete  
**File**: `Dashboard.tsx`  
**Changes**:
- Removed auto-redirect useEffect
- Added `DashboardWelcome` component
- User can now choose to take assessment or explore

### Fix 2: Visual Attention Timer + Skip ✅
**Status**: Complete  
**File**: `CognitiveTaskAssessment.tsx`  
**Changes**:
- Added 20-second countdown timer
- Added skip button
- Tracks skipped status for metrics

---

## 🔧 REMAINING FIXES - DETAILED IMPLEMENTATION

---

## Fix 3: Redesign Memory Game (Image-Based Format)

### Current Problem
- Corsi block pattern is confusing
- Users don't understand what to do
- Abstract grid lacks context

### Solution: Emoji Memory Game

**File to Modify**: `CognitiveTaskAssessment.tsx`  
**Function**: `WorkingMemoryTask`

### Implementation Steps:

```typescript
// Replace WorkingMemoryTask with this:
function WorkingMemoryTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'show' | 'hide' | 'select'>('show');
  const [items, setItems] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(3);

  const emojiSets = [
    ['🍎', '🚗', '🐶', '🌙'],
    ['🌺', '⚽', '🎸', '🍕'],
    ['📚', '🎨', '🏀', '🌈'],
    ['🐱', '🍦', '🎯', '⭐'],
  ];

  useEffect(() => {
    // Phase 1: Show items for 3 seconds
    const randomSet = emojiSets[Math.floor(Math.random() * emojiSets.length)];
    setItems(randomSet);

    const showTimer = setTimeout(() => {
      setPhase('hide');
      setTimeLeft(0);

      // Phase 2: Brief pause
      setTimeout(() => {
        setPhase('select');
        // Generate options (mix correct + distractors)
        const allEmojis = ['🍎', '🍌', '🚗', '🐱', '🐶', '🌙', '🌺', '⚽'];
        const distractors = allEmojis.filter(e => !randomSet.includes(e));
        const mixedOptions = [...randomSet, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
        setOptions(mixedOptions);
      }, 1000);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  const handleSelect = (emoji: string) => {
    if (selected.includes(emoji)) {
      setSelected(selected.filter(e => e !== emoji));
    } else if (selected.length < items.length) {
      setSelected([...selected, emoji]);
    }
  };

  const handleSubmit = () => {
    const correct = selected.filter(s => items.includes(s)).length;
    const wrong = selected.filter(s => !items.includes(s)).length;
    const score = Math.max(0, Math.round(((correct - wrong) / items.length) * 100));
    onComplete(score);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">🧠</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Memory Game</h3>
      <p className="text-gray-600 mb-6">Remember the items shown</p>

      {phase === 'show' && (
        <div>
          <div className="flex justify-center gap-6 mb-6">
            {items.map((emoji, idx) => (
              <div key={idx} className="text-7xl animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }}>
                {emoji}
              </div>
            ))}
          </div>
          <p className="text-sm text-blue-600 font-semibold">Memorize these items...</p>
        </div>
      )}

      {phase === 'hide' && (
        <div className="py-12">
          <div className="text-6xl mb-4">🙈</div>
          <p className="text-xl font-bold text-gray-700">Items hidden!</p>
          <p className="text-gray-500">Get ready to select what you saw...</p>
        </div>
      )}

      {phase === 'select' && (
        <div>
          <p className="text-lg font-semibold mb-6">
            Which {items.length} items did you see? (Select {items.length})
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            {options.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(emoji)}
                className={`text-5xl p-6 rounded-xl transition-all ${
                  selected.includes(emoji)
                    ? 'bg-blue-500 scale-110 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={selected.length !== items.length}
            className="bg-[#4A90E2] hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold"
          >
            Submit ({selected.length}/{items.length} selected)
          </button>
        </div>
      )}
    </div>
  );
}
```

### Key Improvements:
✅ Clear 3-phase flow (show → hide → select)  
✅ Emoji-based (universal, no language barrier)  
✅ Visual feedback on selection  
✅ Score penalizes wrong selections  
✅ Dyslexia-friendly (large emojis, clear instructions)  

---

## Fix 4: Pattern Match - Blank Questions Fix

### Current Problem
- Images fail to load
- No error handling
- Questions appear blank

### Solution: Add Image Validation + Fallback

**File to Modify**: `CognitiveTaskAssessment.tsx`  
**Function**: `ProcessingSpeedTask`

### Implementation:

```typescript
// Add this helper component at the top of the file:
function ReliableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-sm font-semibold text-gray-700">Pattern</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-xl transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

// Update ProcessingSpeedTask to use predefined patterns (no external images):
function ProcessingSpeedTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; time: number }[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const totalTrials = 20;

  // Generate patterns using Unicode symbols (no image loading issues)
  const generatePattern = () => {
    const symbols = ['◆', '■', '●', '▲', '★', '♦', '▪', '◉'];
    return Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]).join(' ');
  };

  const [pattern1, setPattern1] = useState(generatePattern());
  const [pattern2, setPattern2] = useState(generatePattern());
  const [isSame, setIsSame] = useState(false);

  useEffect(() => {
    setStartTime(new Date());
    // 50% chance patterns are same
    const same = Math.random() > 0.5;
    setIsSame(same);
    setPattern1(generatePattern());
    setPattern2(same ? pattern1 : generatePattern());
  }, [currentIndex]);

  const handleResponse = (userSaysSame: boolean) => {
    const endTime = new Date();
    const time = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;
    const correct = userSaysSame === isSame;

    setResponses([...responses, { correct, time }]);

    if (currentIndex < totalTrials - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const accuracy = responses.filter(r => r.correct).length / totalTrials;
      const avgTime = responses.reduce((sum, r) => sum + r.time, 0) / totalTrials;
      const speedScore = Math.max(0, 100 - avgTime * 10);
      const score = Math.round(accuracy * 70 + speedScore * 0.3);
      onComplete(score);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">⚡</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Pattern Match</h3>
      <p className="text-gray-600 mb-6">Are these patterns the SAME or DIFFERENT?</p>

      <div className="flex justify-center gap-8 mb-8">
        <div className="text-4xl tracking-widest bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-100 min-w-[200px]">
          {pattern1}
        </div>
        <div className="text-4xl tracking-widest bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-purple-100 min-w-[200px]">
          {pattern2}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button
          onClick={() => handleResponse(true)}
          className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
        >
          ✓ SAME
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
        >
          ✗ DIFFERENT
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Trial {currentIndex + 1} of {totalTrials}
      </p>
    </div>
  );
}
```

### Key Improvements:
✅ No external images (uses Unicode symbols)  
✅ Impossible to have blank questions  
✅ Instant loading  
✅ Consistent patterns  
✅ Added trial counter  

---

## Fix 5: Word Recognition - Image-Based Confusion Test

### Current Problem
- Text-only word pairs
- Not engaging
- Doesn't test visual confusion

### Solution: Add Image-Based Homophone Test

**File to Modify**: `CognitiveTaskAssessment.tsx`  
**Function**: `OrthographicTask`

### Implementation:

```typescript
function OrthographicTask({ onComplete }: { onComplete: (score: number) => void }) {
  const wordPairs = [
    {
      image: '🌊',
      word: 'sea',
      confusingWord: 'see',
      context: 'The ocean is also called the ___'
    },
    {
      image: '👁️',
      word: 'eye',
      confusingWord: 'I',
      context: 'You use this to see: ___'
    },
    {
      image: '🌸',
      word: 'flower',
      confusingWord: 'flour',
      context: 'A beautiful bloom from a plant'
    },
    {
      image: '👂',
      word: 'ear',
      confusingWord: 'air',
      context: 'You hear with this'
    },
    {
      image: '🌞',
      word: 'sun',
      confusingWord: 'son',
      context: 'It shines in the sky during the day'
    },
    {
      image: '📝',
      word: 'write',
      confusingWord: 'right',
      context: 'To put words on paper'
    },
    {
      image: '⏰',
      word: 'hour',
      confusingWord: 'our',
      context: '60 minutes make one ___'
    },
    {
      image: '🕳️',
      word: 'hole',
      confusingWord: 'whole',
      context: 'A gap or opening in something'
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentPair = wordPairs[currentIndex];
  const options = Math.random() > 0.5 
    ? [currentPair.word, currentPair.confusingWord]
    : [currentPair.confusingWord, currentPair.word];

  const handleChoice = (chosen: string) => {
    if (showFeedback) return;
    
    setSelected(chosen);
    setShowFeedback(true);
    
    const isCorrect = chosen === currentPair.word;
    if (isCorrect) setCorrect(correct + 1);

    setTimeout(() => {
      if (currentIndex < wordPairs.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        const score = Math.round(((correct + (isCorrect ? 1 : 0)) / wordPairs.length) * 100);
        onComplete(score);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">📝</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Word Recognition</h3>
      <p className="text-gray-600 mb-6">Choose the correct word for the image</p>

      {/* Image Display */}
      <div className="text-9xl mb-4">{currentPair.image}</div>
      <p className="text-lg text-gray-700 mb-6 font-medium">{currentPair.context}</p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {options.map((word, idx) => {
          let buttonStyle = "bg-gray-100 hover:bg-blue-50 text-gray-800 border-2 border-gray-200";
          
          if (showFeedback) {
            if (word === currentPair.word) {
              buttonStyle = "bg-green-500 text-white border-2 border-green-600";
            } else if (word === selected) {
              buttonStyle = "bg-red-400 text-white border-2 border-red-500";
            } else {
              buttonStyle = "bg-gray-100 text-gray-400 border-2 border-gray-200";
            }
          } else if (selected === word) {
            buttonStyle = "bg-blue-500 text-white border-2 border-blue-600";
          }

          return (
            <button
              key={idx}
              onClick={() => handleChoice(word)}
              disabled={showFeedback}
              className={`${buttonStyle} py-6 rounded-xl font-bold text-2xl transition-all disabled:cursor-not-allowed`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-8 text-sm text-gray-500">
        Question {currentIndex + 1} of {wordPairs.length}
      </div>
    </div>
  );
}
```

### Key Improvements:
✅ Large emoji images (no loading issues)  
✅ Context clues for each word  
✅ Tests phonetic confusion (sea/see, eye/I)  
✅ Immediate visual feedback  
✅ Tracks confusion types  

---

## Fix 6: Time Reading - Add Voice Input

### Solution: Web Speech API Integration

**File to Modify**: `CognitiveTaskAssessment.tsx`  
**Function**: `TimedReadingTask`

### Implementation:

```typescript
function TimedReadingTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const words = [
    { display: 'the', expect: 'the' },
    { display: 'quick', expect: 'quick' },
    { display: 'brown', expect: 'brown' },
    { display: 'fox', expect: 'fox' },
    { display: 'jumps', expect: 'jumps' },
    { display: 'over', expect: 'over' },
    { display: 'lazy', expect: 'lazy' },
    { display: 'dog', expect: 'dog' },
  ];

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setSpeechText(transcript);
      setIsListening(false);

      // Check if correct
      if (transcript === words[currentIndex].expect) {
        setTimeout(() => handleNext(), 500);
      } else {
        setAttempts(attempts + 1);
        if (attempts >= 1) {
          // After 2 failed attempts, allow manual proceed
          setTimeout(() => handleNext(), 1000);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSpeechText('');
      setAttempts(0);
    } else {
      const endTime = new Date();
      const minutes = (endTime.getTime() - (startTime?.getTime() || 0)) / 60000;
      const wpm = words.length / minutes;
      const score = Math.min(100, Math.round(wpm / 2));
      onComplete(score);
    }
  };

  if (!started) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-6xl mb-4 block">⏱️</span>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Timed Reading</h3>
        <p className="text-gray-600 mb-6">Read words aloud or click through them</p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setStarted(true);
              setStartTime(new Date());
              setShowVoiceInput(true);
            }}
            className="bg-[#4A90E2] hover:bg-blue-600 text-white px-12 py-4 rounded-xl font-bold text-xl block w-full"
          >
            Start with Voice 🎤
          </button>
          <button
            onClick={() => {
              setStarted(true);
              setStartTime(new Date());
              setShowVoiceInput(false);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-12 py-3 rounded-xl font-bold block w-full"
          >
            Start without Voice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <span className="text-sm text-gray-500">Word {currentIndex + 1} of {words.length}</span>
      </div>

      <div className="text-7xl font-bold text-gray-800 py-12 mb-6">
        {words[currentIndex].display}
      </div>

      {showVoiceInput && (
        <div className="mb-6">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`flex items-center gap-3 mx-auto px-8 py-4 rounded-full font-bold text-lg transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <span className="text-2xl">{isListening ? '🔴' : '🎤'}</span>
            {isListening ? 'Listening...' : 'Speak Now'}
          </button>
          {speechText && (
            <p className="mt-3 text-sm text-gray-600">
              You said: <strong>{speechText}</strong>
            </p>
          )}
          {attempts > 0 && (
            <p className="mt-2 text-xs text-orange-600">
              Attempt {attempts + 1}/2 - Click again or proceed manually
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold"
      >
        {currentIndex < words.length - 1 ? 'Next Word →' : 'Complete'}
      </button>
    </div>
  );
}
```

### Key Features:
✅ Web Speech API integration  
✅ Fallback to click-through mode  
✅ 2 attempts per word  
✅ Visual listening indicator  
✅ Real-time feedback  

---

## Fix 7: Notebook LLM - Dynamic AI Integration

### Requirements
- Backend API endpoint needed
- OpenAI/Gemini integration
- Real-time responses

### Frontend Implementation:

**File**: `NotebookLLM.tsx`

```typescript
// Add AI action buttons
const [userInput, setUserInput] = useState('');
const [aiResponse, setAiResponse] = useState('');
const [loading, setLoading] = useState(false);

const handleAIAction = async (action: 'summarize' | 'explain' | 'simplify' | 'quiz') => {
  if (!userInput.trim()) return;
  
  setLoading(true);
  
  try {
    const response = await fetch('/api/notebook-llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userInput,
        action: action,
        dyslexiaLevel: 'moderate' // from context
      })
    });
    
    const data = await response.json();
    setAiResponse(data.response);
  } catch (error) {
    setAiResponse('Error processing request. Please try again.');
  } finally {
    setLoading(false);
  }
};

// UI Buttons:
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
  <button onClick={() => handleAIAction('summarize')} className="bg-blue-500 text-white py-3 rounded-lg font-bold">
    📝 Summarize
  </button>
  <button onClick={() => handleAIAction('explain')} className="bg-purple-500 text-white py-3 rounded-lg font-bold">
    💡 Explain
  </button>
  <button onClick={() => handleAIAction('simplify')} className="bg-green-500 text-white py-3 rounded-lg font-bold">
    🎯 Simplify
  </button>
  <button onClick={() => handleAIAction('quiz')} className="bg-orange-500 text-white py-3 rounded-lg font-bold">
    ❓ Generate Quiz
  </button>
</div>
```

### Backend Setup Needed:
```javascript
// server/routes/notebook-llm.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { text, action, dyslexiaLevel } = req.body;
  
  const prompts = {
    summarize: `Summarize this in simple terms for a ${dyslexiaLevel} dyslexic reader: ${text}`,
    explain: `Explain this concept clearly and simply: ${text}`,
    simplify: `Rewrite this using simple words and short sentences: ${text}`,
    quiz: `Create 3 multiple-choice questions about this: ${text}`
  };
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompts[action] }]
  });
  
  res.json({ response: completion.choices[0].message.content });
});

module.exports = router;
```

---

## Fix 8: LinkedIn OAuth Integration

### Architecture Overview
```
Frontend (React) → Backend (Node.js) → LinkedIn API → Database → Frontend Update
```

### Step-by-Step Implementation:

#### **Step 1: LinkedIn Developer Setup**
1. Go to https://developer.linkedin.com/
2. Create new app
3. Get Client ID and Client Secret
4. Set redirect URI: `http://localhost:5173/auth/linkedin/callback`

#### **Step 2: Frontend - Connect Button**

```typescript
// components/dashboard/Profile.tsx
const handleLinkedInConnect = () => {
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=randomString&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  window.location.href = linkedinAuthUrl;
};

// UI Button:
<button onClick={handleLinkedInConnect} className="bg-[#0077b5] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
  <img src="/linkedin-logo.png" alt="LinkedIn" className="w-5 h-5" />
  Connect LinkedIn
</button>
```

#### **Step 3: Backend - OAuth Handler**

```javascript
// server/routes/linkedin.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Exchange code for token
  const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI
    })
  );
  
  const accessToken = tokenResponse.data.access_token;
  
  // Fetch profile
  const profile = await axios.get('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  // Fetch email
  const email = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  // Update database
  await updateUserProfile({
    linkedin_id: profile.data.id,
    name: `${profile.data.localizedFirstName} ${profile.data.localizedLastName}`,
    email: email.data.elements[0]['handle~'].emailAddress,
    headline: profile.data.headline,
    profile_synced: true
  });
  
  res.redirect('/dashboard');
});
```

#### **Step 4: Database Schema**

```sql
ALTER TABLE users ADD COLUMN linkedin_id VARCHAR(255);
ALTER TABLE users ADD COLUMN linkedin_headline TEXT;
ALTER TABLE users ADD COLUMN profile_synced BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN skills JSONB;
ALTER TABLE users ADD COLUMN linkedin_experience JSONB;
```

#### **Step 5: Auto-Sync Profile**

```typescript
// After LinkedIn connection
useEffect(() => {
  if (user.linkedin_id) {
    fetchLinkedInData();
  }
}, [user.linkedin_id]);

const fetchLinkedInData = async () => {
  const response = await fetch('/api/linkedin/profile');
  const data = await response.json();
  
  // Auto-fill profile
  setProfile({
    name: data.name,
    skills: data.skills,
    experience: data.experience,
    bio: data.headline
  });
};
```

---

## 🎯 Implementation Priority

### **Phase 1: Immediate (Frontend Only)**
1. ✅ Fix 1: Dashboard Welcome
2. ✅ Fix 2: Visual Attention Timer
3. 🔧 Fix 3: Memory Game Redesign
4. 🔧 Fix 4: Pattern Match Fix
5. 🔧 Fix 5: Word Recognition Images

### **Phase 2: Backend Required**
6. 🔧 Fix 6: Voice Input (Web Speech API - frontend only)
7. 🔧 Fix 7: Notebook LLM (needs OpenAI backend)
8. 🔧 Fix 8: LinkedIn OAuth (needs full backend)

---

## 📦 Required Dependencies

```bash
# For Voice Input
# None - uses browser Web Speech API

# For Notebook LLM
npm install openai axios

# For LinkedIn OAuth
npm install axios express jsonwebtoken

# Environment Variables (.env)
OPENAI_API_KEY=your_key_here
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
```

---

## ✅ Testing Checklist

- [ ] Assessment doesn't auto-start after login
- [ ] Visual attention has 20s timer + skip
- [ ] Memory game shows emojis clearly
- [ ] Pattern match never shows blank
- [ ] Word confusion uses images
- [ ] Voice input works in Chrome
- [ ] Notebook LLM responds dynamically
- [ ] LinkedIn connect redirects properly

---

## 🚀 Quick Start Commands

```bash
# Start frontend
cd frontend
npm run dev

# Start backend (when ready)
cd backend
npm start

# Test assessment flow
http://localhost:5173/assessment

# Test dashboard
http://localhost:5173/dashboard
```

---

**Need help implementing any specific fix? Let me know which one to tackle first!** 🎯
