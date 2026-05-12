import { Alert } from 'react-native';

const GROK_API_KEY = 'YOUR_XAI_API_KEY_HERE'; // Get from https://console.x.ai/
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function getGrokResponse(prompt, pantryItems = []) {
  if (GROK_API_KEY === 'YOUR_XAI_API_KEY_HERE') {
    Alert.alert('API Key Missing', 'Please add your xAI API key in utils/grokService.js');
    return 'Add your Grok API key to use AI features!';
  }

  try {
    const pantrySummary = pantryItems.length > 0 
      ? `Current pantry items: ${pantryItems.map(i => i.name).join(', ')}.` 
      : 'No pantry items yet.';

    const fullPrompt = `${prompt}\n\n${pantrySummary}\n\nRespond in a helpful, concise way for a mobile app.`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for a pantry management app called Pantry Pal. Give practical, fun advice.' },
          { role: 'user', content: fullPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, Grok is thinking... try again!';
  } catch (error) {
    console.error('Grok API error:', error);
    return 'Grok is having a moment. Please try again later!';
  }
}