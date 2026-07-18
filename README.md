# ChefAI 🍳 - AI Cooking To-Do List & Meal Planner

A premium, responsive single-page web application built for the **GenAI Promptwars Warm Up Challenge**. ChefAI generates a personalized daily cooking schedule, organized grocery checklist, ingredient substitution suggestions, and real-time budget feasibility metrics based on the user's daily routine, dietary focus, and budget.

---

## ✨ Features

- **Custom Day Analysis**: Enter your schedule (e.g. busy workday, heavy workout session, lazy weekend) to receive personalized cooking durations and step instructions.
- **Dietary Constraints Selection**: Support for *Any/No restrictions*, *Vegetarian*, *Vegan*, *Keto*, and *Gluten-Free* diets.
- **Dynamic Currencies & Budgets**: Enter custom target budget in **USD ($)**, **INR (₹)**, or **EUR (€)**.
- **Smart Grocery Checklists**: View ingredient checklist itemized by categories (Produce, Protein, Pantry, Dairy, Bakery) with estimated pricing. Check off items as you go!
- **Ingredient Substitutions**: Intelligent swaps for expensive, hard-to-find, or non-diet-compliant ingredients.
- **Visual Budget Inspector**: A custom radial gauge indicator representing the spent percentage of your budget with automatic budget alerts (`Under Budget` ✅, `Within Budget` ⚠️, `Over Budget` ❌) and cost-cutting optimization recommendations.
- **API Configuration Settings**: Collapsible floating configuration drawer to input a custom Gemini API Key.
- **Dual-Mode Engine**: 
  - **Live AI Mode**: Directly calls Google's **Gemini 1.5 Flash API** using structured JSON output schemas to generate highly accurate meal schedules.
  - **Local Heuristics Fallback**: A robust, zero-setup recipe and budget generator mapping routine keywords and dietary preferences. Runs instantly out-of-the-box (crucial for quick evaluator testing without requiring API credentials!).
- **Rich Dark/Light Modes**: Premium slaty-dark aesthetic with vibrant emerald accent colors, transition animations, and a seamless toggle to light mode.

---

## 🛠️ Technology Stack

- **Structure**: Semantic HTML5.
- **Styling**: Vanilla CSS3 custom variables (glowing accents, circular SVG gauge meters, responsive flexbox/grid layout).
- **Core Logic**: Vanilla JavaScript (ES6+, asynchronous fetch, LocalStorage caching, dynamic DOM templating).
- **Icons**: FontAwesome CDN.
- **Typography**: Google Fonts (Outfit).
- **AI Engine**: Gemini 1.5 Flash API (`gemini-1.5-flash:generateContent`).

---

## 🚀 How to Run Locally

1. **Clone/Download** the repository:
   ```bash
   git clone <repo-url>
   ```
2. **Open** the `index.html` file in any modern web browser:
   - On Windows: Double-click `index.html` or run:
     ```powershell
     Start-Process "index.html"
     ```
   - On macOS/Linux:
     ```bash
     open index.html
     ```

---

## ⚙️ How to use the Gemini API (Optional)

1. Open the application.
2. Click the configuration gear/slider icon in the header.
3. Paste your Gemini API key and click **Save**.
4. The system status badge will change to **Live AI Mode**. Your subsequent requests will fetch live generated recipe data.
