# 📞 Phone Book Web Application

A modern, responsive web application built with **Flask (Python 3)**, **MySQL**, **[Bulma CSS 1.0.2](https://bulma.io/)**, and **[DataTables.net 2.x](https://datatables.net/)**, with a modular **Playwright + Cucumber BDD** automated test suite.

---

## 📁 Project Directory Structure

```text
phonebook/
├── playwright/                  # BDD Automated Test Suite (Playwright + TypeScript + Cucumber)
│   ├── features/                # Gherkin .feature files grouped by domain/module
│   │   ├── contacts/            # CRUD, validation, and responsive features
│   │   │   ├── crud.feature
│   │   │   ├── field_validation.feature
│   │   │   └── responsive.feature
│   │   └── birthday-insights/   # Birthday discovery & web facts feature
│   │       └── dob_facts.feature
│   ├── step-definitions/        # Step implementation files mapping to features
│   │   ├── crud.steps.ts
│   │   ├── dob_facts.steps.ts
│   │   ├── field_validation.steps.ts
│   │   └── responsive.steps.ts
│   ├── pages/                   # Page Object Model (POM) classes
│   │   ├── base.page.ts         # Shared base page object
│   │   ├── phone-book.page.ts   # Main directory & table page object
│   │   ├── add-contact-modal.page.ts # Add contact modal page object
│   │   ├── edit-contact-modal.page.ts # Edit contact modal page object
│   │   └── index.ts             # Barrel exports
│   ├── fixtures/                # Custom Playwright test and BDD fixtures
│   │   └── bdd-fixtures.ts
│   ├── support/                 # Global setup, teardown, and cucumber hooks
│   │   ├── hooks.ts
│   │   └── world.ts
│   ├── utils/                   # Reusable helper functions and API clients
│   │   └── api-helper.ts
│   ├── test-data/               # Test input data fixtures
│   │   └── contacts.json
│   ├── playwright.config.ts     # Playwright configuration file
│   ├── cucumber.js              # Cucumber configuration file
│   ├── cucumber.json            # Cucumber JSON configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── package.json             # Test dependencies and scripts
│
├── python/                      # Server-Side Application & REST API
│   ├── app.py                   # Flask REST API and web server
│   ├── db.py                    # MySQL connection management, schema initialization and migrations
│   ├── dob_facts.py             # Live Wikipedia facts engine & astrological star signs
│   ├── sample_data.py           # Initial seed contact dataset
│   ├── setup_db.sql             # MySQL database schema and seed data
│   ├── requirements.txt         # Python package dependencies
│   ├── .env.example             # Environment configuration template
│   ├── static/                  # Static assets
│   │   └── style.css            # Custom Bulma styling, card view grid, and animations
│   └── templates/               # Jinja2 HTML templates
│       └── index.html           # Bulma UI, DataTables markup, and modals
│
├── package.json                 # Root convenience scripts delegating to playwright/
├── .gitignore                   # Excludes venv, .env, node_modules, reports, caches
└── README.md                    # Project documentation
```

---

## ✨ Features

### 🎨 Bulma CSS Modern UI
- Clean, accessible interface styled with **Bulma CSS (v1.0.2)** and official DataTables Bulma integration.
- Custom stat boxes for contact category totals (*Work*, *Family*, *Friends & Others*) with hover micro-interactions.
- Accessible color contrast, responsive navbar, and smooth modal overlays.

### 🎂 Centered Birthday Insights Pop-up
When a contact is added or edited with a **Date of Birth**, a modal pop-up immediately appears in the center of the screen featuring:
1. **Live Fun Facts from the Web**: Automatically discovers interesting historical events and milestones that occurred on that date via Wikipedia's "On This Day" REST API (`/feed/onthisday/selected/{MM}/{DD}`) with offline fallback.
2. **Next Fun Fact Button**: Dynamically cycles through multiple interesting historical facts on that day without reloading the page.
3. **Astrological Star Sign Facts**: Calculates the astrological sign, symbol (♈, ♉, ♊, etc.), date range, and personality traits.

### 📅 Date of Birth Field & Validation
- Persisted in MySQL as `date_of_birth DATE NULL`.
- Fully integrated across modals (Add Contact & Edit Contact), directory table columns, child row responsive containers, and card view modes.
- Robust validation: Enforces mandatory fields (`first_name`, `last_name`, `phone_number`), validates email format, allows optional fields (`email`, `date_of_birth`, `notes`), and validates `YYYY-MM-DD` date inputs.

### ⚡ Advanced DataTables.net Features
- **SearchPanes**: Collapsible category filter section with dynamic record counts and cascading filters.
- **Card View vs Table View**: Toggle seamlessly between standard tabular layout and a responsive multi-column CSS grid card view.
- **Responsive Layout**: On mobile and narrow viewports (`< 768px`), non-essential columns gracefully collapse into an expandable child row container (`.dtr-control`), with full editing capabilities preserved.
- **Export Capabilities**: Export directory data directly to **CSV**, **Excel**, **PDF**, **Print**, or copy to **Clipboard**.
- **Real-Time Search & Sorting**: Instant multi-field searching with debouncing and column sorting.

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
# Using the virtual environment
venv/bin/python python/app.py
```

Or from the `python/` directory:
```bash
cd python
../venv/bin/python app.py
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

## 🧪 Automated BDD Test Suite (Cucumber + Playwright + TypeScript)

A complete end-to-end BDD automated test suite built with **Cucumber.js**, **Playwright**, and **TypeScript** resides in `playwright/`.

### Test Coverage (22 Scenarios / 171 Steps — 100% Passing)

- **[`playwright/features/contacts/crud.feature`](./playwright/features/contacts/crud.feature)**:
  - Directory loading and summary stat synchronization.
  - Adding contacts with full details including Date of Birth.
  - Editing contact information and saving changes.
  - **Delete confirmation validation**: Verifies browser confirmation prompt `'Are you sure you want to delete contact "..."?'`.
  - **Cancel delete prompt**: Verifies that canceling leaves the contact safely in the directory.
  - **Confirm delete prompt**: Verifies that confirming deletion permanently removes the contact.

- **[`playwright/features/birthday-insights/dob_facts.feature`](./playwright/features/birthday-insights/dob_facts.feature)**:
  - Automatic display of the centered Birthday Insights pop-up on adding contacts with Date of Birth.
  - Verification of web fun facts pulled via API.
  - Interactive "Next Fun Fact" cycling in the pop-up.
  - Astrological star sign verification on new and updated contacts.

- **[`playwright/features/contacts/field_validation.feature`](./playwright/features/contacts/field_validation.feature)**:
  - Header column verification (`#`, `Name`, `Phone Number`, `Email`, `Date of Birth`, `Category`, `Notes`, `Actions`).
  - Add & Edit modal input fields and Category options verification.
  - Pre-population verification on editing existing records.
  - **First Name validation**: Form validation blocks submission when First Name is missing and keeps modal open.
  - **Last Name validation**: Form validation blocks submission when Last Name is missing and keeps modal open.
  - **Phone Number validation**: Form validation blocks submission when Phone Number is missing and keeps modal open.
  - **Email format validation**: Form validates email format when provided.
  - **Optional fields validation**: Verifies that optional fields (`email`, `date_of_birth`, `notes`) can be omitted.
  - **Edit form validation**: Prevents saving edits when required fields are cleared.
  - **Backend API validation**: Enforces HTTP 400 Bad Request error when required fields are missing on `POST /api/contacts`.
  - **Date of Birth query validation**: Enforces HTTP 400 Bad Request for missing or malformed `dob` parameter on `/api/dob-facts`.

- **[`playwright/features/contacts/responsive.feature`](./playwright/features/contacts/responsive.feature)**:
  - Viewport resizing to mobile (`500x800`).
  - Verification that essential columns (`Name`, `Phone`, `Actions`) remain visible while secondary columns collapse into the responsive container.
  - Expanding the responsive child container and verifying collapsed field values.
  - Updating contacts directly from responsive viewports.
  - Switching to Card View mode and ensuring all 8 fields are rendered cleanly in multi-column grid cards.

### Running Tests

You can run tests directly from the project root or from inside `playwright/`:

```bash
# Run all 22 scenarios headless (from root)
npm test

# Run tests with visible browser window (from root)
npm run test:headed

# Run tests and generate an HTML report (from root)
npm run test:report

# Or run directly from playwright/ directory
cd playwright
npm test
npm run test:report
```

The generated HTML report is available at [`playwright/reports/cucumber-report.html`](./playwright/reports/cucumber-report.html).
