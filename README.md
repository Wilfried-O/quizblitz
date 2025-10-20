# QuizBlitz ⚡

Fast-paced trivia at your fingertips.

## 📚 Overview

**QuizBlitz** is a lightweight trivia app built with **React.js**.

---

## ✨ Features

- **Fetch Questions** - Pull multiple-choice trivia from the Open Trivia DB.
- **Timer & Score Tracking** - Per-question countdown with running score.
- **Multiple-Choice Selection** - Tap to lock your answer; clear feedback on correct/incorrect.
- **Leaderboard (Firebase)** - Submit your score and see the top players.
- **Local Persistence** - Saves player name and preferences in your browser between sessions.

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Styling:** CSS
- **Data:** Open Trivia DB API
- **Backend/DB:** Firebase (Cloud Firestore) for leaderboard
- **Data Storage:** localStorage
- **Linting & Formatting:** ESLint, Prettier
- **Package Manager:** npm

---

## 🚀 Getting Started

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Wilfried-O/quizblitz.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd quizblitz
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Start the development server:**

    ```bash
    npm start
    ```

5. **Open in your browser:**  
   [http://localhost:3000](http://localhost:3000)

---

## 📋 Project Status

- ✅ **Initial Cleanup:** Removed default React boilerplate (logos, tests, `reportWebVitals.js`, etc.)
- ✅ **Branding & Header:** Logo + gradient wordmark (Magma Peach theme)
- ⚙️ **Work in Progress:**
    - Core quiz flow (fetch questions, show choices, submit answers)
    - Timer and scoring logic
    - Firebase leaderboard integration

### 🧭 Next Steps

- Post-quiz summary (correct answers, streaks, accuracy)
- Share score (copyable link/image)
- Persistent player alias + theme toggle
- Accessibility (keyboard-only, focus states, ARIA labels)

---

## 🤖 AI Assistance

This project uses AI assistance for planning, coding, and debugging.  
All code is reviewed and fully understood by the author to ensure quality, clarity, and safety.

---

## 📄 License

This project is licensed under the **MIT License**.
