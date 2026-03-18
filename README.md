# cashFlo Template

Standard template with:
- Landing page
- Login page
- Signup page
- Dashboard page

Auth is now session-cookie based and does not use JWT in app code.

## Stack

- Next.js App Router
- MongoDB + Mongoose
- Credentials auth (email/password)
- Optional Google sign-in via Firebase

## Environment Variables

Create a local environment file and add:

```bash
MONGODB_URI=your_mongodb_connection_string

# Optional: Firebase (required only for Google sign-in)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

If Firebase variables are missing, Google sign-in buttons are disabled automatically.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Auth Flow

1. Signup or login creates a secure httpOnly session cookie.
2. Middleware protects dashboard routes using that cookie.
3. Client auth state is fetched from /api/auth/session.
4. Logout clears both database session and cookie.

## Important Routes

- /api/auth/signup
- /api/auth/login
- /api/auth/google
- /api/auth/session

## Quality Check

```bash
npm run lint
```

Current lint status: no errors, no warnings.
