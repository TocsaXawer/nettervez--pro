import { GoogleGenAI } from "@google/genai";
import { NetworkState, DeviceType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeNetwork = async (network: NetworkState): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "Hiba: Az API kulcs nincs beállítva. Kérlek ellenőrizd a környezeti változókat.";
  }

  // Serialize network state to a readable prompt
  const nodeDescriptions = network.nodes.map(n => {
    let details = `${n.config.name} (${n.type})`;
    details += `\n  - IP: ${n.config.ipAddress}/${n.config.subnetMask}`;
    if (n.type === DeviceType.SERVER) {
      details += `\n  - OS: ${n.config.os}`;
      details += `\n  - Szolgáltatások: ${n.config.services?.join(', ') || 'Nincs'}`;
    }
    return details;
  }).join('\n');

  const linkDescriptions = network.links.map(l => {
    const source = network.nodes.find(n => n.id === l.sourceId);
    const target = network.nodes.find(n => n.id === l.targetId);
    return `  - Kapcsolat: ${source?.config.name} <---> ${target?.config.name}`;
  }).join('\n');

  const prompt = `
    Működj hálózati mérnökként és oktatóként. Elemezd az alábbi hálózati topológiát, amelyet egy diák tervezett.
    
    Eszközök:
    ${nodeDescriptions}

    Összeköttetések:
    ${linkDescriptions}

    Feladat:
    1. Értékeld a topológia logikáját (pl. vannak-e izolált eszközök, van-e értelme a kapcsolatoknak).
    2. Ellenőrizd a konfigurációt (pl. IP címek konzisztenciája, szerver szolgáltatások kompatibilitása az OS-el).
    3. Ha találsz hibát vagy hiányosságot, javasolj javítást.
    4. Ha jó a terv, dicsérd meg és emelj ki egy pozitívumot.
    
    A választ magyar nyelven, Markdown formátumban add meg. Legyél tömör és segítőkész.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Nem sikerült választ generálni.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hiba történt az elemzés során. Kérlek próbáld újra később.";
  }
};