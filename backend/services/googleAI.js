import axios from 'axios';

const modelName = 'gemini-2.0-flash';

export async function generateSummary(prompt) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GOOGLE_API_KEY environment variable');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const resp = await axios.post(url, requestBody, {
    headers: { 'Content-Type': 'application/json' }
  });

  const summary = resp.data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!summary) throw new Error('No summary returned from Google Generative AI');

  return summary;
}
