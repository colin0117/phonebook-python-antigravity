# 📞 Phone Book Web Application

A modern, responsive web application built with **Flask (Python 3)**, **MySQL**, **[Bulma CSS 1.0.2](https://bulma.io/)**, and **[DataTables.net 2.x](https://datatables.net/)**, with a modular **Playwright + Cucumber BDD** automated test suite.

---

## 📸 Application Screenshots

### 📇 Main Contacts Directory Screen
*Interactive DataTables with Bulma styling, side-by-side Category SearchPanes and Custom SearchBuilder, multi-format export buttons, summary stat cards, and instant search.*

![Main Contacts Directory Screen](./docs/screenshots/main-directory.png)

### 🎂 Centered Birthday Insights Pop-up Modal
*Triggered automatically upon adding or editing contacts with a Date of Birth, featuring live web historical facts and astrological star signs.*

![Birthday Insights Modal](./docs/screenshots/birthday-insights.png)

---

## ✨ Features

### 🎨 Bulma CSS Modern UI & Header Summary Bar
- Clean, accessible interface styled with **Bulma CSS (v1.0.2)** and official DataTables Bulma integration.
- Live header summary stat cards for **Total Contacts**, **Work**, **Family**, and **Friends & Others** that automatically update as contacts are added, recategorized, or deleted.
- Accessible color contrast, responsive navbar, and smooth modal overlays.

### 🎂 Centered Birthday Insights Pop-up
When a contact is added or edited with a **Date of Birth**, a modal pop-up immediately appears in the center of the screen featuring:
1. **Live Fun Facts from the Web**: Automatically discovers interesting historical events and milestones that occurred on that date via Wikipedia's "On This Day" REST API (`/feed/onthisday/selected/{MM}/{DD}`) with offline fallback.
2. **Next Fun Fact Button**: Dynamically cycles through multiple interesting historical facts on that day without reloading the page.
3. **Astrological Star Sign Facts**: Calculates the astrological sign, symbol (♈, ♉, ♊, etc.), date range, and personality traits.

### 📅 Date of Birth Field & Validation
- Persisted in MySQL as `date_of_birth DATE NULL`.
- Fully integrated across modals (Add Contact & Edit Contact), directory table columns, child row responsive containers, and card view modes.
- Robust validation: Enforces mandatory fields (`first_name`, `last_name`, `phone_number`), validates email format, enforces field length limits, allows optional fields (`email`, `date_of_birth`, `notes`), and validates `YYYY-MM-DD` calendar dates.

### ⚡ Advanced DataTables.net Features
- **Side-by-Side SearchPanes & SearchBuilder**: Combines one-click category filtering (**SearchPanes** via `top1Start`) with multi-condition custom queries (**SearchBuilder** + **DateTime** via `top1End`) in a single responsive layout row, each with its own toolbar toggle button.
- **Card View vs Table View**: Toggle seamlessly between standard tabular layout and a responsive multi-column CSS grid card view.
- **Responsive Layout**: On mobile and narrow viewports (`< 768px`), non-essential columns gracefully collapse into an expandable child row container (`.dtr-control`), with full editing capabilities preserved.
- **Export Capabilities**: Export directory data directly to **CSV**, **Excel**, **PDF**, **Print**, or copy to **Clipboard**.
- **Real-Time Search & Sorting**: Instant multi-field searching and column sorting.

### 🔌 RESTful API
- `GET /api/contacts`: Retrieve all contacts.
- `POST /api/contacts`: Create a new contact (validates required fields, returns contact ID, `dob_fact`, and `dob_details`).
- `PUT /api/contacts/<id>`: Update an existing contact (validates required fields, returns updated `dob_details`).
- `DELETE /api/contacts/<id>`: Delete an existing contact.
- `GET /api/dob-facts?dob=YYYY-MM-DD`: Retrieve live Wikipedia events and star sign insights for any date (validates date format).

---

## 🚀 Quick Start

### 1. Configure MySQL Credentials
Edit `python/.env` (copy from `python/.env.example` if needed):

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=phonebook_db
PORT=5000
FLASK_DEBUG=1
```

### 2. Activate Virtual Environment & Start Server

From the project root:
```bash
venv/bin/python python/app.py
```

### 3. Open in Browser
Visit **[http://localhost:5000](http://localhost:5000)** in your web browser.

---

## 🗄️ Database Architecture

The application automatically verifies and initializes the database schema and seeds initial sample records on startup:

```sql
CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150),
    `date_of_birth` DATE NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

SQL definitions and initial sample seed data are located in [`python/setup_db.sql`](./python/setup_db.sql) and [`python/sample_data.py`](./python/sample_data.py).

---

## 🧪 Automated Test Suites

The project includes two complementary automated testing suites under `playwright/`:
1. **Playwright REST API & Concurrency Suite** (Fast HTTP-level integration, contract, validation, security/boundary, and 10-user concurrency tests).
2. **Cucumber BDD End-to-End Suite** (Browser automation testing Bulma UI, DataTables, modals, summary stats, and responsive views).

### 1. REST API & Concurrency Test Suite (Playwright Test)

Located in [`playwright/tests/api/`](./playwright/tests/api/):

- **[`contacts-crud.spec.ts`](./playwright/tests/api/contacts-crud.spec.ts)**: Full `GET`, `POST`, `PUT`, and `DELETE` lifecycle verification on `/api/contacts`.
- **[`contacts-validation.spec.ts`](./playwright/tests/api/contacts-validation.spec.ts)**: Mandatory field checks, empty/whitespace rejection (`400`), optional field defaults, and non-existent ID handling (`404`).
- **[`dob-facts.spec.ts`](./playwright/tests/api/dob-facts.spec.ts)**: Star sign calculation, astrological symbols/traits, historical facts, and invalid date rejection (`400`) on `/api/dob-facts`.
- **[`contacts-security-boundary.spec.ts`](./playwright/tests/api/contacts-security-boundary.spec.ts)**: Calendar date validation (`2025-02-31`), `VARCHAR(100)` boundary enforcement, parameterized SQL injection defense, Unicode/`utf8mb4` fidelity, and safe script tag handling.
- **[`concurrency-perf.spec.ts`](./playwright/tests/api/concurrency-perf.spec.ts)**: 10 concurrent readers, 10 concurrent writers, 10 parallel full CRUD user lifecycles, and P95/average latency SLA checks.

### 2. Browser E2E BDD Suite (Cucumber + Playwright)

Located in [`playwright/features/`](./playwright/features/):

- **[`crud.feature`](./playwright/features/contacts/crud.feature)**: Directory loading, adding/editing contacts, and delete confirmation dialog handling.
- **[`summary_stats.feature`](./playwright/features/contacts/summary_stats.feature)**: Header summary bar totals and category breakdown cards (`Total Contacts`, `Work`, `Family`, `Friends & Others`) across create, category-change, and delete flows.
- **[`search_builder.feature`](./playwright/features/contacts/search_builder.feature)**: Side-by-side **SearchPanes** and **SearchBuilder** layout, toolbar toggling, custom query conditions, and combined filtering.
- **[`dob_facts.feature`](./playwright/features/birthday-insights/dob_facts.feature)**: Centered Birthday Insights modal display, web facts cycling, and star signs.
- **[`field_validation.feature`](./playwright/features/contacts/field_validation.feature)**: UI modal form validation, column headers, and pre-populated edit fields.
- **[`responsive.feature`](./playwright/features/contacts/responsive.feature)**: Mobile responsive collapsing child rows (`500x800`) and CSS grid Card View.

---

### 🚀 Running the Tests

You can run tests directly from the project root:

```bash
# Run BOTH suites (API tests + Cucumber E2E tests)
npm test

# Run ONLY the fast Playwright API & Concurrency tests (~2 seconds)
npm run test:api

# Run ONLY the Cucumber browser BDD suite
npm run test:e2e

# Run browser tests with a visible browser window
npm run test:headed

# Run a single Cucumber feature file
npx cucumber-js playwright/features/contacts/summary_stats.feature

# Run Cucumber scenarios matching a specific tag (e.g. @colin)
npx cucumber-js --tags @colin

# Combine tags with boolean expressions
npx cucumber-js --tags "@smoke and not @wip"

# Generate & view HTML reports
npm run test:report         # Cucumber HTML report
```

#### Pausing a BDD Test for Manual Inspection
Add the step `And the tests are paused for manual verification` anywhere in a `.feature` scenario to pause execution at that step. Running `npx cucumber-js` will automatically launch a headed browser and open the **Playwright Inspector** so you can inspect the live DOM and click **Resume** (`F8`) when finished.
