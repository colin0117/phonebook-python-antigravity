# Phone Book Directory — Agent Guidelines (`AGENTS.md`)

## Project Overview
This repository contains a **Phone Book Directory** web application and its automated testing suites:
- **Backend (`python/`)**: Python 3 + Flask REST API (`python/app.py`, including duplicate contact detection at `/api/contacts/duplicates`), MySQL database layer (`python/db.py`), and Date of Birth historical facts & star sign engine (`python/dob_facts.py`).
- **Frontend (`python/templates/index.html`, `python/static/style.css`)**: Bulma CSS 1.0.2 UI with DataTables 2.1.8 (inline cell editing alongside the Edit modal form, duplicate contact flagging & review modal, SearchPanes + SearchBuilder side-by-side layout, Responsive child rows, Buttons export, and Table/Card view switcher).
- **Automated Tests (`playwright/`)**:
  1. **Playwright REST API & Concurrency Suite (`playwright/tests/api/`)**: Fast HTTP-level contract, validation, security/boundary, and 10-user concurrency tests.
  2. **Cucumber BDD End-to-End Suite (`playwright/features/`, `playwright/step-definitions/`, `playwright/pages/`)**: Browser UI tests following the Page Object Model (POM).

---

## Architecture & Coding Conventions

### 1. Cucumber BDD & VS Code "Go to Definition" Compatibility
- **Feature Headers**: Keep `Feature: <Title>` on a single line at the top of `.feature` files with **no** multi-line `As a... / I want... / So that...` narrative block underneath. The `alexkrechik.cucumberautocomplete` VS Code extension parses unindented narrative lines as undefined steps and breaks "Go to Definition".
- **Step Organization**:
  - Put cross-cutting steps (API fixture creation, navigation, directory search, manual pause) in `playwright/step-definitions/common.steps.ts`.
  - Keep domain-specific steps in their corresponding files (`crud.steps.ts`, `dob_facts.steps.ts`, `field_validation.steps.ts`, `responsive.steps.ts`, `summary_stats.steps.ts`, `search_builder.steps.ts`).
- **Playwright Subfolder Execution**: All Node dependencies, Playwright configuration, and Cucumber configuration live exclusively inside `playwright/` (`playwright/package.json`, `playwright/cucumber.js`, `playwright/tsconfig.json`).
- **Manual Verification Step**: Use `And the tests are paused for manual verification` in any scenario to pause Playwright (`page.pause()`) with no step timeout (`{ timeout: -1 }`). The `Before` hook in `playwright/support/hooks.ts` automatically launches Chromium in headed mode whenever a scenario includes this step.

### 2. Test Isolation & Fixture Cleanup
- Every BDD scenario and API test must be self-contained and order-agnostic.
- The `After` hook in `playwright/support/hooks.ts` automatically deletes contacts whose `last_name` contains `Test`, `Create`, `Update`, `Delete`, or `Del`. Always include one of these suffixes (e.g., `Hopper-WorkTest`, `Lovelace-Create`) in test contact last names so test data is cleaned up automatically.

### 3. Page Object Model (POM)
- Keep all DOM selectors and UI interactions encapsulated inside `playwright/pages/` (`PhoneBookPage`, `AddContactModal`, `EditContactModal`).
- Use condition-driven waits (`waitFor`, Playwright web-first assertions) and never use arbitrary `waitForTimeout` sleeps in tests.

### 4. Documentation & Rule Maintenance (Always Keep Current)
- Whenever you add, rename, or remove application features, API endpoints, test suites (`.feature` or `.spec.ts` files), or project conventions, **proactively update both `README.md` and `AGENTS.md` in the same turn** without waiting for the user to ask.
- Whenever you make visible UI changes to the main directory screen or Birthday Insights modal, regenerate `docs/screenshots/main-directory.png` and `docs/screenshots/birthday-insights.png` from `playwright/` using `npx ts-node scripts/capture-screenshots.ts`.

---

## Common Commands

### Running the Application Server
```bash
venv/bin/python python/app.py
```
The server runs on `http://127.0.0.1:5000` and reads MySQL credentials from `python/.env`.
*(If `venv` becomes stale after a system Python upgrade, rebuild it with `python3 -m venv --system-site-packages --without-pip venv && venv/bin/python -m pip install -r python/requirements.txt`.)*

### Running Tests (from `playwright/`)
All Node and test commands run inside the `playwright/` directory. Always execute `npx cucumber-js` as a standalone command without shell chaining (`&&`, `;`) or pipe characters (`|`) in arguments so it matches the IDE auto-run allowlist without prompting for confirmation.
```bash
# Run all tests (API + Cucumber BDD)
npm test

# Run fast Playwright REST API & concurrency tests
npm run test:api

# Run all Cucumber BDD browser tests
npx cucumber-js

# Run a specific Cucumber feature file
npx cucumber-js features/contacts/summary_stats.feature

# Run Cucumber scenarios matching a specific tag
npx cucumber-js --tags @colin

# Validate step definitions without launching a browser
npx cucumber-js --dry-run
```

### Updating Documentation Screenshots (from `playwright/`)
With the Flask server running on `http://127.0.0.1:5000`:
```bash
npx ts-node scripts/capture-screenshots.ts
```
This regenerates `docs/screenshots/main-directory.png` and `docs/screenshots/birthday-insights.png`.
