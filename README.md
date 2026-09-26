# 📞 Phone Book Web Application

A modern, responsive web application built with **Flask (Python 3)**, **MySQL**, **[Bulma CSS 1.0.2](https://bulma.io/)**, and **[DataTables.net 2.x](https://datatables.net/)**.

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
Edit `.env` inside the project directory:

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=phonebook_db
```

### 2. Activate Virtual Environment & Start Server
The project includes a pre-configured Python virtual environment (`venv`).

```bash
# Activate virtual environment
source venv/bin/activate

# Start the Flask web application
python app.py
```

Or run directly with the virtualenv Python binary:
```bash
venv/bin/python app.py
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

SQL definitions and initial sample seed data can also be viewed in [`setup_db.sql`](./setup_db.sql) and [`sample_data.py`](./sample_data.py).

---

## 🧪 Automated BDD Test Suite (Cucumber + Playwright + TypeScript)

A complete end-to-end BDD automated test suite built with **Cucumber.js**, **Playwright**, and **TypeScript** resides in `features/`.

### Test Coverage (22 Scenarios / 171 Steps — 100% Passing)

- **[`crud.feature`](./features/crud.feature)**:
  - Directory loading and summary stat synchronization.
  - Adding contacts with full details including Date of Birth.
  - Editing contact information and saving changes.
  - **Delete confirmation validation**: Verifies that clicking delete triggers browser confirmation prompt `Are you sure you want to delete contact "..."?`.
  - **Cancel delete prompt**: Verifies that dismissing/canceling the confirmation leaves the contact safely in the directory.
  - **Confirm delete prompt**: Verifies that confirming deletion permanently removes the contact.

- **[`dob_facts.feature`](./features/dob_facts.feature)**:
  - Automatic display of the centered Birthday Insights pop-up on adding contacts with Date of Birth.
  - Verification of web fun facts pulled via API.
  - Interactive "Next Fun Fact" cycling in the pop-up.
  - Astrological star sign verification on new and updated contacts.

- **[`field_validation.feature`](./features/field_validation.feature)**:
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

- **[`responsive.feature`](./features/responsive.feature)**:
  - Viewport resizing to mobile (`500x800`).
  - Verification that essential columns (`Name`, `Phone`, `Actions`) remain visible while secondary columns collapse into the responsive container.
  - Expanding the responsive child container and verifying collapsed field values.
  - Updating contacts directly from responsive viewports.
  - Switching to Card View mode and ensuring all 8 fields are rendered cleanly in multi-column grid cards.

### Running Tests

```bash
# Run all 22 scenarios headless
npm test

# Run tests with visible browser window
npm run test:headed

# Run tests and generate an HTML report
npm run test:report
```

The generated HTML report is available at [`reports/cucumber-report.html`](./reports/cucumber-report.html).
