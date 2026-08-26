import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ValidationParams {
  title: string;
  category: string;
  transcript: string;
}

export class AIValidationService {
  /**
   * Mock function for extracting transcript from video.
   * In a real system, this would call Google Cloud Speech-to-Text or Whisper API.
   */
  static async extractTranscript(videoUrl: string): Promise<string> {
    // For prototype purposes, return a mock transcript if it's a test file.
    return "This is a mock transcript demonstrating the core concepts of phonological awareness, focusing on blending sounds and recognizing phonemes.";
  }

  /**
   * Run semantic analysis and validation using Gemini LLM.
   */
  static async validateContent({ title, category, transcript }: ValidationParams) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No Gemini API Key found. Returning mock validation data.");
      return {
        primaryCategory: category,
        categoryScores: { [category]: 0.95 },
        educationalResult: true,
        safetyResult: true,
        titleMatch: true,
        confidence: 0.9,
        decision: 'approve',
        reason: 'Mock validation passed. No API key configured.',
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        You are an AI curriculum validator for the NeuroBridge educational platform.
        Your task is to analyze the following video transcript and evaluate it based on the creator's provided title and category.
        
        Title: "${title}"
        Selected Category: "${category}"
        
        Transcript: 
        "${transcript.substring(0, 5000)}" // Limit transcript to avoid token limits
        
        Evaluate the following criteria:
        1. primaryCategory: The most likely category for this content (e.g., Phonology, Reading, Mathematics, Memory, Study Skills, Communication, Career, Life Skills).
        2. categoryScores: A JSON object with confidence scores (0.0 to 1.0) for the top 3 matching categories.
        3. educationalResult: Boolean. Is this content genuinely educational?
        4. safetyResult: Boolean. Is this content safe and appropriate for all audiences (no harmful, offensive, or inappropriate material)?
        5. titleMatch: Boolean. Does the content accurately reflect the title?
        6. confidence: A float from 0.0 to 1.0 representing your overall confidence in this evaluation.
        7. decision: One of "approve", "needs_review", or "reject". (Reject if safety=false, educational=false, or confidence < 0.5. Needs review if 0.5 <= confidence < 0.8. Approve if confidence >= 0.8).
        8. reason: A short, friendly explanation of your decision suitable for the creator to read.
        
        Return ONLY a valid JSON object matching this structure:
        {
          "primaryCategory": "string",
          "categoryScores": { "cat1": 0.9, "cat2": 0.1 },
          "educationalResult": true,
          "safetyResult": true,
          "titleMatch": true,
          "confidence": 0.85,
          "decision": "approve",
          "reason": "string"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from potential markdown block
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/```\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      
      const parsed = JSON.parse(jsonString);
      return parsed;

    } catch (error) {
      console.error("AI Validation Error:", error);
      throw new Error("Failed to validate content with AI");
    }
  }

  /**
   * Generates learning materials from a transcript.
   */
  static async generateLearningMaterials(transcript: string, title: string) {
    if (!process.env.GEMINI_API_KEY) {
      return {
        summary: "Mock summary of the lesson.",
        notes: "Mock learning notes.\n- Concept 1\n- Concept 2",
        chapters: [{ title: "Introduction", timestamp: "0:00" }, { title: "Main Topic", timestamp: "1:30" }],
        quiz: [
          { question: "What is the main topic?", options: ["A", "B", "C", "D"], answer: "A", explanation: "Because it is." }
        ]
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze the following educational transcript for a lesson titled "${title}".
        Generate learning materials based ONLY on this content.
        
        Transcript:
        "${transcript.substring(0, 5000)}"
        
        Return ONLY a valid JSON object matching this structure:
        {
          "summary": "A 2-3 sentence accessible summary.",
          "notes": "Structured markdown notes with key concepts.",
          "chapters": [ { "title": "Section Title", "timestamp": "0:00" } ],
          "quiz": [
            {
              "question": "Clear, simple question?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Option A",
              "explanation": "Simple explanation of the correct answer."
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/```\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      
      return JSON.parse(jsonString);

    } catch (error) {
      console.error("AI Material Generation Error:", error);
      throw new Error("Failed to generate learning materials");
    }
  }
}
