# Case Management System

Full-stack case and hearing task tracking system with role-aware actions, search/filtering, dashboard metrics, and a React UI backed by an Express + MongoDB API.

## Tech Stack

- Backend: Node.js, TypeScript, Express, Mongoose, Zod, JSON Web Token
- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS
- Testing: Vitest in both apps, Supertest for backend API tests
- Database: MongoDB

## Local Setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB running locally (default URIs below assume local Mongo)

### 1) Clone and install dependencies

```bash
git clone https://github.com/rajat-sharma-3745/Case-Management.git
cd case-management

cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure environment variables

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/case-management
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/case-management-test
JWT_SECRET=change-me-for-local-dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Run, Build, and Test

Use two terminals.

### Backend (`backend/`)

```bash
npm run dev
```

Other backend commands:

```bash
npm run build
npm run start
npm test
npm run test:watch
npm run token:admin
npm run token:intern
```

### Frontend (`frontend/`)

```bash
npm run dev
```

Other frontend commands:

```bash
npm run build
npm run preview
npm test
npm run test:watch
```

## API and UX Overview

### Backend architecture

The backend follows a layered flow:

1. Route handlers receive HTTP requests.
2. Validation parses and enforces request schema.
3. Services execute business logic.
4. Mongoose models persist/query MongoDB.
5. Error middleware normalizes API errors.

Notable behavior:

- Health endpoint: `GET /health`
- Dev token endpoint (non-production only): `POST /auth/dev-token`
- Case delete is role-protected (`admin` only): `DELETE /cases/:id`
- Dashboard summary endpoint: `GET /dashboard/summary`

### Frontend architecture

- App bootstraps with provider composition for auth, toast notifications, and dashboard refresh context.
- Routes render pages for home, dashboard, case workspace, and case detail.
- Shared API client handles base URL, auth header injection, and normalized error handling.
- Dev sign-in panel supports minting/pasting JWT tokens for role testing.

## Folder Structure

```text
case-management-system/
  backend/
    scripts/                 # Dev token minting script
    src/
      auth/                  # JWT helpers + auth middleware
      http/                  # HTTP error types
      middleware/            # Global error middleware
      models/                # Mongoose models (Case, Task)
      routes/                # Express routers (cases, tasks, dashboard, auth)
      services/              # Business logic
      test/                  # API tests + test setup
      utils/                 # Date and helper utilities
      validation/            # Zod schemas and object-id guards
      app.ts                 # Express app wiring
      db.ts                  # Mongo connection setup
      index.ts               # Server bootstrap
  frontend/
    src/
      api/                   # API client wrapper
      auth/                  # Auth provider/hooks/role helpers/dev auth panel
      components/            # Shared UI components
      dashboard/             # Dashboard refresh context/hooks
      pages/                 # Route-level pages
      test/                  # Frontend test setup
      types/                 # Shared domain types
      App.tsx                # Route configuration
      main.tsx               # Root render + provider composition
```

## Assumptions and Known Limitations

- Dev auth flow is intentionally development-only; `/auth/dev-token` is not exposed in production mode.
- Backend startup requires valid `JWT_SECRET`; API startup also requires `MONGODB_URI`.
- Backend tests require `MONGODB_URI_TEST` (or fallback `MONGODB_URI`) to point to an accessible Mongo database.
- Date-based dashboard/case window calculations use UTC calendar-day helpers.
- Role authorization is intentionally scoped: case deletion is explicitly guarded for admin role, while other endpoints are not fully role-segmented.
- Frontend expects `VITE_API_URL` to be present; missing value throws at runtime.

## Bonus Features Review Guide

If you are evaluating bonus scope, this repository includes work in these areas:

- Bonus 2 (Roles): attempted
- Bonus 3 (Tests): attempted
- Bonus 5 (UX polish): attempted

### Where to review

- Roles and auth
  - `backend/src/auth/middleware.ts`
  - `backend/src/auth/jwt.ts`
  - `backend/src/routes/auth.ts`
  - `backend/src/routes/cases.ts`
  - `frontend/src/auth/DevAuthPanel.tsx`
  - `frontend/src/auth/AuthProvider.tsx`
- Backend tests
  - `backend/src/test/setup.ts`
  - `backend/src/test/api/cases.test.ts`
  - `backend/src/test/api/dashboard.test.ts`
- Frontend tests
  - `frontend/src/auth/useAuth.test.tsx`
  - `frontend/src/auth/jwtPayload.test.ts`
- UX/loading/error polish
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/components/LoadingState.tsx`
  - `frontend/src/components/InlineError.tsx`
  - `frontend/src/components/ToastProvider.tsx`
  - `frontend/src/components/Skeleton.tsx`

### How to verify quickly

1. Start backend and frontend in dev mode.
2. In UI, use "Dev sign-in" as `intern` and confirm case delete is blocked.
3. Sign in as `admin` and confirm case delete succeeds.
4. Run tests:
   - `cd backend && npm test`
   - `cd frontend && npm test`
5. Trigger loading/error states by refreshing dashboard during API start/stop to observe skeleton/loading and inline/toast feedback.
