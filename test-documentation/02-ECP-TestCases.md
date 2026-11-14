# KrishiConnect — Equivalence Class Partitioning (ECP) Test Cases

**Prepared by:** Student 2
**Scope:** Registration & Login, Farmer Profile, Profit Calculator, Fertilizer Calculator, Mandi search & filters
**Basis:** actual source code in `krishiconnect-build/src/validation/*` and `src/services/mandiService.js` (see `01-Inspection-and-Gap-Analysis.md` §4)
**Execution status:** **EXECUTED 2026-11-14.** All 86 case IDs below (92 JUnit executions, because `ECP-PRO-12` runs twice and `ECP-FRT-09` runs once per crop) passed against the running app. Evidence: `target/ecp-final.log`, `target/surefire-reports/com.krishiconnect.qa.tests.ecp.*.txt`.

---

## 0. Common test procedure

### Environment assumed by every case

| Item | Value |
|---|---|
| Base URL | `http://127.0.0.1:5173` (Vite dev server, `--host 127.0.0.1`) |
| Browser | Microsoft Edge 157.0.4341.60 via EdgeDriver 157.0.4341.60, one session per test class |
| Data mode | Demo mode (`localStorage`, no Firebase credentials) |
| Login account used by profile/login cases | created in test setup with password `farmer2026` |
| Wait policy | explicit waits on `data-testid` elements; no fixed sleeps |
| Runner | JUnit 5.11.4 + Selenium 4.27.0 + Maven 3.9.11 on Temurin JDK 21.0.13 |

### Step legends

| Code | Registration | Login |
|---|---|---|
| 1 | Open `/register` | Open `/login` |
| 2 | Enter the four field values | Enter email and password |
| 3 | Click `register-submit` | Click `login-submit` |
| 4 | Observe field errors / `auth-error` / URL | Observe field errors / `auth-error` / URL |

| Code | Profile (onboarding / settings) | Profit calculator |
|---|---|---|
| 1 | Open `/onboarding` (new account) or `/settings` (existing profile) | Open `/calculator/profit` |
| 2 | Fill/select name, village, district, taluk, area, irrigation, language, crops | Enter the four numeric fields (and optional label) |
| 3 | Click `onboarding-submit` / `settings-submit` | Click `profit-calculate` |
| 4 | Observe `error-*`, toast, redirect or saved values | Observe `profit-result` fields / `error-profit-*` / `profit-error-summary` |

| Code | Fertilizer calculator | Mandi |
|---|---|---|
| 1 | Open `/calculator/fertilizer` | Open `/mandi` |
| 2 | Select crop and enter land area | Set search / crop / district / market |
| 3 | Click `fertilizer-calculate` | Observe result count, table rows, empty state |
| 4 | Observe `fertilizer-result` fields / `error-fertilizer-*` | — |

### Assertion convention

For validation, assert the stable error code via `data-error-code` on `data-testid="error-<field-id>"`, not the translated sentence. For outcomes, assert `data-testid` values (e.g. `profit-result-status`, `mandi-results-count`).

---

## 1. Registration and Login

### 1.1 Equivalence classes — Registration (`validateRegistration`)

| Class ID | Input | Type | Description | Representative value | Expected |
|---|---|---|---|---|---|
| RN-01 | fullName | Valid | trimmed length 2–60 | `Asha Rao` | accepted |
| RN-02 | fullName | Invalid | empty / whitespace only | `"   "` | `REQUIRED` |
| RN-03 | fullName | Invalid | trimmed length 1 | `A` | `TOO_SHORT` |
| RN-04 | fullName | Invalid | trimmed length > 60 | 61 × `A` | `TOO_LONG` |
| RE-01 | email | Valid | matches email regex, length ≤ 254 | `asha.rao@example.com` | accepted, lower-cased |
| RE-02 | email | Invalid | empty | `""` | `REQUIRED` |
| RE-03 | email | Invalid | malformed (no `@`, no TLD, spaces, double `@`) | `asha.example.com` | `INVALID_EMAIL` |
| RE-04 | email | Valid | upper case + surrounding spaces | `"  ASHA@EXAMPLE.COM  "` | accepted as `asha@example.com` |
| RE-05 | email | Invalid | length > 254 | 255-character address | `INVALID_EMAIL` |
| RP-01 | password | Valid | length 8–128, ≥1 letter and ≥1 digit | `farmer2026` | accepted |
| RP-02 | password | Invalid | empty / whitespace only | `"   "` | `REQUIRED` |
| RP-03 | password | Invalid | length 7 | `farm202` | `PASSWORD_TOO_SHORT` |
| RP-04 | password | Invalid | length 129 | 129 chars with letter+digit | `PASSWORD_TOO_LONG` |
| RP-05 | password | Invalid | length ≥ 8, no digit | `farmerpass` | `PASSWORD_WEAK` |
| RP-06 | password | Invalid | length ≥ 8, no letter | `12345678` | `PASSWORD_WEAK` |
| RC-01 | confirmPassword | Valid | identical to password | `farmer2026` | accepted |
| RC-02 | confirmPassword | Invalid | empty | `""` | `REQUIRED` |
| RC-03 | confirmPassword | Invalid | differs (case-sensitive) | `Farmer2026` | `PASSWORD_MISMATCH` |
| RS-01 | email uniqueness | Valid | email not registered | unique email | account created → `/onboarding` |
| RS-02 | email uniqueness | Invalid | email already registered | existing email | `AUTH_EMAIL_IN_USE` |

### 1.2 Registration test cases

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-REG-01 | Registration | Accept a fully valid registration | App running; clean `localStorage`; email unused | `Asha Rao` / `asha.rao.01@example.com` / `farmer2026` / `farmer2026` | 1,2,3,4 | No field error; URL `/onboarding`; account exists in `kc.demo.users.v1` | Onboarding reached; header shows asha.rao.01@example.com; exactly one record in kc.demo.users.v1; no field error. | Pass |
| ECP-REG-02 | Registration | Reject empty form | clean state | all fields empty | 1,2,3,4 | Four errors: `error-fullName`, `error-email`, `error-password`, `error-confirmPassword`, all code `REQUIRED`; stays on `/register` | REQUIRED on fullName, email, password and confirmPassword; URL stays /register. | Pass |
| ECP-REG-03 | Registration | Reject 1-character name | clean state | name `A`, other fields valid | 1,2,3,4 | `error-fullName` code `TOO_SHORT` | error-fullName code TOO_SHORT; URL stays /register. | Pass |
| ECP-REG-04 | Registration | Reject 61-character name | clean state | name 61×`A` | 1,2,3,4 | `error-fullName` code `TOO_LONG` | error-fullName code TOO_LONG; URL stays /register. | Pass |
| ECP-REG-05 | Registration | Reject malformed email | clean state | email `asha.example.com` | 1,2,3,4 | `error-email` code `INVALID_EMAIL` | error-email code INVALID_EMAIL; URL stays /register. | Pass |
| ECP-REG-06 | Registration | Reject over-long email | clean state | email length 255 (valid shape otherwise) | 1,2,3,4 | `error-email` code `INVALID_EMAIL` | error-email code INVALID_EMAIL; URL stays /register. | Pass |
| ECP-REG-07 | Registration | Normalise email case/whitespace | clean state; email unused | `"  ASHA.REG.07@EXAMPLE.COM  "` | 1,2,3,4 | Accepted; `/onboarding` header shows `asha.reg.07@example.com` | Onboarding reached; header and the stored user record both show asha.reg.07@example.com. | Pass |
| ECP-REG-08 | Registration | Reject 7-character password | clean state | password `farm202` | 1,2,3,4 | `error-password` code `PASSWORD_TOO_SHORT` | error-password code PASSWORD_TOO_SHORT; URL stays /register. | Pass |
| ECP-REG-09 | Registration | Reject 129-character password | clean state | 129-char password containing letter+digit | 1,2,3,4 | `error-password` code `PASSWORD_TOO_LONG` | error-password code PASSWORD_TOO_LONG; URL stays /register. | Pass |
| ECP-REG-10 | Registration | Reject password without a digit | clean state | password `farmerpass` | 1,2,3,4 | `error-password` code `PASSWORD_WEAK` | error-password code PASSWORD_WEAK; URL stays /register. | Pass |
| ECP-REG-11 | Registration | Reject password without a letter | clean state | password `12345678` | 1,2,3,4 | `error-password` code `PASSWORD_WEAK` | error-password code PASSWORD_WEAK; URL stays /register. | Pass |
| ECP-REG-12 | Registration | Reject empty confirmation | clean state | password valid, confirm empty | 1,2,3,4 | `error-confirmPassword` code `REQUIRED` | error-confirmPassword code REQUIRED; URL stays /register. | Pass |
| ECP-REG-13 | Registration | Reject mismatched confirmation | clean state | `farmer2026` / `Farmer2026` | 1,2,3,4 | `error-confirmPassword` code `PASSWORD_MISMATCH` | error-confirmPassword code PASSWORD_MISMATCH; URL stays /register. | Pass |
| ECP-REG-14 | Registration | Reject duplicate email | account `asha.dup@example.com` exists | same email again | 1,2,3,4 | `auth-error` text "An account with this email already exists."; stays on `/register` | auth-error shows "An account with this email already exists."; URL stays /register; no second user record. | Pass |
| ECP-REG-15 | Registration | Check password whitespace class | clean state | password `" abc12345 "` (10 chars) | 1,2,3,4 | Accepted (password is not trimmed). Observation: spaces become part of the credential | Accepted; onboarding reached. Password is not trimmed, so the surrounding spaces become part of the credential. | Pass |

### 1.3 Equivalence classes — Login (`validateLogin`)

| Class ID | Input | Type | Description | Representative value | Expected |
|---|---|---|---|---|---|
| LE-01 | email | Valid | registered email, any case/spaces | `asha.login@example.com` | accepted |
| LE-02 | email | Invalid | empty | `""` | `REQUIRED` |
| LE-03 | email | Invalid | malformed | `asha@` | `INVALID_EMAIL` |
| LP-01 | password | Valid | any non-empty string | `farmer2026` | passes client validation |
| LP-02 | password | Invalid | empty | `""` | `REQUIRED` |
| LP-03 | password | Valid (client) / invalid (server) | 1 character | `x` | `AUTH_INVALID_CREDENTIAL` (not a length error) |
| LS-01 | credentials | Valid | email + correct password | valid pair | `/dashboard` |
| LS-02 | credentials | Invalid | unknown email | `nobody@example.com` | `AUTH_INVALID_CREDENTIAL` |
| LS-03 | credentials | Invalid | wrong password | `wrongpass1` | `AUTH_INVALID_CREDENTIAL` |

### 1.4 Login test cases

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-LOG-01 | Login | Sign in with valid credentials | Account `asha.login@example.com` / `farmer2026` exists | same credentials | 1,2,3,4 | URL `/dashboard`; greeting contains profile name; no `auth-error` | URL /dashboard; profile panel greets the registered farmer; auth-error absent. | Pass |
| ECP-LOG-02 | Login | Reject empty email | app running | email `""`, password valid | 1,2,3,4 | `error-email` code `REQUIRED` | error-email code REQUIRED; URL stays /login; auth-error absent (client validation stops the request). | Pass |
| ECP-LOG-03 | Login | Reject malformed email | app running | email `asha@` | 1,2,3,4 | `error-email` code `INVALID_EMAIL` | error-email code INVALID_EMAIL; URL stays /login; auth-error absent. | Pass |
| ECP-LOG-04 | Login | Reject empty password | app running | email valid, password `""` | 1,2,3,4 | `error-password` code `REQUIRED` | error-password code REQUIRED; URL stays /login; auth-error absent. | Pass |
| ECP-LOG-05 | Login | Show server error for unknown email | app running | `nobody@example.com` / `farmer2026` | 1,2,3,4 | `auth-error` "The email or password is incorrect."; stays on `/login` | auth-error shows "The email or password is incorrect."; URL stays /login. | Pass |
| ECP-LOG-06 | Login | Show server error for wrong password | account exists | valid email / `wrongpass1` | 1,2,3,4 | `auth-error` "The email or password is incorrect." | auth-error shows "The email or password is incorrect."; URL stays /login. | Pass |
| ECP-LOG-07 | Login | Confirm login password has no strength rule | account exists | valid email / `x` | 1,2,3,4 | No `PASSWORD_TOO_SHORT`; `auth-error` `AUTH_INVALID_CREDENTIAL` | No PASSWORD_TOO_SHORT or other strength code; auth-error reports incorrect credentials; URL stays /login. | Pass |
| ECP-LOG-08 | Login | Normalise email case/spaces | account exists | `"  ASHA.LOGIN@EXAMPLE.COM  "` + correct password | 1,2,3,4 | `/dashboard` | URL /dashboard; the mixed-case, space-padded email signs in to the same account. | Pass |
| ECP-LOG-09 | Login | Redirect authenticated user away from login | signed-in session | open `/login` | 1 | Redirect to `/dashboard` | Direct navigation to /login by a signed-in user lands on /dashboard. | Pass |
| ECP-LOG-10 | Login | Show demo notice | demo mode (no Firebase) | open `/login` | 1 | `login-demo-notice` visible; Google button absent | login-demo-notice visible; google-signin not rendered in demo mode. | Pass |

---

## 2. Farmer profile (onboarding and settings)

### 2.1 Equivalence classes (`validateProfile`)

| Class ID | Input | Type | Description | Representative value | Expected |
|---|---|---|---|---|---|
| PN-01 | fullName | Valid | trimmed 2–60 | `Asha Rao` | accepted |
| PN-02 | fullName | Invalid | empty | `""` | `REQUIRED` |
| PN-03 | fullName | Invalid | 1 character | `A` | `TOO_SHORT` |
| PN-04 | fullName | Invalid | > 60 | 61 chars | `TOO_LONG` |
| PD-01 | district | Valid | one of the 31 districts | `Mandya` | accepted |
| PD-02 | district | Invalid | empty | `""` | `REQUIRED` |
| PD-03 | district | Invalid | not in list (not UI-reachable) | `Atlantis` | `INVALID_SELECTION` |
| PT-01 | taluk | Valid | taluk of selected district | `Mandya` | accepted |
| PT-02 | taluk | Invalid | empty | `""` | `REQUIRED` |
| PT-03 | taluk | Invalid | taluk of another district (not UI-reachable) | district `Mandya`, taluk `Mysuru` | `INVALID_SELECTION` |
| PL-01 | language | Valid | `en` or `kn` | `en` | accepted |
| PL-02 | language | Invalid | any other value (not UI-reachable) | `fr` | `INVALID_SELECTION` |
| PA-01 | farmArea | Valid | 0.1–1000 acres | `2.5` | accepted |
| PA-02 | farmArea | Invalid | empty | `""` | `REQUIRED` |
| PA-03 | farmArea | Invalid | non-numeric (function level) | `abc` | `NOT_NUMBER` |
| PA-04 | farmArea | Invalid | below 0.1 | `0` / `0.05` | `BELOW_MIN` |
| PA-05 | farmArea | Invalid | above 1000 | `1000.5` | `ABOVE_MAX` |
| PI-01 | irrigation | Valid | any non-empty string; UI offers 7 options | `Canal` | accepted |
| PI-02 | irrigation | Invalid | empty | `""` | `REQUIRED` |
| PI-03 | irrigation | Observation | arbitrary non-empty string passes validator (not UI-reachable) | `Magic water` | accepted — validator gap |
| PC-01 | primaryCrops | Valid | 1–5 valid crops | `[Ragi, Paddy]` | accepted |
| PC-02 | primaryCrops | Invalid | none selected | `[]` | `REQUIRED` |
| PC-03 | primaryCrops | Invalid | more than 5 | 6 crops | `TOO_MANY` |
| PC-04 | primaryCrops | Invalid | unknown crop (not UI-reachable) | `[Dragonfruit]` | `INVALID_SELECTION` |
| PV-01 | village | Valid | optional, ≤ 80 chars | `KRS Halli` | accepted |
| PV-02 | village | Boundary | > 80 chars | 81 chars | no error; saved value is first 80 chars |

### 2.2 Profile test cases

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-PRO-01 | Profile | Save a fully valid profile | signed in; no profile yet | `Asha Rao`, `KRS Halli`, `Mandya`/`Mandya`, `en`, `2.5`, `Canal`, crops `Ragi`,`Paddy` | 1,2,3,4 | Redirect `/dashboard`; profile card shows name, district, taluk; no `error-onboarding-*` | URL /dashboard; profile card shows Asha Rao and Mandya; no error-onboarding-* remains; stored farmArea is 2.5. | Pass |
| ECP-PRO-02 | Profile | Reject empty name | onboarding open | name `""`, other fields valid | 1,2,3,4 | `error-onboarding-name` code `REQUIRED` | error-onboarding-name code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-03 | Profile | Reject 1-character name | onboarding open | name `A` | 1,2,3,4 | `error-onboarding-name` code `TOO_SHORT` | error-onboarding-name code TOO_SHORT; URL stays /onboarding. | Pass |
| ECP-PRO-04 | Profile | Reject 61-character name | onboarding open | 61 chars | 1,2,3,4 | `error-onboarding-name` code `TOO_LONG` | error-onboarding-name code TOO_LONG; URL stays /onboarding. | Pass |
| ECP-PRO-05 | Profile | Reject missing district | onboarding open | district unselected | 1,2,3,4 | `error-onboarding-district` code `REQUIRED`; taluk disabled | Taluk select disabled before submit; error-onboarding-district code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-06 | Profile | Reject missing taluk | district selected | taluk `""` | 1,2,3,4 | `error-onboarding-taluk` code `REQUIRED` | error-onboarding-taluk code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-07 | Profile | Reset taluk when district changes | district `Mandya`, taluk `Mandya` selected | change district to `Mysuru` | 1,2,4 | Taluk value becomes empty; then `REQUIRED` on submit | Taluk value becomes empty on district change; submit reports REQUIRED for taluk. | Pass |
| ECP-PRO-08 | Profile | Reject taluk from another district (validator) | validator-level test (option B) | district `Mandya`, taluk `Mysuru` | — | `INVALID_SELECTION` for taluk. **Not UI-reachable** — record as validator-only | Bridge validateProfile returns ok=false with taluk INVALID_SELECTION and no district error. | Pass |
| ECP-PRO-09 | Profile | Reject empty farm area | onboarding open | farmArea `""` | 1,2,3,4 | `error-onboarding-farmArea` code `REQUIRED` | error-onboarding-farmArea code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-10 | Profile | Reject farm area below minimum | onboarding open | farmArea `0` | 1,2,3,4 | `error-onboarding-farmArea` code `BELOW_MIN` | error-onboarding-farmArea code BELOW_MIN; URL stays /onboarding. | Pass |
| ECP-PRO-11 | Profile | Reject farm area above maximum | onboarding open | farmArea `1000.5` | 1,2,3,4 | `error-onboarding-farmArea` code `ABOVE_MAX` | error-onboarding-farmArea code ABOVE_MAX; URL stays /onboarding. | Pass |
| ECP-PRO-12 | Profile | Accept boundary-valid farm areas | onboarding open | `0.1` then separately `1000` | 1,2,3,4 | Both accepted (covered fully in BVA) | Both 0.1 and 1000 accepted; each persisted farmArea matches the entered value (2 executions). | Pass |
| ECP-PRO-13 | Profile | Reject missing irrigation | onboarding open | irrigation unselected | 1,2,3,4 | `error-onboarding-irrigation` code `REQUIRED` | error-onboarding-irrigation code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-14 | Profile | Reject no crops | onboarding open | no crop selected | 1,2,3,4 | `error-onboarding-crops` code `REQUIRED` | error-onboarding-crops code REQUIRED; URL stays /onboarding. | Pass |
| ECP-PRO-15 | Profile | Enforce 5-crop maximum | onboarding open; 5 crops selected | click a 6th crop | 1,2,4 | Crop count stays 5/5; `error-onboarding-crops` reports `TOO_MANY` | Crop counter stays 5/5 after clicking a sixth crop; error-onboarding-crops reports TOO_MANY. | Pass |
| ECP-PRO-16 | Profile | Accept 1 crop | onboarding open | only `Ragi` | 1,2,3,4 | Saved; redirect `/dashboard` | Profile saved with a single crop; URL /dashboard and card shows Asha Rao. | Pass |
| ECP-PRO-17 | Profile | Truncate over-long village silently | onboarding open | village 81 × `V` | 1,2,3,4 | No error; dashboard/`localStorage` contains first 80 chars | No error; persisted and reloaded village is 80 characters, the trailing character is dropped. | Pass |
| ECP-PRO-18 | Profile | Persist profile edits from Settings | signed-in user with profile | change farmArea to `3.5`; submit | 1,2,3,4 | Toast "Farm profile updated."; value persists after reload | Toast reads "Farm profile updated."; 3.5 survives a settings reload and is stored as 3.5. | Pass |

---

## 3. Profit calculator

### 3.1 Equivalence classes (`calculateProfit`)

| Class ID | Input | Type | Description | Representative value | Expected |
|---|---|---|---|---|---|
| PF-LA-01 | landArea | Valid | 0.1–500 | `1` | accepted |
| PF-LA-02 | landArea | Invalid | empty | `""` | `REQUIRED` |
| PF-LA-03 | landArea | Invalid | non-numeric / signed / exponent | `-1`, `1e3`, `.5` | `NOT_NUMBER` |
| PF-LA-04 | landArea | Invalid | < 0.1 | `0.05` | `BELOW_MIN` |
| PF-LA-05 | landArea | Invalid | > 500 | `500.5` | `ABOVE_MAX` |
| PF-YA-01 | yieldPerAcre | Valid | 0.1–500 | `20` | accepted |
| PF-YA-02 | yieldPerAcre | Invalid | empty | `""` | `REQUIRED` |
| PF-YA-03 | yieldPerAcre | Invalid | non-numeric | `abc` | `NOT_NUMBER` |
| PF-YA-04 | yieldPerAcre | Invalid | < 0.1 | `0` | `BELOW_MIN` |
| PF-YA-05 | yieldPerAcre | Invalid | > 500 | `501` | `ABOVE_MAX` |
| PF-SP-01 | sellingPrice | Valid | 1–100000 | `2000` | accepted |
| PF-SP-02 | sellingPrice | Invalid | empty | `""` | `REQUIRED` |
| PF-SP-03 | sellingPrice | Invalid | non-numeric | `₹2000` | `NOT_NUMBER` |
| PF-SP-04 | sellingPrice | Invalid | < 1 | `0` | `BELOW_MIN` |
| PF-SP-05 | sellingPrice | Invalid | > 100000 | `100001` | `ABOVE_MAX` |
| PF-CC-01 | cultivationCost | Valid | 0–10000000 | `10000` | accepted |
| PF-CC-02 | cultivationCost | Invalid | empty | `""` | `REQUIRED` |
| PF-CC-03 | cultivationCost | Invalid | negative | `-1` | `NOT_NUMBER` (regex rejects the sign) |
| PF-CC-04 | cultivationCost | Invalid | > 10000000 | `10000001` | `ABOVE_MAX` |
| PF-CC-05 | cultivationCost | Valid | exactly 0 | `0` | accepted |
| PF-OUT-01 | outcome | Valid | profit > 0 | reference scenario | status `PROFIT` |
| PF-OUT-02 | outcome | Valid | profit = 0 | revenue = cost | status `BREAK_EVEN` |
| PF-OUT-03 | outcome | Valid | profit < 0 | cost > revenue | status `LOSS` |
| PF-LB-01 | label | Valid | optional/empty | `""` | calculation still runs |

### 3.2 Profit test cases

Reference scenario for arithmetic: `landArea=1`, `yieldPerAcre=20`, `sellingPrice=2000`, `cultivationCost=10000` → total yield 20, revenue ₹40,000, profit ₹30,000, margin 75 %, break-even ₹500.00, status Profit. The margin element prints the raw number, so the DOM text is `75%` (not `75.0%`).

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-PFT-01 | Profit | Compute a profitable season | app running | 1 / 20 / 2000 / 10000 | 1,2,3,4 | `profit-result-status` = Profit; total yield 20; revenue ₹40,000; expenditure ₹10,000; net ₹30,000; margin `75%`; break-even ₹500.00 | Status Profit; total yield 20 quintals; revenue INR 40,000; expenditure INR 10,000; net INR 30,000; margin 75%; break-even INR 500.00. | Pass |
| ECP-PFT-02 | Profit | Compute break-even | app running | 1 / 20 / 2000 / 40000 | 1,2,3,4 | status Break-even; net ₹0; margin `0%` | Status Break-even; net INR 0; margin 0%; break-even INR 2,000.00. | Pass |
| ECP-PFT-03 | Profit | Compute a loss | app running | 1 / 20 / 2000 / 50000 | 1,2,3,4 | status Loss; net -₹10,000; margin `-25%`; break-even ₹2,500.00 | Status Loss; net -INR 10,000; margin -25%; break-even INR 2,500.00. | Pass |
| ECP-PFT-04 | Profit | Reject empty form | app running | all four empty | 1,2,3,4 | `profit-error-summary` shown; four `error-profit-*` with `REQUIRED`; no `profit-result` | profit-error-summary shown; landArea, yieldPerAcre, sellingPrice and cultivationCost all REQUIRED; no profit-result. | Pass |
| ECP-PFT-05 | Profit | Reject whitespace-only land area | app running | landArea `"   "` | 1,2,3,4 | `error-profit-landArea` code `REQUIRED` | error-profit-landArea code REQUIRED. A number input sanitises spaces to empty before submit. | Pass |
| ECP-PFT-06 | Profit | Reject non-numeric land area (function level) | option B bridge | landArea `abc` | — | `NOT_NUMBER`. Note: `type=number` may sanitise text to empty in UI | Bridge calculateProfit returns ok=false with landArea NOT_NUMBER and no yieldPerAcre error. | Pass |
| ECP-PFT-07 | Profit | Reject land area below 0.1 | app running | `0.05` | 1,2,3,4 | `error-profit-landArea` code `BELOW_MIN` | error-profit-landArea code BELOW_MIN; no result card. | Pass |
| ECP-PFT-08 | Profit | Reject yield above 500 | app running | `600` | 1,2,3,4 | `error-profit-yieldPerAcre` code `ABOVE_MAX` | error-profit-yieldPerAcre code ABOVE_MAX; no result card. | Pass |
| ECP-PFT-09 | Profit | Reject selling price of 0 | app running | `0` | 1,2,3,4 | `error-profit-sellingPrice` code `BELOW_MIN` | error-profit-sellingPrice code BELOW_MIN; no result card. | Pass |
| ECP-PFT-10 | Profit | Reject selling price above 100000 | app running | `100001` | 1,2,3,4 | `error-profit-sellingPrice` code `ABOVE_MAX` | error-profit-sellingPrice code ABOVE_MAX; no result card. | Pass |
| ECP-PFT-11 | Profit | Reject negative cost as non-numeric | app running | `-1` | 1,2,3,4 | `error-profit-cultivationCost` code `NOT_NUMBER` | error-profit-cultivationCost code NOT_NUMBER (the number regex rejects the sign); no result card. | Pass |
| ECP-PFT-12 | Profit | Accept zero cultivation cost | app running | 1 / 20 / 2000 / 0 | 1,2,3,4 | status Profit; net ₹40,000; margin `100%`; break-even ₹0.00 | Status Profit; net INR 40,000; margin 100%; break-even INR 0.00. | Pass |
| ECP-PFT-13 | Profit | Report all invalid fields at once | app running | `0.05` / `600` / `0` / `-1` | 1,2,3,4 | Four errors with the codes above; no result card | One submit reports landArea BELOW_MIN, yieldPerAcre ABOVE_MAX, sellingPrice BELOW_MIN, cultivationCost NOT_NUMBER; no result card. | Pass |
| ECP-PFT-14 | Profit | Calculate without a crop label | app running | label empty; valid numbers | 1,2,3,4 | Result shown; label not required | Label stays empty; status Profit, so the label is optional. | Pass |
| ECP-PFT-15 | Profit | Clear form and result on reset | result currently shown | click `profit-reset` | 1,2,4 | Fields empty; `profit-result` removed; summary hidden | All four fields cleared; profit-result removed; error summary hidden. | Pass |

---

## 4. Fertilizer calculator

### 4.1 Equivalence classes (`calculateFertilizer`)

| Class ID | Input | Type | Description | Representative value | Expected |
|---|---|---|---|---|---|
| FF-CR-01 | cropId | Valid | one of 6 crop IDs | `ragi` | result produced |
| FF-CR-02 | cropId | Invalid | empty placeholder | `""` | `INVALID_SELECTION` |
| FF-CR-03 | cropId | Invalid | unknown ID (not UI-reachable) | `dragonfruit` | `INVALID_SELECTION` |
| FF-LA-01 | landArea | Valid | 0.1–100 | `1` | accepted |
| FF-LA-02 | landArea | Invalid | empty | `""` | `REQUIRED` |
| FF-LA-03 | landArea | Invalid | non-numeric | `abc` | `NOT_NUMBER` |
| FF-LA-04 | landArea | Invalid | < 0.1 | `0` / `0.05` | `BELOW_MIN` |
| FF-LA-05 | landArea | Invalid | > 100 | `100.01` | `ABOVE_MAX` |
| FF-LA-06 | landArea | Invalid | negative | `-1` | `NOT_NUMBER` |

### 4.2 Fertilizer test cases

Reference: Ragi, 1 acre → hectares `0.405`; target N `20.25` kg, P₂O₅ `16.2` kg, K₂O `10.13` kg; DAP `35.2` kg; urea `30.2` kg; MOP `16.9` kg. These values were produced by executing the real `calculateFertilizer` module at design time (see `03-BVA-TestCases.md` §0.2): hectares is rounded to 3 decimals *before* the NPK targets are computed, which is why the targets are 20.25/16.2/10.13 and not 20.23/16.19/10.12.

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-FRT-01 | Fertilizer | Compute a valid Ragi dose | app running | crop `ragi`, area `1` | 1,2,3,4 | Result card for Ragi; `0.405` ha; N `20.25`, P `16.2`, K `10.13`; DAP `35.2 kg`, urea `30.2 kg`, MOP `16.9 kg` | Ragi result: 0.405 ha; N 20.25, P 16.2, K 10.13; DAP 35.2 kg, urea 30.2 kg, MOP 16.9 kg. | Pass |
| ECP-FRT-02 | Fertilizer | Compute a valid Paddy dose | app running | crop `paddy`, area `2` | 1,2,3,4 | `0.809` ha; N `80.9`, P `40.45`, K `40.45`; DAP `87.9 kg`, urea `141.5 kg`, MOP `67.4 kg` | Paddy result: 0.809 ha; N 80.9, P 40.45, K 40.45; DAP 87.9 kg, urea 141.5 kg, MOP 67.4 kg. | Pass |
| ECP-FRT-03 | Fertilizer | Reject missing crop | app running | crop unselected, area `1` | 1,2,3,4 | `error-fertilizer-crop` code `INVALID_SELECTION`; no result | error-fertilizer-crop code INVALID_SELECTION; no result card. | Pass |
| ECP-FRT-04 | Fertilizer | Reject empty area | app running | crop `ragi`, area `""` | 1,2,3,4 | `error-fertilizer-landArea` code `REQUIRED` | error-fertilizer-landArea code REQUIRED; no result card. | Pass |
| ECP-FRT-05 | Fertilizer | Reject zero area | app running | area `0` | 1,2,3,4 | `error-fertilizer-landArea` code `BELOW_MIN` | error-fertilizer-landArea code BELOW_MIN; no result card. | Pass |
| ECP-FRT-06 | Fertilizer | Reject area below 0.1 | app running | area `0.05` | 1,2,3,4 | `BELOW_MIN` | error-fertilizer-landArea code BELOW_MIN; no result card. | Pass |
| ECP-FRT-07 | Fertilizer | Reject area above 100 | app running | area `100.01` | 1,2,3,4 | `ABOVE_MAX` | error-fertilizer-landArea code ABOVE_MAX; no result card. | Pass |
| ECP-FRT-08 | Fertilizer | Reject negative area as non-numeric | app running | area `-1` | 1,2,3,4 | `NOT_NUMBER` | error-fertilizer-landArea code NOT_NUMBER; no result card. | Pass |
| ECP-FRT-09 | Fertilizer | Produce output for every supported crop | app running | each of 6 crops, area `1` (parameterized) | 1,2,3,4 | Six result cards with non-empty N/P/K and DAP/urea/MOP values; no error | All six crops (ragi, paddy, maize, groundnut, cotton, sugarcane) render a result with populated hectares, N, P, K and kg values; no field error (6 executions). | Pass |
| ECP-FRT-10 | Fertilizer | Clear result on reset | result shown | click `fertilizer-reset` | 1,2,4 | Crop and area cleared; result removed | Crop select and area are empty after reset; result card removed. | Pass |
| ECP-FRT-11 | Fertilizer | Pre-select a profile crop | signed-in user with `Ragi` in primaryCrops | open calculator | 1 | Crop select defaults to `ragi`; dose hint visible | Crop select defaults to ragi from the profile; fertilizer-dose-hint visible. | Pass |

---

## 5. Mandi search and filters

### 5.1 Equivalence classes (`filterPrices`)

| Class ID | Input | Type | Description | Representative value | Expected rows |
|---|---|---|---|---|---|
| MD-CR-01 | crop | Valid | specific crop | `Ragi` | 4 |
| MD-CR-02 | crop | Valid | another crop | `Sugarcane` | 4 |
| MD-CR-03 | crop | Valid | sentinel | `All crops` | no crop restriction |
| MD-DS-01 | district | Valid | specific district | `Mandya` | 3 |
| MD-DS-02 | district | Valid | sentinel | `All districts` | no district restriction |
| MD-MK-01 | market | Valid | specific market | `Mandya APMC` | 3 |
| MD-MK-02 | market | Valid | sentinel | `All markets` | no market restriction |
| MD-SR-01 | search | Valid | empty | `""` | 32 |
| MD-SR-02 | search | Valid | whitespace only | `"   "` | 32 |
| MD-SR-03 | search | Valid | matching crop, any case | `ragi` | 6 (includes Kalaburagi) |
| MD-SR-04 | search | Valid | matching Kannada crop name | `ರಾಗಿ` | 4 |
| MD-SR-05 | search | Valid | matching market text | `apmc` | 32 |
| MD-SR-06 | search | Valid | no match | `xyz` | 0 |
| MD-SR-07 | search | Valid | date/price text is not searched | `2026` | 0 |
| MD-CB-01 | combination | Valid | crop + district | `Ragi` + `Mandya` | 1 |
| MD-CB-02 | combination | Valid | crop + search | `Onion` + `hubballi` | 1 |
| MD-RS-01 | result count | Valid | 0 rows | no-match filter | empty state |
| MD-RS-02 | result count | Valid | 1 row | `Ragi` + `Mandya` | singular "1 row" |
| MD-RS-03 | result count | Valid | > 1 row | default | "{count} rows" |

### 5.2 Mandi test cases

| TC ID | Module | Objective | Preconditions | Input data | Steps | Expected result | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| ECP-MND-01 | Mandi | Show full sample dataset | app running | no filters | 1,2,3 | 32 rows; count text "32 rows"; `mandi-sample-notice` visible | 32 rendered rows; count text starts "32 rows"; mandi-sample-notice visible. | Pass |
| ECP-MND-02 | Mandi | Filter by crop | app running | crop `Ragi` | 1,2,3 | 4 rows, all Ragi | 4 rendered rows, every row contains Ragi; count text starts "4 rows". | Pass |
| ECP-MND-03 | Mandi | Filter by district | app running | district `Mandya` | 1,2,3 | 3 rows (Ragi, Paddy, Sugarcane), all Mandya | 3 rendered rows, every row contains Mandya and the set includes Ragi, Paddy and Sugarcane. | Pass |
| ECP-MND-04 | Mandi | Filter by market | app running | market `Mandya APMC` | 1,2,3 | 3 rows, all at Mandya APMC | 3 rendered rows, every row contains Mandya APMC. | Pass |
| ECP-MND-05 | Mandi | Combine crop and district | app running | crop `Ragi`, district `Mandya` | 1,2,3 | 1 row: Ragi / Mandya / Mandya APMC; count text starts "1 row" | 1 rendered row: Ragi / Mandya / Mandya APMC. The count element reads "1 row" followed by the unit note, so the assertion checks the prefix. | Pass |
| ECP-MND-06 | Mandi | Search by market text | app running | search `apmc` | 1,2,3 | 32 rows (every market name contains APMC) | 32 rendered rows, every row contains APMC. | Pass |
| ECP-MND-07 | Mandi | Search by crop substring across district names | app running | search `ragi` | 1,2,3 | 6 rows: 4 Ragi + 2 Kalaburagi rows | 6 rendered rows: 4 Ragi crop rows plus 2 Kalaburagi district matches. | Pass |
| ECP-MND-08 | Mandi | Search in Kannada | app running | search `ರಾಗಿ` | 1,2,3 | 4 Ragi rows | 4 rendered rows, all Ragi rows matching the Kannada crop name. | Pass |
| ECP-MND-09 | Mandi | Show empty state for no match | app running | search `xyz` | 1,2,3 | 0 rows; `mandi-empty` visible; no `mandi-row` | 0 rendered rows; count text starts "0 rows"; mandi-empty visible. | Pass |
| ECP-MND-10 | Mandi | Treat whitespace search as empty | app running | search `"   "` | 1,2,3 | 32 rows | 32 rendered rows; empty state absent, so a whitespace search behaves as an empty search. | Pass |
| ECP-MND-11 | Mandi | Search is case-insensitive | app running | search `APMC` | 1,2,3 | 32 rows | 32 rendered rows for uppercase APMC, identical to the lowercase search. | Pass |
| ECP-MND-12 | Mandi | Combine crop, district and search | app running | crop `Tomato`, district `Kolar` | 1,2,3 | 1 row: Tomato / Kolar / Kolar APMC | 1 rendered row: Tomato / Kolar / Kolar APMC. | Pass |
| ECP-MND-13 | Mandi | Do not search price/date fields | app running | search `2026` | 1,2,3 | 0 rows; empty state | 0 rendered rows for 2026; empty state visible, so dates and prices are not searched. | Pass |
| ECP-MND-14 | Mandi | Reset market when district changes | district `Mandya`, market `Mandya APMC` | change district to `Tumakuru` | 1,2,3 | Market resets to `All markets`; results are Tumakuru rows (Ragi + Groundnut = 2) | Market select returns to All markets; 2 Tumakuru rows (Ragi and Groundnut). | Pass |
| ECP-MND-15 | Mandi | Clear all filters | any filters active | click `mandi-clear` | 1,2,3 | 32 rows; search empty; all sentinels selected | Search empty and all three sentinels restored; 32 rows. | Pass |
| ECP-MND-16 | Mandi | Scope market list to district | app running | select district `Mandya` | 1,2 | `mandi-market` contains only `All markets` + `Mandya APMC` | Market options are exactly All markets and Mandya APMC. | Pass |
| ECP-MND-17 | Mandi | Handle special characters safely | app running | search `<script>alert(1)</script>` | 1,2,3 | 0 rows; no script execution; empty state | 0 rendered rows; empty state visible; the payload is treated as text and no script executes. | Pass |

---

## 6. Traceability summary

| Area | ECP classes | Test cases |
|---|---|---|
| Registration + Login | 30 | 25 |
| Farmer profile | 27 | 18 |
| Profit calculator | 24 | 15 |
| Fertilizer calculator | 9 | 11 |
| Mandi search/filters | 19 | 17 |
| **Total** | **109** | **86** |

### Execution result by area

| Area | JUnit class | IDs | Executions | Passed | Failed |
|---|---|---|---|---|---|
| Registration | `EcpRegistrationTest` | 15 | 15 | 15 | 0 |
| Login | `EcpLoginTest` | 10 | 10 | 10 | 0 |
| Farmer profile | `EcpProfileTest` | 18 | 19 | 19 | 0 |
| Profit calculator | `EcpProfitTest` | 15 | 15 | 15 | 0 |
| Fertilizer calculator | `EcpFertilizerTest` | 11 | 16 | 16 | 0 |
| Mandi search/filters | `EcpMandiTest` | 17 | 17 | 17 | 0 |
| **Total** | — | **86** | **92** | **92** | **0** |

Command: `mvn -B test -Dtest=Ecp*Test` on 2026-11-14; `Tests run: 92, Failures: 0, Errors: 0, Skipped: 0`; `BUILD SUCCESS`; total time 02:17 min. The only class with more executions than IDs is `EcpProfileTest` (`ECP-PRO-12` runs for 0.1 and 1000) and `EcpFertilizerTest` (`ECP-FRT-09` runs once per crop); the extra profile execution comes from the two-value parameterization of `ECP-PRO-12`.

No defect was raised by this suite. Three observations are recorded in the cases rather than as failures, because the behaviour is what the source code specifies: passwords are not trimmed (`ECP-REG-15`), an arbitrary non-empty irrigation string passes the validator (class `PI-03`), and one `validateProfile` error set can be produced for a taluk outside the district only through the function-level bridge (`ECP-PRO-08`).

`04-CFG-and-Complexity.md` reuses these IDs so that design, code and evidence stay traceable.
