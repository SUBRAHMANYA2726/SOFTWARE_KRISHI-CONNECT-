# KrishiConnect

A bilingual (English / Kannada) web application that helps farmers in Karnataka plan a season:
check mandi prices, estimate profit, convert a blanket NPK recommendation into fertilizer
quantities, and keep a profile and saved reports.

This repository contains the React/Vite application and the Java/Selenium test suite built for
the ISE2501 CA3 software-testing assignment.

## Features

| Route | What it does |
|---|---|
| `/` | Landing page with the feature overview |
| `/register`, `/login` | Account creation and sign-in (demo mode or Firebase) |
| `/onboarding` | Farmer profile: name, district, taluk, farm area, irrigation, primary crops, village |
| `/dashboard` | Signed-in overview |
| `/mandi` | Mandi price table with crop, district, market and free-text filters |
| `/calculator/profit` | Profit / loss / break-even from land area, yield, price and cultivation cost |
| `/calculator/fertilizer` | DAP, urea and MOP quantities from a crop and land area |
| `/reports`, `/reports/:reportId` | Saved profit and fertilizer reports |
| `/settings` | Edit the farmer profile |
| `*` | Not-found page |

The interface and messages are available in English and Kannada.

## Stack

- React 19, React Router 7, Vite 8, Tailwind CSS 3
- Firebase 12 (Auth + Firestore) when configured, otherwise a local demo adapter backed by `localStorage`
- No backend server is required in demo mode

## Quick start

Requirements: Node.js 20+ (developed with Node 24) and npm.

```bash
cd krishiconnect-build
npm install
npm run dev
```

Open <http://localhost:5173>.

### Demo mode vs Firebase

Copy `krishiconnect-build/.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*` values to
use Firebase. If they are left empty, the app selects the local demo adapter automatically, shows a
demo notice, and stores accounts and reports in `localStorage`. Demo mode is intended for
development and testing, not for real user data.

### Production build

```bash
cd krishiconnect-build
npm run build     # output in dist/
npm run preview
```

`firebase.json` is configured to deploy `dist/` to Firebase Hosting with SPA rewrites.

## Tests

The suite is Java 21 + Selenium 4 + JUnit 5 + Maven, using the Page Object Model. It drives the real
app in Microsoft Edge; no ChromeDriver is needed.

```bash
# From the repository root, with JAVA_HOME and Maven on PATH
mvn -B test                    # 291 tests, ~6 minutes
mvn -B test -Dtest="Ecp*Test"  # 92 equivalence-class tests
mvn -B test -Dtest="Bva*Test"  # 139 boundary-value tests
mvn -B test -Dtest="Wb*Test"   # 55 white-box tests
```

The suite starts the Vite dev server on `http://127.0.0.1:5173` if it is not already running, uses
one browser session per test class, and clears `localStorage` before each case. To use Chrome
instead of Edge, pass `-Dbrowser=chrome`.

Test evidence and analysis are in [`test-documentation/`](test-documentation/):

| Document | Contents |
|---|---|
| [01 — Inspection and gap analysis](test-documentation/01-Inspection-and-Gap-Analysis.md) | Repository inspection, validation catalogue, gap analysis |
| [02 — ECP test cases](test-documentation/02-ECP-TestCases.md) | Equivalence-class tables and 92 executed cases |
| [03 — BVA test cases](test-documentation/03-BVA-TestCases.md) | Boundary tables and 139 executed cases |
| [04 — CFG and complexity](test-documentation/04-CFG-and-Complexity.md) | Control-flow graphs, V(G), basis paths, decision coverage |
| [05 — Execution summary](test-documentation/05-Test-Execution-Summary.md) | Environment, per-class results and evidence index |
| [06 — Defect report](test-documentation/06-Defect-Report.md) | Findings, severity and fix verification |
| [07 — Regression and release readiness](test-documentation/07-Regression-and-Release-Readiness.md) | Quality gates, residual risk and recommendation |

Known Low-severity issues (sub-rupee profit display, whitespace-only login password, irrigation
validation) are documented in the defect report; none blocks the tested workflows.

## Project layout

```
.
├── krishiconnect-build/     React/Vite application
│   └── src/
│       ├── components/      Shared UI
│       ├── pages/           Route screens
│       ├── validation/      Pure validators used by forms and white-box tests
│       ├── services/        Mandi data, reports, demo/Firebase adapters
│       └── dev/             Development-only white-box test bridge
├── src/test/java/           Selenium + JUnit suite (core, pages, support, tests)
├── test-documentation/      QA design, analysis and reports
└── pom.xml                  Maven build for the test suite
```

## License

No license has been declared for this repository yet. See [LICENSE](LICENSE).
