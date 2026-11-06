# BabyLog Web

BabyLog Web is a CS361 class project that helps caregivers record and review bottle feeds. Sprint 1 includes account creation, login/logout, bottle logging and editing, a daily summary, and a date-based timeline.

## Technologies

- JavaScript and React
- Vite
- Node.js and Express
- SQLite
- express-session
- HTML and CSS

## Features

- Create an account and log in or out.
- Record the date, time, breast milk amount, formula amount, and an optional note.
- Calculate the total bottle amount automatically.
- View the latest bottle and today's bottle count and total on Home.
- View bottle feeds in reverse chronological order on Timeline.
- Choose a date using the date picker or previous/next-day buttons.
- Open More / Edit to review and update a saved bottle.
- Cancel a form without saving changes.
- Keep each user's records separate.

## Requirements

- Node.js 24 and npm. The project was developed using Node.js 24.21.0.
- A web browser.

SQLite is included with Node.js. No separate database server or Firebase setup is needed.

## Project Structure

```text
BabyLog-Web/
├── backend-rest/
│   ├── controllers/
│   ├── models/
│   ├── database.mjs
│   ├── server.mjs
│   └── package.json
├── frontend-react/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

## Running the Application

Open two terminals in the project root.

In the first terminal, start the backend:

```bash
cd backend-rest
npm install
node server.mjs
```

The backend runs at `http://localhost:3000`. It creates `backend-rest/babylog.db` and its tables automatically on first startup.

In the second terminal, start the frontend:

```bash
cd frontend-react
npm install
npm run dev
```

Open the Local address printed by Vite, usually `http://localhost:5173`.

Keep both terminals running. Create a new account through the application, then select **Log Bottle** to add your first record. The database starts empty; no preconfigured account is required.

Vite forwards `/api` requests to the backend on port 3000. Restart the backend after changing its code.

## Data Storage

The local SQLite database has two tables: `users` and `bottle_feeds`. Passwords are hashed with a salt. Bottle records belong to the signed-in user, and backend queries restrict access to that user's records.

Amounts are entered and displayed in ounces but stored in milliliters. Dates are stored as UTC ISO strings and displayed in the browser's local time.

Accounts and bottles remain saved after restarting the backend. Login sessions are stored in memory, so users must log in again after a backend restart.

The database and `node_modules` folders should not be committed to Git. Use fictional data for demonstrations.

## Code Checks

Run these commands from `frontend-react`:

```bash
npm run lint
npm run build
```

## Sprint 1 Checks

- Create an account, log out, and log back in.
- Confirm an incorrect password is rejected.
- Save breast milk, formula, and combo bottles.
- Check the Home summary and newest-first Timeline.
- Select earlier dates and open More / Edit.
- Save an edit and confirm Cancel leaves a record unchanged.
- Confirm two accounts cannot see each other's records.
- Restart the backend and confirm records remain after logging in again.
- Check Timeline responsiveness using 100 synthetic records for one day.

## Current Scope

This milestone focuses on bottle feeding. Baby profiles, other activity types, and team microservices are planned for later sprints.
