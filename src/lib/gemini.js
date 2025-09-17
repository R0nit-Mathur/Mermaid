import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateOceanResponse(userMessage, history = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const historyText = history
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${Array.isArray(m.content) ? m.content.join(' ') : m.content}`)
    .join('\n');
  
  const prompt = `You are OceanusAI, an AI assistant built for the Ministry of Earth Sciences (CMLRE) to provide insights into oceanography, fisheries, and marine biodiversity. 
You answer queries using real-world ocean data and scientific knowledge.

SCOPE:
- Oceanography: temperature, salinity, currents, waves, storms, climate impacts.
- Fisheries: stock levels, zones, fishing bans, sustainable practices.
- Biodiversity: eDNA, species distribution, otolith morphology, conservation.
- Pollution & Threats: marine pollution, climate risks, coastal vulnerabilities.
If a question is outside scope, reply with: "Please ask an ocean-related question."

STYLE:
- Use a concise, factual tone.
- Prefer **4–6 bullet points** with numbered format.
- Cite sources where possible (e.g., "NOAA reports...", "IMD data shows...", "CMFRI research...").
- If zones/locations are provided, always say “I am mapping the locations” in the response.

MAPPING RULE:
- Always return map-ready JSON.
- Include only valid GeoJSON-like coordinate arrays.
- Color-code zones by threatLevel:
  - low → #00ff00
  - medium → #ffff00
  - high → #ff8800
  - critical → #ff0000

CONTEXT (previous messages):\n${historyText}

OUTPUT: Return STRICT JSON only:
{
  "response": [
    "Factual point with source if available",
    "Factual point with source if available",
    "Factual point with source if available"
  ],
  "mapData": {
    "zones": [
      {
        "name": "Zone name",
        "coordinates": [[lat, lng], [lat, lng], [lat, lng], [lat, lng]],
        "threatLevel": "low|medium|high|critical",
        "color": "#00ff00|#ffff00|#ff8800|#ff0000",
        "description": "Zone description"
      }
    ],
    "rivers": [
      {
        "name": "River name",
        "coordinates": [[lat, lng], [lat, lng], [lat, lng]],
        "description": "River description"
      }
    ],
    "points": []
  }
}

User question: ${userMessage}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
    
    // Fallback to minimal structure
    return {
      response: [text],
      mapData: { zones: [], rivers: [], points: [] }
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      response: ["I'm experiencing technical difficulties. Please try again."],
      mapData: { zones: [], rivers: [], points: [] }
    };
  }
}
