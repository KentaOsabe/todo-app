# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Conversation Guidelines

- 常に日本語で会話する

## Development Commands

### Local Development

- `npm run dev` - Start Vite development server on localhost:5173
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

### Testing

- `npm run test` - Run Vitest unit tests in watch mode
- `npm run test:run` - Run Vitest unit tests once
- `npm run test:ui` - Launch Vitest UI for interactive testing
- `npm run test:e2e` - Run Playwright E2E tests (requires dev server running)
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

### Docker Development

- `docker compose up -d app` - Start containerized development server
- `docker compose --profile test run test` - Run unit tests in container
- `docker compose --profile e2e up` - Run E2E tests in container
- `docker compose down` - Stop all containers

## Architecture Overview

### Technology Stack

- **React 19.1.0** with TypeScript 5.8.2
- **Vite** for build tooling and development server
- **Vitest** for unit testing with jsdom environment
- **Playwright** for E2E testing across Chromium, Firefox, and WebKit
- **ESLint** for code linting

### Project Structure

This is a TDD-developed React Todo application with the following architecture:

#### Component Architecture

- `TodoApp` - Main application component managing global todo state
- `TodoItem` - Individual todo item component with completion and deletion handlers
- State is managed locally in `TodoApp` using React's `useState`
- Props are passed down for todo operations (toggle completion, delete)

#### Type System

- `src/types/todo.ts` defines the core `Todo` interface
- Uses `import type` syntax due to `verbatimModuleSyntax` TypeScript configuration
- All components are strictly typed with proper interfaces

#### Testing Strategy

- **Unit Tests**: Located alongside components (`.test.tsx` files)
- **E2E Tests**: Located in `tests/` directory
- Test files include detailed comments explaining test purpose and goals
- Full coverage of user interactions and edge cases

### Development Environment

#### VSCode Integration

- Launch configurations for debugging React app, tests, and Docker containers
- Chrome debugging support with source maps
- Vitest and Playwright debugging configurations
- Auto-formatting with Prettier and ESLint integration

#### Docker Setup

- Development environment runs on Node.js 22.17.0 Alpine
- Hot reload enabled with volume mounting
- Debug port 9229 exposed for remote debugging
- Separate profiles for testing environments

### Key Implementation Details

#### Type Import Requirements

- This project uses TypeScript's `verbatimModuleSyntax`
- Always use `import type { Todo } from '../types/todo'` for type-only imports
- Regular imports should be used only for runtime values

#### Test Environment

- Vitest configured with jsdom environment for React testing
- `@testing-library/react` and `@testing-library/jest-dom` for component testing
- Playwright E2E tests expect dev server to be running on localhost:5173
- E2E tests include comprehensive scenarios with detailed comments

#### Build Configuration

- Vite handles both development and production builds
- TypeScript compilation happens before Vite build in production
- Source maps enabled for debugging in all environments
