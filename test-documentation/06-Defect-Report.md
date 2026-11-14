# KrishiConnect — Defect Report

**Prepared by:** Student 2
**Date:** 14 November 2026
**Build under test:** `krishiconnect-build` (React 19 + Vite 8), demo mode
**Test basis:** 291 executed cases — 139 BVA, 92 ECP, 55 white-box, 5 smoke
**Suite outcome:** **291 / 291 passed, 0 failures, 0 errors, 0 skipped** (`target/full-suite.log`, 06:01 min)

---

## 1. How to read this report

No executed assertion failed, so there is **no defect that the suite caught as a red test**. This report still has content, because a passing suite can document behaviour that is inconsistent, misleading or dead:

- a passing case can assert a *wrong-looking but implemented* behaviour (for example, a ₹0.01 profit displayed as ₹0);
- source inspection during the white-box pass found branches no input can reach;
- one full-suite attempt failed for an environment reason and had to be retried.

Every finding below is tied to an executed case ID or to a named source line. Nothing is reported as "confirmed" unless a test asserted it.

### Severity scale used

| Severity | Meaning |
|---|---|
| **Critical** | Data loss, security bypass, or a core workflow impossible to complete |
| **High** | Core workflow gives a materially wrong result with no workaround |
| **Medium** | Workflow degraded; a workaround exists |
| **Low** | Cosmetic, messaging or validation inconsistency; no wrong money/value stored |
| **Info** | Dead code, redundancy, or rounding note with no user-visible failure |

### Status values

`Open` — confirmed, not fixed. `Accepted` — behaviour matches the current specification, recorded for the team. `Withdrawn` — predicted, then disproved by execution. `Closed` — environment issue resolved by re-run.

---

## 2. Summary

| ID | Title | Module | Type | Severity | Status | Evidence |
|---|---|---|---|---|---|---|
| **DEF-01** | Net profit of ₹0.01 renders as `₹0`, and −₹0.01 as `-₹0`, while the badge says Profit / Loss | Profit calculator | UI presentation | Low | Open | `BVA-PFT-25`, `BVA-PFT-27`, `BVA-PFT-31` |
| **DEF-02** | Login validator accepts a whitespace-only password, so no inline `REQUIRED` error is shown | Login | Validation inconsistency | Low | Open | `BVA-LOG-05`, `WB-LOG-05` |
| **DEF-03** | `validateProfile` accepts any non-empty irrigation string; the seven UI options are not enforced | Farmer profile | Validation gap (defence in depth) | Low | Open | `WB-PRO-01`, `BVA-OBS-06` |
| **DEF-04** | Dead / unreachable branches in profit, number validation and fertilizer; unused `firstError` export | Profit, common, fertilizer, auth | Dead code | Info | Accepted | `WB-PFT-05`, `WB-PFT-09`, `BVA-PFT-22`, `BVA-PFT-31`, `BVA-OBS-08` |
| **DEF-05** | Margin rounds to `100%` at 99.996% and to `0%` for a genuine small profit | Profit calculator | Rounding note | Info | Accepted | `BVA-PFT-25`, `BVA-PFT-32` |
| **ENV-01** | Edge session dropped mid-class during the first full-suite run (5 `NoSuchSessionException`) | Test infrastructure | Environment | n/a | Closed | `target/full-suite.log` (first attempt), `target/bva-profile-rerun.log` |
| **WD-01** | Predicted missing `TOO_MANY` crop error when selecting a 6th crop | Farmer profile | — | n/a | Withdrawn | `BVA-PRO-16` |

Counts: **2 Low UI/validation defects open, 1 Low validation gap open, 2 Info notes accepted, 1 environment issue closed, 1 prediction withdrawn.** No Critical, High or Medium product defect was found.

---

## 3. Defect details

### DEF-01 — Sub-rupee profit is displayed as zero rupees while the status badge reports a profit or loss

| Field | Detail |
|---|---|
| **ID** | DEF-01 |
| **Module** | Profit calculator (`/calculator/profit`) |
| **Severity** | Low (presentation only — the stored/model value is correct) |
| **Status** | Open |
| **Related cases** | `BVA-PFT-25`, `BVA-PFT-27`, `BVA-PFT-31` (all Pass, because they assert the actual rendering) |
| **Source** | `src/utils/format.js` line 4: `maximumFractionDigits: 0`; `ProfitCalculator.jsx` line 187 renders `formatINR(result.profit)` |

**Preconditions.** App running at `http://127.0.0.1:5173`, demo mode, profit calculator open.

**Steps.**

1. Enter land area `1`, yield per acre `20`, selling price `2000`, cultivation cost `39999.99`.
2. Click **Calculate**.
3. Repeat with cultivation cost `40000.01`.

**Expected.** A net amount that communicates the sign and magnitude of the result. Either show paise (`₹0.01` / `−₹0.01`) or show an explicit "less than ₹1" indication, so the number does not contradict the Profit / Loss badge.

**Actual.**

| Input (area / yield / price / cost) | Model `profit` | Badge | Rendered net |
|---|---|---|---|
| 1 / 20 / 2000 / 39999.99 | `0.01` | Profit | **`₹0`** |
| 1 / 20 / 2000 / 40000.01 | `-0.01` | Loss | **`-₹0`** |
| 1 / 20 / 2000 / 40000 | `0` | Break-even | `₹0` |

The badge is driven by `result.profit > 0` / `< 0`, while the headline uses a formatter with zero fraction digits. The two disagree for any net whose absolute value is below ₹0.50.

**Evidence.** The values above are the assertions in `BvaProfitTest` cases 25, 27 and 31, executed in the green BVA run (`target/bva-final.log`). White-box case `WB-PFT-09` separately proves the model value is exactly `0.01` for the minimum legal input.

**Impact.** A farmer comparing seasons can read "Profit ₹0" or "Loss -₹0" and conclude the calculation failed. No monetary value is miscomputed; the result object carries the exact paise.

**Recommendation.** Do not change during the QA assignment without owner approval. If fixed, the smallest change is to render the net with `{ decimals: true }` when `Math.abs(profit) < 1 && profit !== 0`, leaving the whole-rupee display for normal amounts. `formatINR` already supports this through the `decimals` option used for break-even.

**Fix verification.** Re-run `BvaProfitTest#BVA-PFT-25`, `-27`, `-31`; the expected string must change from `₹0` to `₹0.01`, from `-₹0` to `-₹0.01`, and the model-value assertions in `WbProfitTest` must remain unchanged.

---

### DEF-02 — Whitespace-only login password passes the client validator

| Field | Detail |
|---|---|
| **ID** | DEF-02 |
| **Module** | Login (`/login`, `validateLogin`) |
| **Severity** | Low (no bypass: authentication still fails) |
| **Status** | Open |
| **Related cases** | `BVA-LOG-05` (UI), `WB-LOG-05` (module) |
| **Source** | `src/validation/auth.js` line 43: `if (!password) errors.password = error('REQUIRED')` |

**Preconditions.** An account exists (`asha.login@example.com` / `farmer2026`), login page open.

**Steps.**

1. Enter the registered email.
2. Enter a single space in the password field, or any run of spaces.
3. Click **Sign in**.

**Expected.** The same inline treatment as an empty password: `error-password` with code `REQUIRED`, and no authentication request. The registration validator already rejects whitespace-only passwords through `isEmpty`, so login should be consistent with it.

**Actual.** No `error-password` is rendered, because `"   "` is a truthy string and the check is `!password` rather than a trimmed emptiness test. The request is sent, the demo adapter hashes the spaces, no account matches, and `auth-error` reports invalid credentials (executed: `BVA-LOG-05`). At module level, `validateLogin({ email: valid, password: "   " })` returns `ok: true` (`WB-LOG-05`).

**Impact.** The user sees a server-style error for an input the form should have caught locally. The account is not compromised — `localAdapter.login` compares a hash of the exact string, and registration cannot create a whitespace-only password (`validatePassword` calls `isEmpty`). This is a validation-consistency defect, not an authentication bypass.

**Recommendation.** Use `isEmpty(password)` or reuse the trimmed check in `validateLogin`, so the client-side rule matches registration. Keep the raw value for the credential itself; trimming the password value would change what users registered.

**Fix verification.** Re-run `BvaLoginTest#BVA-LOG-05` (expect `error-password` = `REQUIRED` and a change to the case's asserted actual) and `WbAuthTest#WB-LOG-05` (expect `ok:false`), then the full login ECP set to confirm no regression.

---

### DEF-03 — Profile validator accepts any non-empty irrigation string

| Field | Detail |
|---|---|
| **ID** | DEF-03 |
| **Module** | Farmer profile (`/onboarding`, Settings) |
| **Severity** | Low (not UI-reachable today) |
| **Status** | Open |
| **Related cases** | `WB-PRO-01` (accepting path), `BVA-OBS-06`, `BVA-PRO-19` (empty is rejected) |
| **Source** | `src/validation/profile.js` lines 30–31: `String(raw.irrigation || '')` then `if (isEmpty(irrigation))` only |

**Preconditions.** Call `validateProfile` through the dev bridge with a profile whose other fields are valid.

**Steps.**

1. Submit a valid profile with `irrigation: "Rainfed"` (one of the seven UI options) — accepted.
2. Submit the same profile with `irrigation: "Magic water"` — an arbitrary non-empty string.

**Expected.** `INVALID_SELECTION`, because `IRRIGATION_SOURCES` defines the permitted values and the UI select offers exactly seven.

**Actual.** Both values are accepted. The validator checks only that the string is non-empty; it never consults `IRRIGATION_SOURCES`. `BVA-PRO-19` confirms the empty case is correctly rejected with `REQUIRED`.

**Impact.** None through the current UI, because the `<select>` cannot produce an arbitrary string. The gap matters if a profile is later written by an API, imported from `localStorage`, or edited by a script. The stored profile could then contain a value the UI cannot display or filter on.

**Recommendation.** Validate membership against `IRRIGATION_SOURCES` in `validateProfile`, mirroring how `district` is checked against `DISTRICT_NAMES`. The UI already guarantees the allowed set, so this is a hardening change and must be regression-tested against `BVA-PRO-17…21`.

**Fix verification.** Re-run `WbProfileTest` (add/expect `INVALID_SELECTION` for a non-listed value) and the profile BVA/ECP sets; no current case should start failing.

---

### DEF-04 — Dead and unreachable code, and one unused export

| Field | Detail |
|---|---|
| **ID** | DEF-04 |
| **Modules** | Profit, shared validation, fertilizer, auth |
| **Severity** | Info |
| **Status** | Accepted (no user-visible failure; cleanup item) |
| **Related cases** | `WB-PFT-05`, `WB-PFT-09`, `BVA-PFT-22`, `BVA-PFT-31`, `BVA-OBS-08` |

Each item below was found by source reading and then confirmed by executing the real module.

| # | Location | Finding | Proof |
|---|---|---|---|
| 1 | `profit.js` line 54 `if (revenue > 0)` | The false branch is impossible. The smallest legal inputs (`0.1 × 0.1 × 1`) give `totalYield = 0.01` and `revenue = 0.01`. | `WB-PFT-09`, `BVA-PFT-31` |
| 2 | `profit.js` line 57 `if (totalYield > 0)` | Same: `totalYield ≥ 0.01` for every legal input. The `breakEvenPrice = 0` fallback is therefore dead. | `WB-PFT-09`, `BVA-PFT-31` |
| 3 | `common.js` line 35 `if (value < min)` for `cultivationCost` (`min: 0`) | Unreachable for this field: `NUMBER_PATTERN = /^\d+(\.\d+)?$/` rejects the minus sign, so `-0.01` returns `NOT_NUMBER` before the range check. The branch is live for the other fields. | `WB-PFT-05`, `BVA-PFT-22` |
| 4 | `fertilizer.js` line 43 `Math.max(0, round(targetN - nitrogenFromDap, 2))` | The clamp never activates for the six shipped crops: every crop's N : P ratio exceeds DAP's 18 : 46 contribution ratio, so `remainingN` is positive at both area boundaries. | `BVA-OBS-08` |
| 5 | `common.js` lines 72–74 `firstError`, re-exported by `auth.js` line 49 | No module imports it. `grep` over `src/` finds only the definition and the re-export. V(G)=3 of dead code. | Source search; see `04-CFG-and-Complexity.md` §6.4 |

**Impact.** No runtime effect. The cost is maintenance and coverage honesty: a reviewer may believe four branches are protected when no input can reach them. The white-box report deliberately excludes them from the basis-path claims rather than padding coverage.

**Recommendation.** Either delete the dead guards/exports or, if they are defensive, record the invariant next to them (for example a comment that both factors are ≥ 0.1, so the product is ≥ 0.01). Do not silently remove them as part of test work; that is a product-code change and needs owner approval and a regression run.

---

### DEF-05 — Whole-percent rounding in the margin field

| Field | Detail |
|---|---|
| **ID** | DEF-05 |
| **Module** | Profit calculator |
| **Severity** | Info |
| **Status** | Accepted |
| **Related cases** | `BVA-PFT-25`, `BVA-PFT-32` |
| **Source** | `profit.js` line 54: `round((profit / revenue) * 100, 1)`; `ProfitCalculator.jsx` line 210 prints the value with `%` |

**Observed.** For `1 / 20 / 2000 / 39999.99` the margin is `0%` although the status is Profit (the true value is 0.000025%). For `500 / 500 / 100000 / 10000000` the margin prints `100%` although `profit / revenue = 99.96%`.

**Why it is not raised as a defect.** One-decimal rounding is a deliberate display choice, and both endpoints are within one display unit of the true value. The raw `marginPercent` in the result object is correctly rounded; no calculation is wrong. It is recorded so that a reader of the profit card is not surprised, and so a future fix of DEF-01 considers the margin at the same time.

---

## 4. Environment finding

### ENV-01 — Edge session closed mid-class on the first full-suite attempt

| Field | Detail |
|---|---|
| **ID** | ENV-01 |
| **Type** | Test-infrastructure flake, not a product defect |
| **Status** | Closed — the same code passed on re-run |
| **Severity** | n/a for the product; medium impact on evidence handling |

**What happened.** The first `mvn -B test` attempt on 14 November 2026 stopped in `BvaProfileTest`:

```
[ERROR] Tests run: 21, Failures: 0, Errors: 5, Skipped: 0, Time elapsed: 131.7 s <<< FAILURE!
[ERROR] com.krishiconnect.qa.tests.bva.BvaProfileTest.profileBoundary(Case)[17] -- Time elapsed: 91.49 s <<< ERROR!
org.openqa.selenium.NoSuchSessionException: invalid session id
  ... browser has closed the connection
```

Cases 18–21 then failed in milliseconds because the session was already gone.

**Diagnosis.** The Edge process exited while case 17 waited for the page. There is no assertion failure and no application exception. The identical class passed 21/21 in 62.51 s when re-run alone, and the next full suite passed 291/291. No test or application code changed between attempts.

**Handling.** The run was not reported as green. The class was re-run (`target/bva-profile-rerun.log`), then the full suite was re-run (`target/full-suite.log`). Both logs are kept so the sequence is auditable.

**Recommendation for the shared framework (Student 1's ownership).** Keep the per-class browser reuse, but add a class-level retry rule (or recreate the session when a `NoSuchSessionException` is thrown during setup) so one driver crash does not invalidate a 6-minute run. Until then, the documented recovery is: re-run the failed class, then re-run the full suite before quoting a result.

---

## 5. Prediction withdrawn after execution

### WD-01 — "Selecting a 6th crop shows no error"

`BVA-PRO-16` was designed from a source reading: `ProfileForm.jsx`'s `toggleCrop` appeared to set the `TOO_MANY` error and then clear it in a second `setErrors` call, so the predicted UI behaviour was a silent `5/5` cap.

Execution disproved it: the counter stays `5/5` **and** `error-onboarding-crops` displays `TOO_MANY` with `params.max = 5`. The case is marked Pass and the prediction is withdrawn. It is listed here to make the point that the suite was allowed to contradict its author.

---

## 6. Behaviours recorded but not raised as defects

| Behaviour | Case | Why not a defect |
|---|---|---|
| Registration password is not trimmed, so surrounding spaces become part of the credential | `ECP-REG-15` | Passwords are opaque strings; trimming them silently would change the credential and could lock users out. The case asserts the implemented behaviour and documents it. |
| Break-even price prints with two decimals while net/revenue print whole rupees | `ECP-PFT-01…03` | Deliberate: break-even is a unit price that is usually fractional, and `formatINR(..., { decimals: true })` is used explicitly for it. |
| `breakEvenPrice` is `0` when cultivation cost is `0` | `BVA-PFT-23` | Correct arithmetic: cost 0 means the break-even selling price is 0. |
| Search is case-insensitive and matches across field boundaries (crop + district + market) | `BVA-MND-08`, `-11`, `-12` | Implemented search semantics; `ECP-MND-17` confirms special characters are treated as text and do not execute. |
| District change resets the market filter | `ECP-MND-14` | Deliberate cascade; prevents an impossible district/market pair. |

These are documented so that a future reviewer does not re-open them as bugs without a product decision.

---

## 7. What was not tested (limits of this report)

The absence of a finding in an area is not evidence of correctness. The following were outside this assignment's executed scope and are carried into the release-readiness report as residual risk:

- **Firebase production mode.** All 291 cases ran in demo mode. The Firebase adapter's network paths, error mapping and session persistence were not exercised.
- **Browsers other than Edge 157.** ChromeDriver is blocked on this machine by Smart App Control; Firefox and Safari were not run.
- **Mobile viewports and touch input.** Only the desktop layout was exercised.
- **Performance, accessibility and security testing.** No load, WCAG or penetration tests were performed; `ECP-MND-17` covers only script-injection-as-text, not a full XSS audit.
- **Exploratory testing.** The suite is specification-driven; it does not replace a human exploratory session.

---

## 8. Summary for the release decision

- **Blocking defects: none.**
- **Open Low defects: 3** (DEF-01 display of sub-rupee profit, DEF-02 whitespace login password, DEF-03 irrigation membership).
- **Accepted Info notes: 2** (DEF-04 dead code, DEF-05 margin rounding).
- **Environment issue: 1, closed by successful re-run** (ENV-01).
- **Withdrawn prediction: 1** (WD-01).

None of the open items corrupts a stored value, blocks a workflow or exposes data. DEF-01 is the most user-visible and is the first candidate for a fix after the assignment; DEF-02 is a small consistency fix in `validateLogin`; DEF-03 is hardening.

Every claim in this report maps to a case ID and a Surefire result in `target/`, or to a named source line. No defect has been marked fixed, and no code was changed to make a test pass.
