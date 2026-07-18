// App State and DOM Elements
const DOM = {
  form: document.getElementById('plannerForm'),
  routineInput: document.getElementById('routineInput'),
  dietOptions: document.getElementsByName('dietPreference'),
  currencySelect: document.getElementById('currencySelect'),
  budgetInput: document.getElementById('budgetInput'),
  generateBtn: document.getElementById('generateBtn'),
  
  // Settings Panel
  settingsBtn: document.getElementById('settingsBtn'),
  apiConfigPanel: document.getElementById('apiConfigPanel'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  apiStatus: document.getElementById('apiStatus'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  
  // Views
  placeholder: document.getElementById('outputPlaceholder'),
  loader: document.getElementById('outputLoader'),
  results: document.getElementById('outputResults'),
  loadingQuote: document.getElementById('loadingQuote'),
  
  // Tab Elements
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Meal Outputs
  mealRoutineSummary: document.getElementById('mealRoutineSummary'),
  breakfastTitle: document.getElementById('breakfastTitle'),
  breakfastTime: document.getElementById('breakfastTime'),
  breakfastCalories: document.getElementById('breakfastCalories'),
  breakfastIngredients: document.getElementById('breakfastIngredients'),
  breakfastSteps: document.getElementById('breakfastSteps'),
  
  lunchTitle: document.getElementById('lunchTitle'),
  lunchTime: document.getElementById('lunchTime'),
  lunchCalories: document.getElementById('lunchCalories'),
  lunchIngredients: document.getElementById('lunchIngredients'),
  lunchSteps: document.getElementById('lunchSteps'),
  
  dinnerTitle: document.getElementById('dinnerTitle'),
  dinnerTime: document.getElementById('dinnerTime'),
  dinnerCalories: document.getElementById('dinnerCalories'),
  dinnerIngredients: document.getElementById('dinnerIngredients'),
  dinnerSteps: document.getElementById('dinnerSteps'),
  
  // Groceries & Swaps & Budget Outputs
  groceriesList: document.getElementById('groceriesList'),
  swapsGrid: document.getElementById('swapsGrid'),
  
  // Budget
  budgetGaugeMeter: document.getElementById('budgetGaugeMeter'),
  budgetValue: document.getElementById('budgetValue'),
  summaryTargetBudget: document.getElementById('summaryTargetBudget'),
  summaryEstCost: document.getElementById('summaryEstCost'),
  budgetStatusAlert: document.getElementById('budgetStatusAlert'),
  budgetTipsList: document.getElementById('budgetTipsList')
};

// Suggestion Tags click listener
document.querySelectorAll('.suggestion-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    DOM.routineInput.value = getRoutineSuggestion(tag.textContent);
  });
});

function getRoutineSuggestion(tagText) {
  switch (tagText) {
    case 'Busy workday':
      return "I have a packed office day. Leaving at 8 AM, back at 8 PM. Need quick meals with minimal cleanup, but healthy enough to keep my energy up.";
    case 'Post-workout':
      return "Doing heavy weightlifting in the morning. Need a solid protein-heavy breakfast and a quick high-protein lunch. Dinner can be light.";
    case 'Lazy Sunday':
      return "Relaxing weekend day. I want to spend some time cooking a nice, comforting meal in the afternoon, but keep breakfast and dinner super simple.";
    default:
      return "";
  }
}

// Local Storage for API Key
let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
if (geminiApiKey) {
  DOM.apiKeyInput.value = geminiApiKey;
  updateApiStatus(true);
}

// Toggle Settings Panel
DOM.settingsBtn.addEventListener('click', () => {
  DOM.apiConfigPanel.classList.toggle('hidden');
});

// Save API Key
DOM.saveApiKeyBtn.addEventListener('click', () => {
  const key = DOM.apiKeyInput.value.trim();
  localStorage.setItem('gemini_api_key', key);
  geminiApiKey = key;
  updateApiStatus(!!key);
  alert(key ? 'Gemini API Key saved successfully!' : 'API Key removed. Running in Local Mode.');
});

function updateApiStatus(active) {
  if (active) {
    DOM.apiStatus.className = 'api-status-badge active';
    DOM.apiStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Live AI Mode';
  } else {
    DOM.apiStatus.className = 'api-status-badge inactive';
    DOM.apiStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Local Mode';
  }
}

// Theme Toggle
DOM.themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  DOM.themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// Tab Switcher
DOM.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.tabButtons.forEach(b => b.classList.remove('active'));
    DOM.tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Form Submission
DOM.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const routine = DOM.routineInput.value.trim();
  const currency = DOM.currencySelect.value;
  const budget = parseFloat(DOM.budgetInput.value);
  
  let diet = 'No restrictions';
  for (const radio of DOM.dietOptions) {
    if (radio.checked) {
      diet = radio.value;
      break;
    }
  }

  // Show Loader
  DOM.placeholder.classList.add('hidden');
  DOM.results.classList.add('hidden');
  DOM.loader.classList.remove('hidden');
  
  // Loading Quotes Animation
  const quotes = [
    "Consulting the digital chef...",
    "Analyzing your schedule...",
    "Factoring in your daily budget...",
    "Sourcing ingredient substitutes...",
    "Assembling the ultimate checklist..."
  ];
  let quoteIdx = 0;
  DOM.loadingQuote.textContent = quotes[0];
  const quoteInterval = setInterval(() => {
    quoteIdx = (quoteIdx + 1) % quotes.length;
    DOM.loadingQuote.textContent = quotes[quoteIdx];
  }, 1200);

  try {
    let result;
    if (geminiApiKey) {
      result = await fetchAiPlan(routine, diet, budget, currency);
    } else {
      // Simulate delay for local mock engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = generateLocalPlan(routine, diet, budget, currency);
    }
    
    renderResults(result, budget, currency, diet);
    
    DOM.loader.classList.add('hidden');
    DOM.results.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    alert('Error generating plan: ' + error.message + '\nFalling back to local generator.');
    
    // Auto-fallback on API error
    const fallbackResult = generateLocalPlan(routine, diet, budget, currency);
    renderResults(fallbackResult, budget, currency, diet);
    DOM.loader.classList.add('hidden');
    DOM.results.classList.remove('hidden');
  } finally {
    clearInterval(quoteInterval);
  }
});

// Fetch Real Meal Plan from Gemini
async function fetchAiPlan(routine, diet, budget, currency) {
  const systemInstruction = `You are a culinary planner. Generate a personalized daily meal plan based on the user's routine, diet, and budget in ${currency}. 
Respond strictly with a JSON object. Do not include markdown code block formatting or backticks outside of the raw JSON. The response must match this schema:
{
  "mealPlan": {
    "breakfast": { "name": "Meal name", "prepTime": "Prep time (e.g. 15m)", "calories": 350, "ingredients": ["item 1", "item 2"], "instructions": ["step 1", "step 2"] },
    "lunch": { "name": "Meal name", "prepTime": "Prep time", "calories": 500, "ingredients": ["item 1"], "instructions": ["step 1"] },
    "dinner": { "name": "Meal name", "prepTime": "Prep time", "calories": 600, "ingredients": ["item 1"], "instructions": ["step 1"] }
  },
  "groceryList": [
    { "item": "item name", "category": "Produce|Protein|Pantry|Dairy|Bakery", "estCost": 2.50 }
  ],
  "substitutions": [
    { "original": "item to replace", "alternative": "healthy/cheap alternative", "reason": "why swap" }
  ],
  "budgetFeasibility": {
    "totalEstCost": 18.50,
    "status": "Under Budget|Within Budget|Over Budget",
    "feasibilityExplanation": "Brief explanation of how the plan aligns with the target budget of ${budget}.",
    "savingTips": ["Tip 1", "Tip 2"]
  }
}`;

  const prompt = `User's daily routine: "${routine}"
Dietary focus: "${diet}"
Daily budget limit: ${budget} ${currency}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

// Smart Local Fallback Plan Generator
function generateLocalPlan(routine, diet, budget, currency) {
  const isINR = currency === 'INR';
  const multiplier = isINR ? 80 : 1; // Basic conversion factor for realism
  
  // Base cost items scale with currency
  const scaleCost = (val) => Math.round(val * multiplier * 100) / 100;
  
  // Routine check
  const routineLower = routine.toLowerCase();
  const isBusy = routineLower.includes('busy') || routineLower.includes('work') || routineLower.includes('late') || routineLower.includes('office');
  const isWorkout = routineLower.includes('workout') || routineLower.includes('gym') || routineLower.includes('train') || routineLower.includes('protein') || routineLower.includes('exercise');
  const isWeekend = routineLower.includes('sunday') || routineLower.includes('saturday') || routineLower.includes('weekend') || routineLower.includes('lazy');

  // Core Recipes Library based on diets
  const recipeDb = {
    "No restrictions": {
      busy: {
        breakfast: { name: "Greek Yogurt Berry Parfait", prepTime: "5m", calories: 320, ingredients: ["Greek Yogurt", "Mixed Berries", "Granola", "Honey"], instructions: ["Layer Greek yogurt in a bowl or jar.", "Top with fresh mixed berries and granola.", "Drizzle with honey and serve cold."] },
        lunch: { name: "Turkey & Swiss Avocado Wrap", prepTime: "10m", calories: 480, ingredients: ["Tortilla Wraps", "Sliced Turkey", "Swiss Cheese", "Avocado", "Spinach"], instructions: ["Spread mashed avocado on a whole wheat tortilla.", "Lay down spinach, turkey slices, and swiss cheese.", "Roll tightly and slice in half."] },
        dinner: { name: "One-Pan Lemon Garlic Chicken & Veggies", prepTime: "25m", calories: 580, ingredients: ["Chicken Breast", "Broccoli", "Cherry Tomatoes", "Olive Oil", "Garlic", "Lemon"], instructions: ["Preheat oven or skillet to medium-high.", "Chop chicken and broccoli into bite-size pieces.", "Toss with olive oil, minced garlic, lemon juice, salt, and pepper.", "Cook together for 15-20 minutes until chicken is done."] }
      },
      workout: {
        breakfast: { name: "Power Protein Scramble", prepTime: "12m", calories: 450, ingredients: ["Whole Eggs", "Egg Whites", "Spinach", "Whole Wheat Toast", "Butter"], instructions: ["Whisk eggs and egg whites together.", "Sauté spinach in a skillet with a dab of butter.", "Pour in eggs and scramble until firm.", "Serve alongside toasted whole wheat bread."] },
        lunch: { name: "Glazed Salmon & Quinoa Bowl", prepTime: "20m", calories: 650, ingredients: ["Salmon Fillet", "Quinoa", "Edamame", "Soy Sauce", "Sesame Oil"], instructions: ["Cook quinoa according to package instructions.", "Pan-sear salmon in sesame oil and glaze with soy sauce.", "Assemble bowl with quinoa, salmon, and steamed edamame."] },
        dinner: { name: "Beef & Sweet Potato Sauté", prepTime: "30m", calories: 720, ingredients: ["Lean Ground Beef", "Sweet Potato", "Bell Peppers", "Onions", "Spices"], instructions: ["Cube sweet potato and microwave for 4 mins to soften.", "Brown ground beef in a skillet with chopped onions and peppers.", "Add sweet potato cubes and sauté together with spices until golden."] }
      },
      standard: {
        breakfast: { name: "Classic French Toast & Banana", prepTime: "15m", calories: 400, ingredients: ["Sliced Bread", "Eggs", "Milk", "Cinnamon", "Banana", "Maple Syrup"], instructions: ["Whisk egg, milk, and cinnamon in a shallow bowl.", "Dip bread slices into the mixture, coating both sides.", "Grill in a greased pan until golden brown on both sides.", "Serve with sliced banana and maple syrup."] },
        lunch: { name: "Caprese Grilled Chicken Sandwich", prepTime: "15m", calories: 550, ingredients: ["Chicken Breast", "Ciabatta Bread", "Mozzarella", "Tomato", "Pesto"], instructions: ["Cook chicken breast in a skillet.", "Slice ciabatta and spread pesto on one side.", "Layer chicken, sliced tomato, and mozzarella.", "Press or grill until cheese melts."] },
        dinner: { name: "Creamy Tomato Basil Pasta", prepTime: "20m", calories: 680, ingredients: ["Penne Pasta", "Tomato Sauce", "Heavy Cream", "Fresh Basil", "Parmesan Cheese"], instructions: ["Boil pasta in salted water.", "Simmer tomato sauce, cream, and chopped basil in a pan.", "Drain pasta and toss in the sauce.", "Top generously with grated parmesan."] }
      }
    },
    "Vegetarian": {
      busy: {
        breakfast: { name: "Nut Butter Banana Toast", prepTime: "5m", calories: 350, ingredients: ["Whole Wheat Bread", "Peanut Butter", "Banana", "Chia Seeds"], instructions: ["Toast bread slices.", "Spread peanut butter evenly.", "Top with sliced banana and sprinkle chia seeds."] },
        lunch: { name: "Chickpea Avocado Salad", prepTime: "10m", calories: 460, ingredients: ["Canned Chickpeas", "Avocado", "Cucumber", "Feta Cheese", "Lemon Dressing"], instructions: ["Rinse and drain canned chickpeas.", "Dice avocado and cucumber.", "Combine ingredients in a bowl, crumble feta over top, and toss in lemon dressing."] },
        dinner: { name: "Stir-Fried Veggies & Tofu", prepTime: "20m", calories: 510, ingredients: ["Firm Tofu", "Mixed Veggies", "Soy Sauce", "Ginger", "Brown Rice"], instructions: ["Cook brown rice.", "Press tofu to remove water, cube, and pan-sear until crispy.", "Add mixed veggies, minced ginger, and soy sauce, stirring frequently for 5 mins."] }
      },
      workout: {
        breakfast: { name: "Greek Yogurt High-Protein Parfait", prepTime: "8m", calories: 420, ingredients: ["Greek Yogurt", "Protein Powder", "Almonds", "Blueberries"], instructions: ["Mix protein powder into Greek yogurt until smooth.", "Top with almonds and fresh blueberries."] },
        lunch: { name: "Lentil & Quinoa Salad", prepTime: "20m", calories: 580, ingredients: ["Brown Lentils", "Quinoa", "Spinach", "Cherry Tomatoes", "Olive Oil"], instructions: ["Cook quinoa and lentils.", "Toss together with fresh spinach, cherry tomatoes, and olive oil."] },
        dinner: { name: "Tempeh Sweet Potato Hash", prepTime: "25m", calories: 610, ingredients: ["Tempeh", "Sweet Potato", "Black Beans", "Kale", "Avocado Oil"], instructions: ["Crumble tempeh and sauté with diced sweet potato and black beans in avocado oil.", "Add kale at the very end until wilted."] }
      },
      standard: {
        breakfast: { name: "Mushroom Spinach Omelette", prepTime: "12m", calories: 360, ingredients: ["Eggs", "Mushrooms", "Spinach", "Cheddar Cheese"], instructions: ["Sauté sliced mushrooms and spinach in a pan.", "Pour in beaten eggs and cook until set.", "Fold in cheese and cook until melted."] },
        lunch: { name: "Vegetable Hummus Wrap", prepTime: "10m", calories: 410, ingredients: ["Tortilla Wraps", "Hummus", "Cucumber", "Carrots", "Bell Peppers"], instructions: ["Spread a thick layer of hummus on flatbread.", "Julienne the cucumber, carrots, and peppers.", "Place veggies in wrap, roll up tightly, and cut."] },
        dinner: { name: "Vegetarian Chili", prepTime: "30m", calories: 540, ingredients: ["Kidney Beans", "Canned Tomatoes", "Corn", "Bell Pepper", "Chili Spices"], instructions: ["Sauté chopped onions and bell pepper in a pot.", "Add beans, tomatoes, corn, and spices.", "Simmer on low heat for 20 minutes."] }
      }
    },
    "Vegan": {
      busy: {
        breakfast: { name: "Green Protein Smoothie", prepTime: "5m", calories: 310, ingredients: ["Spinach", "Banana", "Plant Milk", "Vegan Protein Powder"], instructions: ["Add all ingredients to a blender.", "Blend on high speed until completely smooth."] },
        lunch: { name: "Hummus & Veggie Sandwich", prepTime: "8m", calories: 390, ingredients: ["Vegan Bread", "Hummus", "Cucumber", "Tomato", "Sprouted Lentils"], instructions: ["Spread hummus on toast.", "Assemble sandwich with cucumber, tomato, and sprouts."] },
        dinner: { name: "Quick Black Bean Quesadilla", prepTime: "15m", calories: 480, ingredients: ["Tortilla Wraps", "Canned Black Beans", "Vegan Cheese", "Salsa"], instructions: ["Mash black beans slightly with seasoning.", "Spread onto tortilla, sprinkle vegan cheese, and fold in half.", "Cook in dry skillet until crispy on both sides."] }
      },
      workout: {
        breakfast: { name: "Chia Seed Pudding & Hemp Seeds", prepTime: "10m", calories: 380, ingredients: ["Chia Seeds", "Almond Milk", "Maple Syrup", "Hemp Seeds", "Berries"], instructions: ["Stir chia seeds, almond milk, and maple syrup (ideally prepped night before).", "Top with hemp seeds and berries before eating."] },
        lunch: { name: "Tempeh Buddha Bowl", prepTime: "20m", calories: 620, ingredients: ["Tempeh", "Quinoa", "Broccoli", "Tahini", "Lemon Juice"], instructions: ["Steam broccoli and cook quinoa.", "Pan-fry sliced tempeh.", "Assemble bowl and drizzle with a tahini-lemon dressing."] },
        dinner: { name: "Lentil Shepherd's Pie (Deconstructed)", prepTime: "25m", calories: 590, ingredients: ["Brown Lentils", "Mashed Potato", "Peas", "Carrots", "Vegetable Broth"], instructions: ["Simmer lentils, peas, and carrots in broth until thick.", "Serve topped with a scoop of warm mashed potatoes."] }
      },
      standard: {
        breakfast: { name: "Berry Oatmeal Bowl", prepTime: "10m", calories: 340, ingredients: ["Rolled Oats", "Water", "Mixed Berries", "Walnuts", "Maple Syrup"], instructions: ["Cook oats in water until creamy.", "Top with berries, crushed walnuts, and a splash of maple syrup."] },
        lunch: { name: "Mediterranean Chickpea Salad", prepTime: "12m", calories: 440, ingredients: ["Chickpeas", "Cucumber", "Olives", "Red Onion", "Lemon-Herb Dressing"], instructions: ["Toss chickpeas, diced cucumber, sliced olives, and red onion together.", "Pour dressing over top and mix."] },
        dinner: { name: "Vegan Coconut Lentil Curry", prepTime: "25m", calories: 580, ingredients: ["Red Lentils", "Coconut Milk", "Spinach", "Curry Powder", "Basmati Rice"], instructions: ["Cook basmati rice.", "Simmer red lentils with curry powder and coconut milk until soft.", "Fold in spinach until wilted, and serve over rice."] }
      }
    },
    "Keto/Low-carb": {
      busy: {
        breakfast: { name: "Avocado & Bacon Plate", prepTime: "5m", calories: 450, ingredients: ["Avocado", "Bacon", "Olive Oil", "Salt & Pepper"], instructions: ["Cook bacon slices until crispy.", "Slice avocado in half, drizzle with olive oil, salt, and pepper.", "Serve together."] },
        lunch: { name: "Keto Tuna Salad Cups", prepTime: "10m", calories: 480, ingredients: ["Canned Tuna", "Mayonnaise", "Celery", "Romaine Lettuce Leaves"], instructions: ["Mix tuna, mayonnaise, and diced celery in a bowl.", "Spoon mixture into romaine lettuce leaves and serve like tacos."] },
        dinner: { name: "Garlic Butter Steak Bites", prepTime: "15m", calories: 650, ingredients: ["Sirloin Steak", "Butter", "Garlic", "Asparagus"], instructions: ["Cube steak and sauté in butter and minced garlic over high heat.", "Throw in asparagus tips and cook for another 5 minutes."] }
      },
      workout: {
        breakfast: { name: "Scrambled Eggs & Keto Sausage", prepTime: "12m", calories: 580, ingredients: ["Eggs", "Heavy Cream", "Butter", "Keto Sausage Links"], instructions: ["Whisk eggs with a splash of heavy cream.", "Scramble in butter until fluffy.", "Cook sausage links and serve alongside eggs."] },
        lunch: { name: "Double Cheeseburger Salad", prepTime: "15m", calories: 710, ingredients: ["Ground Beef", "Cheddar Cheese", "Lettuce", "Pickles", "Keto Dressing"], instructions: ["Cook ground beef and melt cheddar cheese over it.", "Serve over a bed of chopped lettuce, pickles, and low-carb dressing."] },
        dinner: { name: "Keto Cream Cheese Salmon", prepTime: "25m", calories: 680, ingredients: ["Salmon Fillet", "Cream Cheese", "Spinach", "Garlic", "Lemon Juice"], instructions: ["Pan-sear salmon.", "In another pan, melt cream cheese with garlic, lemon, and spinach.", "Pour cream cheese sauce over salmon."] }
      },
      standard: {
        breakfast: { name: "Spinach Feta Frittata", prepTime: "20m", calories: 410, ingredients: ["Eggs", "Spinach", "Feta Cheese", "Heavy Cream"], instructions: ["Whisk eggs, cream, spinach, and feta.", "Pour into greased pan and bake or cook covered until firm."] },
        lunch: { name: "Cobb Salad", prepTime: "15m", calories: 590, ingredients: ["Chicken Breast", "Bacon", "Hardboiled Egg", "Blue Cheese", "Lettuce", "Olive Oil"], instructions: ["Assemble chopped chicken, cooked bacon, egg, and cheese over lettuce.", "Drizzle with olive oil and vinegar."] },
        dinner: { name: "Pesto Chicken & Zucchini Noodles", prepTime: "20m", calories: 620, ingredients: ["Chicken Breast", "Zucchini (Zoodles)", "Pesto", "Parmesan Cheese"], instructions: ["Sauté sliced chicken in a pan.", "Add zucchini noodles and cook for 2 mins.", "Stir in pesto and top with grated parmesan."] }
      }
    },
    "Gluten-Free": {
      busy: {
        breakfast: { name: "GF Granola Yogurt Bowl", prepTime: "5m", calories: 320, ingredients: ["Greek Yogurt", "Gluten-Free Granola", "Strawberries", "Honey"], instructions: ["Scoop yogurt into a bowl.", "Top with gluten-free granola and sliced strawberries.", "Drizzle with honey."] },
        lunch: { name: "Turkey Lettuce Wraps", prepTime: "10m", calories: 420, ingredients: ["Sliced Turkey", "Butter Lettuce Leaves", "Avocado", "GF Mustard"], instructions: ["Lay out large lettuce leaves.", "Layer turkey and avocado inside.", "Roll up and dip in gluten-free mustard."] },
        dinner: { name: "Sheet Pan Salmon & Broccoli", prepTime: "20m", calories: 540, ingredients: ["Salmon Fillet", "Broccoli", "Olive Oil", "Lemon"], instructions: ["Place salmon and broccoli on baking sheet.", "Drizzle with olive oil, salt, pepper, and lemon juice.", "Bake at 400°F (200°C) for 15 minutes."] }
      },
      workout: {
        breakfast: { name: "Protein Egg & Veggie Scramble", prepTime: "12m", calories: 430, ingredients: ["Eggs", "Bell Pepper", "Onions", "Ham", "Cheddar Cheese"], instructions: ["Sauté diced ham, pepper, and onion in a pan.", "Pour in beaten eggs and scramble.", "Top with cheddar cheese."] },
        lunch: { name: "Chicken & Quinoa Bowl", prepTime: "20m", calories: 610, ingredients: ["Grilled Chicken", "Quinoa", "Black Beans", "Salsa", "Cilantro"], instructions: ["Layer cooked quinoa and black beans.", "Top with sliced grilled chicken, salsa, and fresh cilantro."] },
        dinner: { name: "Steak & Sweet Potato Sauté", prepTime: "25m", calories: 690, ingredients: ["Sirloin Steak", "Sweet Potato", "Spinach", "Garlic Butter"], instructions: ["Sauté diced sweet potato until tender.", "Add steak strips and cook to liking.", "Toss in spinach until wilted with garlic butter."] }
      },
      standard: {
        breakfast: { name: "Gluten-Free Pancakes", prepTime: "15m", calories: 380, ingredients: ["GF Flour", "Egg", "Milk", "Banana", "Maple Syrup"], instructions: ["Mix GF flour, egg, milk, and mashed banana into batter.", "Pour onto hot griddle and cook both sides.", "Serve with maple syrup."] },
        lunch: { name: "GF Caprese Salad Bowl", prepTime: "12m", calories: 460, ingredients: ["Cherry Tomatoes", "Mozzarella Pearls", "Basil", "Olive Oil", "Balsamic Glaze"], instructions: ["Toss tomatoes, mozzarella, and basil in a bowl.", "Drizzle with olive oil and balsamic glaze."] },
        dinner: { name: "Beef & Vegetable Rice Skillet", prepTime: "25m", calories: 610, ingredients: ["Ground Beef", "Jasmine Rice", "Zucchini", "Carrots", "GF Tamari Sauce"], instructions: ["Cook jasmine rice.", "Brown beef in a skillet with chopped zucchini and carrots.", "Stir in rice and GF tamari sauce."] }
      }
    }
  };

  // Resolve active category
  const selectedDiet = recipeDb[diet] ? diet : "No restrictions";
  const category = isBusy ? "busy" : (isWorkout ? "workout" : "standard");
  const plan = recipeDb[selectedDiet][category];

  // Dynamically assemble Grocery List and Costs
  const groceryCategories = {
    "Greek Yogurt": "Dairy", "Mixed Berries": "Produce", "Granola": "Pantry", "Honey": "Pantry",
    "Tortilla Wraps": "Pantry", "Sliced Turkey": "Protein", "Swiss Cheese": "Dairy", "Avocado": "Produce",
    "Spinach": "Produce", "Chicken Breast": "Protein", "Broccoli": "Produce", "Cherry Tomatoes": "Produce",
    "Olive Oil": "Pantry", "Garlic": "Produce", "Lemon": "Produce", "Whole Eggs": "Dairy",
    "Egg Whites": "Dairy", "Whole Wheat Toast": "Bakery", "Butter": "Dairy", "Salmon Fillet": "Protein",
    "Quinoa": "Pantry", "Edamame": "Produce", "Soy Sauce": "Pantry", "Sesame Oil": "Pantry",
    "Lean Ground Beef": "Protein", "Sweet Potato": "Produce", "Bell Peppers": "Produce", "Onions": "Produce",
    "Spices": "Pantry", "Sliced Bread": "Bakery", "Eggs": "Dairy", "Milk": "Dairy",
    "Cinnamon": "Pantry", "Banana": "Produce", "Maple Syrup": "Pantry", "Ciabatta Bread": "Bakery",
    "Mozzarella": "Dairy", "Tomato": "Produce", "Pesto": "Pantry", "Penne Pasta": "Pantry",
    "Tomato Sauce": "Pantry", "Heavy Cream": "Dairy", "Fresh Basil": "Produce", "Parmesan Cheese": "Dairy",
    "Peanut Butter": "Pantry", "Chia Seeds": "Pantry", "Canned Chickpeas": "Pantry", "Cucumber": "Produce",
    "Feta Cheese": "Dairy", "Lemon Dressing": "Pantry", "Firm Tofu": "Protein", "Mixed Veggies": "Produce",
    "Ginger": "Produce", "Brown Rice": "Pantry", "Protein Powder": "Pantry", "Almonds": "Pantry",
    "Blueberries": "Produce", "Brown Lentils": "Pantry", "Tempeh": "Protein", "Black Beans": "Pantry",
    "Kale": "Produce", "Avocado Oil": "Pantry", "Mushrooms": "Produce", "Cheddar Cheese": "Dairy",
    "Hummus": "Dairy", "Carrots": "Produce", "Kidney Beans": "Pantry", "Canned Tomatoes": "Pantry",
    "Corn": "Produce", "Bell Pepper": "Produce", "Chili Spices": "Pantry", "Plant Milk": "Dairy",
    "Vegan Protein Powder": "Pantry", "Vegan Bread": "Bakery", "Sprouted Lentils": "Produce",
    "Vegan Cheese": "Dairy", "Salsa": "Pantry", "Hemp Seeds": "Pantry", "Tahini": "Pantry",
    "Lemon Juice": "Produce", "Mashed Potato": "Produce", "Peas": "Produce", "Vegetable Broth": "Pantry",
    "Rolled Oats": "Pantry", "Water": "Pantry", "Walnuts": "Pantry", "Olives": "Produce",
    "Red Onion": "Produce", "Lemon-Herb Dressing": "Pantry", "Red Lentils": "Pantry", "Coconut Milk": "Pantry",
    "Curry Powder": "Pantry", "Basmati Rice": "Pantry", "Bacon": "Protein", "Canned Tuna": "Protein",
    "Mayonnaise": "Pantry", "Celery": "Produce", "Romaine Lettuce Leaves": "Produce", "Sirloin Steak": "Protein",
    "Asparagus": "Produce", "Keto Sausage Links": "Protein", "Pickles": "Produce", "Keto Dressing": "Pantry",
    "Cream Cheese": "Dairy", "Blue Cheese": "Dairy", "Zucchini (Zoodles)": "Produce", "Gluten-Free Granola": "Pantry",
    "Strawberries": "Produce", "Butter Lettuce Leaves": "Produce", "GF Mustard": "Pantry", "GF Flour": "Pantry",
    "Mozzarella Pearls": "Dairy", "Balsamic Glaze": "Pantry", "Jasmine Rice": "Pantry", "Zucchini": "Produce",
    "GF Tamari Sauce": "Pantry"
  };

  // Base pricing for ingredients (in USD baseline)
  const basePrices = {
    "Greek Yogurt": 2.50, "Mixed Berries": 3.00, "Granola": 2.20, "Honey": 1.50,
    "Tortilla Wraps": 1.80, "Sliced Turkey": 4.00, "Swiss Cheese": 2.50, "Avocado": 2.00,
    "Spinach": 1.50, "Chicken Breast": 5.00, "Broccoli": 1.20, "Cherry Tomatoes": 1.80,
    "Olive Oil": 1.00, "Garlic": 0.50, "Lemon": 0.50, "Whole Eggs": 2.00,
    "Egg Whites": 2.20, "Whole Wheat Toast": 1.20, "Butter": 1.50, "Salmon Fillet": 7.50,
    "Quinoa": 2.00, "Edamame": 1.50, "Soy Sauce": 0.80, "Sesame Oil": 1.20,
    "Lean Ground Beef": 5.50, "Sweet Potato": 1.20, "Bell Peppers": 1.50, "Onions": 0.80,
    "Spices": 0.50, "Sliced Bread": 1.00, "Eggs": 1.80, "Milk": 1.50,
    "Cinnamon": 0.40, "Banana": 0.80, "Maple Syrup": 2.00, "Ciabatta Bread": 2.00,
    "Mozzarella": 3.00, "Tomato": 1.00, "Pesto": 2.50, "Penne Pasta": 1.00,
    "Tomato Sauce": 1.20, "Heavy Cream": 1.80, "Fresh Basil": 1.50, "Parmesan Cheese": 2.50,
    "Peanut Butter": 2.00, "Chia Seeds": 1.50, "Canned Chickpeas": 1.00, "Cucumber": 0.80,
    "Feta Cheese": 3.00, "Lemon Dressing": 1.50, "Firm Tofu": 2.00, "Mixed Veggies": 1.50,
    "Ginger": 0.50, "Brown Rice": 1.00, "Protein Powder": 3.50, "Almonds": 2.50,
    "Blueberries": 2.80, "Brown Lentils": 1.00, "Tempeh": 2.80, "Black Beans": 1.00,
    "Kale": 1.50, "Avocado Oil": 1.80, "Mushrooms": 1.80, "Cheddar Cheese": 2.20,
    "Hummus": 2.00, "Carrots": 0.80, "Kidney Beans": 1.00, "Canned Tomatoes": 1.00,
    "Corn": 0.80, "Bell Pepper": 1.00, "Chili Spices": 0.50, "Plant Milk": 2.00,
    "Vegan Protein Powder": 4.00, "Vegan Bread": 2.20, "Sprouted Lentils": 1.50,
    "Vegan Cheese": 3.50, "Salsa": 1.50, "Hemp Seeds": 2.00, "Tahini": 2.50,
    "Lemon Juice": 0.50, "Mashed Potato": 1.50, "Peas": 0.80, "Vegetable Broth": 1.00,
    "Rolled Oats": 1.20, "Water": 0.00, "Walnuts": 2.50, "Olives": 1.80,
    "Red Onion": 0.50, "Lemon-Herb Dressing": 1.50, "Red Lentils": 1.20, "Coconut Milk": 1.50,
    "Curry Powder": 0.50, "Basmati Rice": 1.20, "Bacon": 3.50, "Canned Tuna": 1.80,
    "Mayonnaise": 1.50, "Celery": 0.80, "Romaine Lettuce Leaves": 1.20, "Sirloin Steak": 8.00,
    "Asparagus": 2.50, "Keto Sausage Links": 4.00, "Pickles": 1.20, "Keto Dressing": 1.80,
    "Cream Cheese": 2.00, "Blue Cheese": 3.00, "Zucchini (Zoodles)": 2.00, "Gluten-Free Granola": 3.50,
    "Strawberries": 2.50, "Butter Lettuce Leaves": 1.50, "GF Mustard": 1.50, "GF Flour": 2.50,
    "Mozzarella Pearls": 3.20, "Balsamic Glaze": 2.00, "Jasmine Rice": 1.20, "Zucchini": 1.20,
    "GF Tamari Sauce": 1.80
  };

  // Compile full ingredient list
  const ingredientSet = new Set([
    ...plan.breakfast.ingredients,
    ...plan.lunch.ingredients,
    ...plan.dinner.ingredients
  ]);

  const groceryList = Array.from(ingredientSet).map(ing => {
    const rawCost = basePrices[ing] || 1.50;
    return {
      item: ing,
      category: groceryCategories[ing] || "Pantry",
      estCost: scaleCost(rawCost)
    };
  });

  // Calculate total cost
  const totalEstCost = groceryList.reduce((acc, item) => acc + item.estCost, 0);
  const roundedCost = Math.round(totalEstCost * 100) / 100;

  // Decide status
  let status = "Under Budget";
  if (roundedCost > budget) {
    status = "Over Budget";
  } else if (roundedCost > budget * 0.8) {
    status = "Within Budget";
  }

  // AI substitutions suggestions
  const potentialSwaps = [
    { original: "Salmon Fillet", alternative: "Canned Tuna", reason: "Saves around 70% of the protein cost while maintaining high Omega-3 levels." },
    { original: "Sirloin Steak", alternative: "Chicken Breast", reason: "Significantly cheaper protein option, reduces fat content as well." },
    { original: "Greek Yogurt", alternative: "Plain Curd", reason: "A local dairy alternative that offers similar probiotics at a fraction of the cost." },
    { original: "Avocado", alternative: "Olive Oil / Peanut Butter", reason: "Healthy fats alternative, easier to source and store." },
    { original: "Mixed Berries", alternative: "Frozen Berries / Banana", reason: "Frozen fruits or local bananas are cheaper and last much longer without waste." },
    { original: "Quinoa", alternative: "Brown Rice", reason: "Saves money while still providing a whole-grain base." },
    { original: "Vegan Cheese", alternative: "Nutritional Yeast", reason: "Adds cheesy flavor to dishes naturally, costs less per serving and is highly nutritious." }
  ];

  // Select swaps that are actually in the recipe ingredients
  const activeSwaps = potentialSwaps.filter(swap => ingredientSet.has(swap.original));
  if (activeSwaps.length === 0) {
    // Add default general swaps if no recipe ingredients match
    activeSwaps.push({ original: "Fresh Berries", alternative: "Banana", reason: "Bananas are cheaper and supply quick energy." });
    activeSwaps.push({ original: "Heavy Cream", alternative: "Coconut Milk / Yogurt", reason: "Lighter fat alternative, budget friendly." });
  }

  // Cost saving tips based on status
  const savingTips = [
    `Buy generic store brands for pantry staples like quinoa, pasta, or oats.`,
    `Purchase vegetables like broccoli and carrots in bulk, and prep them yourself rather than buying pre-cut.`,
    `Use leftover stalks/scraps to make home-cooked vegetable broth.`
  ];
  if (status === "Over Budget") {
    savingTips.unshift(`Swap out premium proteins like salmon or steak for eggs, tofu, or lentils to instantly trim your budget.`);
  }

  return {
    mealPlan: plan,
    groceryList,
    substitutions: activeSwaps,
    budgetFeasibility: {
      totalEstCost: roundedCost,
      status,
      feasibilityExplanation: `Your estimated grocery spend is ${currency} ${roundedCost}. This is ${status === 'Over Budget' ? 'above' : 'within'} your target budget limit of ${currency} ${budget}.`,
      savingTips
    }
  };
}

// Render Results on UI
function renderResults(data, targetBudget, currency, diet) {
  const symbol = getCurrencySymbol(currency);
  
  // Set routine summary
  DOM.mealRoutineSummary.textContent = `${diet} Plan`;
  
  // Render Breakfast
  DOM.breakfastTitle.textContent = data.mealPlan.breakfast.name;
  DOM.breakfastTime.textContent = data.mealPlan.breakfast.prepTime;
  DOM.breakfastCalories.textContent = `${data.mealPlan.breakfast.calories} kcal`;
  DOM.breakfastIngredients.innerHTML = data.mealPlan.breakfast.ingredients.map(i => `<li>${i}</li>`).join('');
  DOM.breakfastSteps.innerHTML = data.mealPlan.breakfast.instructions.map(s => `<li>${s}</li>`).join('');
  
  // Render Lunch
  DOM.lunchTitle.textContent = data.mealPlan.lunch.name;
  DOM.lunchTime.textContent = data.mealPlan.lunch.prepTime;
  DOM.lunchCalories.textContent = `${data.mealPlan.lunch.calories} kcal`;
  DOM.lunchIngredients.innerHTML = data.mealPlan.lunch.ingredients.map(i => `<li>${i}</li>`).join('');
  DOM.lunchSteps.innerHTML = data.mealPlan.lunch.instructions.map(s => `<li>${s}</li>`).join('');
  
  // Render Dinner
  DOM.dinnerTitle.textContent = data.mealPlan.dinner.name;
  DOM.dinnerTime.textContent = data.mealPlan.dinner.prepTime;
  DOM.dinnerCalories.textContent = `${data.mealPlan.dinner.calories} kcal`;
  DOM.dinnerIngredients.innerHTML = data.mealPlan.dinner.ingredients.map(i => `<li>${i}</li>`).join('');
  DOM.dinnerSteps.innerHTML = data.mealPlan.dinner.instructions.map(s => `<li>${s}</li>`).join('');

  // Render Groceries grouped by Category
  const categories = {};
  data.groceryList.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  DOM.groceriesList.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'grocery-category';
    
    let catIcon = '<i class="fa-solid fa-box"></i>';
    if (cat === 'Produce') catIcon = '<i class="fa-solid fa-carrot"></i>';
    else if (cat === 'Protein') catIcon = '<i class="fa-solid fa-drumstick-bite"></i>';
    else if (cat === 'Dairy') catIcon = '<i class="fa-solid fa-cheese"></i>';
    else if (cat === 'Bakery') catIcon = '<i class="fa-solid fa-bread-slice"></i>';
    
    catDiv.innerHTML = `
      <h4>${catIcon} ${cat}</h4>
      <div class="grocery-item-list">
        ${categories[cat].map(g => `
          <label class="grocery-item">
            <div class="grocery-item-left">
              <input type="checkbox">
              <span>${g.item}</span>
            </div>
            <span class="grocery-item-cost">${symbol}${g.estCost.toFixed(2)}</span>
          </label>
        `).join('')}
      </div>
    `;
    DOM.groceriesList.appendChild(catDiv);
  });

  // Render Substitutions
  DOM.swapsGrid.innerHTML = data.substitutions.map(s => `
    <div class="swap-card">
      <div class="swap-card-top">
        <span class="swap-original">${s.original}</span>
        <span class="swap-arrow"><i class="fa-solid fa-right-long"></i></span>
        <span class="swap-alternative">${s.alternative}</span>
      </div>
      <p class="swap-reason">${s.reason}</p>
    </div>
  `).join('');

  // Render Budget Inspector
  const estCost = data.budgetFeasibility.totalEstCost;
  DOM.summaryTargetBudget.textContent = `${symbol}${targetBudget.toFixed(2)}`;
  DOM.summaryEstCost.textContent = `${symbol}${estCost.toFixed(2)}`;
  
  // Calculate percentage & clamp to max 100%
  const pct = targetBudget > 0 ? (estCost / targetBudget) * 100 : 0;
  const clampedPct = Math.min(pct, 100);
  
  // Update gauge circle meter
  // Circumference of r=45 circle is 2 * PI * 45 = 282.74 (approx 283)
  const offset = 283 - (clampedPct / 100) * 283;
  DOM.budgetGaugeMeter.style.strokeDashoffset = offset;
  DOM.budgetValue.textContent = `${Math.round(pct)}%`;
  
  // Color the gauge depending on percentage
  if (pct <= 80) {
    DOM.budgetGaugeMeter.style.stroke = 'var(--success)';
  } else if (pct <= 100) {
    DOM.budgetGaugeMeter.style.stroke = 'var(--warning)';
  } else {
    DOM.budgetGaugeMeter.style.stroke = 'var(--danger)';
  }
  
  // Set alert box state
  const status = data.budgetFeasibility.status;
  const statusAlert = DOM.budgetStatusAlert;
  statusAlert.className = 'budget-status-alert'; // reset
  
  if (status === 'Under Budget') {
    statusAlert.classList.add('success');
    statusAlert.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <div>
        <h4>Under Budget ✅</h4>
        <p>${data.budgetFeasibility.feasibilityExplanation}</p>
      </div>
    `;
  } else if (status === 'Within Budget') {
    statusAlert.classList.add('warning');
    statusAlert.innerHTML = `
      <i class="fa-solid fa-circle-exclamation"></i>
      <div>
        <h4>Within Budget limit ⚠️</h4>
        <p>${data.budgetFeasibility.feasibilityExplanation}</p>
      </div>
    `;
  } else {
    statusAlert.classList.add('danger');
    statusAlert.innerHTML = `
      <i class="fa-solid fa-circle-xmark"></i>
      <div>
        <h4>Over Budget limit ❌</h4>
        <p>${data.budgetFeasibility.feasibilityExplanation}</p>
      </div>
    `;
  }
  
  // Render budget saving tips
  DOM.budgetTipsList.innerHTML = data.budgetFeasibility.savingTips.map(tip => `<li>${tip}</li>`).join('');
}

function getCurrencySymbol(curr) {
  switch(curr) {
    case 'INR': return '₹';
    case 'EUR': return '€';
    default: return '$';
  }
}
