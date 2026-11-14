# KrishiConnect — Repository Inspection & QA Gap Analysis

**Project:** KrishiConnect (Karnataka smart agriculture web app)
**Course:** ISE2501 Software Testing — CA3 (Option 2)
**Role:** Student 2 — Test Designer, White-Box Testing Specialist, QA Documentation Engineer
**Inspection date:** 14 November 2026
**Repository:** https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-
**Local clone inspected:** `C:\Users\hemanth kumar bn\software\SOFTWARE_KRISHI-CONNECT-`

> **Status of this document:** inspection only. **No test case has been executed yet.** Every result column added later must come from a real run.

---

## 1. Repository facts

| Item | Value | How verified |
|---|---|---|
| Branch | `main` (only branch) | `git branch -a`, GitHub Branches API |
| Commits | 1 — `a18919a feat: complete KrishiConnect web application with full automation suite` | `git log --all --oneline` |
| Remote | `origin https://github.com/SUBRAHMANYA2726/SOFTWARE_KRISHI-CONNECT-` | `git remote -v` |
| Commit message claim | "full automation suite" | **Not supported by the tree** — see §6 |
| Tracked files | Application source, `node_modules/`, Maven ZIPs, JVM crash log | `git ls-files` |

The commit message claims a complete automation suite, but **no `pom.xml`, no `src/test/java`, no JUnit/Selenium dependency and no page object exists in the committed tree or on GitHub**.

---

## 2. Confirmed technology stack

From `krishiconnect-build/package.json`:

| Concern | Technology / version |
|---|---|
| UI | React 19.3.1 |
| Build | Vite 8.3.6 |
| Routing | react-router-dom 7.10.1 |
| Auth/DB | firebase 12.6.0 (Firestore + Firebase Auth) |
| Styling | Tailwind CSS 3.4.17 |
| Lint | oxlint 1.90.0 |
| Test tooling | **None declared** |

### Runtime environment available on this machine

| Tool | Status |
|---|---|
| Node.js | 24.18.1 ✅ |
| npm | 11.16.0 ✅ |
| Google Chrome | 157.0.8103.51 ✅ (`C:\Program Files\Google\Chrome\Application\chrome.exe`) |
| Java (JDK) | ❌ not installed / not on `PATH`; no `javac.exe` found |
| Maven | ❌ not installed / not on `PATH` |
| Maven distributions present | `​.tools/apache-maven-3.9.16-bin.zip` (9.4 MB), `​.tools/mvn.zip` (2.9 MB), both **tracked in git** |
| `JAVA_HOME` | not set |

**Consequence:** JUnit 5 and Selenium tests cannot be compiled or executed until a JDK is installed. Maven can be unpacked from the committed ZIP, but Maven still needs a JDK.

### Application mode for testing

- No `.env` file exists (only `.env.example`) and no Firebase project is configured.
- Therefore `src/services/backend/index.js` selects `localAdapter` (`mode: 'demo'`).
- Registration, login, profile and reports are stored in **browser `localStorage`**, which is good for deterministic Selenium runs:
  - `kc.demo.users.v1`
  - `kc.demo.session.v1`
  - `kc.demo.profile.<uid>`
  - `kc.demo.reports.<uid>`
- The UI visibly labels demo mode (`login-demo-notice`, `settings-demo-notice`).
- Google sign-in is hidden on `/login` in demo mode and disabled on `/register`.

---

## 3. Module inventory and routes

| # | Module | Route | Page source | Validation source |
|---|---|---|---|---|
| 1 | Landing page | `/` | `pages/Landing.jsx` | none (static) |
| 2 | Registration | `/register` | `pages/Register.jsx` | `validation/auth.js` → `validation/common.js` |
| 3 | Login | `/login` | `pages/Login.jsx` | `validation/auth.js` → `validation/common.js` |
| 4 | Farmer onboarding | `/onboarding` | `pages/Onboarding.jsx` + `components/profile/ProfileForm.jsx` | `validation/profile.js` |
| 5 | Farmer dashboard | `/dashboard` | `pages/Dashboard.jsx` | profile required (ProtectedRoute) |
| 6 | Mandi prices | `/mandi` | `pages/Mandi.jsx` | `services/mandiService.js` (`filterPrices`) |
| 7 | Profit calculator | `/calculator/profit` | `pages/ProfitCalculator.jsx` | `validation/profit.js` |
| 8 | Fertilizer calculator | `/calculator/fertilizer` | `pages/FertilizerCalculator.jsx` | `validation/fertilizer.js` |
| 9 | Saved reports | `/reports`, `/reports/:reportId` | `pages/Reports.jsx`, `pages/ReportDetail.jsx` | `services/reportService.js` |
| 10 | Settings / profile management | `/settings` | `pages/Settings.jsx` + `ProfileForm` | `validation/profile.js` |
| — | 404 | `*` | `pages/NotFound.jsx` | **file is corrupt — see §7** |

Public routes: `/`, `/login`, `/register`, `/mandi`, `/calculator/profit`, `/calculator/fertilizer`.
Authenticated routes: `/dashboard`, `/reports`, `/reports/:id`, `/settings`; `/onboarding` requires login but not a completed profile.

### Testability hooks already present

The application already exposes `data-testid` attributes on every field, button and result, plus `data-error-code` on validation messages. This is excellent for Page Object Model work. Key examples:

| Module | Test IDs |
|---|---|
| Registration | `register-form`, `register-name`, `register-email`, `register-password`, `register-confirm-password`, `register-submit`, `auth-error` |
| Login | `login-form`, `login-email`, `login-password`, `login-submit`, `login-demo-notice`, `auth-error` |
| Profile | `onboarding-form`, `onboarding-name`, `onboarding-village`, `onboarding-district`, `onboarding-taluk`, `onboarding-farmArea`, `onboarding-irrigation`, `onboarding-language-en/kn`, `crop-<name>`, `onboarding-submit`, `error-onboarding-*`; settings variants use `settings-*` |
| Profit | `profit-form`, `profit-label`, `profit-landArea`, `profit-yieldPerAcre`, `profit-sellingPrice`, `profit-cultivationCost`, `profit-calculate`, `profit-reset`, `profit-error-summary`, `profit-result`, `profit-result-status`, `profit-net-result`, `profit-revenue`, `profit-expenditure`, `profit-total-yield`, `profit-margin`, `profit-break-even`, `profit-summary`, `profit-save`, `profit-save-login` |
| Fertilizer | `fertilizer-form`, `fertilizer-crop`, `fertilizer-landArea`, `fertilizer-dose-hint`, `fertilizer-calculate`, `fertilizer-reset`, `fertilizer-result`, `fertilizer-target-n/p/k`, `fertilizer-product-dap/urea/mop` |
| Mandi | `mandi-search`, `mandi-crop`, `mandi-district`, `mandi-market`, `mandi-results-count`, `mandi-clear`, `mandi-table`, `mandi-row`, `mandi-card`, `mandi-empty`, `mandi-sample-notice` |

Field-level errors follow the pattern `data-testid="error-<field-id>"` and expose `data-error-code` (e.g. `REQUIRED`, `BELOW_MIN`, `PASSWORD_MISMATCH`).

---

## 4. Actual validation rules (single source of truth)

Rules below are copied from the source, not invented.

### 4.1 Shared primitives — `src/validation/common.js`

| Primitive | Behaviour | Lines |
|---|---|---|
| `EMAIL_PATTERN` | `/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/` | 8 |
| `NUMBER_PATTERN` | `/^\d+(\.\d+)?$/` — digits, optional decimal part. **No sign, no exponent, no comma, no leading/trailing dot** | 9 |
| `isEmpty` | `null`, `undefined` or empty after `trim()` | 11–13 |
| `validateNumberField` | trim → `REQUIRED` if empty → `NOT_NUMBER` if regex fails → `NOT_NUMBER` if not finite → `BELOW_MIN` if `< min` → `ABOVE_MAX` if `> max` | 23–42 |
| `validateRequiredText` | trim → `REQUIRED` → `TOO_SHORT` (`< min`) → `TOO_LONG` (`> max`) | 44–50 |
| `validateEmail` | trim + lowercase → `REQUIRED` / `INVALID_EMAIL` if length > 254 or regex fails | 52–59 |
| `validatePassword` | **not trimmed** → `REQUIRED` → `PASSWORD_TOO_SHORT` (`< 8`) → `PASSWORD_TOO_LONG` (`> 128`) → `PASSWORD_WEAK` if no ASCII letter **or** no digit | 61–70 |

### 4.2 Registration — `src/validation/auth.js`

| Field | Rule | Error codes |
|---|---|---|
| `fullName` | trimmed, length **2–60** | `REQUIRED`, `TOO_SHORT`, `TOO_LONG` |
| `email` | regex + length ≤ **254**, trimmed + lowercased | `REQUIRED`, `INVALID_EMAIL` |
| `password` | length **8–128**, at least one ASCII letter and one digit | `REQUIRED`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`, `PASSWORD_WEAK` |
| `confirmPassword` | non-empty and **exactly equal** to password (no trim, case-sensitive) | `REQUIRED`, `PASSWORD_MISMATCH` |
| duplicate email | demo adapter rejects an existing email | `AUTH_EMAIL_IN_USE` |
| success | session created, navigate to `/onboarding` | — |

### 4.3 Login — `src/validation/auth.js`

| Field | Rule | Error codes |
|---|---|---|
| `email` | same as registration | `REQUIRED`, `INVALID_EMAIL` |
| `password` | **only non-empty** — no length or strength rule at login | `REQUIRED` |
| unknown email / wrong password | rejected by adapter | `AUTH_INVALID_CREDENTIAL` |

### 4.4 Farmer profile — `src/validation/profile.js`

| Field | Rule | Notes |
|---|---|---|
| `fullName` | trimmed, 2–60 | `REQUIRED`, `TOO_SHORT`, `TOO_LONG` |
| `district` | required, must be in `DISTRICT_NAMES` (31 districts) | `REQUIRED`, `INVALID_SELECTION` |
| `taluk` | required, must belong to selected district (`taluksForDistrict`) | `REQUIRED`, `INVALID_SELECTION` |
| `language` | must be `en` or `kn` | `INVALID_SELECTION` |
| `farmArea` | acres, **0.1–1000** | `REQUIRED`, `NOT_NUMBER`, `BELOW_MIN`, `ABOVE_MAX` |
| `irrigation` | required, **non-empty only** — validator does *not* check the 7 UI options | `REQUIRED` |
| `primaryCrops` | 1–**5** items, each from `PRIMARY_CROPS` (12 crops) | `REQUIRED`, `TOO_MANY`, `INVALID_SELECTION` |
| `village` | optional, trimmed, silently `.slice(0, 80)` | no error code |

UI behaviour: changing district resets taluk to `''`; taluk select is disabled until a district is chosen.

### 4.5 Profit calculator — `src/validation/profit.js`

| Input | Unit | Min | Max |
|---|---|---|---|
| `landArea` | acres | **0.1** | **500** |
| `yieldPerAcre` | quintals/acre | **0.1** | **500** |
| `sellingPrice` | ₹/quintal | **1** | **100000** |
| `cultivationCost` | ₹ total | **0** | **10000000** |

Formulas (lines 44–57):

```text
totalYield      = round(landArea × yieldPerAcre, 2)
revenue         = round(totalYield × sellingPrice, 2)
cost            = round(cultivationCost, 2)
profit          = round(revenue − cost, 2)
status          = PROFIT if profit > 0, LOSS if profit < 0, else BREAK_EVEN
marginPercent   = round(profit / revenue × 100, 1)   (0 when revenue = 0)
breakEvenPrice  = round(cost / totalYield, 2)        (0 when totalYield = 0)
```

`label` (crop/report label) is optional and not validated here.
All four numeric fields must be valid before any result is produced; otherwise `ok:false` with per-field errors.

### 4.6 Fertilizer calculator — `src/validation/fertilizer.js`

| Input | Rule |
|---|---|
| `cropId` | one of 6 IDs: `ragi`, `paddy`, `maize`, `groundnut`, `cotton`, `sugarcane` |
| `landArea` | acres, **0.1–100** |

Data (`src/data/fertilizer.js`): NPK per hectare —

| Crop | N | P₂O₅ | K₂O |
|---|---|---|---|
| Ragi | 50 | 40 | 25 |
| Paddy | 100 | 50 | 50 |
| Maize | 150 | 75 | 37.5 |
| Groundnut | 25 | 50 | 75 |
| Cotton | 150 | 75 | 75 |
| Sugarcane | 250 | 75 | 75 |

Formulas (lines 35–45):

```text
hectares        = round(acres × 0.40468564224, 3)
targetN/P/K     = round(npkPerHectare × acres × 0.40468564224, 2)
DAP kg          = round(targetP / 0.46, 1)
nitrogenFromDap = round(DAP × 0.18, 2)
remainingN      = max(0, round(targetN − nitrogenFromDap, 2))
Urea kg         = round(remainingN / 0.46, 1)
MOP kg          = round(targetK / 0.6, 1)
```

### 4.7 Mandi search and filters — `src/services/mandiService.js`

- Dataset: **32 rows**, **8 crops**, **19 districts**, **26 markets** (sample data, snapshot date `2026-10-30`).
- `crop`, `district`, `market` are **exact-match** against select values; sentinels are `All crops`, `All districts`, `All markets`.
- `search` is trimmed and lower-cased, then matched as a **substring** of `crop + ' ' + cropKn + ' ' + market + ' ' + district`.
- Search therefore also matches district/market names. Example: `ragi` matches 6 rows because **Kalaburagi** contains `ragi`.
- Price and date are **not** searchable.
- Market dropdown is scoped to the selected district and resets when the district changes.

---

## 5. White-box candidates (inspection result)

| Function | File | Why suitable |
|---|---|---|
| `calculateProfit` | `src/validation/profit.js` | arithmetic + status/margin/break-even branches; core business logic |
| `validateNumberField` | `src/validation/common.js` | shared by both calculators and profile; 5 decision points |
| `validatePassword` | `src/validation/common.js` | multiple boundaries and a compound `||` decision |
| `validateProfile` | `src/validation/profile.js` | many independent decision branches |
| `calculateFertilizer` | `src/validation/fertilizer.js` | arithmetic conversion + guard branches |
| `filterPrices` | `src/services/mandiService.js` | four independent filter decisions |

**Important observation:** `Math.max(0, …)` in `calculateFertilizer` appears **unreachable (false branch)** with the current crop data, because every crop's N:P ratio is higher than DAP's 18:46 contribution ratio. This must be documented as an infeasible path, not counted as covered.

Cyclomatic complexity, CFGs and basis paths are **not** stated in this document; they belong in `04-CFG-and-Complexity.md` and must be derived from the actual source with an explicit node/edge count.

---

## 6. What is completed vs missing

| Deliverable | Status | Evidence |
|---|---|---|
| React application source | ⚠️ Present but **currently cannot render** | see §7 P0-1 |
| Validation logic modules | ✅ Present | `src/validation/*.js` |
| Test IDs across UI | ✅ Present, extensive | `data-testid` / `data-error-code` |
| Demo (credential-free) auth | ✅ Present | `localBackend`, no `.env` |
| Test plan | ❌ Missing | — |
| Test scenarios | ❌ Missing | — |
| ECP tables | ❌ Missing (being created now — `02-ECP-TestCases.md`) | — |
| BVA tables | ❌ Missing (being created now — `03-BVA-TestCases.md`) | — |
| CFG / cyclomatic complexity / basis paths | ❌ Missing | — |
| JUnit 5 test classes | ❌ Missing | no `src/test/java` |
| Maven `pom.xml` | ❌ Missing | not tracked |
| Selenium framework, BasePage, POM | ❌ Missing | Student 1 deliverable absent |
| Test data class | ❌ Missing | — |
| Execution evidence | ❌ Missing | no Surefire reports, no screenshots |
| Defect report / regression report / summary | ❌ Missing | — |
| CI workflow | ❌ Missing | — |
| README / `.gitignore` / `.gitattributes` / `LICENSE` | ❌ Corrupt (100% `0xFF` bytes) | see §7 P1-1 |
| `NotFound.jsx` | ❌ Corrupt (100% `0xFF` bytes) | see §7 P0-1 |
| `node_modules` | ❌ Tracked and corrupt | see §7 P1-2 |
| `package-lock.json` | ❌ Corrupt; untracked | see §7 P1-3 |
| JVM crash log | ❌ Tracked, 98% `0xFF` | 56,498 bytes |

---

## 7. Blocking defects found during inspection

| ID | Severity | Finding | Evidence | Impact |
|---|---|---|---|---|
| **P0-1** | Blocker | `krishiconnect-build/src/pages/NotFound.jsx` is **1,630 bytes of `0xFF`** (binary), not JSX. Vite fails: `[plugin:vite:oxc] Transform failed with 1 error: [PARSE_ERROR] File appears to be binary.` | Dev server + browser console; GitHub raw blob is also 1,630 × `0xFF` | **No route renders at all** (App.jsx imports `NotFound`). Selenium execution impossible. |
| **P0-2** | Blocker | Student 1's Maven/Selenium/POM framework is **not in the repository** | `git ls-files`, GitHub tree API | No shared framework to "reuse"; page objects, driver lifecycle and dependencies do not exist |
| **P0-3** | Blocker | No JDK installed; Maven not installed; `JAVA_HOME` unset | `java -version`, `mvn -v`, filesystem search | JUnit 5/Selenium tests cannot compile or run |
| **P1-1** | High | `README.md` (7,976 B), `.gitignore` (155 B), `.gitattributes` (208 B), `LICENSE` (1,071 B) are **100% `0xFF`** | byte scan; GitHub blobs identical | Documentation lost; `.gitignore` rules lost; this is why `node_modules` was committed |
| **P1-2** | High | `node_modules/` is tracked and its metadata is corrupt. `npm install` failed with `Invalid Version:`. `vite` failed with missing `@rolldown/pluginutils` | `git ls-files`, npm log, dev-server crash | Fresh clone cannot install/start without manual repair; repository size inflated |
| **P1-3** | High | `package-lock.json` is untracked and corrupt: 4 entries have no `version` (`@firebase/app-types/node_modules/@firebase/logger`, `binary-extensions`, `react-router-dom/node_modules/react-router`, `thenify`) | `node -e` audit of lock | `npm install` fails; reproducible builds impossible |
| **P1-4** | Medium | `hs_err_pid20360.log` (56,498 B, 98% `0xFF`) and two Maven ZIPs are tracked | byte scan, `git ls-files` | Repository noise; crash log is unreadable |

### Notes on P0-1 recovery

- No copy of the original `NotFound.jsx` was found on disk, in `.vite` cache, or on GitHub.
- The page can only be restored by rewriting it. A minimal, design-consistent 404 page can be reconstructed from existing i18n keys (`notFound.eyebrow/title/body`, `common.goHome`) and existing components.
- **This requires team approval** because it modifies application source. Without it, no Selenium test can run.

---

## 8. Actions performed during this inspection (transparency)

1. Read repository, git metadata and GitHub tree (read-only).
2. Read all validation modules and all relevant pages (read-only).
3. Ran `npm install` — failed because of the corrupt tracked `node_modules`.
4. Moved the corrupt `node_modules` to `node_modules.corrupt-backup` (not deleted).
5. Backed up and regenerated the corrupt, **untracked** `package-lock.json` (backup: `%TEMP%\kc-package-lock.corrupt.json`), then `npm install` succeeded (188 packages).
6. Started Vite (`http://localhost:5173`) and inspected the app in Chrome. The app returned HTTP 500 because of the binary `NotFound.jsx`.
7. **No application source file was modified. Nothing was committed.**

Current working tree state is dirty (as it already was before this session): tracked `node_modules` differs from the fresh install, and `package-lock.json` is new. This must be resolved by the team before committing.

---

## 9. Test design decisions and risks

| Decision | Reason |
|---|---|
| Use demo mode for Selenium | No Firebase credentials; deterministic; storage is local and inspectable |
| Unique email per registration run | Demo adapter persists users in `localStorage`; fixed emails would collide on rerun |
| Clear `kc.demo.*` keys in test setup when a clean state is needed | Ensures repeatable tests |
| Prefer `data-testid` locators | Already provided by the app; resilient to styling/i18n changes |
| Explicit waits only | Required by the brief; no `Thread.sleep` |
| Assert `data-error-code`, not translated text, for validation | Text changes with language; codes are stable |
| Treat `type="number"` inputs carefully | Browsers sanitise non-numeric keystrokes; `NOT_NUMBER` cannot always be triggered through the UI |

### Open methodology issue — white-box tests are JavaScript logic, tests are Java

The calculation and validation logic is **JavaScript** (`src/validation/*.js`). JUnit 5 tests written in Java cannot import those modules directly. Options:

| Option | What it means | Trade-off |
|---|---|---|
| **A. JUnit + Selenium only** | Exercise every basis path through the real UI | Tests the real product, but slow; `type=number` hides some `NOT_NUMBER` paths; no real branch coverage measurement |
| **B. Test-only JS bridge (recommended)** | In dev builds, expose the pure functions on `window.__kcTest`; JUnit uses `JavascriptExecutor` to call the **actual** functions with the parameterized data | Fast, exact, tests production logic; needs a small, dev-guarded app change and Student 1 approval |
| **C. Add Vitest for JS unit tests** | Node-based unit tests for the pure modules, plus JUnit/Selenium for E2E | Best coverage, but adds a second test framework beyond the stated JUnit 5 requirement |

**Recommendation:** B for white-box basis-path tests + A for end-to-end flows. Final decision must be agreed with Student 1 and the guide.

---

## 10. Recommended next steps

| Step | Owner | Dependency |
|---|---|---|
| 1. Approve and restore `NotFound.jsx` | Student 1 / team | This inspection |
| 2. Decide framework ownership: Student 1 delivers Maven/POM, or Student 2 bootstraps a minimal shared framework with approval | Student 1 + Student 2 | P0-2 |
| 3. Install JDK 21 (Temurin) and unpack Maven 3.9.16 from `.tools` | Student 2 | approval to install |
| 4. Fix repository hygiene: corrupt files, `.gitignore`, untrack `node_modules`, commit a valid `package-lock.json`, remove crash log/ZIPs | Student 1 + Student 2 | P1-1…P1-4 |
| 5. Create page objects for Landing, Register, Login, Profile, Mandi, Profit, Fertilizer | Student 1 (architecture) + Student 2 (selectors/tests) | steps 1–2 |
| 6. Implement ECP/BVA parameterized JUnit tests (`02`, `03`) | Student 2 | framework |
| 7. Produce CFG, complexity and basis-path tests | Student 2 | `04` |
| 8. Execute, capture evidence, raise defects, regression, final summary | Student 2 | all above |

Design documents produced in this increment:

- `02-ECP-TestCases.md` — equivalence class partitioning for 5 areas
- `03-BVA-TestCases.md` — boundary value analysis for 5 areas

All rows in those documents are **design-only until executed**.
