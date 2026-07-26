import { GoogleGenAI } from '@google/genai';
import { executeStructuredQuery, auditLogs } from './kspData.js';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && !key.includes('MY_GEMINI_API_KEY') && key.trim() !== '') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

export async function askKSPAssistant(
  query: string,
  history: { role: string; content: string }[],
  userEmail: string,
  userRole: string,
  language: string = 'en'
) {
  // Check if query is a greeting or introductory message
  const isKnLanguage = language === 'kn' || /[\u0C80-\u0CFF]/.test(query);
  const cleanQuery = query.trim().toLowerCase().replace(/[^\w\s\u0C80-\u0CFF]/g, '');
  const words = cleanQuery.split(/\s+/).filter(Boolean);

  const greetingList = [
    'hi', 'hello', 'hey', 'namaste', 'hlo', 'helo', 'hiii', 'good morning', 
    'good afternoon', 'good evening', 'greetings', 'ಹಲೋ', 'ಹಾಯ್', 'ನಮಸ್ಕಾರ', 'ನಮಸ್ತೆ'
  ];
  const introList = ['who are you', 'what can you do', 'help', 'help me', 'ನೀವು ಯಾರು', 'ಸಹಾಯ'];

  const isGreeting = (words.length <= 3 && greetingList.some(g => cleanQuery.includes(g))) || introList.some(i => cleanQuery.includes(i));
  const containsSearchKeywords = ['fir', 'case', 'theft', 'fraud', 'murder', 'crime', 'accused', 'victim', 'bank', 'account', 'evidence', 'whitefield', 'indiranagar', 'geeta', 'rajesh', 'ಪ್ರಕರಣ', 'ಆರೋಪಿ', 'ಕಳ್ಳತನ', 'ಸಾಕ್ಷಿ', 'ಕೊಲೆ', 'ಮೋಸ'].some(k => cleanQuery.includes(k));

  if (isGreeting && !containsSearchKeywords) {
    const greetingResponse = isKnLanguage
      ? `ಹಲೋ! ನಾನು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ (KSP) ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕರಾಗಿದ್ದೇನೆ.\n\nತನಿಖೆಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಮಾಹಿತಿ ಬೇಕಿದ್ದಲ್ಲಿ ದಯವಿಟ್ಟು ಕೇಳಿ:\n• **ಎಫ್‌ಐಆರ್ ಅಥವಾ ಅಪರಾಧ ಪ್ರಕರಣಗಳು** (ಉದಾ: *ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳು*)\n• **ಆರೋಪಿಗಳ ಜಾಲ ಅಥವಾ ವಿವರಗಳು** (ಉದಾ: *ಗೀತಾ ರೆಡ್ಡಿ ಅವರ ಸಹಚರರು*)\n• **ಸಾಕ್ಷ್ಯಾಧಾರ ಮತ್ತು ಹಣಕಾಸಿನ ಸಂಬಂಧಗಳು**\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ, ನಾನು ಕೆಎಸ್‍ಪಿ ಡೇಟಾಬೇಸ್‌ನಿಂದ ಮಾಹಿತಿ ನೀಡುತ್ತೇನೆ.`
      : `Hello! I am the Karnataka State Police (KSP) Crime Intelligence Assistant.\n\nHow can I assist your investigation today? You can ask me about:\n• **FIR & Crime Records** (e.g., *Show theft cases in Whitefield*)\n• **Accused Networks & Associates** (e.g., *Who are the associates of Geeta Reddy?*)\n• **Evidence & Financial Transactions**\n\nPlease enter your case query to search the intelligence database.`;

    const newAuditId = auditLogs.length + 1;
    auditLogs.unshift({
      id: newAuditId,
      user_email: userEmail,
      user_role: userRole,
      query_text: query,
      sql_ran: 'N/A (Conversational Greeting)',
      cypher_ran: 'N/A (Conversational Greeting)',
      timestamp: new Date().toISOString()
    });

    return {
      answer: greetingResponse,
      sources: [],
      sql_ran: 'SELECT * FROM ksp_cases WHERE 1=0; -- Greeting',
      cypher_ran: 'MATCH (n) WHERE false RETURN n; -- Greeting',
      graph_data: { nodes: [], edges: [] },
      translation_tier: 'Conversational-Greeting'
    };
  }

  // 1. Retrieve grounded facts from the synthetic database
  const queryResult = executeStructuredQuery(query);

  // 2. Add entry to Audit Log
  const newAuditId = auditLogs.length + 1;
  auditLogs.unshift({
    id: newAuditId,
    user_email: userEmail,
    user_role: userRole,
    query_text: query,
    sql_ran: queryResult.sqlRan,
    cypher_ran: queryResult.cypherRan,
    timestamp: new Date().toISOString()
  });

  // 3. Synthesize grounded answer
  let answerText = '';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const isKannada = language === 'kn' || /[\u0C80-\u0CFF]/.test(query);
      const systemPrompt = `You are an expert Crime Intelligence Analyst for the Karnataka State Police (KSP).
Your task is to synthesize a factual answer to the investigator's query based ONLY on the provided database search results.

CRITICAL LANGUAGE INSTRUCTION:
${isKannada 
  ? "YOU MUST RESPOND ENTIRELY IN KANNADA SCRIPT (ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ). All explanations, FIR summaries, and analytical notes MUST be written in natural, fluent Kannada language using Kannada script (ಕನ್ನಡ ಅಕ್ಷರಗಳು)." 
  : "Respond in English."}

CRITICAL GROUNDING RULES:
1. Do not fabricate facts. Every claim MUST be supported by the database results.
2. Use inline citations in your response:
   - [FIR: <fir_number>] for FIRs
   - [Accused: <name>] for accused individuals
   - [Location: <area_or_name>] for locations
3. Keep the tone professional, objective, and analytical for police intelligence.
`;

      const factsContext = JSON.stringify({
        matching_firs: queryResult.matchedFirs.map(f => ({
          fir_number: f.fir_number,
          date: f.date.substring(0, 10),
          crime_type: f.crime_type,
          description: f.description
        })),
        matching_accused: queryResult.matchedAccused.map(a => ({
          name: a.name,
          age: a.age,
          address: a.address,
          associates: a.associates
        })),
        locations: queryResult.matchedLocations.map(l => l.area)
      }, null, 2);

      const userPromptText = `${systemPrompt}\n\nREQUIRED RESPONSE LANGUAGE: ${isKannada ? 'KANNADA (ಕನ್ನಡ - ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ)' : 'ENGLISH'}\n\nDATABASE FACTS:\n${factsContext}\n\nUSER QUERY:\n${query}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: userPromptText }] }
        ]
      });

      answerText = response.text || '';
    } catch (err) {
      console.warn('[KSP Gemini] Synthesis error, falling back to rule-based engine:', err);
    }
  }

  // Fallback rule-based synthesis if Gemini is absent or failed
  if (!answerText) {
    const isKannada = language === 'kn' || /[\u0C80-\u0CFF]/.test(query);

    if (isKannada) {
      if (queryResult.matchedFirs.length === 0) {
        answerText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಸೂಕ್ತವಾದ ಯಾವುದೇ ಎಫ್‌ಐಆರ್ ಅಥವಾ ಆರೋಪಿಗಳ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.`;
      } else {
        const firSummary = queryResult.matchedFirs.slice(0, 4).map(f =>
          `• **${f.fir_number}** (${f.crime_type}) ದಾಖಲಾದ ದಿನಾಂಕ ${f.date.substring(0, 10)}: ${f.description} [FIR: ${f.fir_number}]`
        ).join('\n');

        const accusedSummary = queryResult.matchedAccused.length > 0
          ? `\n\n**ಗುರುತಿಸಲಾದ ಆರೋಪಿಗಳು / ಸಹಚರರು:**\n` + queryResult.matchedAccused.slice(0, 4).map(a =>
            `• **${a.name}** (ವಯಸ್ಸು ${a.age}, ${a.address}) [Accused: ${a.name}]`
          ).join('\n')
          : '';

        const locSummary = queryResult.matchedLocations.length > 0
          ? `\n\n**ವ್ಯಾಪ್ತಿ / ಸ್ಥಳಗಳು:** ${queryResult.matchedLocations.map(l => `[Location: ${l.area}]`).join(', ')}`
          : '';

        answerText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಡೇಟಾಬೇಸ್ ಮಾಹಿತಿಯ ಪ್ರಕಾರ:\n\n**ಹೊಂದುವ ಪ್ರಕರಣಗಳು:**\n${firSummary}${accusedSummary}${locSummary}\n\n*ಗಮನಿಸಿ: ವಿಶ್ಲೇಷಣೆ ವಿಭಾಗದಲ್ಲಿ ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು ಮತ್ತು ಸಂಬಂಧಿತ ನೆಟ್‌ವರ್ಕ್ ನೀಡಲಾಗಿದೆ.*`;
      }
    } else {
      if (queryResult.matchedFirs.length === 0) {
        answerText = `No registered FIR records or accused individuals were found matching your query criteria in the Karnataka State Police database.`;
      } else {
        const firSummary = queryResult.matchedFirs.slice(0, 4).map(f =>
          `• **${f.fir_number}** (${f.crime_type}) recorded on ${f.date.substring(0, 10)}: ${f.description} [FIR: ${f.fir_number}]`
        ).join('\n');

        const accusedSummary = queryResult.matchedAccused.length > 0
          ? `\n\n**Identified Accused / Associates:**\n` + queryResult.matchedAccused.slice(0, 4).map(a =>
            `• **${a.name}** (Age ${a.age}, ${a.address}) [Accused: ${a.name}]`
          ).join('\n')
          : '';

        const locSummary = queryResult.matchedLocations.length > 0
          ? `\n\n**Jurisdictions / Locations:** ${queryResult.matchedLocations.map(l => `[Location: ${l.area}]`).join(', ')}`
          : '';

        answerText = `Based on the Karnataka State Police database query results:\n\n**Matching Case Files:**\n${firSummary}${accusedSummary}${locSummary}\n\n*Note: All retrieved case files and relationship nodes have been rendered in the link analysis panel.*`;
      }
    }
  }

  return {
    answer: answerText,
    sources: queryResult.sources,
    sql_ran: queryResult.sqlRan,
    cypher_ran: queryResult.cypherRan,
    graph_data: queryResult.graphData,
    translation_tier: 'Grounding-Synthesized'
  };
}
