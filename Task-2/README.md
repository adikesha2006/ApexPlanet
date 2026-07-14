# Task 2: Intermediate Developer Dashboard Workspace

## 📌 Project Overview
This module focuses on Document Object Model (DOM) manipulation, basic input state handling, and structured fluid positioning layouts. It provides an operational "Project Tracker" checklist alongside an interactive contact form pipeline inside a clean, modern workspace layout.

---

## 🛠️ Key Technical Implementations

* **Responsive Structural Layout:** Designed a layout split using CSS Grid and Flexbox variables. The navigation bar handles fluid item distributions via Flexbox, while the dashboard sections are locked inside an operational CSS Grid layout that adapts to standard screen widths.
* **Asynchronous Form Interception & Validation:** Implemented a client-side javascript validation engine on the contact form layout. It monitors text input fields and evaluates email inputs using clean Regular Expressions (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). It blocks invalid form submissions, bypassing ugly browser alerts to dynamically toggle custom `.invalid` error markup tokens cleanly in the DOM tree.
* **Dynamic To-Do Project Tracker:** Programmed a modular milestone checklist engine using vanilla JavaScript DOM tree modification methods (`document.createElement`, `appendChild`, and `element.remove`). Users can generate new milestones, toggle active execution states, and scrub complete records dynamically in real time.

---

## 🎨 Visual Contrast Tokens

To ensure maximum scannability and card boundaries against the background canvas, the UI utilizes high-contrast layout parameters:

```css
:root {
    --bg: #eef2f6;      /* High-contrast dashboard gray canvas background */
    --card: #ffffff;    /* Pure white component panels */
    --text: #0f1724;    /* Charcoal text typography */
    --border: #e2e8f0;  /* Subdued layout boundaries */
    --accent: #0ea5a4;  /* Technical premium teal accents */
}