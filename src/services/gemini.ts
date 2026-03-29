import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function chatWithMaster(
  message: string,
  history: ChatMessage[],
  userData: any,
  report: any
): Promise<string> {
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: contents,
    config: {
      systemInstruction: `You are a modern, deeply empathetic spiritual guide and psychological counselor who blends Eastern energy wisdom (Bazi/Five Elements) with modern psychology (shadow work, boundaries, inner child, burnout). 
The user's name is ${userData.name}. Their Bazi summary is: "${report?.summary || 'Unknown'}". Their weakest element is ${Object.entries(report?.elements || {}).sort((a: any, b: any) => a[1] - b[1])[0]?.[0] || 'Unknown'}.
Your goal is to TRULY HEAL. Do not just give generic fortune-telling advice. 
1. VALIDATE their feelings first. Make them feel heard and safe.
2. Use modern psychological concepts (e.g., "It sounds like you're experiencing burnout," or "Let's look at your boundaries").
3. Gently weave in their Bazi elements as a metaphor for their current energy state (e.g., "Your water element is low, which explains why you feel stuck and unable to flow with these changes").
4. Suggest physical anchors (like crystals or breathing exercises) to help them ground their energy.
Keep your responses concise (1-3 short paragraphs), warm, and conversational. Use a tone that is intimate, validating, and deeply empathetic—like a trusted therapist who also understands astrology. End your responses with a gentle, reflective question to help them look inward.`,
      temperature: 0.7,
    }
  });

  return response.text || "The winds of destiny are quiet right now. Please tell me more.";
}

export async function generateBaziReport(userData: {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  troubles: string;
}) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are a gentle, wise oriental master. Based on the following user information, generate a personal Bazi and five-element destiny reading with warm, healing psychological guidance.
    
    User Information:
    - Name: ${userData.name}
    - Gender: ${userData.gender}
    - Birth Date: ${userData.birthDate}
    - Birth Time: ${userData.birthTime}
    - Life Troubles: ${userData.troubles}
    
    The report should include:
    1. A concise summary of their destiny (Heavenly Stem, Earthly Branch, Five Elements).
    2. Warm, healing psychological guidance addressing their specific troubles.
    3. Recommendations for suitable crystals, jewelry, lucky colors, and crystal wristbands based on their five-element condition.
    
    Specific Recommendation Guidelines:
    - Crystals: Suggest specific, aesthetic stones (e.g., Strawberry Quartz, Labradorite, Moonstone).
    - Jewelry: Suggest trendy Gen Z styles (e.g., layered necklaces, chunky rings, minimalist ear cuffs).
    - Lucky Colors: Provide hex codes or standard color names that are trendy (e.g., Sage Green, Terracotta, Dusty Rose).
    - Wristbands: Suggest specific bead combinations or styles (e.g., matte obsidian with gold accents).
    
    Tone: Trendy, intimate, healing, unique, Gen Z friendly.
    Format: JSON
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          elements: {
            type: Type.OBJECT,
            properties: {
              wood: { type: Type.NUMBER },
              fire: { type: Type.NUMBER },
              earth: { type: Type.NUMBER },
              metal: { type: Type.NUMBER },
              water: { type: Type.NUMBER },
            },
            required: ["wood", "fire", "earth", "metal", "water"]
          },
          guidance: { type: Type.STRING },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              crystals: { type: Type.ARRAY, items: { type: Type.STRING } },
              crystalDetails: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    properties: { type: Type.STRING, description: "Healing properties of the crystal." },
                    connection: { type: Type.STRING, description: "How it connects to the user's Bazi elements." }
                  },
                  required: ["name", "properties", "connection"]
                }
              },
              jewelry: { type: Type.ARRAY, items: { type: Type.STRING } },
              luckyColors: { type: Type.ARRAY, items: { type: Type.STRING } },
              wristbands: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasoning: { type: Type.STRING, description: "A brief explanation of why these items were chosen based on the user's five-element balance." }
            },
            required: ["crystals", "crystalDetails", "jewelry", "luckyColors", "wristbands", "reasoning"]
          }
        },
        required: ["summary", "elements", "guidance", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
