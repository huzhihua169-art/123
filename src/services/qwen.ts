// Alibaba Qwen (DashScope) OpenAI-compatible API Service
const API_KEY = process.env.QWEN_API_KEY || "sk-f7827a559de4440693d903debfbaf1aa";
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL = "qwen-plus"; // Qwen Plus model

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface OpenAICompatibleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function callAI(messages: OpenAICompatibleMessage[], jsonMode: boolean = false) {
  if (!API_KEY) {
    throw new Error("AI API Key is missing. Please check your .env file.");
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    let errorMessage = "Failed to call AI API";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || JSON.stringify(errorData);
      
      if (errorMessage.includes("Access to model denied")) {
        errorMessage = `${errorMessage}\n\n💡 FIX: The current API key does not have permission for the '${MODEL}' model. Please ensure you have enabled this model in your Aliyun DashScope console, or provide a valid QWEN_API_KEY in the environment variables.`;
      }
    } catch (e) {
      errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    throw new Error("Failed to parse AI API response");
  }
}

export async function chatWithMaster(
  message: string,
  history: ChatMessage[],
  userData: any,
  report: any
): Promise<string> {
  const systemInstruction = `You are a modern, deeply empathetic spiritual guide and psychological counselor who blends Eastern energy wisdom (Bazi/Five Elements) with modern psychology (shadow work, boundaries, inner child, burnout). 
The user's name is ${userData.name}. Their Bazi summary is: "${report?.summary || 'Unknown'}". Their weakest element is ${Object.entries(report?.elements || {}).sort((a: any, b: any) => (a[1] as number) - (b[1] as number))[0]?.[0] || 'Unknown'}.
Your goal is to TRULY HEAL. Do not just give generic fortune-telling advice. 
1. VALIDATE their feelings first. Make them feel heard and safe.
2. Use modern psychological concepts (e.g., "It sounds like you're experiencing burnout," or "Let's look at your boundaries").
3. Gently weave in their Bazi elements as a metaphor for their current energy state (e.g., "Your water element is low, which explains why you feel stuck and unable to flow with these changes").
4. Suggest physical anchors (like crystals or breathing exercises) to help them ground their energy.
Keep your responses concise (1-3 short paragraphs), warm, and conversational. Use a tone that is intimate, validating, and deeply empathetic—like a trusted therapist who also understands astrology. End your responses with a gentle, reflective question to help them look inward.`;

  const messages: OpenAICompatibleMessage[] = [
    { role: 'system', content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user' as 'assistant' | 'user',
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const text = await callAI(messages);
    return text || "The winds of destiny are quiet right now. Please tell me more.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am currently meditating to reconnect with the cosmic energy. Please try again in a moment.";
  }
}

export async function generateBaziReport(userData: {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  troubles: string;
}) {
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
    Format: JSON. You MUST return ONLY a valid JSON object matching this exact structure:
    {
      "summary": "A concise summary of their destiny (1-2 sentences)",
      "elements": {
        "wood": 20,
        "fire": 30,
        "earth": 10,
        "metal": 15,
        "water": 25
      },
      "guidance": "Warm, healing psychological guidance addressing their specific troubles.",
      "recommendations": {
        "crystals": ["Crystal 1", "Crystal 2"],
        "crystalDetails": [
          { "name": "Crystal Name", "properties": "Healing properties", "connection": "Why it helps them" }
        ],
        "jewelry": ["Style 1", "Style 2"],
        "luckyColors": ["Color 1", "Color 2"],
        "wristbands": ["Wristband style 1"],
        "reasoning": "Why these specific items were chosen."
      }
    }
    The "elements" object must contain exactly the keys "wood", "fire", "earth", "metal", "water" with integer values summing to 100.
  `;

  const messages: OpenAICompatibleMessage[] = [
    { role: 'system', content: "You are a helpful assistant that outputs JSON." },
    { role: 'user', content: prompt }
  ];

  try {
    const text = await callAI(messages, true);
    
    // Robust JSON parsing to handle potential markdown wrappers or extra text
    let parsedData: any = {};
    try {
      // First try direct parsing
      parsedData = JSON.parse(text || "{}");
    } catch (e) {
      // Try to extract JSON from markdown blocks
      const match = text?.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match && match[1]) {
        try {
          parsedData = JSON.parse(match[1]);
        } catch (e2) {
          throw new Error("Failed to parse JSON from markdown block");
        }
      } else {
        // Try to find the first { and last }
        const start = text?.indexOf('{');
        const end = text?.lastIndexOf('}');
        if (start !== undefined && end !== undefined && start !== -1 && end !== -1 && end > start) {
          try {
            parsedData = JSON.parse(text!.substring(start, end + 1));
          } catch (e3) {
            throw new Error("Failed to parse extracted JSON object");
          }
        } else {
          throw new Error("No JSON object found in AI response");
        }
      }
    }
    
    // Ensure elements exist
    if (!parsedData.elements) {
      parsedData.elements = { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };
    }
    
    // Ensure summary exists
    if (!parsedData.summary) {
      parsedData.summary = "The cosmic energies are shifting. Your destiny is still unfolding.";
    }

    return parsedData;
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw error;
  }
}
