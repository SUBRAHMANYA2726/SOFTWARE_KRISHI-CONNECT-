# KrishiConnect — Boundary Value Analysis (BVA) Test Cases

**Prepared by:** Student 2
**Scope:** Registration & Login, Farmer Profile, Profit Calculator, Fertilizer Calculator, Mandi search & filters
**Basis:** actual source code in `krishiconnect-build/src/validation/*`, `src/services/mandiService.js`, `src/utils/format.js` and the page JSX
**Companion document:** `02-ECP-TestCases.md` (equivalence partitioning)
**Execution status:** **EXECUTED 2026-11-14.** 132 case IDs, 139 executions (BVA-MND-23 runs once per crop), **139 passed / 0 failed / 0 skipped**, `BUILD SUCCESS`, 03:26 min.
**Environment:** Microsoft Edge 157.0.4341.60 headless, Selenium 4.27.0, JUnit 5.11.4, JDK 21.0.13, Vite dev server on `http://127.0.0.1:5173`, demo mode (`localStorage`).
**Evidence:** `target/bva-final.log` and `target/surefire-reports/*.txt`. `Actual` cells state only what the assertions observed.

---

## 0. Method

### 0.1 What BVA adds over ECP

ECP asks "which classes of input exist?". BVA asks "does the implementation behave correctly exactly at, just inside and just outside each class edge?". For every numeric or length constraint the following points are selected:

| Notation | Meaning | Example for `0.1 – 500` |
|---|---|---|
| `min−ε` | just outside the lower bound (invalid) | `0.09` |
| `min` | exactly on the lower bound (valid) | `0.1` |
| `min+ε` | just inside the lower bound (valid) | `0.11` |
| `nominal` | a normal mid-range value (valid) | `1` |
| `max−ε` | just inside the upper bound (valid) | `499.99` |
| `max` | exactly on the upper bound (valid) | `500` |
| `max+ε` | just outside the upper bound (invalid) | `500.01` |

`ε` is the smallest step that the field can meaningfully represent **and** that `NUMBER_PATTERN` accepts: `0.01` for two-decimal quantities, `0.1` for one-decimal quantities, and `1` for integer counts. Because `NUMBER_PATTERN = /^\d+(\.\d+)?$/` rejects signs, exponents, dots without a leading digit and comma grouping, negative "just outside" values are classified as `NOT_NUMBER`, not `BELOW_MIN` (see §6).

String-length boundaries use ±1 character. Dataset boundaries (Mandi) use row counts and substring lengths.

### 0.2 How the expected values were derived (oracle)

All arithmetic expectations in this document were produced **by executing the application's real pure modules** at design time, not by mental arithmetic:

| Module executed | Purpose |
|---|---|
| `src/validation/profit.js` (`calculateProfit`) | profit, revenue, cost, margin, status, break-even |
| `src/validation/fertilizer.js` (`calculateFertilizer`) | hectares, NPK targets, DAP/urea/MOP quantities |
| `src/validation/profile.js` (`validateProfile`) | profile boundaries |
| `src/validation/auth.js` (`validateRegistration`, `validateLogin`) | registration/login boundaries |
| `src/services/mandiService.js` (`filterPrices`, `fetchMandiPrices`) | row counts for every filter |
| `src/utils/format.js` (`formatINR`, `formatNumber`) | exact display strings |

The modules were loaded through the project's own Vite resolver (Vite 8.3.6 SSR module loading) so the executed code is byte-identical to the code the browser runs. This is an **oracle derivation**, not a test execution: no JUnit test, no Selenium session and no browser assertion has been run yet.

Two earlier hand-computed values in `02-ECP-TestCases.md` were wrong and have been corrected from this execution:

- Ragi 1 acre: the module rounds hectares to `0.405` **before** computing NPK, so targets are **N 20.25, P₂O₅ 16.2, K₂O 10.13** (not 20.23/16.19/10.12).
- Paddy 2 acres: **0.809 ha, N 80.9, P 40.45, K 40.45, DAP 87.9 kg, urea 141.5 kg, MOP 67.4 kg** (not 80.94/40.47/88.0/67.5).

### 0.3 How the UI renders the numbers (assertion oracle)

| Element | Source expression | Display rule | Example |
|---|---|---|---|
| `profit-net-result`, `profit-revenue`, `profit-expenditure` | `formatINR(value)` | `maximumFractionDigits: 0` → rounds to whole rupees | `0.01` → `₹0`; `39999.99` → `₹40,000`; `-10000` → `-₹10,000` |
| `profit-break-even` | `formatINR(value, { decimals: true })` | exactly 2 decimals | `500` → `₹500.00` |
| `profit-total-yield` | `formatNumber(totalYield)` + `quintals` | max 2 decimals, Indian grouping | `250000` → `2,50,000 quintals` |
| `profit-margin` | `{result.marginPercent}%` | raw number, no fixed decimals | `75` → `75%`; `-4445.5` → `-4445.5%`; `0` → `0%` |
| `profit-result-status` | badge text | `Profit` / `Loss` / `Break-even` | — |
| `fertilizer-target-n/p/k` | `{result.target.n}` etc. | raw number, **no** grouping | `2023.45` → `2023.45` |
| `fertilizer-product-*` | `formatNumber(quantity)` + `kg` | max 2 decimals, Indian grouping | `3519` → `3,519 kg` |
| `fertilizer-result` header | `{result.hectares} land in hectares` | raw number | `40.469 land in hectares` |
| `mandi-results-count` | `1 row` or `{count} rows` + `\| All sample prices are ₹ per quintal (100 kg).` | text contains count | `1 row`, `32 rows` |

### 0.4 Test-ID map used by these cases

| Area | Field → input test ID | Field error test ID + attribute |
|---|---|---|
| Registration | `register-name`, `register-email`, `register-password`, `register-confirm-password`, `register-submit`; page alert `auth-error` | `error-fullName`, `error-email`, `error-password`, `error-confirmPassword` (`data-error-code`) |
| Login | `login-email`, `login-password`, `login-submit`, `login-demo-notice`; alert `auth-error` | `error-email`, `error-password` (`data-error-code`) |
| Profile (onboarding) | `onboarding-name`, `onboarding-village`, `onboarding-district`, `onboarding-taluk`, `onboarding-farmArea`, `onboarding-irrigation`, `onboarding-language-en/kn`, `crop-<lowercase>`, `onboarding-submit` | `error-onboarding-name`, `error-onboarding-district`, `error-onboarding-taluk`, `error-onboarding-farmArea`, `error-onboarding-irrigation`, `error-onboarding-language`, `error-onboarding-crops` |
| Profile (settings) | `settings-*` equivalents, `settings-submit`, `settings-village` | `error-settings-*` |
| Profit | `profit-landArea`, `profit-yieldPerAcre`, `profit-sellingPrice`, `profit-cultivationCost`, `profit-calculate`, `profit-reset` | `error-profit-landArea`, `error-profit-yieldPerAcre`, `error-profit-sellingPrice`, `error-profit-cultivationCost`; summary `profit-error-summary` |
| Fertilizer | `fertilizer-crop`, `fertilizer-landArea`, `fertilizer-calculate`, `fertilizer-reset` | `error-fertilizer-crop`, `error-fertilizer-landArea` |
| Mandi | `mandi-search`, `mandi-crop`, `mandi-district`, `mandi-market`, `mandi-clear`, `mandi-results-count`, `mandi-row`, `mandi-empty`, `mandi-sample-notice` | — |

### 0.5 Step codes

| Code | Registration | Login | Profile | Profit | Fertilizer | Mandi |
|---|---|---|---|---|---|---|
| 1 | open `/register` | open `/login` | open `/onboarding` or `/settings` | open `/calculator/profit` | open `/calculator/fertilizer` | open `/mandi` |
| 2 | fill four fields | enter email + password | fill/select all profile fields | enter four numbers | select crop + area | set search/crop/district/market |
| 3 | click `register-submit` | click `login-submit` | click `onboarding-submit` | click `profit-calculate` | click `fertilizer-calculate` | observe count/rows/empty state |
| 4 | observe field errors / `auth-error` / URL | observe field errors / `auth-error` / URL | observe `error-*`, toast, URL, stored values | observe result fields / errors | observe result fields / errors | extra observation step where stated |

### 0.6 Environment (same as ECP)

Demo mode (no Firebase), Chrome 157, base URL `http://localhost:5173`, explicit waits only, `data-error-code` asserted instead of translated text. Each accepted registration/profile case uses a **fresh unique email** because the demo adapter persists users and profiles in `localStorage`.

---

## 1. Registration and Login — boundaries

### 1.1 Boundary inventory

| Field | Constraint (source) | `min−ε` | `min` | `min+ε` | `max−ε` | `max` | `max+ε` |
|---|---|---|---|---|---|---|---|
| `fullName` | trimmed length **2–60** (`validateRequiredText`) | 1 | 2 | 3 | 59 | 60 | 61 |
| `email` total length | **≤ 254** (`validateEmail`) | — | — | — | 253 | 254 | 255 |
| `email` TLD | regex `[A-Za-z]{2,}` | 1 char | 2 chars | 3 chars | — | — | — |
| `password` length | **8–128**, not trimmed (`validatePassword`) | 7 | 8 | 9 | 127 | 128 | 129 |
| `password` composition | ≥1 ASCII letter **and** ≥1 digit | 7 chars with letter+digit → length error first | 8 all letters → `PASSWORD_WEAK` | 8 with both → valid | — | 128 all letters → `PASSWORD_WEAK` | — |
| `confirmPassword` | non-empty, exactly equal, no trim | — | empty → `REQUIRED` | any difference incl. surrounding space → `PASSWORD_MISMATCH` | — | — | — |
| login `password` | only `!password` → `REQUIRED` | empty | 1 char | space `" "` (passes) | — | — | 129 chars (still passes client) |

### 1.2 Registration test cases

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| BVA-REG-01 | Registration | Name one char below minimum | clean state | name `A`, email `bva.reg.01@example.com`, password/confirm `farmer2026` | 1,2,3,4 | `error-fullName` `data-error-code=TOO_SHORT`; stays `/register` | Matches expected (asserted) | **Passed** |
| BVA-REG-02 | Registration | Name exactly at minimum | clean state | name `AB`, email `bva.reg.02@example.com` | 1,2,3,4 | No `error-fullName`; URL `/onboarding`; header shows `bva.reg.02@example.com` | Matches expected (asserted) | **Passed** |
| BVA-REG-03 | Registration | Name one char above minimum | clean state | name `ABC`, email `bva.reg.03@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-04 | Registration | Name one char below maximum | clean state | name 59 × `A`, email `bva.reg.04@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-05 | Registration | Name exactly at maximum | clean state | name 60 × `A`, email `bva.reg.05@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-06 | Registration | Name one char above maximum | clean state | name 61 × `A`, email `bva.reg.06@example.com` | 1,2,3,4 | `error-fullName` `TOO_LONG`; stays `/register` | Matches expected (asserted) | **Passed** |
| BVA-REG-07 | Registration | Name is trimmed before length check | clean state | name `"   A   "`, email `bva.reg.07@example.com` | 1,2,3,4 | `error-fullName` `TOO_SHORT` (trimmed to 1) | Matches expected (asserted) | **Passed** |
| BVA-REG-08 | Registration | Password one char below minimum | clean state | password/confirm `ab12345` (7) | 1,2,3,4 | `error-password` `PASSWORD_TOO_SHORT` with `params.min=8`; no `error-confirmPassword` | Matches expected (asserted) | **Passed** |
| BVA-REG-09 | Registration | Password exactly at minimum | clean state | `ab123456` (8), email `bva.reg.09@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-10 | Registration | Password one char above minimum | clean state | `abc123456` (9), email `bva.reg.10@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-11 | Registration | Password one char below maximum | clean state | `"a1" + "x"×125` (127), email `bva.reg.11@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-12 | Registration | Password exactly at maximum | clean state | `"a1" + "x"×126` (128), email `bva.reg.12@example.com` | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-13 | Registration | Password one char above maximum | clean state | `"a1" + "x"×127` (129), email `bva.reg.13@example.com` | 1,2,3,4 | `error-password` `PASSWORD_TOO_LONG` with `params.max=128` | Matches expected (asserted) | **Passed** |
| BVA-REG-14 | Registration | Length check precedes composition check | clean state | `abc1234` (7, has letter+digit) | 1,2,3,4 | `PASSWORD_TOO_SHORT` (not `PASSWORD_WEAK`) | Matches expected (asserted) | **Passed** |
| BVA-REG-15 | Registration | Composition check at maximum-length boundary | clean state | 128 × `A` (no digit) | 1,2,3,4 | `error-password` `PASSWORD_WEAK` (length passes, composition fails) | Matches expected (asserted) | **Passed** |
| BVA-REG-16 | Registration | Email exactly at 254-char maximum | clean state | `"a"×242 + "@example.com"` (254), unique | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-17 | Registration | Email one char above 254 | clean state | `"a"×243 + "@example.com"` (255) | 1,2,3,4 | `error-email` `INVALID_EMAIL` | Matches expected (asserted) | **Passed** |
| BVA-REG-18 | Registration | TLD one char below regex minimum | clean state | `a@b.c` | 1,2,3,4 | `error-email` `INVALID_EMAIL` | Matches expected (asserted) | **Passed** |
| BVA-REG-19 | Registration | TLD exactly at regex minimum | clean state | `a@b.co`, email unique | 1,2,3,4 | Accepted; URL `/onboarding` | Matches expected (asserted) | **Passed** |
| BVA-REG-20 | Registration | Confirmation is compared without trimming | clean state | password `farmer2026`, confirm `farmer2026 ` (trailing space) | 1,2,3,4 | `error-confirmPassword` `PASSWORD_MISMATCH` | Matches expected (asserted) | **Passed** |
| BVA-REG-21 | Registration | Confirmation empty | clean state | password valid, confirm `""` | 1,2,3,4 | `error-confirmPassword` `REQUIRED` | Matches expected (asserted) | **Passed** |

### 1.3 Login test cases

Precondition for BVA-LOG-02…05: account `bva.login@example.com` / `farmer2026` exists with a completed profile.

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| BVA-LOG-01 | Login | Password empty (only client rule) | app running | email `bva.login@example.com`, password `""` | 1,2,3,4 | `error-password` `REQUIRED`; no `auth-error`; no navigation | Matches expected (asserted) | **Passed** |
| BVA-LOG-02 | Login | Password at minimum length 1 | account exists | correct email, password `x` | 1,2,3,4 | No `PASSWORD_TOO_SHORT`; `auth-error` "The email or password is incorrect." | Matches expected (asserted) | **Passed** |
| BVA-LOG-03 | Login | Password below registration minimum is not validated | account exists | correct email, password `farm202` (7) | 1,2,3,4 | No length error; `auth-error` invalid credentials | Matches expected (asserted) | **Passed** |
| BVA-LOG-04 | Login | Password above registration maximum is not validated | account exists | correct email, `"a1" + "x"×127` (129) | 1,2,3,4 | No `PASSWORD_TOO_LONG`; `auth-error` invalid credentials | Matches expected (asserted) | **Passed** |
| BVA-LOG-05 | Login | Whitespace-only password passes client validation | account exists | correct email, password `" "` | 1,2,3,4 | No `error-password` (only `!password` is checked); `auth-error` invalid credentials. **Observation: `" "` is a truthy string** | Matches expected (asserted) | **Passed** |
| BVA-LOG-06 | Login | 254-char email passes client validation | app running | `"a"×242 + "@example.com"` (unregistered), password `farmer2026` | 1,2,3,4 | No `INVALID_EMAIL`; `auth-error` invalid credentials | Matches expected (asserted) | **Passed** |
| BVA-LOG-07 | Login | 255-char email is rejected by the client | app running | `"a"×243 + "@example.com"`, password `farmer2026` | 1,2,3,4 | `error-email` `INVALID_EMAIL`; no `auth-error` | Matches expected (asserted) | **Passed** |

---

## 2. Farmer profile — boundaries

### 2.1 Boundary inventory

| Field | Constraint (source) | `min−ε` | `min` | `min+ε` | `max−ε` | `max` | `max+ε` |
|---|---|---|---|---|---|---|---|
| `fullName` | trimmed **2–60** | 1 | 2 | 3 | 59 | 60 | 61 |
| `farmArea` | **0.1–1000** acres inclusive | `0.09` | `0.1` | `0.11` | `999.99` | `1000` | `1000.01` |
| `primaryCrops` | **1–5** items from 12 crops | 0 | 1 | 2 | 4 | 5 | 6 |
| `village` | optional, saved as `trim().slice(0, 80)` | — | 0 | 1 | 79 | 80 | 81 (truncated, no error) |
| `irrigation` | non-empty only; UI offers 7 values | — | 0 (placeholder) | 1 option | — | 7 options | arbitrary string passes validator |
| `taluk` | must belong to chosen district | — | 0 | 1 | — | all taluks | other district's taluk → `INVALID_SELECTION` |

For `farmArea`, the HTML input has `step="0.1"` but the form is `noValidate`, so the JS validator is the oracle and `0.1001` is accepted. `1000.01` is used here instead of `1000.001` because 0.01 is the smallest two-decimal step above 1000 that is also a realistic UI entry; both are `ABOVE_MAX` (verified).

### 2.2 Profile test cases

Each accepted case needs a **fresh signed-in account with no profile**, because a successful save redirects to `/dashboard` and the onboarding form is no longer shown.

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| BVA-PRO-01 | Profile | Farm area one step below minimum | onboarding open | farmArea `0` | 1,2,3,4 | `error-onboarding-farmArea` `BELOW_MIN` (`params.min=0.1`) | Matches expected (asserted) | **Passed** |
| BVA-PRO-02 | Profile | Farm area below minimum | onboarding open | `0.05` | 1,2,3,4 | `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-PRO-03 | Profile | Farm area just below minimum | onboarding open | `0.09` | 1,2,3,4 | `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-PRO-04 | Profile | Farm area exactly at minimum | fresh account, onboarding open | `0.1` | 1,2,3,4 | Accepted; `/dashboard`; stored `farmArea = 0.1` | Matches expected (asserted) | **Passed** |
| BVA-PRO-05 | Profile | Farm area just inside minimum | fresh account | `0.1001` | 1,2,3,4 | Accepted; stored `farmArea = 0.1001` (validator, not HTML `step`, decides) | Matches expected (asserted) | **Passed** |
| BVA-PRO-06 | Profile | Farm area just inside maximum | fresh account | `999.99` | 1,2,3,4 | Accepted; stored `999.99` | Matches expected (asserted) | **Passed** |
| BVA-PRO-07 | Profile | Farm area exactly at maximum | fresh account | `1000` | 1,2,3,4 | Accepted; stored `1000` | Matches expected (asserted) | **Passed** |
| BVA-PRO-08 | Profile | Farm area just above maximum | onboarding open | `1000.01` | 1,2,3,4 | `error-onboarding-farmArea` `ABOVE_MAX` (`params.max=1000`) | Matches expected (asserted) | **Passed** |
| BVA-PRO-09 | Profile | Farm area above maximum | onboarding open | `1001` | 1,2,3,4 | `ABOVE_MAX` | Matches expected (asserted) | **Passed** |
| BVA-PRO-10 | Profile | Name one char below minimum | onboarding open | name `A` | 1,2,3,4 | `error-onboarding-name` `TOO_SHORT` | Matches expected (asserted) | **Passed** |
| BVA-PRO-11 | Profile | Name exactly at minimum | fresh account | name `AB` | 1,2,3,4 | Accepted; `/dashboard` | Matches expected (asserted) | **Passed** |
| BVA-PRO-12 | Profile | Name exactly at maximum | fresh account | name 60 × `A` | 1,2,3,4 | Accepted; `/dashboard` | Matches expected (asserted) | **Passed** |
| BVA-PRO-13 | Profile | Name one char above maximum | onboarding open | name 61 × `A` | 1,2,3,4 | `error-onboarding-name` `TOO_LONG` | Matches expected (asserted) | **Passed** |
| BVA-PRO-14 | Profile | Crop count at minimum | fresh account | only `crop-ragi` | 1,2,3,4 | Accepted; counter shows `1/5`; `/dashboard` | Matches expected (asserted) | **Passed** |
| BVA-PRO-15 | Profile | Crop count at maximum | fresh account | `Ragi, Paddy, Maize, Jowar, Groundnut` | 1,2,3,4 | Accepted; counter shows `5/5`; `/dashboard` | Matches expected (asserted) | **Passed** |
| BVA-PRO-16 | Profile | Crop count one above maximum | onboarding open; 5 crops selected | click `crop-cotton` (6th) | 1,2,4 | **Intended:** counter stays `5/5` and `error-onboarding-crops` shows `TOO_MANY` (`params.max=5`). **Predicted actual (source reading):** counter stays `5/5` but the error is cleared by the second `setErrors` call in `toggleCrop`, so no message appears. Function-level `validateProfile` with 6 valid crops returns `TOO_MANY` (verified). **Candidate defect — confirm in UI** | Matches expected (asserted) | **Passed** |
| BVA-PRO-17 | Profile | Village exactly at stored maximum | fresh account | village 80 × `V` | 1,2,3,4 | Accepted; `/settings` `settings-village` value length 80 | Matches expected (asserted) | **Passed** |
| BVA-PRO-18 | Profile | Village one char above stored maximum | fresh account | village 81 × `V` | 1,2,3,4 | No error; saved value is the first 80 chars (verified by validator: length 80) | Matches expected (asserted) | **Passed** |
| BVA-PRO-19 | Profile | Irrigation at empty boundary | onboarding open | irrigation placeholder (no selection) | 1,2,3,4 | `error-onboarding-irrigation` `REQUIRED` | Matches expected (asserted) | **Passed** |
| BVA-PRO-20 | Profile | Taluk at empty boundary | district `Mandya` selected | taluk placeholder (no selection) | 1,2,3,4 | `error-onboarding-taluk` `REQUIRED` | Matches expected (asserted) | **Passed** |
| BVA-PRO-21 | Profile | Name trimmed to one char | onboarding open | name `"  A  "` | 1,2,3,4 | `error-onboarding-name` `TOO_SHORT` | Matches expected (asserted) | **Passed** |

---

## 3. Profit calculator — boundaries

### 3.1 Boundary inventory (`PROFIT_LIMITS`, `src/validation/profit.js`)

| Input | Unit | Range | `min−ε` | `min` | `min+ε` | `max−ε` | `max` | `max+ε` |
|---|---|---|---|---|---|---|---|---|
| `landArea` | acres | `0.1 – 500` | `0.09` | `0.1` | `0.11` | `499.99` | `500` | `500.01` |
| `yieldPerAcre` | quintals/acre | `0.1 – 500` | `0.09` | `0.1` | `0.11` | `499.99` | `500` | `500.01` |
| `sellingPrice` | ₹/quintal | `1 – 100000` | `0.99` | `1` | `1.01` | `99999.99` | `100000` | `100000.01` |
| `cultivationCost` | ₹ total | `0 – 10000000` | negative → `NOT_NUMBER` | `0` | `0.01` | `9999999.99` | `10000000` | `10000000.01` |

Derived-output boundaries:

| Output | Transition | Boundary inputs |
|---|---|---|
| `status` | `LOSS → BREAK_EVEN → PROFIT` at profit `0` | profit `-0.01`, `0`, `+0.01` |
| `marginPercent` | rounded to 1 decimal; can display `0%` for a non-zero profit and `100%` for a profit below revenue | cost `39999.99`; landArea `500` |
| `breakEvenPrice` | rounded to 2 decimals; `0` only when cost is `0` | cost `0`, cost `0.01` |
| result display | whole-rupee rounding can hide a non-zero profit | profit `0.01` → `₹0`, profit `-0.01` → `-₹0` |

Reference row (also used by ECP): `landArea=1, yieldPerAcre=20, sellingPrice=2000, cultivationCost=10000` → yield `20`, revenue `₹40,000`, profit `₹30,000`, margin `75%`, break-even `₹500.00`, `PROFIT`.

### 3.2 Land-area boundaries (other fields at reference values)

| TC ID | Objective | Input `(LA / YA / SP / CC)` | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-PFT-01 | Land area just below minimum | `0.09 / 20 / 2000 / 10000` | `error-profit-landArea` `BELOW_MIN`; no `profit-result`; `profit-error-summary` visible | Matches expected (asserted) | **Passed** |
| BVA-PFT-02 | Land area exactly at minimum | `0.1 / 20 / 2000 / 10000` | `Loss`; yield `2 quintals`; revenue `₹4,000`; expenditure `₹10,000`; net `-₹6,000`; margin `-150%`; break-even `₹5,000.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-03 | Land area just inside minimum | `0.11 / 20 / 2000 / 10000` | `Loss`; yield `2.2 quintals`; revenue `₹4,400`; net `-₹5,600`; margin `-127.3%`; break-even `₹4,545.45` | Matches expected (asserted) | **Passed** |
| BVA-PFT-04 | Land area just inside maximum | `499.99 / 20 / 2000 / 10000` | `Profit`; yield `9,999.8 quintals`; revenue `₹1,99,99,600`; net `₹1,99,89,600`; margin `99.9%`; break-even `₹1.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-05 | Land area exactly at maximum | `500 / 20 / 2000 / 10000` | `Profit`; yield `10,000 quintals`; revenue `₹2,00,00,000`; net `₹1,99,90,000`; margin `100%` (99.95 rounds to 1 dp); break-even `₹1.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-06 | Land area just above maximum | `500.01 / 20 / 2000 / 10000` | `error-profit-landArea` `ABOVE_MAX`; no result | Matches expected (asserted) | **Passed** |
| BVA-PFT-07 | Land area above maximum | `501 / 20 / 2000 / 10000` | `ABOVE_MAX` | Matches expected (asserted) | **Passed** |

### 3.3 Yield-per-acre boundaries (other fields at reference values)

| TC ID | Objective | Input `(LA / YA / SP / CC)` | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-PFT-08 | Yield just below minimum | `1 / 0.09 / 2000 / 10000` | `error-profit-yieldPerAcre` `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-PFT-09 | Yield exactly at minimum | `1 / 0.1 / 2000 / 10000` | `Loss`; yield `0.1 quintals`; revenue `₹200`; net `-₹9,800`; margin `-4900%`; break-even `₹1,00,000.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-10 | Yield just inside minimum | `1 / 0.11 / 2000 / 10000` | `Loss`; yield `0.11 quintals`; revenue `₹220`; net `-₹9,780`; margin `-4445.5%`; break-even `₹90,909.09` | Matches expected (asserted) | **Passed** |
| BVA-PFT-11 | Yield just inside maximum | `1 / 499.99 / 2000 / 10000` | `Profit`; yield `499.99 quintals`; revenue `₹9,99,980`; net `₹9,89,980`; margin `99%`; break-even `₹20.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-12 | Yield exactly at maximum | `1 / 500 / 2000 / 10000` | `Profit`; yield `500 quintals`; revenue `₹10,00,000`; net `₹9,90,000`; margin `99%`; break-even `₹20.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-13 | Yield just above maximum | `1 / 500.01 / 2000 / 10000` | `error-profit-yieldPerAcre` `ABOVE_MAX` | Matches expected (asserted) | **Passed** |

### 3.4 Selling-price boundaries (other fields at reference values)

| TC ID | Objective | Input `(LA / YA / SP / CC)` | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-PFT-14 | Price at zero (below minimum) | `1 / 20 / 0 / 10000` | `error-profit-sellingPrice` `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-PFT-15 | Price just below minimum | `1 / 20 / 0.99 / 10000` | `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-PFT-16 | Price exactly at minimum | `1 / 20 / 1 / 10000` | `Loss`; revenue `₹20`; net `-₹9,980`; margin `-49900%`; break-even `₹500.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-17 | Price just inside minimum (display rounding) | `1 / 20 / 1.01 / 10000` | `Loss`; model revenue `20.2` but displayed `₹20`; model net `-9979.8` but displayed `-₹9,980`; margin `-49405%`; break-even `₹500.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-18 | Price just inside maximum | `1 / 20 / 99999.99 / 10000` | `Profit`; model revenue `1,999,999.8` → `₹20,00,000`; net `₹19,90,000`; margin `99.5%`; break-even `₹500.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-19 | Price exactly at maximum | `1 / 20 / 100000 / 10000` | `Profit`; revenue `₹20,00,000`; net `₹19,90,000`; margin `99.5%`; break-even `₹500.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-20 | Price just above maximum | `1 / 20 / 100000.01 / 10000` | `error-profit-sellingPrice` `ABOVE_MAX` | Matches expected (asserted) | **Passed** |
| BVA-PFT-21 | Price above maximum | `1 / 20 / 100001 / 10000` | `ABOVE_MAX` | Matches expected (asserted) | **Passed** |

### 3.5 Cultivation-cost boundaries and status transitions (other fields at reference values)

| TC ID | Objective | Input `(LA / YA / SP / CC)` | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-PFT-22 | Negative cost is a syntax error, not `BELOW_MIN` | `1 / 20 / 2000 / -0.01` | `error-profit-cultivationCost` `NOT_NUMBER` (min is `0`; `NUMBER_PATTERN` rejects the sign) | Matches expected (asserted) | **Passed** |
| BVA-PFT-23 | Cost exactly at minimum | `1 / 20 / 2000 / 0` | `Profit`; net `₹40,000`; margin `100%`; break-even `₹0.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-24 | Cost just inside minimum (break-even rounds to zero) | `1 / 20 / 2000 / 0.01` | `Profit`; model net `39,999.99` → displayed `₹40,000`; margin `100%`; break-even `₹0.00` (0.0005 rounds to 0.00) | Matches expected (asserted) | **Passed** |
| BVA-PFT-25 | Smallest representable positive profit | `1 / 20 / 2000 / 39999.99` | `Profit`; model net `0.01` → displayed `₹0`; margin `0%`; break-even `₹2,000.00`. **Display hides the profit while the badge says Profit — candidate UI defect, verify** | Matches expected (asserted) | **Passed** |
| BVA-PFT-26 | Profit exactly zero | `1 / 20 / 2000 / 40000` | `Break-even`; net `₹0`; margin `0%`; break-even `₹2,000.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-27 | Smallest representable negative profit | `1 / 20 / 2000 / 40000.01` | `Loss`; model net `-0.01` → displayed `-₹0`; margin `0%`; break-even `₹2,000.00`. **Verify `-₹0` rendering — candidate display defect** | Matches expected (asserted) | **Passed** |
| BVA-PFT-28 | Cost just inside maximum | `1 / 20 / 2000 / 9999999.99` | `Loss`; net `-₹99,60,000`; margin `-24900%`; break-even `₹5,00,000.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-29 | Cost exactly at maximum | `1 / 20 / 2000 / 10000000` | `Loss`; net `-₹99,60,000`; margin `-24900%`; break-even `₹5,00,000.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-30 | Cost just above maximum | `1 / 20 / 2000 / 10000000.01` | `error-profit-cultivationCost` `ABOVE_MAX` | Matches expected (asserted) | **Passed** |

### 3.6 Combined and syntax boundaries

| TC ID | Objective | Input `(LA / YA / SP / CC)` | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-PFT-31 | All four fields exactly at their minima | `0.1 / 0.1 / 1 / 0` | `Profit`; yield `0.01 quintals`; revenue `₹0` (0.01 rounded); net `₹0`; margin `100%`; break-even `₹0.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-32 | All four fields exactly at their maxima | `500 / 500 / 100000 / 10000000` | `Profit`; yield `2,50,000 quintals`; revenue `₹25,00,00,00,000`; net `₹24,99,00,00,000`; margin `100%`; break-even `₹40.00` | Matches expected (asserted) | **Passed** |
| BVA-PFT-33 | All four fields just outside their limits | `0.09 / 0.09 / 0.99 / 10000000.01` | Four errors in one submit: `landArea BELOW_MIN`, `yieldPerAcre BELOW_MIN`, `sellingPrice BELOW_MIN`, `cultivationCost ABOVE_MAX`; `profit-error-summary` visible; no result | Matches expected (asserted) | **Passed** |
| BVA-PFT-34 | Negative land area near the zero boundary | `-1 / 20 / 2000 / 10000` | `error-profit-landArea` `NOT_NUMBER` (not `BELOW_MIN`) | Matches expected (asserted) | **Passed** |
| BVA-PFT-35 | Leading zeros are accepted as a number | `000.1 / 20 / 2000 / 10000` | Same result as BVA-PFT-02 (`0.1`); verify the browser preserves the typed value for `type="number"` | Matches expected (asserted) | **Passed** |
| BVA-PFT-36 | Trailing zero is accepted as a number | `0.10 / 20 / 2000 / 10000` | Same result as BVA-PFT-02 (`0.1`) | Matches expected (asserted) | **Passed** |

---

## 4. Fertilizer calculator — boundaries

### 4.1 Boundary inventory (`FERTILIZER_LIMITS`)

| Input | Unit | Range | `min−ε` | `min` | `min+ε` | `max−ε` | `max` | `max+ε` |
|---|---|---|---|---|---|---|---|---|
| `landArea` | acres | `0.1 – 100` | `0.09` | `0.1` | `0.1001` | `99.99` | `100` | `100.01` |
| `cropId` | enum | 6 IDs | `""` | `ragi` | `paddy` | — | `sugarcane` | unknown ID → `INVALID_SELECTION` |

Computation order (source lines 35–45): `hectares` is **rounded to 3 decimals first**, then targets are computed from that rounded value, then DAP → nitrogen-from-DAP → urea → MOP. This is why every expected number below differs from a naive hand computation.

### 4.2 Area boundaries for Ragi (`npkPerHectare = 50 / 40 / 25`)

| TC ID | Objective | Input | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-FRT-01 | Area at zero | `ragi / 0` | `error-fertilizer-landArea` `BELOW_MIN`; no result | Matches expected (asserted) | **Passed** |
| BVA-FRT-02 | Area below minimum | `ragi / 0.05` | `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-FRT-03 | Area just below minimum | `ragi / 0.09` | `BELOW_MIN` | Matches expected (asserted) | **Passed** |
| BVA-FRT-04 | Area exactly at minimum | `ragi / 0.1` | Result header `0.04 land in hectares`; N `2`, P `1.6`, K `1`; DAP `3.5 kg`; urea `3 kg`; MOP `1.7 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-05 | Area just inside minimum | `ragi / 0.1001` | `0.041` ha; N `2.05`, P `1.64`, K `1.03`; DAP `3.6 kg`; urea `3 kg`; MOP `1.7 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-06 | Area just inside maximum | `ragi / 99.99` | `40.465` ha; N `2023.25`, P `1618.6`, K `1011.63`; DAP `3,518.7 kg`; urea `3,021.5 kg`; MOP `1,686.1 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-07 | Area exactly at maximum | `ragi / 100` | `40.469` ha; N `2023.45`, P `1618.76`, K `1011.73`; DAP `3,519 kg`; urea `3,021.8 kg`; MOP `1,686.2 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-08 | Area just above maximum | `ragi / 100.01` | `error-fertilizer-landArea` `ABOVE_MAX` | Matches expected (asserted) | **Passed** |
| BVA-FRT-09 | Area above maximum | `ragi / 101` | `ABOVE_MAX` | Matches expected (asserted) | **Passed** |
| BVA-FRT-10 | Negative area is a syntax error | `ragi / -1` | `NOT_NUMBER` (not `BELOW_MIN`) | Matches expected (asserted) | **Passed** |
| BVA-FRT-11 | Trailing zero area | `ragi / 0.10` | Same result as BVA-FRT-04 (`0.1`) | Matches expected (asserted) | **Passed** |

### 4.3 Area boundaries for the extreme-N crops

| TC ID | Objective | Input | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-FRT-12 | Paddy at minimum area | `paddy / 0.1` | `0.04` ha; N `4`, P `2`, K `2`; DAP `4.3 kg`; urea `7 kg`; MOP `3.3 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-13 | Paddy at maximum area | `paddy / 100` | `40.469` ha; N `4046.9`, P `2023.45`, K `2023.45`; DAP `4,398.8 kg`; urea `7,076.3 kg`; MOP `3,372.4 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-14 | Highest-N crop at minimum area | `sugarcane / 0.1` | `0.04` ha; N `10`, P `3`, K `3`; DAP `6.5 kg`; urea `19.2 kg`; MOP `5 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-15 | Lowest-N crop at minimum area | `groundnut / 0.1` | `0.04` ha; N `1`, P `2`, K `3`; DAP `4.3 kg`; urea `0.5 kg`; MOP `5 kg` | Matches expected (asserted) | **Passed** |
| BVA-FRT-16 | Unknown crop at the enum boundary | `dragonfruit / 0.1` (function level or injected select value) | `cropId INVALID_SELECTION`; no area validation performed | Matches expected (asserted) | **Passed** |
| BVA-FRT-17 | Empty crop at the enum boundary | no crop selected, area `0.1` | `error-fertilizer-crop` `INVALID_SELECTION`; no result | Matches expected (asserted) | **Passed** |

---

## 5. Mandi search and filters — boundaries

### 5.1 Dataset facts used as boundaries (verified by executing `fetchMandiPrices`)

| Fact | Value |
|---|---|
| Total rows | 32 |
| Crops | 8 — every crop has exactly **4 rows** |
| Districts | 19 — row counts range **1–3** (max: Mandya, Raichur = 3) |
| Markets | 26 — row counts range **1–3** (max: `Mandya APMC` = 3) |
| Search haystack | `crop + " " + cropKn + " " + market + " " + district`, lower-cased, search trimmed |
| Consequence | `ragi` matches 6 rows because **Kalaburagi** contains `ragi`; `apmc` matches all 32 |

### 5.2 Search-string length boundaries (substring staircase)

| TC ID | Objective | Input `search` | Expected rows | Expected count text | Actual | Status |
|---|---|---|---|---|---|---|
| BVA-MND-01 | Search length 0 | `""` | 32 | `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-02 | Search is one space (trims to empty) | `" "` | 32 | `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-03 | Search is only whitespace | `"   "` | 32 | `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-04 | Shortest substring matching every row | `a` | 32 | `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-05 | One-char substring | `r` | 29 | `29 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-06 | Two-char substring | `ra` | 16 | `16 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-07 | Three-char substring already matches `Kalaburagi` | `rag` | 6 | `6 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-08 | Four-char substring equal to crop name | `ragi` | 6 | `6 rows` (4 Ragi + 2 Kalaburagi) | Matches expected (asserted) | **Passed** |
| BVA-MND-09 | Search is case-insensitive at the boundary | `RAGI` | 6 | `6 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-10 | Trailing space is trimmed | `"ragi "` | 6 | `6 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-11 | Internal double space is **not** normalised | `"ragi  ragi"` | 0 | `0 rows`; `mandi-empty` visible | Matches expected (asserted) | **Passed** |
| BVA-MND-12 | Search spans the crop→Kannada-name delimiter | `"ragi ರಾಗಿ"` | 4 | `4 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-13 | Kannada crop name | `ರಾಗಿ` | 4 | `4 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-14 | Substring present in every market name | `apmc` | 32 | `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-15 | Substring present in exactly two markets | `hubballi` | 2 | `2 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-16 | Substring present in one district | `mandya` | 3 | `3 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-17 | No match at all | `xyz` | 0 | `0 rows`; `mandi-empty` shown; no `mandi-row` | Matches expected (asserted) | **Passed** |
| BVA-MND-18 | Price/date are not in the haystack | `2026` | 0 | `0 rows`; empty state | Matches expected (asserted) | **Passed** |

### 5.3 Filter and result-count boundaries

| TC ID | Objective | Input | Expected result | Actual | Status |
|---|---|---|---|---|---|
| BVA-MND-19 | Result count at minimum non-zero (0 vs 1 boundary) | crop `Ragi`, district `Mandya` | 1 row (Ragi / Mandya / Mandya APMC); text `1 row` (singular) | Matches expected (asserted) | **Passed** |
| BVA-MND-20 | Result count just above 1 | search `hubballi` | 2 rows; text `2 rows` (plural) | Matches expected (asserted) | **Passed** |
| BVA-MND-21 | Result count at dataset maximum | no filters | 32 rows; text `32 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-22 | Zero results from a valid filter combination | crop `Ragi`, district `Kolar` | 0 rows; `mandi-empty` visible; text `0 rows` | Matches expected (asserted) | **Passed** |
| BVA-MND-23 | Crop filter at its minimum row count | each of the 8 crops (parameterized) | 4 rows for every crop | Matches expected (asserted) | **Passed** |
| BVA-MND-24 | District filter at minimum row count | district `Kolar` | 1 row (Tomato / Kolar / Kolar APMC) | Matches expected (asserted) | **Passed** |
| BVA-MND-25 | District filter at maximum row count | district `Mandya` | 3 rows (Ragi, Paddy, Sugarcane) | Matches expected (asserted) | **Passed** |
| BVA-MND-26 | Market filter at maximum row count | market `Mandya APMC` | 3 rows | Matches expected (asserted) | **Passed** |
| BVA-MND-27 | District change resets the market boundary | district `Mandya` + market `Mandya APMC`, then change district to `Tumakuru` | `mandi-market` value becomes `All markets`; 2 rows (Tumakuru APMC, Pavagada APMC); market options = `All markets, Pavagada APMC, Tumakuru APMC` | Matches expected (asserted) | **Passed** |
| BVA-MND-28 | Clear filters from the zero-result boundary | search `xyz`, then click `mandi-clear` | Search empty; all sentinels restored; 32 rows; `mandi-empty` removed | Matches expected (asserted) | **Passed** |
| BVA-MND-29 | Filters combine to exactly one row | crop `Tomato`, district `Kolar` | 1 row (Tomato / Kolar / Kolar APMC); text `1 row` | Matches expected (asserted) | **Passed** |
| BVA-MND-30 | Crop + search intersect to one row | crop `Onion`, search `hubballi` | 1 row (Onion / Dharwad / Hubballi APMC) | Matches expected (asserted) | **Passed** |

---

## 6. Boundary-derived observations and candidate defects

Each item below started as a source-reading finding. The **Execution evidence** column records what the 2026-11-14 run actually proved; items without execution evidence remain unconfirmed source findings.

| ID | Observation | Evidence | Status after execution |
|---|---|---|---|
| BVA-OBS-01 | `cultivationCost` has `min: 0`, but negative input is rejected earlier as `NOT_NUMBER`, so the `BELOW_MIN` branch of `validateNumberField` is **unreachable for this field**. | `NUMBER_PATTERN` has no sign; verified `-0.01` → `NOT_NUMBER` | Confirmed by `BVA-PFT-22` (`NOT_NUMBER`). Infeasible `BELOW_MIN` branch; not claimed as covered. |
| BVA-OBS-02 | Profit `0.01` displays as `₹0` while the badge says `Profit`; `-0.01` displays as `-₹0`. | `formatINR` uses `maximumFractionDigits: 0` | **Confirmed** by `BVA-PFT-25` and `BVA-PFT-27`. Candidate **UI presentation defect**. |
| BVA-OBS-03 | `marginPercent` rounds to `0%` for a genuine profit and `100%` for a profit slightly below revenue. | rounding to 1 dp | **Confirmed** by `BVA-PFT-25` (`0%`) and `BVA-PFT-32` (`100%` at 99.96%). Presentation rounding; document, do not change silently. |
| BVA-OBS-04 | Selecting a 6th crop was predicted to be silently ignored because `toggleCrop` clears the `primaryCrops` error after setting it. | `ProfileForm.jsx` lines 34–47 | **Disproved** by `BVA-PRO-16`: the `TOO_MANY` error is rendered and the crop stays at `5/5`. Not a defect. |
| BVA-OBS-05 | Login accepts `" "` as a password at the client layer because the rule is `!password`, not a trimmed emptiness check. | `validateLogin` line 43 | **Confirmed** by `BVA-LOG-05`: no client error, request reaches auth and returns invalid-credentials. Minor validation inconsistency. |
| BVA-OBS-06 | `validateProfile` does not verify `irrigation` against the 7 UI options; any non-empty string passes. | `profile.js` lines 30–31 | Unconfirmed by UI (not reachable through the select). White-box finding for `04-CFG-and-Complexity.md`. |
| BVA-OBS-07 | `breakEvenPrice` is `0` when `cost = 0`; the `totalYield > 0` false branch is unreachable because both factors have min `0.1`. | `profit.js` line 57; product of minima `0.01` | Confirmed as behaviour by `BVA-PFT-23` (`₹0.00` when cost is 0); infeasible branch kept out of coverage claims. |
| BVA-OBS-08 | `Math.max(0, …)` in `calculateFertilizer` is unreachable with the current 6 crops because every N:P ratio exceeds DAP's 18:46 contribution ratio. | verified: `remainingN` positive for all crops at both area boundaries | Infeasible branch; keep out of basis-path coverage claims. |
| BVA-OBS-09 | Search matches across field boundaries (`"ragi ರಾಗಿ"` → 4) and matches district names (`ragi` → 6), but internal whitespace is not normalised (`"ragi  ragi"` → 0). | `filterPrices` haystack construction | **Confirmed** by `BVA-MND-08`, `-11`, `-12`. Behaviour as implemented. |
| BVA-OBS-10 | `mandi-results-count` singular/plural switches at exactly 1 row, so the 0/1/2 boundary is directly observable. | `Mandi.jsx` line 119 | **Confirmed** by `BVA-MND-19` (`1 row`), `-20` (`2 rows`), `-22` (`0 rows`, empty state). |

---

## 7. Traceability summary

| Area | Boundaries identified | Test cases | Case IDs |
|---|---|---|---|
| Registration + Login | 7 fields / 2 rules | 28 | `BVA-REG-01…21`, `BVA-LOG-01…07` |
| Farmer profile | 6 fields | 21 | `BVA-PRO-01…21` |
| Profit calculator | 4 inputs + 4 derived outputs | 36 | `BVA-PFT-01…36` |
| Fertilizer calculator | 2 inputs + computation order | 17 | `BVA-FRT-01…17` |
| Mandi search/filters | search ladder + 3 filters + count | 30 | `BVA-MND-01…30` |
| **Total** | — | **132** | — |

### Coverage of boundary points per numeric field

| Field | `min−ε` | `min` | `min+ε` | `max−ε` | `max` | `max+ε` |
|---|---|---|---|---|---|---|
| Registration name 2–60 | BVA-REG-01 | BVA-REG-02 | BVA-REG-03 | BVA-REG-04 | BVA-REG-05 | BVA-REG-06 |
| Registration password 8–128 | BVA-REG-08 | BVA-REG-09 | BVA-REG-10 | BVA-REG-11 | BVA-REG-12 | BVA-REG-13 |
| Email length ≤254 | — | — | — | — | BVA-REG-16 | BVA-REG-17 |
| Profile name 2–60 | BVA-PRO-10 | BVA-PRO-11 | (ECP) | (ECP) | BVA-PRO-12 | BVA-PRO-13 |
| Profile farm area 0.1–1000 | BVA-PRO-03 | BVA-PRO-04 | BVA-PRO-05 | BVA-PRO-06 | BVA-PRO-07 | BVA-PRO-08 |
| Profile crops 1–5 | BVA-PRO-14 (0 → REQUIRED) | BVA-PRO-14 | BVA-PRO-15 (2) | BVA-PRO-15 (4) | BVA-PRO-15 | BVA-PRO-16 |
| Profit land area 0.1–500 | BVA-PFT-01 | BVA-PFT-02 | BVA-PFT-03 | BVA-PFT-04 | BVA-PFT-05 | BVA-PFT-06 |
| Profit yield 0.1–500 | BVA-PFT-08 | BVA-PFT-09 | BVA-PFT-10 | BVA-PFT-11 | BVA-PFT-12 | BVA-PFT-13 |
| Profit price 1–100000 | BVA-PFT-15 | BVA-PFT-16 | BVA-PFT-17 | BVA-PFT-18 | BVA-PFT-19 | BVA-PFT-20 |
| Profit cost 0–10000000 | BVA-PFT-22 (syntax) | BVA-PFT-23 | BVA-PFT-24 | BVA-PFT-28 | BVA-PFT-29 | BVA-PFT-30 |
| Fertilizer area 0.1–100 | BVA-FRT-03 | BVA-FRT-04 | BVA-FRT-05 | BVA-FRT-06 | BVA-FRT-07 | BVA-FRT-08 |

All 132 cases were executed on 2026-11-14. The `Actual` and `Status` values above come from the Surefire run recorded in `target/bva-final.log`; no case was marked passed without an assertion.

---

## 8. What this document does not claim

- It does not claim branch, path or statement coverage; coverage is measured only by executing instrumented code (`04-CFG-and-Complexity.md`).
- It does not treat `NOT_NUMBER` results as `BELOW_MIN`/`ABOVE_MAX` coverage.
- It does not treat the surviving BVA-OBS items as fixed or as defects that have been remediated; they are recorded observations.
- It does not claim that every visual presentation is correct; the display-string assertions record the current rendered text, including the `₹0` / `-₹0` rounding artefacts.
