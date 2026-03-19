
# cashFlo – Freelancer Finance Dashboard

**cashFlo** is a modern, full-stack financial dashboard template designed for freelancers and small businesses to manage their finances, track analytics, and streamline invoicing and payments. Built with Next.js, MongoDB, and Firebase, it offers a seamless, secure, and extensible platform for financial management.

---

## 🚀 Features

- **Landing Page**: Professional introduction to your platform.
- **Authentication**: Secure session-cookie based login and signup (no JWTs in app code).
- **Dashboard**: Interactive analytics, balance, expenses, invoices, payments, and reports.
- **Google Sign-In**: Optional, powered by Firebase (auto-disables if not configured).
- **Client Management**: Add, view, and manage clients and their financial data.
- **Expense Tracking**: Categorize, add, and analyze business and personal expenses.
- **Invoice Management**: Create, send, and track invoices and payment statuses.
- **Reports & Insights**: Generate annual/monthly reports, view trends, and gain actionable insights.
- **Notifications**: Stay updated with payment reminders and important alerts.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **Backend**: Next.js API routes, MongoDB, Mongoose
- **Authentication**: Credentials (email/password), Google (via Firebase)
- **Styling**: CSS Modules, PostCSS
- **Linting**: ESLint

---

## 📁 Project Structure

- `src/app/` – Main application pages and API routes
- `src/components/` – Reusable UI and layout components
- `src/context/` – React context providers (e.g., Auth)
- `src/hooks/` – Custom React hooks
- `src/lib/` – Utility libraries (e.g., Firebase integration)
- `public/` – Static assets
- `scripts/` – Database seeding and setup scripts

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add:

```bash
MONGODB_URI=your_mongodb_connection_string

# Optional: Firebase (for Google sign-in)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

If Firebase variables are missing, Google sign-in is disabled automatically.

---

## 🏁 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd cashFlo
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

1. Signup/login creates a secure httpOnly session cookie.
2. Middleware protects dashboard routes using that cookie.
3. Client fetches auth state from `/api/auth/session`.
4. Logout clears both database session and cookie.

---

## 📌 Key API Routes

- `/api/auth/signup` – User registration
- `/api/auth/login` – User login
- `/api/auth/google` – Google OAuth login
- `/api/auth/session` – Session state
- `/api/balance` – Balance data
- `/api/clients` – Client management
- `/api/expenses` – Expense tracking
- `/api/invoices` – Invoice management
- `/api/payments` – Payment processing
- `/api/reports` – Financial reports

---

## 🧪 Quality & Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Current status: no errors, no warnings.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.
