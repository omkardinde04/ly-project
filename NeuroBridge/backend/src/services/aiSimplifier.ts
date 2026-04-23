/**
 * AI Simplifier Service
 * Takes raw job/hackathon data and converts it into a dyslexia-friendly
 * structured format using the system prompt logic.
 * When an OpenAI/Gemini key is available it calls the real LLM.
 * Without a key it applies deterministic rule-based simplification.
 */

interface RawOpportunity {
  title: string;
  company?: string;
  organization?: string;
  location?: string;
  deadline?: string;
  prize?: string;
  description: string;
  eligibility: string;
  type?: string;
}

export interface SimplifiedOpportunity {
  title: string;
  company: string;
  location: string;
  whatYouWillDo: string[];   // max 3 bullets
  whoCanApply: string[];     // simplified eligibility as yes/no bullets
  whyItsGood: string;        // 1–2 lines
  deadline: string;
  badge: string;             // emoji badge
}

// ─── Deterministic rule-based simplifier (no API key needed) ─────────────────

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

function simplifyEligibility(text: string): string[] {
  const bullets: string[] = [];
  const lower = text.toLowerCase();

  // Years of experience
  const expMatch = lower.match(/(\d+)\+?\s*year[s]?\s*(of)?\s*(experience|exp)/);
  if (expMatch) bullets.push(`✅ You need ${expMatch[1]}+ years of experience`);

  // Degree requirement
  if (lower.includes("bachelor") || lower.includes("degree"))
    bullets.push("✅ A college degree is needed");

  // Student eligibility
  if (lower.includes("student") || lower.includes("undergraduate") || lower.includes("postgraduate"))
    bullets.push("✅ Open to students");

  // Team size
  const teamMatch = lower.match(/team[s]? of (\d+)\s*(to|-)\s*(\d+)/);
  if (teamMatch) bullets.push(`✅ Teams of ${teamMatch[1]}–${teamMatch[3]} people`);

  // Tool requirements
  if (lower.includes("figma")) bullets.push("🛠 Must know Figma");
  if (lower.includes("react")) bullets.push("🛠 Must know React");
  if (lower.includes("tensorflow") || lower.includes("pytorch")) bullets.push("🛠 Must know ML frameworks");

  if (bullets.length === 0) {
    // Generic fallback – take first 2 sentences
    splitSentences(text).slice(0, 2).forEach(s => bullets.push(`• ${s}`));
  }

  return bullets;
}

function summarizeDescription(text: string): string[] {
  const sentences = splitSentences(text);
  // Return first 3 meaningful sentences
  return sentences.slice(0, 3).map(s => `• ${s}`);
}

function getWhyGood(title: string, type?: string): string {
  if (type?.toLowerCase().includes("hackathon"))
    return `Great chance to build something cool and win prizes 🏆. You will meet other smart people too!`;
  if (type?.toLowerCase().includes("internship"))
    return `This will give you real work experience 💼. A great first step in your career!`;
  return `This is a great opportunity to grow your skills and get noticed by top companies 🌟.`;
}

function ruleBasedSimplify(raw: RawOpportunity): SimplifiedOpportunity {
  return {
    title: raw.title,
    company: raw.company || raw.organization || "Unknown",
    location: raw.location || "Remote / Online",
    whatYouWillDo: summarizeDescription(raw.description),
    whoCanApply: simplifyEligibility(raw.eligibility),
    whyItsGood: getWhyGood(raw.title, raw.type),
    deadline: raw.deadline || "Check the listing",
    badge: raw.prize ? "🏆" : raw.type?.toLowerCase().includes("internship") ? "💼" : "🚀",
  };
}

// ─── Optional: Real LLM call (used only when OPENAI_API_KEY is set) ───────────

async function llmSimplify(raw: RawOpportunity): Promise<SimplifiedOpportunity | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const axios = (await import("axios")).default;
    const prompt = `
You are an AI assistant for dyslexic users. Simplify this opportunity.

Title: ${raw.title}
Company/Org: ${raw.company || raw.organization || ""}
Location: ${raw.location || ""}
Type: ${raw.type || ""}
Deadline: ${raw.deadline || "Not specified"}
Prize: ${raw.prize || "Not applicable"}
Description: ${raw.description}
Eligibility: ${raw.eligibility}

Return ONLY valid JSON matching this structure:
{
  "title": "...",
  "company": "...",
  "location": "...",
  "whatYouWillDo": ["bullet 1", "bullet 2", "bullet 3"],
  "whoCanApply": ["✅ point 1", "✅ point 2"],
  "whyItsGood": "1-2 short sentences",
  "deadline": "...",
  "badge": "emoji"
}

Rules:
- Use grade 5–7 English
- Max 3 bullets for whatYouWillDo
- Short sentences only
- No jargon`;

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const content = res.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (e: any) {
    console.error("LLM simplify failed:", e.message);
    return null;
  }
}

// ─── Public export ────────────────────────────────────────────────────────────

export async function simplifyOpportunity(raw: RawOpportunity): Promise<SimplifiedOpportunity> {
  const llmResult = await llmSimplify(raw);
  if (llmResult) return llmResult;
  return ruleBasedSimplify(raw);
}
