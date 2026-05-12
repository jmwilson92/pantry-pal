const GROK_API_KEY = 'YOUR_XAI_API_KEY_HERE';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function getGrokMealSuggestions() {
  const prompt = `You are a creative chef. Generate 7 unique, delicious meal ideas with real appetizing names (not generic like 'Meal 1'). For each meal provide:
- Creative name
- Short tasty description (2-3 sentences)
- 4-6 main ingredients as array
- imagePrompt for Unsplash search

Format as JSON array. Be creative and varied even if pantry is empty.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      console.error('Grok API returned no choices:', data);
      return getMockMeals();
    }

    const content = data.choices[0].message.content;
    const meals = JSON.parse(content.replace(/```json|```/g, '').trim());
    
    return meals.map(meal => ({
      ...meal,
      image: `https://picsum.photos/seed/${encodeURIComponent(meal.name || 'food')}/300/200`
    }));
  } catch (error) {
    console.error('Grok API error:', error);
    return getMockMeals();
  }
}

export async function getGrokWeeklyPlan() {
  const prompt = `You are a creative meal planner. Generate a full 7-day meal plan with breakfast, lunch, and dinner for each day. Make them creative and varied. For each meal provide name, short description, key nutrients/vitamins.

Format as JSON array with days Monday to Sunday, each with breakfast, lunch, dinner objects.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      console.error('Grok weekly plan API error:', data);
      return getMockWeeklyPlan();
    }

    return JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error('Grok weekly plan error:', error);
    return getMockWeeklyPlan();
  }
}

export async function getCookingInstructions(mealName, ingredients) {
  const prompt = `You are a helpful chef. Give clear step-by-step cooking instructions for ${mealName} using these ingredients: ${ingredients.join(', ')}. Include prep time and tips. Keep under 300 words.`;

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      return 'Sorry, could not generate instructions right now. Try again later.';
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Cooking instructions error:', error);
    return 'Sorry, could not generate instructions right now. Try again later.';
  }
}

function getMockMeals() {
  return [
    { id: 1, name: 'Creamy Avocado Pasta', description: 'Fresh avocado blended with garlic and lemon for a creamy sauce.', image: 'https://picsum.photos/id/1080/300/200', ingredients: ['avocado', 'pasta', 'garlic', 'lemon'] },
    { id: 2, name: 'Spicy Chickpea Stir Fry', description: 'Crispy chickpeas tossed with colorful veggies and a kick of chili.', image: 'https://picsum.photos/id/106/300/200', ingredients: ['chickpeas', 'bell peppers', 'onion', 'chili'] },
    { id: 3, name: 'Lemon Herb Chicken Bowl', description: 'Juicy grilled chicken with roasted vegetables and quinoa.', image: 'https://picsum.photos/id/292/300/200', ingredients: ['chicken', 'lemon', 'herbs', 'quinoa'] },
    { id: 4, name: 'Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms and parmesan.', image: 'https://picsum.photos/id/312/300/200', ingredients: ['mushrooms', 'arborio rice', 'parmesan', 'garlic'] },
    { id: 5, name: 'Thai Basil Beef', description: 'Spicy stir-fried beef with fragrant basil and bell peppers.', image: 'https://picsum.photos/id/431/300/200', ingredients: ['beef', 'basil', 'chili', 'bell peppers'] },
    { id: 6, name: 'Caprese Stuffed Chicken', description: 'Chicken breast stuffed with mozzarella, tomato, and fresh basil.', image: 'https://picsum.photos/id/1080/300/200', ingredients: ['chicken', 'mozzarella', 'tomato', 'basil'] },
    { id: 7, name: 'Sweet Potato Black Bean Tacos', description: 'Roasted sweet potato and black beans in warm corn tortillas.', image: 'https://picsum.photos/id/106/300/200', ingredients: ['sweet potato', 'black beans', 'corn tortillas', 'avocado'] },
  ];
}

function getMockWeeklyPlan() {
  return [
    { day: 'Monday', breakfast: { name: 'Avocado Toast', description: 'Creamy avocado on toasted sourdough with chili flakes', nutrients: 'Healthy fats, Vitamin E, Fiber' }, lunch: { name: 'Quinoa Veggie Bowl', description: 'Fresh mixed veggies with quinoa and tahini dressing', nutrients: 'Complete protein, Fiber, Iron' }, dinner: { name: 'Grilled Salmon with Asparagus', description: 'Lemon herb salmon fillet with roasted asparagus', nutrients: 'Omega-3, Protein, Vitamin D' } },
    { day: 'Tuesday', breakfast: { name: 'Berry Yogurt Parfait', description: 'Greek yogurt layered with fresh berries and granola', nutrients: 'Probiotics, Antioxidants, Calcium' }, lunch: { name: 'Chickpea Salad Wrap', description: 'Spiced chickpeas in a whole wheat wrap with veggies', nutrients: 'Plant protein, Fiber, Folate' }, dinner: { name: 'Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms and parmesan', nutrients: 'B vitamins, Fiber, Antioxidants' } },
    { day: 'Wednesday', breakfast: { name: 'Scrambled Eggs with Spinach', description: 'Fluffy eggs with fresh spinach and feta cheese', nutrients: 'Protein, Iron, Vitamin A' }, lunch: { name: 'Lentil Soup with Bread', description: 'Hearty lentil soup with crusty whole grain bread', nutrients: 'Plant protein, Fiber, Iron' }, dinner: { name: 'Beef Stir Fry', description: 'Tender beef with broccoli and garlic sauce over rice', nutrients: 'Protein, Vitamin C, Iron' } },
    { day: 'Thursday', breakfast: { name: 'Banana Oat Pancakes', description: 'Fluffy pancakes made with banana and oats', nutrients: 'Potassium, Fiber, B vitamins' }, lunch: { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil with balsamic', nutrients: 'Calcium, Lycopome, Healthy fats' }, dinner: { name: 'Baked Cod with Sweet Potato', description: 'Oven-baked cod with roasted sweet potato wedges', nutrients: 'Lean protein, Beta-carotene, Omega-3' } },
    { day: 'Friday', breakfast: { name: 'Chia Pudding with Mango', description: 'Overnight chia pudding topped with fresh mango', nutrients: 'Omega-3, Fiber, Vitamin C' }, lunch: { name: 'Turkey Avocado Sandwich', description: 'Sliced turkey with avocado on whole grain bread', nutrients: 'Lean protein, Healthy fats, Fiber' }, dinner: { name: 'Vegetable Curry', description: 'Mixed vegetables in fragrant coconut curry sauce', nutrients: 'Fiber, Vitamins, Antioxidants' } },
    { day: 'Saturday', breakfast: { name: 'Smoked Salmon Bagel', description: 'Toasted bagel with cream cheese and smoked salmon', nutrients: 'Omega-3, Protein, Calcium' }, lunch: { name: 'Greek Salad with Chicken', description: 'Grilled chicken over crisp salad with feta and olives', nutrients: 'Protein, Healthy fats, Vitamins' }, dinner: { name: 'Pork Tenderloin with Apples', description: 'Roasted pork with caramelized apples and sage', nutrients: 'Protein, Fiber, Iron' } },
    { day: 'Sunday', breakfast: { name: 'Veggie Omelette', description: 'Fluffy omelette loaded with peppers, onions, and cheese', nutrients: 'Protein, Vitamins, Calcium' }, lunch: { name: 'Falafel Bowl', description: 'Crispy falafel with hummus, veggies, and tahini', nutrients: 'Plant protein, Fiber, Iron' }, dinner: { name: 'Shrimp Tacos', description: 'Grilled shrimp in corn tortillas with slaw and lime', nutrients: 'Lean protein, Vitamin C, Omega-3' } },
  ];
}
