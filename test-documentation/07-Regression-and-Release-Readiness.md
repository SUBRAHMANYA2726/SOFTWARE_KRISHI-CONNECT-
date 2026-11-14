# KrishiConnect — Regression and Release-Readiness Report

**Prepared by:** Student 2
**Date:** 14 November 2026
**Build assessed:** branch `main`, commit `a18919a` (`feat: complete KrishiConnect web application with full automation suite`, 9 Nov 2026) plus the QA changes listed in §1.2
**Verification run:** `mvn -B test` — **291 / 291 passed, 0 failures, 0 errors, 0 skipped, BUILD SUCCESS, 06:01 min** (`target/full-suite.log`)

---

## 1. What was assessed

### 1.1 Scope

The five areas named in the assignment, exercised through the real web UI and, for white-box work, through the real validation modules:

| Area | Routes / units |
|---|---|
| Registration and login | `/register`, `/login`, `validateRegistration`, `validateLogin` |
| Farmer profile | `/onboarding`, Settings, `validateProfile` |
| Profit calculator | `/calculator/profit`, `calculateProfit` |
| Fertilizer calculator | `/calculator/fertilizer`, `calculateFertilizer` |
| Mandi search and filters | `/mandi`, `filterPrices` |

Cross-cutting smoke checks (server health, navigation, page identity) run in the same suite.

### 1.2 Changes made to the working tree for QA

These are the only changes beyond the committed application. They are not released code and are listed so the assessed build is unambiguous.

| Change | File(s) | Reason | Committed? |
|---|---|---|---|
| Dev-only white-box bridge | `krishiconnect-build/src/dev/testBridge.js`, 3-line guard in `src/main.jsx` | Execute real validation branches the UI cannot reach | No |
| Minimal restore of a broken page | `krishiconnect-build/src/pages/NotFound.jsx` | The committed file was corrupt and the production build failed | No |
| Maven/Selenium/JUnit framework | `pom.xml`, `src/test/java/**` | The repo contained no runnable Java test framework; this is the shared framework for both students | No |
| Test documentation | `test-documentation/01…07` | ECP/BVA design, CFG, execution and this report | No |
| Lockfile | `krishiconnect-build/package-lock.json` | Reproducible `npm install` after the tracked `node_modules` was found corrupt | No |

Nothing has been committed or pushed. The application's business logic was not modified; the bridge delegates to the shipped modules and is stripped from production builds (§3.4).

### 1.3 Out of scope

Firebase production mode, non-Edge browsers, mobile viewports, accessibility, performance/load, penetration testing and exploratory testing. These are treated as residual risks in §6, not as passed areas.

---

## 2. Verification evidence

| Evidence | Result | Location |
|---|---|---|
| Full regression suite | 291 passed / 0 failed / 0 errors / 0 skipped, 06:01 min | `target/full-suite.log` |
| BVA layer | 139 passed, 03:26 min | `target/bva-final.log` |
| ECP layer | 92 passed, 02:17 min | `target/ecp-final.log` |
| White-box layer | 55 passed, 53.64 s | `target/wb-final.log` |
| Smoke layer | 5 passed, 6.90 s | `target/full-suite.log` |
| Production build | 90 modules transformed, `built in 1.12 s` | console output of `npm run build` |
| Bridge isolation | `__kcTest` / `installTestBridge` absent from all `dist/assets/*.js` | `dist/` inspection |
| CFG basis checks | 6/6 units `basis=true` | `basis.mjs`, `04-CFG-and-Complexity.md` §5 |
| Defect triage | 3 Low open, 2 Info accepted, 1 environment closed, 1 withdrawn | `06-Defect-Report.md` |

One qualification, stated up front: the first full-suite attempt failed with five `NoSuchSessionException` errors in `BvaProfileTest` after the Edge process exited. The class passed 21/21 on re-run and the subsequent full suite was green (see `06-Defect-Report.md` ENV-01). The green result quoted here is the second run, not the first.

---

## 3. Quality gates

| Gate | Criterion | Result | Verdict |
|---|---|---|---|
| **G1 Functional correctness** | No open Critical, High or Medium defect in the tested scope | 3 Low, 2 Info only | **Pass** |
| **G2 Regression** | Full suite green on the assessed working tree | 291/291 after one environment retry | **Pass with note** |
| **G3 Build integrity** | Production build completes | `npm run build` succeeds, 90 modules, 1.12 s | **Pass** |
| **G4 Test isolation** | Test instrumentation absent from the production bundle | `__kcTest` not found in `dist/assets` | **Pass** |
| **G5 Traceability** | Every executed case has an ID and a documented expected/actual | 86 ECP IDs, 132 BVA IDs, 55 WB IDs mapped in docs | **Pass** |
| **G6 Defect handling** | Every finding logged with evidence; no silent fix | `06-Defect-Report.md` | **Pass** |
| **G7 Reproducibility** | Toolchain, browser, base URL and commands documented | `05-Test-Execution-Summary.md` §1, §7 | **Pass** |
| **G8 Automation in CI** | Suite runs unattended on every change | No CI pipeline exists; run is manual | **Fail (known gap)** |
| **G9 Non-functional** | Accessibility, performance, security, cross-browser | Not tested | **Fail (out of scope)** |

G8 and G9 are the two gates that keep this build from being called production-ready. They are not hidden in a footnote; they drive the recommendation in §7.

---

## 4. Regression strategy

### 4.1 Full-suite trigger

Run the whole suite for any change to:

- a file in `src/validation/`, `src/services/`, `src/data/` or `src/context/`;
- a form, calculator or filter component;
- the routing table, the auth provider or the storage adapter;
- the dev bridge (if its shape changes, the white-box classes must be re-validated);
- `pom.xml`, `BaseTest`, `DriverFactory`, or a page object.

The full suite is ~6 minutes, which is cheap enough that there is no reason to skip it before quoting a result.

### 4.2 Targeted suites

| Change type | Minimum run | Time (measured) |
|---|---|---|
| Copy/i18n or styling only | `SmokeTest` | ~7 s |
| One validator or calculator | that module's ECP + BVA + its `Wb*` class | 30–90 s |
| Profile form | `BvaProfileTest`, `EcpProfileTest`, `WbProfileTest` | ~1:45 |
| Mandi filters/data | `BvaMandiTest`, `EcpMandiTest`, `WbMandiFilterTest` | ~55 s |
| Auth | `BvaLoginTest`, `BvaRegistrationTest`, `EcpLoginTest`, `EcpRegistrationTest`, `WbAuthTest` | ~2:15 |
| Framework/driver change | full suite | ~6:00 |

### 4.3 Recovery rule for the known Edge flake

If a class fails with `NoSuchSessionException` / "browser has closed the connection":

1. Do **not** edit a test or an expectation.
2. Re-run that class alone (`mvn -B test -Dtest=<Class>`).
3. If it passes, re-run the full suite and quote only the full-suite result.
4. If it fails again, treat it as a product or framework defect and investigate before proceeding.

This rule exists because it already happened once (ENV-01); it is the difference between a documented flake and a hidden one.

### 4.4 Data and environment discipline

- Each class gets one browser session; `localStorage` is cleared before each case, so cases do not depend on order.
- The suite starts/reuses the Vite server at `http://127.0.0.1:5173`; no external network or database is required.
- No fixed sleeps: waits are explicit (`WebDriverWait`) on element state or bridge readiness.
- Test data lives in `TestData`/`Flows` and in the parameterized case records, not inside assertions.

---

## 5. Coverage against risk

The matrix is qualitative: it says which technique was applied and where, not a percentage. Complexity and path counts are in `04-CFG-and-Complexity.md`.

| Area | ECP | BVA | White-box | UI/Selenium | Highest-risk behaviour covered |
|---|---|---|---|---|---|
| Registration | 15 | 21 | 7 paths (V(G)=7, rank 6) | Full form + demo storage | Boundary lengths, email normalisation, password strength, mismatch, persisted account |
| Login | 10 | 7 | 4 paths + whitespace probe (V(G)=4) | Full form + redirect | Unknown email, wrong password, case/space normalisation, session redirect |
| Profile | 19 | 21 | 17/17 decisions (V(G)=18) | Onboarding + Settings | District/taluk cascade, 0.1–1000 area, 1–5 crops, village slice, save/reload |
| Profit | 15 | 36 | 8 feasible paths (V(G)=10, rank 7) | Full form + result card | Min/max of every field, loss/break-even/profit, margin, break-even price |
| Fertilizer | 16 | 17 | 3 paths (V(G)=3) | All six crops | Crop guard, area 0.1–100, hectares/NPK/product arithmetic |
| Mandi | 17 | 37 | 9 paths (V(G)=9, rank 8) | Search + three filters + reset | Row counts, cascading market list, special characters, empty state |

Residual-risk reading: the weakest *evidence* is in the areas that were not executed at all (Firebase, other browsers, mobile, non-functional), not in the five tested modules.

---

## 6. Residual risks

| # | Risk | Likelihood | Impact | Current mitigation | Owner / next step |
|---|---|---|---|---|---|
| R1 | Firebase production mode behaves differently from the demo adapter (error codes, session persistence, network failures) | Medium | High | Demo mode is deterministic and fully tested; adapter contract is shared | Run the same 291 cases against a Firebase test project; add fault-injection for network errors |
| R2 | A non-Edge browser breaks layout or a locator | Medium | Medium | Locators use `data-testid`; Edge is a Chromium browser | Add Chrome/Firefox jobs on a machine without Smart App Control |
| R3 | Mobile/touch layout unusable | Medium | Medium | Responsive Tailwind classes exist but are untested | Add viewport tests (e.g. 390×844) for onboarding, calculators, mandi table |
| R4 | Accessibility failures (labels, contrast, keyboard order) | High | Medium | Semantic HTML used in places; no audit | WCAG 2.1 AA audit + axe scan |
| R5 | Performance under real mandi data or many reports | Low–Medium | Medium | Sample data is small (32 rows) | Load test with a realistic dataset; check bundle size (largest chunk 560 kB) |
| R6 | Edge driver dies mid-run (observed once) | Medium | Low | Documented retry rule (§4.3) | Class-level retry or session recreation in the shared framework |
| R7 | Sub-rupee profit reads as ₹0 (DEF-01) | High for tiny values | Low | Badge still shows Profit/Loss; exact model value is stored | Fix display when `abs(profit) < 1`; re-run BVA-PFT-25/27/31 |
| R8 | Whitespace-only login password skips the inline error (DEF-02) | Low | Low | Authentication still fails | Trim-check in `validateLogin`; re-run BVA-LOG-05/WB-LOG-05 |
| R9 | Arbitrary irrigation value accepted if written outside the UI (DEF-03) | Low | Low | The select constrains the UI | Membership check against `IRRIGATION_SOURCES` |
| R10 | Dead code misleads future coverage claims (DEF-04) | Medium | Low | Documented and excluded from basis paths | Remove or annotate the guards; keep the exclusion list in `04` |
| R11 | No CI, so the suite can rot between submissions | High | Medium | Manual run command documented | Add a GitHub Actions job: JDK 21, Node 24, Edge, `mvn -B test` |
| R12 | Demo data in `localStorage` is not a real persistence/security model | High | Medium | Clearly labelled demo mode | Replace with the Firebase adapter before any real user data |

No residual risk is rated Critical. R1, R4 and R11 are the three that a production owner would have to close first.

---

## 7. Release recommendation

Three audiences, three different answers. Collapsing them into one "ready / not ready" would be misleading.

### 7.1 For ISE2501 CA3 evaluation — **READY**

The assignment asks for black-box design, white-box analysis, Selenium automation and evidence. All are present and executed:

- separate ECP and BVA tables with 86 and 132 case IDs (92 and 139 executions);
- CFG, cyclomatic complexity and basis paths for six units, with GF(2) verification;
- 291 JUnit/Selenium executions, all passing, against the real app;
- defect, execution and release-readiness reports with traceable evidence.

No result in this package is asserted without a log or a case ID.

### 7.2 For a controlled demo or pilot — **READY WITH CAVEATS**

Use demo mode, a desktop Chromium browser and the documented toolchain. The five tested modules behave as specified, and the three open defects are Low and do not corrupt data. Before real farmers use it, fix DEF-01 (the most visible), add the CI job (R11) and run one pass against Firebase (R1).

### 7.3 For public production — **NOT READY**

The blockers are evidence gaps, not known product defects:

1. **R1 Firebase** — the production auth/persistence path has never been executed.
2. **R4 Accessibility** — no WCAG audit; a public Indian-government-adjacent service should not ship without one.
3. **R11 CI** — no automated regression on change; the suite is run by hand.
4. **R2/R3 Browser and mobile** — only Edge desktop was exercised.
5. **R5 Performance** — no load test with realistic data volumes.
6. **R12 Persistence/security** — demo `localStorage` is not a production data model.

Closing DEF-01…03 is desirable but not the gating factor; the gating factor is that four whole quality dimensions were not tested.

---

## 8. Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| QA engineer (Student 2) | — | Recommends: evaluation Ready; production Not Ready | 14 Nov 2026 |
| Framework owner (Student 1) | — | Pending review of shared framework and ENV-01 retry policy | — |
| Module owner / developer | — | Pending triage of DEF-01…03 | — |
| Module coordinator | — | Pending | — |

The QA recommendation is not a release approval. It states what was verified and what was not.

---

## 9. Reproduce the verification

```powershell
$tools = "$env:LOCALAPPDATA\kc-tools"
$env:JAVA_HOME = "$tools\jdk\jdk-21.0.13+9"
$env:PATH = "$env:JAVA_HOME\bin;$tools\apache-maven-3.9.11\bin;$env:PATH"

cd <repo>\krishiconnect-build
npm install            # once; a valid lockfile is present in the working tree
npm run build          # gate G3; bridge must be absent from dist/

cd <repo>
mvn -B test            # gate G2; 291 cases, ~6 min
```

Then check:

```powershell
Select-String -Path target\surefire-reports\*.txt -Pattern "Tests run"
Select-String -Path krishiconnect-build\dist\assets\*.js -Pattern "__kcTest" -SimpleMatch   # expect no output
```

---

## 10. Document set

| Document | Contents |
|---|---|
| `01-Inspection-and-Gap-Analysis.md` | Repo inspection, validation catalogue, test-ID map, gap analysis |
| `02-ECP-TestCases.md` | Equivalence-class tables and 92 executed ECP cases |
| `03-BVA-TestCases.md` | Boundary tables, 139 executed BVA cases, observations |
| `04-CFG-and-Complexity.md` | CFGs, V(G) for 15 units, basis paths, decision coverage, infeasible code |
| `05-Test-Execution-Summary.md` | Environment, suite composition, per-class results, evidence index |
| `06-Defect-Report.md` | DEF-01…05, ENV-01, WD-01, severity and fix verification |
| `07-Regression-and-Release-Readiness.md` | This document — gates, risk, recommendation |

All seven documents describe the same build and the same 291-case run; the case IDs are consistent across them.
