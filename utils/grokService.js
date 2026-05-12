const GROK_API_KEY = 'YOUR_XAI_API_KEY_HERE';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function getGrokMealSuggestions() {
  const loadingTexts = [
    'Pantry Pro is generating meals...',
    'Dicing onions...',
    'Shredding cheese...',
    'Preheating oven...',
    'Chopping fresh herbs...',
    'Searing the steak...',
    'Simmering the sauce...',
    'Tossing the salad...',
    'Marinating the chicken...',
    'Roasting the vegetables...'
  ];

  const prompt = `You are a creative chef. Generate 7 unique, delicious meal ideas with real appetizing names. 
For each meal provide:
- name: creative real name
- description: 2-3 sentences
- ingredients: array of strings WITH QUANTITIES (example: "1/2 pound chicken cutlets", "1 teaspoon lemon pepper", "2 tablespoons butter")
- imagePrompt: short search term for food photo

Return ONLY a valid JSON array of 7 objects. No extra text.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    console.log("Grok Meal Suggestions raw response:", data);

    if (!data.choices || !data.choices[0]) {
      console.error("No choices in response");
      return [];
    }

    const content = data.choices[0].message.content;
    const meals = JSON.parse(content.replace(/```json|```/g, '').trim());

    return meals.map(meal => ({
      ...meal,
      image: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/200`
    }));
  } catch (error) {
    console.error('Grok API error:', error);
    return [];
  }
}

export async function getGrokWeeklyPlan() {
  const loadingTexts = [
    'Pantry Pro is creating your weekly plan...',
    'Dicing onions...',
    'Shredding cheese...',
    'Preheating oven...',
    'Chopping fresh herbs...',
    'Searing the steak...',
    'Simmering the sauce...',
    'Tossing the salad...',
    'Marinating the chicken...',
    'Roasting the vegetables...'
  ];

  const prompt = `You are a creative meal planner. Generate a full 7-day meal plan.
Return ONLY a valid JSON ARRAY (not an object) in this exact format:
[
  {"day": "Monday", "breakfast": {"name": "...", "description": "...", "key_nutrients": ["..."]}, "lunch": {...}, "dinner": {...}},
  {"day": "Tuesday", "breakfast": {...}, "lunch": {...}, "dinner": {...}},
  ... for all 7 days
]
Make every meal different and creative.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    console.log("Grok Weekly Plan raw response:", data);

    if (!data.choices || !data.choices[0]) {
      console.error("No choices in weekly plan response");
      return [];
    }

    const content = data.choices[0].message.content;
    let plan = JSON.parse(content.replace(/```json|```/g, '').trim());

    if (!Array.isArray(plan)) {
      console.log("Weekly plan was an object, converting to array...");
      plan = Object.keys(plan).map(day => ({
        day,
        ...plan[day]
      }));
    }

    return plan;
  } catch (error) {
    console.error('Grok weekly plan error:', error);
    return [];
  }
}

export async function getCookingInstructions(mealName, ingredients) {
  const prompt = `Give clear step-by-step cooking instructions for ${mealName} using these ingredients: ${ingredients.join(', ')}. 
Start directly with the steps. No intro paragraph. Use numbered steps. Keep under 300 words.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      return 'Sorry, could not generate instructions right now.';
    }
    return data.choices[0].message.content;
  } catch (error) {
    return 'Sorry, could not generate instructions right now.';
  }
}
