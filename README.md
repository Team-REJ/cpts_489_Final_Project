# CougarMarket

A campus marketplace web application for Washington State University students. Built for CPT_S 489 Web Development (Dr. Subu Kandaswamy, WSU Pullman) by Team REJ — Raul Martinez, Edwin, Jaydon.

Students can post items to sell, trade, or give away; browse listings by category; open purchase-request threads with counter-offers and messaging; and get notifications as their requests progress. Moderators review pending listings and flag users; admins manage users and marketplace stats.

## Stack

- **Runtime:** Node.js 18+
- **Server:** Express 4 (server-rendered MVC)
- **Views:** EJS + Bootstrap 5.3 (CDN) + vanilla JS
- **Database:** SQLite via `better-sqlite3` (synchronous)
- **Sessions:** `express-session` + `connect-sqlite3` (persistent)
- **Auth:** `bcryptjs` password hashing (cost 10), `csurf` CSRF protection
- **No ORM, no frontend framework, no build step.**

## Prerequisites

- Node.js **18 or newer** (`node --version`)
- npm (ships with Node)
- A POSIX-ish shell (macOS, Linux, or WSL on Windows). Raw Windows PowerShell works too, but the install step compiles `better-sqlite3` — make sure you have the MSVC build tools or use WSL if you hit native-module errors.

No external services. No Docker. No Postgres. Everything runs from one folder on one machine.

## Setup

```bash
# 1. Clone and enter the repo
git clone https://github.com/Team-REJ/cpts_489_Final_Project cougarmarket
cd cougarmarket

# 2. Install dependencies (this also compiles better-sqlite3)
npm install

# 3. Create your local .env from the template
cp .env.example .env

# 4. Edit .env and replace SESSION_SECRET with a long random string
#    (any value works in development; just don't leave the placeholder)

# 5. Initialize the SQLite database (creates database/cougmarket.sqlite,
#    applies schema, and seeds demo users + sample listings)
npm run db:init
```

That's it. You now have a database with 3 students, 1 moderator, and 1 admin, plus a handful of listings across categories.

## Running the app

```bash
# Development (auto-reloads on file changes)
npm run dev

# Production-style (no auto-reload)
npm start
```

Then open <http://localhost:3000> in your browser.

The port is controlled by `PORT` in `.env` (defaults to 3000).

## Seed accounts

All seeded accounts use the password **`password123`**.

| Email | Role |
| --- | --- |
| `student1@wsu.edu` | student |
| `student2@wsu.edu` | student |
| `student3@wsu.edu` | student |
| `mod@wsu.edu` | moderator |
| `admin@wsu.edu` | admin |

You can also self-register at `/register` with any `@wsu.edu` email — the app enforces the WSU domain and creates student-role accounts.

## npm scripts

| Command | What it does |
| --- | --- |
| `npm start` | Boot the server on `$PORT` |
| `npm run dev` | Boot with nodemon (auto-reload on file changes) |
| `npm run db:init` | Apply schema and seed demo data. If the DB file already exists, tables are dropped and recreated in place. |
| `npm run db:reset` | Delete the SQLite file entirely and recreate it from scratch |

If you want a totally clean slate (including sessions), delete `database/sessions.sqlite` too before starting the server.

## Project layout

```text
cougarmarket/
├── server.js                    Entry point; wires middleware + routes
├── config/
│   ├── db.js                    better-sqlite3 singleton (FKs on, WAL)
│   ├── session.js               express-session + connect-sqlite3 store
│   └── constants.js             Enums (roles, statuses, types, bcrypt cost)
├── app/
│   ├── controllers/             Route handlers (auth, listings, requests, …)
│   ├── models/                  Data-access classes (one per table)
│   ├── routes/
│   │   ├── web/                 Server-rendered page routes
│   │   └── api/                 JSON endpoints (notifications, search, …)
│   └── views/
│       ├── partials/            head, navbar, footer, alerts, sidebars
│       └── *.ejs                Page templates
├── middleware/                  attachUser, auth, roles, csrf, errorHandler
├── utils/
│   └── password.js              bcryptjs hash/compare wrappers
├── database/
│   ├── schema.sql               Frozen 7-table schema
│   ├── seed.sql                 Supplementary seed SQL
│   ├── init.js                  Runs schema + bcrypt-hashes demo users
│   ├── cougmarket.sqlite        (gitignored — app data)
│   └── sessions.sqlite          (gitignored — session store)
├── public/
│   ├── css/styles.css
│   ├── js/                      Client-side enhancements (no framework)
│   └── images/
└── .env.example                 Copy to .env and edit
```

## Troubleshooting

**`Error: Cannot find module 'better-sqlite3'`** — run `npm install`.

**Server boots but every page is a 500 / `DB_PATH` error** — you forgot `npm run db:init`. The app deliberately refuses to auto-create the database on first boot; you have to run the init script explicitly.

**`EBADCSRFTOKEN` errors in the console** — you submitted a form without the `_csrf` hidden input, or your session expired. Refresh the page and try again. Every form in the app already includes the token; this only trips custom curl/Postman calls.

**Login redirects back to `/login` with no error** — double-check you used one of the seed emails + `password123`, or that the account you self-registered with an `@wsu.edu` address.

**Port 3000 already in use** — set a different `PORT` in `.env` (e.g. `PORT=3001`) or free the port: `lsof -ti :3000 | xargs kill`.

**Tests failing after a schema change** — re-run `npm run db:reset` to wipe and rebuild the SQLite file.

## Security notes

- Passwords are bcrypt-hashed at cost 10; we never store plaintext.
- CSRF tokens are required on every state-changing request (csurf, session-backed).
- Session cookies are `httpOnly` and `sameSite=lax`; set `NODE_ENV=production` to flip the `secure` flag on.
- Stack traces are never leaked to the browser — uncaught errors render `error.ejs` with a short message and are logged server-side via `console.error`.
- Role guards (`requireAuth`, `requireStaff`, `requireAdmin`) are enforced at the route level, not just in views.

## License

Academic project — CPT_S 489 Final, WSU Pullman, Spring 2026. Not licensed for reuse outside the course.

