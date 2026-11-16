# KrishiConnect

A bilingual (English and Kannada) season-planning web application for farmers in Karnataka.
KrishiConnect brings mandi prices, profit planning, fertilizer calculations and farmer records
into a single interface.

The application is built with React 19 and Vite 8. The
[`student2`](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/tree/student2) branch
adds the Java 21 / Selenium 4 / JUnit 5 test suite and the supporting QA documentation.

> Academic project for **ISE2501 CA3 - Software Testing**. The application in this branch is the
> build under test; the QA evidence is maintained on the
> [`student2`](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/tree/student2) branch.

---

## Table of contents

- [Overview](#overview)
- [Features and routes](#features-and-routes)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Demo mode and Firebase mode](#demo-mode-and-firebase-mode)
- [Quality assurance](#quality-assurance)
- [Running the test suite](#running-the-test-suite)
- [QA documentation](#qa-documentation)
- [Project layout](#project-layout)
- [Troubleshooting](#troubleshooting)
- [Project status and limitations](#project-status-and-limitations)
- [License](#license)

---

## Overview

A farmer planning a season needs four answers in one place:

1. **Today's mandi prices.** Filter prices by crop, district and market.
2. **Season profitability.** Calculate profit, loss, margin and break-even price from land area,
   yield, selling price and cultivation cost.
3. **Fertilizer quantities.** Convert a per-hectare NPK recommendation into quantities of DAP,
   urea and MOP for the entered land area.
4. **Farmer records.** Keep a farmer profile and saved reports, in English or Kannada.

The application can run without a backend. When Firebase is not configured, it starts in a
clearly labelled demo mode backed by browser `localStorage`. This keeps demonstrations and
automated tests deterministic.

## Features and routes

| Route | Screen | Purpose |
|---|---|---|
| `/` | Landing | Feature overview and entry points |
| `/register` | Register | Account creation with name, email and password validation |
| `/login` | Login | Sign-in, session redirect and error reporting |
| `/onboarding` | Onboarding | Farmer profile: name, village, district, taluk, farm area, irrigation and primary crops |
| `/dashboard` | Dashboard | Signed-in overview |
| `/mandi` | Mandi board | Price table with crop, district, market and free-text filters |
| `/calculator/profit` | Profit calculator | Profit, loss and break-even results with total yield, revenue, expenditure and margin |
| `/calculator/fertilizer` | Fertilizer calculator | DAP, urea and MOP quantities for six crops and 0.1 to 100 acres |
| `/reports` | Reports | Saved profit and fertilizer reports |
| `/reports/:reportId` | Report detail | A single saved report |
| `/settings` | Settings | Edit the farmer profile |
| `*` | Not found | 404 page with a route back to the home page |

Key characteristics:

- **Bilingual interface.** Every user-facing string is available in English and Kannada.
- **Shared validation rules.** Pure validator modules are used by the forms, the UI tests and the
  white-box tests, so the tested behaviour is the shipped behaviour.
- **User-scoped data.** Accounts, profiles and reports are scoped to the signed-in user.
- **Accessible form structure.** Controls have labels, error text and stable `data-testid` hooks
  for automation.
- **No committed secrets.** Firebase configuration is read from `.env.local`, which is ignored by
  Git.

## Technology stack

| Layer | Technology |
|---|---|
| User interface | React 19.3, React Router 7.10, Tailwind CSS 3.4 |
| Build | Vite 8.3, PostCSS, Autoprefixer |
| Linting | oxlint |
| Persistence (demo) | Browser `localStorage` through `localAdapter` |
| Persistence (configured) | Firebase 12 Authentication and Firestore through `firebaseAdapter` |
| UI tests (`student2` branch) | Java 21, Selenium 4.27, JUnit 5.11, Maven 3.9, Surefire 3.5 |
| Browser | Microsoft Edge 157 (Chromium); Chrome is supported with `-Dbrowser=chrome` |

The application does not require an application server. In demo mode it is a static bundle with
browser storage. In Firebase mode the browser communicates directly with Firebase.

## Architecture

```
Browser
  -> React application (krishiconnect-build/src)
       -> pages/            route screens
       -> components/       forms, fields, dialogs and feedback
       -> validation/       pure validators (auth, profile, profit, fertilizer, common)
       -> services/
            -> backend/     localAdapter or firebaseAdapter (selected at startup)
            -> mandiService.js    filtering and search over sample prices
            -> reportService.js   saved reports
       -> i18n/             English and Kannada dictionaries
```

- `src/services/backend/index.js` exposes one interface with two implementations. When the
  `VITE_FIREBASE_*` variables are present, Firebase is used. Otherwise the local adapter is
  selected and the interface displays a demo notice.
- Validation lives in `src/validation/` as pure functions returning `{ ok, errors, values }`.
  Forms, Selenium UI tests and white-box tests exercise the same functions.
- Profit and fertilizer results are formatted through `src/utils/format.js`, which uses
  `Intl.NumberFormat('en-IN')` for Indian digit grouping and rupee formatting.
- The development-only automation bridge (`src/dev/testBridge.js`) exists only on the `student2`
  branch and is excluded from production builds.

## Getting started

### Prerequisites

| Tool | Version used |
|---|---|
| Node.js | 24.18.1 (Node 20 or later is supported) |
| npm | Bundled with Node.js |
| JDK | 21 (Temurin 21.0.13 used for the test suite) |
| Maven | 3.9.11 |
| Browser | Microsoft Edge (Chromium) for the default test profile |

### Install and run

```bash
git clone https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-.git
cd SOFTWARE_KRISHI-CONNECT-/krishiconnect-build
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite server is pinned to port 5173 with `strictPort`, so it
fails with a clear message instead of silently selecting another port.

### Production build

```bash
cd krishiconnect-build
npm run build      # output in dist/
npm run preview    # serves dist/ on http://localhost:4173
```

`firebase.json` is configured for Firebase Hosting with single-page application rewrites.
Deployment is a separate, deliberate step (`firebase deploy`) and is not performed by the test
suite.

## Configuration

Copy `krishiconnect-build/.env.example` to `krishiconnect-build/.env.local` and provide only the
values that are required. `.env.local` is ignored by Git; real values must never be committed.

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key (public identifier) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender identifier |
| `VITE_FIREBASE_APP_ID` | Firebase application identifier |
| `VITE_CONTACT_EMAIL` | Contact address displayed in the footer |
| `VITE_REPOSITORY_URL` | Repository link displayed in the footer |

If the Firebase values are absent, the application runs in demo mode. Firebase security rules and
indexes are maintained in `firestore.rules` and `firestore.indexes.json`.

## Demo mode and Firebase mode

| | Demo mode (default) | Firebase mode |
|---|---|---|
| Selection | No `VITE_FIREBASE_*` values | Firebase application configuration present |
| Accounts | `localAdapter`, browser `localStorage` | Firebase Authentication |
| Profile and reports | `localStorage` | Firestore |
| Network required | No | Yes |
| Intended use | Development, demonstrations, automated tests | Configured deployments |

Demo mode is explicit and visible in the interface. It is not a production data model: anyone
with access to the browser profile can read its storage.

## Quality assurance

The QA work is maintained on the
[`student2`](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/tree/student2) branch.
It is specification-driven and was executed against the application in a real browser.

| Layer | Technique | Executions |
|---|---|---|
| ECP | Equivalence-class partitioning for registration, login, profile, profit, fertilizer and mandi filters | 92 |
| BVA | Boundary value analysis for every documented numeric and text limit | 139 |
| White-box | Control-flow graphs, cyclomatic complexity, basis paths and decision coverage on the real modules | 55 |
| Smoke | Navigation, server health and page identity | 5 |
| **Total** | | **291** |

The recorded green run is **291 tests, 0 failures, 0 errors, 0 skipped, BUILD SUCCESS in 06:01
minutes** (14 November 2026). Execution evidence, per-class results and the one environment retry
are documented in the
[execution summary](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/05-Test-Execution-Summary.md).

Known findings are recorded rather than hidden. Three Low-severity issues (sub-rupee profit
display, whitespace-only login password and a non-enumerated irrigation value) and two
informational notes (dead branches and margin rounding) are documented in the
[defect report](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/06-Defect-Report.md).
None blocks the tested workflows.

## Running the test suite

The suite is part of the `student2` branch. Check out that branch first:

```bash
git fetch origin
git checkout student2
```

Set `JAVA_HOME`, add Maven to `PATH`, and run from the repository root:

```powershell
mvn -B test                     # full suite: 291 tests, about 6 minutes
mvn -B test -Dtest="Ecp*Test"   # 92 equivalence-class tests
mvn -B test -Dtest="Bva*Test"   # 139 boundary-value tests
mvn -B test -Dtest="Wb*Test"    # 55 white-box tests
mvn -B test -Dtest="SmokeTest"  # 5 smoke tests
```

The framework:

- starts the Vite development server on `http://127.0.0.1:5173` when it is not already running,
  and stops it when the suite started it;
- uses one browser session per test class and clears `localStorage` before each case, so cases do
  not depend on execution order;
- waits explicitly for element and bridge readiness; it does not use fixed sleeps;
- writes failure screenshots to `target/evidence/` through `ScreenshotHandler`;
- publishes `.txt` and `TEST-*.xml` Surefire reports in `target/surefire-reports/`.

Useful system properties:

| Property | Default | Purpose |
|---|---|---|
| `-Dbrowser=chrome` | `edge` | Run against Chrome instead of Edge |
| `-Dheadless=false` | `true` | Show the browser window for debugging |
| `-DbaseUrl=...` | `http://127.0.0.1:5173` | Point the suite at an already-running instance |

The page objects are in `src/test/java/com/krishiconnect/qa/pages/`, test data and flows in
`support/`, and the test layers in `tests/{ecp,bva,whitebox}` plus `SmokeTest`.

## QA documentation

| # | Document | Contents |
|---|---|---|
| 01 | [Inspection and gap analysis](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/01-Inspection-and-Gap-Analysis.md) | Repository inspection, validation catalogue, test identifier map and gap analysis |
| 02 | [ECP test cases](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/02-ECP-TestCases.md) | Equivalence-class tables, 86 case identifiers and 92 executions |
| 03 | [BVA test cases](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/03-BVA-TestCases.md) | Boundary tables, 132 case identifiers and 139 executions |
| 04 | [CFG and complexity](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/04-CFG-and-Complexity.md) | Control-flow graphs, V(G) for 15 units, basis paths, GF(2) checks and decision coverage |
| 05 | [Execution summary](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/05-Test-Execution-Summary.md) | Environment, suite composition, per-class results and evidence index |
| 06 | [Defect report](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/06-Defect-Report.md) | DEF-01 to DEF-05, ENV-01 and WD-01 with severity and fix verification |
| 07 | [Regression and release readiness](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/07-Regression-and-Release-Readiness.md) | Quality gates, residual risks R1 to R12 and the release recommendation |

Every case in these documents records an identifier, module, objective, preconditions, input,
steps, expected result, actual result and verdict. Each case maps to a Surefire result or a named
source line.

## Project layout

```
.
|-- krishiconnect-build/          React and Vite application
|   |-- public/                   Static assets
|   `-- src/
|       |-- assets/               Images
|       |-- components/           Shared UI components
|       |-- config/               Site metadata and disclaimers
|       |-- context/              Authentication, language and toast providers
|       |-- data/                 Sample mandi prices and crop catalogue
|       |-- hooks/                Page title and shared hooks
|       |-- i18n/                 English and Kannada translations
|       |-- layouts/              Application shell and authentication layout
|       |-- pages/                Route screens
|       |-- services/             Backend adapters, mandi search and reports
|       |-- utils/                Formatting and shared helpers
|       `-- validation/           Pure validators used by the interface and tests
|-- LICENSE                       License status notice
`-- README.md                     This file
```

The `student2` branch additionally contains:

```
src/test/java/                    Selenium and JUnit suite (core, pages, support, tests)
src/test/resources/               JUnit platform configuration
test-documentation/               QA design, analysis and reports (01 to 07)
pom.xml                           Maven build for the test suite
```

## Troubleshooting

| Symptom | Cause and resolution |
|---|---|
| `Port 5173 is already in use` | Vite runs with `strictPort`. Stop the other server, or allow `AppServer` to reuse the instance already listening on `127.0.0.1:5173`. |
| `Frontend dependencies are missing` | Run `npm install` inside `krishiconnect-build/`. |
| Tests cannot find page elements | Confirm the application is served from `http://127.0.0.1:5173`. `localhost` and `127.0.0.1` use separate `localStorage` origins. |
| `NoSuchSessionException` during a class | The browser process exited (observed once with Edge). Re-run the class, then the full suite. This is documented as ENV-01. |
| Wrong browser driver | Pass `-Dbrowser=chrome`, or install the driver that matches the installed browser version. |
| Firebase network errors during tests | The suite expects demo mode. Do not set `VITE_FIREBASE_*` in the environment used for the test run. |
| Firebase is configured but the application reports demo mode | Confirm the variables are in `krishiconnect-build/.env.local` and restart Vite. |

## Project status and limitations

**Suitable for:** coursework evaluation, demonstrations and a controlled pilot in demo mode.

**Not yet production-ready.** The following areas were outside the executed test scope:

- Firebase production mode, including network paths, session persistence and error mapping;
- browsers other than Chromium or Edge, and mobile viewports;
- accessibility (no WCAG audit), performance and load, and penetration testing;
- continuous integration; the 291-case suite is currently run manually.

These items are treated as residual risks R1 to R12 in the
[regression and release-readiness report](https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-/blob/student2/test-documentation/07-Regression-and-Release-Readiness.md).

## License

No license has been declared for this repository. See [LICENSE](LICENSE) for the current status.
Until a license is added, no permission is granted beyond applicable copyright law.
