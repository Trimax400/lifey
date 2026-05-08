# 🍃 Lifey

> **Smart tracking for your financial freedom.**

[![Tests](https://github.com/Trimax400/lifey/actions/workflows/tests.yml/badge.svg)](https://github.com/Trimax400/lifey/actions/workflows/tests.yml)

Lifey is a modern, fast, and secure personal finance application designed to give you complete control over your budget. Track your daily expenses, manage recurring bills, and visualize your financial future with ease.

## ✨ Key Features

- **📊 Comprehensive Dashboard:** Instantly view your monthly incomes, expenses, balance, and savings rate.
- **🔄 Recurring Transactions:** Easily manage subscriptions and regular incomes (weekly, monthly, or yearly) with an advanced projection engine.
- **📈 Advanced Analytics:** Understand your spending habits with interactive Pie charts (Category breakdown, Fixed vs Variable) and Line charts (6-month history).
- **🔮 Budget Projections:** Anticipate your financial future with a 6-month projected budget based on your recurring flows.
- **📱 Mobile-First Experience:** Fully responsive design with intuitive touch gestures (swipe to open/close menus).
- **🔒 Secure Authentication:** Safe login, registration, and password recovery powered by Supabase.

## 🛠️ Tech Stack

- **Frontend:** Angular 21
- **Styling:** Tailwind CSS
- **Backend & Auth:** Supabase
- **Mailing:** Resend
- **Testing:** Vitest

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19 or higher)
- A Supabase project (URL and Anon Key)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Trimax400/lifey.git
   cd lifey
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create an `environment.ts` file (and `environment.development.ts`) in `src/environments/` and add your Supabase credentials:
   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'YOUR_SUPABASE_URL',
     supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
     serverUrl: 'http://localhost:4200'
   };
   ```

4. Start the development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/` in your browser.

## 🧪 Testing

Lifey is thoroughly tested using Vitest. To run the test suite:
```bash
ng test
```
## ⏩ Roadmap
_This roadmap is indicative and evolves based on technical feasibility and user feedback._

- UI/UX Enhancements: Implementation of Dark Mode and French localization.
- Banking Open API: Automated transaction syncing via secure bank integration.
- Onboarding: In-app tutorials and interactive user documentation.
- Social & Collaborative: Shared budgets and group expense tracking for trips or shared living.
