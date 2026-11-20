import dotenv from 'dotenv';
dotenv.config();

import { AIService } from '../src/services/aiProvider';

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('  NEUROBRIDGE JARVIS INTELLIGENCE & DYNAMIC RESPONSE TEST SUITE');
  console.log('===============================================================\n');

  const aiService = new AIService();
  const results: Array<{
    id: number;
    prompt: string;
    passed: boolean;
    provider: string;
    model: string;
    latencyMs: number;
    responsePreview: string;
    notes?: string;
  }> = [];

  const oldCannedPhrases = [
    'interconnected concepts that can be understood systematically',
    'it involves key principles that can be explored step-by-step',
    'regarding',
  ];

  function containsOldCanned(text: string): boolean {
    const lower = text.toLowerCase();
    return oldCannedPhrases.some((phrase) => lower.includes(phrase));
  }

  // ── Test 1: What is artificial intelligence? ──
  console.log('\n[Test 1] Testing: "What is artificial intelligence?"');
  const t1 = await aiService.chat(aiService.prepareMessages('What is artificial intelligence?'));
  const t1Pass = t1.text.length > 50 && !containsOldCanned(t1.text);
  results.push({
    id: 1,
    prompt: 'What is artificial intelligence?',
    passed: t1Pass,
    provider: t1.provider,
    model: t1.model,
    latencyMs: t1.latencyMs,
    responsePreview: t1.text.slice(0, 160) + '...',
  });

  // ── Test 2: Why is the sky blue? ──
  console.log('\n[Test 2] Testing: "Why is the sky blue?"');
  const t2 = await aiService.chat(aiService.prepareMessages('Why is the sky blue?'));
  const t2Pass = t2.text.length > 50 && !containsOldCanned(t2.text);
  results.push({
    id: 2,
    prompt: 'Why is the sky blue?',
    passed: t2Pass,
    provider: t2.provider,
    model: t2.model,
    latencyMs: t2.latencyMs,
    responsePreview: t2.text.slice(0, 160) + '...',
  });

  // ── Test 3: Explain black holes in simple words ──
  console.log('\n[Test 3] Testing: "Explain black holes in simple words."');
  const t3 = await aiService.chat(aiService.prepareMessages('Explain black holes in simple words.'));
  const t3Pass = t3.text.length > 50 && !containsOldCanned(t3.text);
  results.push({
    id: 3,
    prompt: 'Explain black holes in simple words.',
    passed: t3Pass,
    provider: t3.provider,
    model: t3.model,
    latencyMs: t3.latencyMs,
    responsePreview: t3.text.slice(0, 160) + '...',
  });

  // ── Test 4: Write a short motivational message for someone starting a business ──
  console.log('\n[Test 4] Testing: "Write a short motivational message for someone starting a business."');
  const t4 = await aiService.chat(aiService.prepareMessages('Write a short motivational message for someone starting a business.'));
  const t4Pass = t4.text.length > 50 && !containsOldCanned(t4.text);
  results.push({
    id: 4,
    prompt: 'Write a short motivational message for someone starting a business.',
    passed: t4Pass,
    provider: t4.provider,
    model: t4.model,
    latencyMs: t4.latencyMs,
    responsePreview: t4.text.slice(0, 160) + '...',
  });

  // ── Test 5: Give me three creative app ideas ──
  console.log('\n[Test 5] Testing: "Give me three creative app ideas."');
  const t5 = await aiService.chat(aiService.prepareMessages('Give me three creative app ideas.'));
  const t5Pass = t5.text.length > 50 && !containsOldCanned(t5.text);
  results.push({
    id: 5,
    prompt: 'Give me three creative app ideas.',
    passed: t5Pass,
    provider: t5.provider,
    model: t5.model,
    latencyMs: t5.latencyMs,
    responsePreview: t5.text.slice(0, 160) + '...',
  });

  // ── Test 6: Calculate 147 multiplied by 39 and explain the result ──
  console.log('\n[Test 6] Testing: "Calculate 147 multiplied by 39 and explain the result."');
  const t6 = await aiService.chat(aiService.prepareMessages('Calculate 147 multiplied by 39 and explain the result.'));
  // 147 * 39 = 5733
  const t6Pass = t6.text.includes('5733') || t6.text.includes('5,733');
  results.push({
    id: 6,
    prompt: 'Calculate 147 multiplied by 39 and explain the result.',
    passed: t6Pass,
    provider: t6.provider,
    model: t6.model,
    latencyMs: t6.latencyMs,
    responsePreview: t6.text.slice(0, 160) + '...',
    notes: t6Pass ? 'Correct mathematical computation (5,733)' : 'Math verification flag',
  });

  // ── Multi-Turn Flow: Tests 7, 8, 9 ──
  // Turn 1: Explain machine learning
  console.log('\n[Test 7] Testing Multi-Turn Start: "Explain machine learning."');
  const t7 = await aiService.chat(aiService.prepareMessages('Explain machine learning.'));
  const t7Pass = t7.text.length > 50 && !containsOldCanned(t7.text);
  results.push({
    id: 7,
    prompt: 'Explain machine learning.',
    passed: t7Pass,
    provider: t7.provider,
    model: t7.model,
    latencyMs: t7.latencyMs,
    responsePreview: t7.text.slice(0, 160) + '...',
  });

  // Turn 2: Give me a real-world example
  console.log('\n[Test 8] Testing Contextual Follow-Up: "Give me a real-world example."');
  const historyFor8 = [
    { role: 'user', content: 'Explain machine learning.' },
    { role: 'assistant', content: t7.text },
  ];
  const t8 = await aiService.chat(aiService.prepareMessages('Give me a real-world example.', historyFor8));
  const t8Pass = t8.text.length > 40 && !containsOldCanned(t8.text);
  results.push({
    id: 8,
    prompt: 'Give me a real-world example. (Context from #7)',
    passed: t8Pass,
    provider: t8.provider,
    model: t8.model,
    latencyMs: t8.latencyMs,
    responsePreview: t8.text.slice(0, 160) + '...',
    notes: 'Preserved conversational context',
  });

  // Turn 3: Explain that example in more detail
  console.log('\n[Test 9] Testing Deepening Follow-Up: "Explain that example in more detail."');
  const historyFor9 = [
    ...historyFor8,
    { role: 'user', content: 'Give me a real-world example.' },
    { role: 'assistant', content: t8.text },
  ];
  const t9 = await aiService.chat(aiService.prepareMessages('Explain that example in more detail.', historyFor9));
  const t9Pass = t9.text.length > 50 && !containsOldCanned(t9.text);
  results.push({
    id: 9,
    prompt: 'Explain that example in more detail. (Context from #8)',
    passed: t9Pass,
    provider: t9.provider,
    model: t9.model,
    latencyMs: t9.latencyMs,
    responsePreview: t9.text.slice(0, 160) + '...',
    notes: 'Preserved multi-turn depth',
  });

  // ── Test 10: What are the biggest challenges of renewable energy? ──
  console.log('\n[Test 10] Testing: "What are the biggest challenges of renewable energy?"');
  const t10 = await aiService.chat(aiService.prepareMessages('What are the biggest challenges of renewable energy?'));
  const t10Pass = t10.text.length > 50 && !containsOldCanned(t10.text);
  results.push({
    id: 10,
    prompt: 'What are the biggest challenges of renewable energy?',
    passed: t10Pass,
    provider: t10.provider,
    model: t10.model,
    latencyMs: t10.latencyMs,
    responsePreview: t10.text.slice(0, 160) + '...',
  });

  // ── Test Streaming SSE Route ──
  console.log('\n[Test 11] Testing Streaming: "Give 2 quick study tips."');
  let streamedChunks = 0;
  let accumulatedStream = '';
  const t11 = await aiService.chatStream(
    aiService.prepareMessages('Give 2 quick study tips.'),
    {
      onChunk: (chunk) => {
        streamedChunks++;
        accumulatedStream += chunk;
      },
    }
  );
  const t11Pass = streamedChunks > 1 && accumulatedStream.length > 30;
  results.push({
    id: 11,
    prompt: 'Streaming test: "Give 2 quick study tips."',
    passed: t11Pass,
    provider: t11.provider,
    model: t11.model,
    latencyMs: t11.latencyMs,
    responsePreview: accumulatedStream.slice(0, 160) + '...',
    notes: `Streamed in ${streamedChunks} chunks`,
  });

  // ── Print Summary Table ──
  console.log('\n===============================================================');
  console.log('                      TEST SUITE SUMMARY');
  console.log('===============================================================\n');

  console.table(
    results.map((r) => ({
      ID: r.id,
      Prompt: r.prompt.slice(0, 36),
      Passed: r.passed ? '✅ PASS' : '❌ FAIL',
      Provider: `${r.provider} (${r.model})`,
      Latency: `${r.latencyMs}ms`,
      Preview: r.responsePreview.slice(0, 50),
    }))
  );

  const allPassed = results.every((r) => r.passed);
  console.log(`\nOverall Status: ${allPassed ? '✅ ALL 11 TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
