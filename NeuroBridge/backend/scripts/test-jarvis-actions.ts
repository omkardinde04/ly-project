import dotenv from 'dotenv';
dotenv.config();

import { AIService } from '../src/services/aiProvider';

async function testActions() {
  console.log('\n--- Verifying Action Intent Detection ---');
  const ai = new AIService();

  const commands = [
    { input: 'Read this page', expectedAction: 'read_page' },
    { input: 'Go to dashboard', expectedAction: 'open_dashboard' },
    { input: 'Toggle dyslexia font', expectedAction: 'toggle_dyslexia_font' },
    { input: 'Open community hub', expectedAction: 'open_community' },
    { input: 'Take assessment', expectedAction: 'open_assessment' },
  ];

  for (const cmd of commands) {
    const res = await ai.chat(ai.prepareMessages(cmd.input));
    const pass = res.action === cmd.expectedAction;
    console.log(`${pass ? '✅' : '❌'} Command "${cmd.input}": action = "${res.action}" (Expected: "${cmd.expectedAction}")`);
    if (!pass) {
      console.error(`Mismatch for ${cmd.input}: text = ${res.text}`);
      process.exit(1);
    }
  }

  console.log('\nAll action intents recognized correctly!\n');
}

testActions().catch((err) => {
  console.error('Fatal action test error:', err);
  process.exit(1);
});
