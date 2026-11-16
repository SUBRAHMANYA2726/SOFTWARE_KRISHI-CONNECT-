# KrishiConnect

**A bilingual (English / ಕನ್ನಡ) season-planning web app for farmers in Karnataka.**
Check mandi prices, price a season before sowing, turn a blanket NPK recommendation into
fertilizer quantities, and keep a farmer profile with saved reports.

Built with React 19 + Vite 8, with a Java 21 / Selenium 4 / JUnit 5 test suite covering
equivalence partitioning, boundary value analysis and white-box path testing.

> Academic project for **ISE2501 CA3 — Software Testing**. The application is a web app;
> the QA evidence in [`test-documentation/`](test-documentation/) was produced against the
> same build in this repository.

---

## Table of contents

- [Why KrishiConnect](#why-krishiconnect)
- [Features and routes](#features-and-routes)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Demo mode vs Firebase](#demo-mode-vs-firebase)
- [Quality assurance](#quality-assurance)
- [Running the test suite](#running-the-test-suite)
- [QA documentation](#qa-documentation)
- [Project layout](#project-layout)
- [Troubleshooting](#troubleshooting)
- [Project status and limitations](#project-status-and-limitations)
- [License](#license)

---

## Why KrishiConnect

A farmer deciding what to sow needs four answers in one place:

1. **What is my crop fetching today?** — filter mandi prices by crop, district and market.
2. **Will this season make money?** — profit, loss, margin and break-even price from area,
   yield, selling price and cultivation cost.
3. **How much fertilizer do I actually need?** — convert a per-hectare NPK dose into bags
   of DAP, urea and MOP for the entered land area.
4. **Where is my data?** — a saved profile and saved reports, in English or Kannada.

The app is deliberately usable without a backend: with no Firebase configuration it runs in a
clearly labelled **demo mode** backed by `localStorage`, which makes it easy to demonstrate and
test deterministically.

## Features and routes

| Route | Screen | What it does |
|---|---|---|
| `/` | Landing | Feature overview and entry points |
| `/register` | Register | Create an account; name, email and password validation |
| `/login` | Login | Sign in; session redirect and error messaging |
| `/onboarding` | Onboarding | Farmer profile: name, village, district, taluk, farm area, irrigation, primary crops |
| `/dashboard` | Dashboard | Signed-in overview |
| `/mandi` | Mandi board | Price table with crop, district, market and free-text filters |
| `/calculator/profit` | Profit calculator | Profit / loss / break-even, total yield, revenue, expenditure, margin |
| `/calculator/fertilizer` | Fertilizer calculator | DAP, urea and MOP quantities for six crops and 0.1–100 acres |
| `/reports` | Reports | Saved profit and fertilizer reports |
| `/reports/:reportId` | Report detail | A single saved report |
| `/settings` | Settings | Edit the farmer profile |
| `*` | Not found | Friendly 404 with a route back home |

Highlights:

- **Bilingual UI** — every string is available in English and Kannada.
- **Real calculation rules** — validators are pure modules shared by the forms, the UI tests
  and the white-box tests, so what is tested is what ships.
- **Data ownership** — accounts and reports are scoped to the signed-in user.
- **Accessible form structure** — labels, error text and `data-testid` hooks on every control
  used by the automation suite.
- **No secrets in the repository** — Firebase configuration is read from `.env.local`, which
  is ignored by Git.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19.3, React Router 7.10, Tailwind CSS 3.4 |
| Build | Vite 8.3, PostCSS, Autoprefixer |
| Lint | oxlint |
| Persistence (demo) | Browser `localStorage` via `localAdapter` |
| Persistence (configured) | Firebase 12 Auth + Firestore via `firebaseAdapter` |
| UI tests | Java 21, Selenium 4.27, JUnit 5.11, Maven 3.9, Surefire 3.5 |
| Browser | Microsoft Edge 157 (Chromium); Chrome supported with `-Dbrowser=chrome` |

No application server is required. In demo mode the app is a static bundle plus browser
storage; in Firebase mode the browser talks directly to Firebase.

## Architecture

```
Browser
  └── React app (krishiconnect-build/src)
        ├── pages/            route screens
        ├── components/       forms, fields, dialogs, feedback
        ├── validation/       pure validators (auth, profile, profit, fertilizer, common)
        ├── services/
        │     ├── backend/    localAdapter | firebaseAdapter  ← chosen at startup
        │     ├── mandiService.js     filter + search over sample prices
        │     └── reportService.js    saved reports
        ├── i18n/             English + Kannada dictionaries
        └── dev/testBridge.js development-only automation bridge (never in production)
```

- `src/services/backend/index.js` exposes one interface with two implementations. If the
  `VITE_FIREBASE_*` variables are present, Firebase is used; otherwise the local adapter is
  selected and the UI shows a demo notice.
- Validation lives in `src/validation/` as pure functions returning `{ ok, errors, values }`.
  Forms, the Selenium UI tests and the white-box tests all exercise these same functions.
- Profit and fertilizer results are formatted through `src/utils/format.js`, which uses
  `Intl.NumberFormat('en-IN')` for Indian digit grouping and rupee formatting.

## Getting started

### Prerequisites

| Tool | Version used |
|---|---|
| Node.js | 24.18.1 (Node 20+ works) |
| npm | bundled with Node |
| JDK | 21 (Temurin 21.0.13 used for the suite) |
| Maven | 3.9.11 |
| Browser | Microsoft Edge (Chromium) for the default profile |

### Install and run

```bash
git clone https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-.git
cd SOFTWARE_KRISHI-CONNECT-/krishiconnect-build
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite server is pinned to port **5173** with `strictPort`, so
it fails loudly instead of moving to another port.

### Production build

```bash
cd krishiconnect-build
npm run build      # output in dist/
npm run preview    # serves dist/ on http://localhost:4173
```

`firebase.json` is set up for Firebase Hosting with SPA rewrites and a single-page fallback.
Deployment is a separate, deliberate step (`firebase deploy`) and is not performed by the
test suite.

## Configuration

Copy `krishiconnect-build/.env.example` to `krishiconnect-build/.env.local` and fill in only
what you need. `.env.local` is git-ignored; never commit real values.

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key (public identifier) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_CONTACT_EMAIL` | Contact address shown in the footer |
| `VITE_REPOSITORY_URL` | Repository link shown in the footer |

If the Firebase values are absent, the app runs in demo mode. Firebase security rules and
indexes live in `firestore.rules` and `firestore.indexes.json`.

## Demo mode vs Firebase

| | Demo mode (default) | Firebase mode |
|---|---|---|
| When selected | No `VITE_FIREBASE_*` values | At least the Firebase app config is present |
| Accounts | `localAdapter`, browser `localStorage` | Firebase Authentication |
| Reports and profile | `localStorage` | Firestore |
| Network required | No | Yes |
| Intended use | Development, demos, automated tests | Configured deployments |

Demo mode is explicit and visible in the UI. It is **not** a production data model: anyone
with access to the browser profile can read its storage.

## Quality assurance

The QA work is specification-driven and executed against the real app in a real browser.

| Layer | Technique | Executions |
|---|---|---|
| ECP | Equivalence-class partitioning for registration, login, profile, profit, fertilizer and mandi filters | **92** |
| BVA | Boundary value analysis for every documented numeric and text limit | **139** |
| White-box | Control-flow graphs, cyclomatic complexity, basis paths and decision coverage on the real modules | **55** |
| Smoke | Navigation, server health and page identity | **5** |
| **Total** | | **291** |

The green run recorded for this repository is **291 tests, 0 failures, 0 errors, 0
skipped, BUILD SUCCESS in 06:01 min** (14 November 2026). Execution evidence, per-class
results and the one environment retry are documented in
[`05-Test-Execution-Summary.md`](test-documentation/05-Test-Execution-Summary.md).

Known findings are recorded, not hidden: three Low-severity issues (sub-rupee profit
display, whitespace-only login password, non-enumerated irrigation value) and two
informational notes (dead branches, margin rounding) are in the
[defect report](test-documentation/06-Defect-Report.md). None blocks the tested workflows.

## Running the test suite

Set `JAVA_HOME` and put Maven on `PATH`, then run from the repository root:

```powershell
mvn -B test                     # full suite: 291 tests, ~6 minutes
mvn -B test -Dtest="Ecp*Test"   # 92 equivalence-class tests
mvn -B test -Dtest="Bva*Test"   # 139 boundary-value tests
mvn -B test -Dtest="Wb*Test"    # 55 white-box tests
mvn -B test -Dtest="SmokeTest"  # 5 smoke tests
```

What the framework does:

- starts the Vite dev server on `http://127.0.0.1:5173` if it is not already running, and
  stops it when the suite started it;
- uses one browser session per test class and clears `localStorage` before each case, so
  cases do not depend on execution order;
- waits explicitly on element and bridge readiness — no fixed sleeps;
- writes failure screenshots to `target/evidence/` through `ScreenshotHandler`;
- publishes `.txt` and `TEST-*.xml` Surefire reports in `target/surefire-reports/`.

Useful system properties:

| Property | Default | Purpose |
|---|---|---|
| `-Dbrowser=chrome` | `edge` | Run against Chrome instead of Edge |
| `-Dheadless=false` | `true` | Show the browser window (useful when debugging) |
| `-DbaseUrl=…` | `http://127.0.0.1:5173` | Point the suite at an already-running instance |

The page objects live in `src/test/java/com/krishiconnect/qa/pages/`, test data and flows in
`support/`, and the four test layers in `tests/{ecp,bva,whitebox}` plus `SmokeTest`.

## QA documentation

| # | Document | Contents |
|---|---|---|
| 01 | [Inspection and gap analysis](test-documentation/01-Inspection-and-Gap-Analysis.md) | Repository inspection, validation catalogue, test-ID map, gap analysis |
| 02 | [ECP test cases](test-documentation/02-ECP-TestCases.md) | Equivalence-class tables and 86 case IDs / 92 executions |
| 03 | [BVA test cases](test-documentation/03-BVA-TestCases.md) | Boundary tables and 132 case IDs / 139 executions |
| 04 | [CFG and complexity](test-documentation/04-CFG-and-Complexity.md) | Control-flow graphs, V(G) for 15 units, basis paths, GF(2) checks, decision coverage |
| 05 | [Execution summary](test-documentation/05-Test-Execution-Summary.md) | Environment, suite composition, per-class results, evidence index |
| 06 | [Defect report](test-documentation/06-Defect-Report.md) | DEF-01…05, ENV-01, WD-01, severity and fix verification |
| 07 | [Regression and release readiness](test-documentation/07-Regression-and-Release-Readiness.md) | Quality gates, residual risks R1–R12, release recommendation |

Every case in those documents carries an ID, module, objective, preconditions, input, steps,
expected result, actual result and verdict, and maps to a Surefire result or a named source
line.

## Project layout

```
.
├── krishiconnect-build/            React + Vite application
│   ├── public/                      Static assets
│   └── src/
│       ├── assets/                  Images
│       ├── components/              Shared UI (fields, dialogs, feedback, profile form)
│       ├── config/                  Site metadata and disclaimers
│       ├── context/                 Auth, language and toast providers
│       ├── data/                    Sample mandi prices and crop catalogue
│       ├── dev/                     Development-only white-box bridge
│       ├── hooks/                   Page title and shared hooks
│       ├── i18n/                    English + Kannada translations
│       ├── layouts/                 App shell and auth layout
│       ├── pages/                   Route screens
│       ├── services/                Backend adapters, mandi search, reports
│       ├── utils/                   Formatting and shared helpers
│       └── validation/              Pure validators used by UI and tests
├── src/test/java/com/krishiconnect/qa/
│   ├── core/                        Config, DriverFactory, AppServer, BaseTest
│   ├── pages/                       Page objects
│   ├── support/                     Test data, flows, storage, JS bridge
│   └── tests/                       smoke, ecp, bva and whitebox suites
├── src/test/resources/              JUnit platform configuration
├── test-documentation/              QA design, analysis and reports (01–07)
├── pom.xml                          Maven build for the test suite
├── LICENSE                          License status notice
└── README.md                        This file
```

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Port 5173 is already in use` | Vite runs with `strictPort`. Stop the other server, or let `AppServer` reuse the one already listening on `127.0.0.1:5173`. |
| `Frontend dependencies are missing` | Run `npm install` inside `krishiconnect-build/`. |
| Browser opens but tests cannot find elements | Make sure the app is served from `http://127.0.0.1:5173`; `localhost` and `127.0.0.1` have separate `localStorage` origins. |
| `NoSuchSessionException` mid-class | The browser process exited (observed once with Edge). Re-run the class, then the full suite. Documented as ENV-01. |
| Wrong browser driver | Pass `-Dbrowser=chrome` to use Chrome, or install the matching Edge/Chrome driver. |
| Firebase network errors in tests | The suite expects demo mode. Do not set `VITE_FIREBASE_*` in the environment used for the test run. |
| Firebase configured but app still says demo | Ensure the variables are in `krishiconnect-build/.env.local` (not the repository root) and restart Vite. |

## Project status and limitations

**Suitable for:** coursework evaluation, demos and a controlled pilot in demo mode.

**Not yet production-ready**, because the following were outside the executed test scope:

- Firebase production mode (network paths, session persistence, error mapping);
- browsers other than Chromium/Edge and mobile viewports;
- accessibility (no WCAG audit), performance/load and penetration testing;
- continuous integration — the 291-case suite is currently run manually.

These are treated as residual risks R1–R12 in
[`07-Regression-and-Release-Readiness.md`](test-documentation/07-Regression-and-Release-Readiness.md).

## License

No license has been declared for this repository. See [LICENSE](LICENSE) for the current
status; until a license is added, no permission is granted beyond applicable copyright law.
