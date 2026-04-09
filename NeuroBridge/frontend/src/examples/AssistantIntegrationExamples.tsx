// Example Integration - How to use Assistant in page components

import { useEffect, useState } from 'react';
import { useAssistant } from '../contexts/AssistantContext';
import { OpportunityFlow, AssessmentFlow, ConfusionDetector } from '../services/conversationFlows';
import type { Language } from '../types/assistant';

/**
 * EXAMPLE 1: Profile Builder Page Integration
 * Shows how to guide user through building their profile via conversation
 */
export function ProfileBuilderExample() {
  const {
    switchFlow,
    addMessage
  } = useAssistant();

  // When page loads, switch to profile-building flow
  useEffect(() => {
    switchFlow('profile-builder');
    addMessage('assistant', "Let's build your profile step by step! 🎯");
  }, [switchFlow, addMessage]);

  return (
    <div className="p-6">
      <h1>Build Your Profile</h1>
      {/* Profile form UI would go here */}
    </div>
  );
}

/**
 * EXAMPLE 2: Opportunity Finder Integration
 * Shows how to display jobs/opportunities with simplified descriptions
 */
export function OpportunityFinderExample() {
  const {
    switchFlow,
    userProfile,
    addMessage,
    language
  } = useAssistant();

  const opportunityFlow = new OpportunityFlow(language as Language);

  // Sample opportunities
  const opportunities = [
    {
      id: 1,
      title: 'Data Analytics Intern',
      description: 'Candidate must demonstrate analytical proficiency in handling complex datasets, implementing strategic frameworks, and collaborative problem-solving in a fast-paced environment.'
    },
    {
      id: 2,
      title: 'Content Writer',
      description: 'Exceptional communication skills required. Must exhibit advanced organizational capabilities and demonstrate ability to produce innovative solutions.'
    }
  ];

  useEffect(() => {
    switchFlow('opportunity-assistant');
    addMessage('assistant', 'Let me show you opportunities that match YOU! 🎯');
  }, [switchFlow, addMessage]);

  // Handle opportunity display
  const handleShowOpportunity = (opportunity: typeof opportunities[0]) => {
    const explanation = opportunityFlow.generateOpportunityExplanation(
      opportunity.title,
      userProfile,
      opportunity.description
    );

    addMessage('assistant', explanation);
  };

  return (
    <div className="p-6">
      <h1>Opportunities for You</h1>
      {opportunities.map(opp => (
        <div
          key={opp.id}
          className="mb-4 p-4 border rounded cursor-pointer hover:bg-purple-50"
          onClick={() => handleShowOpportunity(opp)}
        >
          <h3>{opp.title}</h3>
          <p className="text-sm text-gray-600">Click to learn more</p>
        </div>
      ))}
    </div>
  );
}

/**
 * EXAMPLE 3: Assessment Page Integration
 * Shows how to conduct assessments via conversation
 */
export function AssessmentPageExample() {
  const {
    switchFlow,
    addMessage,
    processUserInput,
    language
  } = useAssistant();

  const assessmentFlow = new AssessmentFlow(language as Language);

  useEffect(() => {
    switchFlow('assessment-guide');
    initializeAssessment();
  }, [switchFlow, addMessage]);

  const initializeAssessment = async () => {
    addMessage('assistant', 'Let\'s understand how you learn best with a quick assessment.');
    
    // Ask first question
    const firstQuestion = assessmentFlow.getNextQuestion();
    if (firstQuestion) {
      addMessage('assistant', firstQuestion);
    }
  };

  // Handle assessment response
  const handleAssessmentResponse = async (answer: string) => {
    // Record response
    assessmentFlow.recordResponse(answer);
    
    // Show confirmation
    await processUserInput(answer);

    // Get next question
    const nextQuestion = assessmentFlow.getNextQuestion();
    
    if (nextQuestion) {
      // Ask next question
      addMessage('assistant', nextQuestion);
    } else {
      // Assessment complete
      const score = assessmentFlow.calculateScore();
      const completionMessage = `
        You've finished the assessment! 🎉
        
        Your score: ${score}%
        
        This helps us personalize your experience.
      `;
      
      addMessage('assistant', completionMessage);
      
      // TODO: Save assessment results to backend
      // TODO: Update user's cognitive profile
    }
  };

  return (
    <div className="p-6">
      <h1>Quick Assessment</h1>
      {/* Assessment buttons would go here */}
      <div className="flex gap-4">
        <button onClick={() => handleAssessmentResponse('yes')} className="px-4 py-2 bg-green-500 text-white rounded">
          Yes
        </button>
        <button onClick={() => handleAssessmentResponse('no')} className="px-4 py-2 bg-red-500 text-white rounded">
          No
        </button>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 4: Using Confusion Detection
 * Shows how to automatically help confused users
 */
export function ConfusionDetectionExample() {
  const {
    processUserInput,
    addMessage,
    language
  } = useAssistant();

  const confusionDetector = new ConfusionDetector(language as Language);

  const [confusionInput, setConfusionInput] = useState('');

  // Handle user input with confusion detection
  const handleUserInput = async (input: string) => {
    await processUserInput(input);

    const { isConfused, reason } = confusionDetector.detectFromInput(input);
    if (isConfused) {
      const supportMessage = confusionDetector.generateAdaptiveResponse(reason);
      addMessage('assistant', supportMessage);
      addMessage('assistant', `
        What would help?
        1. Repeat what I said
        2. Explain it simpler
        3. Skip and move on
      `);
    }
  };

  return (
    <div className="p-6">
      <h1>Confusion Detection Example</h1>
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={confusionInput}
          onChange={(e) => setConfusionInput(e.target.value)}
          placeholder="Type something you find confusing"
        />
        <button
          className="rounded bg-purple-600 px-4 py-2 text-white"
          onClick={() => {
            handleUserInput(confusionInput);
            setConfusionInput('');
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 5: Language Switching
 * Shows how to handle language changes dynamically
 */
export function LanguageSwitchExample() {
  const {
    language,
    setLanguage,
    addMessage
  } = useAssistant();

  const handleLanguageSwitch = (newLang: Language) => {
    setLanguage(newLang);
    
    // Update conversation to new language
    const messages = {
      en: 'Great! I\'ll speak in English now. 🇬🇧',
      hi: 'बहुत अच्छा! मैं अब हिंदी बोलूंगा। 🇮🇳',
      mr: 'खूप छान! मी आता मराठी बोलीन. 🇮🇳'
    };

    addMessage('assistant', messages[newLang]);
  };

  return (
    <div className="p-6">
      <h1>Language Settings</h1>
      <div className="flex gap-2">
        <button onClick={() => handleLanguageSwitch('en')} className={`px-4 py-2 rounded ${language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
          English
        </button>
        <button onClick={() => handleLanguageSwitch('hi')} className={`px-4 py-2 rounded ${language === 'hi' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
          हिंदी
        </button>
        <button onClick={() => handleLanguageSwitch('mr')} className={`px-4 py-2 rounded ${language === 'mr' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
          मराठी
        </button>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 6: Full End-to-End Flow
 * Shows complete user journey from landing to profile building to opportunities
 */
export function EndToEndFlowExample() {
  const {
    conversationState,
    switchFlow,
    processUserInput,
    addMessage,
    setUserProfile
  } = useAssistant();

  // Step 1: Welcome user
  useEffect(() => {
    const startJourney = async () => {
      addMessage('assistant', 'Welcome! Let\'s get started 🚀');
      
      // After 2 seconds, ask what they want to do
      setTimeout(() => {
        addMessage('assistant', `
          What would you like to do?
          1. Build your profile
          2. Find opportunities
          3. Take an assessment
          4. Join our community
        `);
      }, 2000);
    };

    startJourney();
  }, [addMessage]);

  // Step 2: Handle user choice
  const handleChoice = async (choice: number) => {
    const flows = {
      1: 'profile-builder',
      2: 'opportunity-assistant',
      3: 'assessment-guide',
      4: 'community-guide'
    };

    const selectedFlow = flows[choice as keyof typeof flows];
    if (selectedFlow) {
      switchFlow(selectedFlow as any);
      await processUserInput(`I want to choose option ${choice}`);
    }
  };

  // Step 3: Save profile when complete
  useEffect(() => {
    if (conversationState.currentFlow === 'profile-builder' && 
        conversationState.stepIndex > 5) {
      // Profile is complete, save it
      const profileData = {
        name: conversationState.sessionData.step_1_input,
        education: conversationState.sessionData.step_2_input,
        skills: conversationState.sessionData.step_3_input,
        interests: conversationState.sessionData.step_4_input
      };

      setUserProfile(profileData);
      // TODO: Save to backend
    }
  }, [conversationState, setUserProfile]);

  return (
    <div className="p-6">
      <h1>Your Journey</h1>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            onClick={() => handleChoice(num)}
            className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Option {num}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * EXAMPLE 7: Accessing Conversation History
 * Shows how to retrieve and use conversation history
 */
export function ConversationHistoryExample() {
  const { conversationState } = useAssistant();

  // Get last assistant message
  const lastAssistantMessage = conversationState.messages
    .filter(m => m.type === 'assistant')
    .slice(-1)?.[0]?.text;

  // Get all user inputs
  const userInputs = conversationState.messages
    .filter(m => m.type === 'user')
    .map(m => m.text);

  // Get conversation summary
  const conversationSummary = {
    totalMessages: conversationState.messages.length,
    currentFlow: conversationState.currentFlow,
    currentStep: conversationState.stepIndex,
    userSaidCount: userInputs.length
  };

  return (
    <div className="p-6">
      <h1>Conversation History</h1>
      <pre>{JSON.stringify(conversationSummary, null, 2)}</pre>
      <h2>Last Messages</h2>
      <p>Assistant: {lastAssistantMessage}</p>
      <p>You said: {userInputs.slice(-1)?.[0]}</p>
    </div>
  );
}

export default {
  ProfileBuilderExample,
  OpportunityFinderExample,
  AssessmentPageExample,
  ConfusionDetectionExample,
  LanguageSwitchExample,
  EndToEndFlowExample,
  ConversationHistoryExample
};
