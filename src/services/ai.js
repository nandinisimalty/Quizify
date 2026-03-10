const API_KEY = import.meta.env.VITE_LLM_API_KEY;
// Using Google Gemini API endpoint as default
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const generateQuizQuestions = async ({ topic, textContent, numQuestions, difficulty }) => {
  if (!API_KEY) {
    throw new Error("LLM API Key is missing. Please set VITE_LLM_API_KEY in your .env file.");
  }

  const prompt = `
You are an expert educational AI tutor. Generate a multiple-choice quiz based on the following context.
Context type: ${textContent ? 'Provided Document Text' : 'Topic Name'}
Context: ${textContent || topic}
Number of questions: ${numQuestions}
Difficulty: ${difficulty}

Rules:
1. Generate exactly ${numQuestions} distinct questions.
2. Provide 4 answer options for each question.
3. Only one answer should be correct.
4. Output MUST be strictly valid JSON in the following format:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Ensure the response is purely JSON without any markdown formatting blocks like \`\`\`json.
`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to generate quiz from AI");
    }

    const data = await response.json();
    let textResponse = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown serialization if the LLM adds it
    textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to process AI response");
  }
};

export const chatWithTutor = async (history, currentMessage) => {
  if (!API_KEY) throw new Error("API Key missing");

  // Format history for the prompt context
  const historyText = history.map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n');
  
  const prompt = `
You are an expert educational AI tutor. You help a student understand concepts clearly using simple, engaging language.
Provide accurate, encouraging, and concise responses.

Conversation History:
${historyText}

Student: ${currentMessage}
Tutor:`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!response.ok) throw new Error("Failed to get tutor response");

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Tutor Error:", error);
    throw new Error("Failed to process tutor response");
  }
};
