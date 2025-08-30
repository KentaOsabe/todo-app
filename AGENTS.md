# Repository Guidelines

## Conversation Guidelines
- 常に日本語で会話する

## Project Structure & Module Organization
- `frontend/`: React + TypeScript (Vite). App code in `frontend/src`, unit tests in `frontend/__tests__`, E2E specs in `frontend/__tests__/e2e`, assets in `frontend/public`.
- `backend/`: Ruby on Rails API. App code in `backend/app`, configuration in `backend/config`, tests in `backend/test`.
- Docker & infra: `docker-compose.yml`, `Dockerfile.frontend`, `Dockerfile.backend`, environment in `.env` (see `.env.example`). MySQL data is persisted via the `mysql_data` volume.

## Build, Test, and Development Commands
- Frontend (local):
  - `cd frontend && npm install && npm run dev` — start Vite dev server.
  - `npm run build` — type-check and production build.
  - `npm run test` / `npm run test:run` — Vitest (watch/CI).
  - `npm run test:e2e` — Playwright E2E (requires app running).
- Docker:
  - `docker compose up -d app` — run frontend with backend and MySQL.
  - `docker compose --profile test run --rm test` — run unit tests.
  - `docker compose --profile e2e run --rm e2e` — run E2E tests.
- Backend:
  - `cd backend && bundle install && bin/rails s` — start API (3000; exposed as 3001 in Compose).
  - `bin/rails test` — run Rails (Minitest) suite.

## Coding Style & Naming Conventions
- Frontend: TypeScript, 2-space indent, single quotes, no semicolons (Prettier). Components PascalCase (`src/components/TodoItem.tsx`); hooks camelCase (`useDarkMode.ts`); tests `*.test.ts(x)` in `__tests__`.
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run format` (ESLint flat config + Prettier).
- Backend: RuboCop Rails Omakase; 2-space indent; files snake_case; classes/modules CamelCase.

## Testing Guidelines
- Frontend: Vitest + Testing Library for unit/integration; Playwright for E2E.
- Focus on hooks, pure utils, and critical UI flows; keep E2E scenarios fast and deterministic.
- Backend: keep controller/model tests under `backend/test/**`; prefer small, isolated cases.

## Commit & Pull Request Guidelines
- Conventional Commits as used in history: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- PRs: clear description, linked issues, screenshots for UI changes, test plan (unit/E2E), and note any DB migrations. Update docs when behavior changes.

## Security & Configuration
- Never commit secrets (`.env`, Rails master key). Use `.env.example` and Docker env vars.
- Local MySQL credentials in `docker-compose.yml` are for development only; rotate if exposed.

