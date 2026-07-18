# Main Challenge Preparation & Improvement Roadmap (Targeting 100/100)

Based on the Warm-Up Challenge AI Evaluation (Score: **75.22/100**), here is the analysis of the points lost and the concrete updates we will implement in the main challenge to achieve a perfect 100/100 score.

---

## 📊 Score Analysis & Improvement Action Plan

| Criteria | Score | Reason for Deduction | Main Challenge Action Plan |
| :--- | :---: | :--- | :--- |
| **Testing** | **0** | No test files or testing framework were included in the repository. | **Add a Jest test suite** (`app.test.js` or `tests/`) to verify state changes, mock API outputs, and budget logic calculations. |
| **Accessibility**| **45**| Missing explicit ARIA landmarks, lack of skip links, insufficient focus state outlines, and raw screen-reader labels. | **Apply semantic HTML5**, screen-reader-only tags (`.sr-only`), strict `aria-labels` on all form elements, and keyboard focus states. |
| **Security** | **73**| Direct usage of `innerHTML` in rendering user inputs/API responses, which triggers Cross-Site Scripting (XSS) concerns. | **Sanitize all DOM inputs** using an HTML escape helper instead of raw `innerHTML`, and secure local storage storage. |
| **Code Quality** | **80**| Monolithic script structure (`app.js`) and lack of strict modular separation. | **Modularize JavaScript** into distinct modules: `api.js` (network), `dom.js` (rendering), `utils.js` (helpers), and `app.js` (orchestration). |
| **Alignment** | **92**| Mostly aligned, but could be tighter on detailing specific constraints. | **Implement a detailed specification check** for every challenge parameter before writing code. |
| **Efficiency** | **100**| Client-side generation, no-dependency page, responsive design, and small footprint. | **Maintain zero-dependency design** and lightweight styling. |

---

## 🛠️ Code Implementation Guide for 100/100

### 1. Security Fix: XSS Prevention
Whenever we inject text into the DOM, we must escape special characters to prevent HTML/JS injection.
```javascript
// Add this helper in utils.js
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
```

### 2. Testing Fix: Jest Test Suite
We will add `jest` as a devDependency in `package.json` and create a `tests/` directory:
```javascript
// Example test file: tests/budget.test.js
const { calculateBudgetPercentage } = require('../js/utils.js');

test('calculates budget percentage correctly', () => {
  expect(calculateBudgetPercentage(100, 50)).toBe(50);
  expect(calculateBudgetPercentage(10, 20)).toBe(200);
});
```

### 3. Accessibility (A11y) checklist
- Wrap main content blocks in `<main>`, `<nav>`, `<header>`, and `<footer>` tags.
- Use explicit labels:
  ```html
  <label for="budgetInput" class="sr-only">Daily Budget</label>
  <input id="budgetInput" aria-label="Enter your daily budget limit" ... />
  ```
- Focus states: Ensure elements have visible `:focus-visible` styles:
  ```css
  input:focus-visible, button:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
  }
  ```

---

## 🚀 Execution Strategy for the Main Challenge
1. **Analyze Requirements**: Instantly create a checklist matching all requirements.
2. **Setup File Structure**: Split CSS/JS/HTML and configure Jest immediately.
3. **Draft the Code**: Write clean, accessible semantic HTML first, then add styling and modular JS with XSS protection.
4. **Run Tests**: Execute npm test to verify logic and code quality.
5. **Push and Deploy**: Sync to public GitHub and deploy to GitHub Pages.
