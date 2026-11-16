# KrishiConnect — Test Execution Summary

**Prepared by:** Student 2
**Date of execution:** 14 November 2026
**Build under test:** KrishiConnect web app (`krishiconnect-build`, React 19 + Vite 8), demo mode (localStorage persistence, no Firebase credentials required)
**Framework:** Java 21 + Selenium 4 + JUnit 5 + Maven, Page Object Model
**Result:** **291 tests executed, 291 passed, 0 failures, 0 errors, 0 skipped — BUILD SUCCESS in 06:01 min.**

This document records what was actually run. It does not restate the test design (that is `02-ECP-TestCases.md`, `03-BVA-TestCases.md` and `04-CFG-and-Complexity.md`); it states the environment, the exact suite composition, per-class results, evidence locations and the one retry that occurred.

---

## 1. Environment

Every value below was read from the machine that produced `target/full-suite.log`.

| Item | Value |
|---|---|
| Operating system | Windows (host `hemanth kumar bn`), PowerShell |
| Browser | Microsoft Edge **157.0.4341.60** (Stable, signed) |
| Browser driver | `msedgedriver.exe` **157.0.4341.60**, matched to the installed Edge |
| JDK | Eclipse Temurin **21.0.13+9** (LTS), `maven.compiler.release=21` |
| Build tool | Apache Maven **3.9.11** |
| Node.js | **v24.18.1** (runs the Vite dev server) |
| App dev server | Vite **8.3.6**, `npm run dev -- --host 127.0.0.1`, port **5173** |
| Base URL | `http://127.0.0.1:5173` |
| Application runtime | React **19.3.1**, React Router **7.10.1**, Tailwind 3.4.17 |
| Selenium | `org.seleniumhq.selenium:selenium-java` **4.27.0** |
| Test runner | `org.junit.jupiter:junit-jupiter` **5.11.4** |
| Surefire | `maven-surefire-plugin` **3.5.2** |
| Database | none — demo mode stores users/profiles in `localStorage` |
| Network dependency | none during the run; the app server is started by the suite itself |

Notes on deliberate choices:

- **Edge, not Chrome.** Smart App Control on this machine blocks the unsigned ChromeDriver binary (`CreateProcess error=4551`). The project's `DriverFactory` still accepts `-Dbrowser=chrome`; Edge is the default because it is the only signed driver available here.
- **Loopback host.** The suite pins `127.0.0.1` rather than `localhost` so that the browser and the Vite server agree on origin and `localStorage` state. The dev server must be started with `--host 127.0.0.1` for the same reason.
- **Demo mode.** `localStorage` persistence makes every registration/login/profile scenario deterministic and leaves no external state to clean up. `BaseTest.prepareStorage()` clears the keys before each test case.

---

## 2. Suite composition

The 291 executions are the union of four layers, all running against the same build:

| Layer | Purpose | Classes | Executions |
|---|---|---|---|
| **BVA** | boundary value analysis of every documented numeric/text limit | 6 | **139** |
| **ECP** | equivalence-class partitioning of every form and filter | 6 | **92** |
| **White-box** | CFG paths, cyclomatic complexity, basis-path execution | 6 | **55** |
| **Smoke** | navigation, server health, page identity | 1 | **5** |
| **Total** | | **19** | **291** |

Per module:

| Module | BVA | ECP | White-box | Smoke | Total |
|---|---|---|---|---|---|
| Registration | 21 | 15 | 7 | — | 43 |
| Login | 7 | 10 | 5 | — | 22 |
| Farmer profile | 21 | 19 | 15 | — | 55 |
| Profit calculator | 36 | 15 | 10 | — | 61 |
| Fertilizer calculator | 17 | 16 | 3 | — | 36 |
| Mandi search / filters | 37 | 17 | 9 | — | 63 |
| Cross-cutting (server, navigation) | — | — | — | 5 | 5 |
| Path primitives (shared `validateNumberField`) | — | — | 6 | — | 6 |
| **Total** | **139** | **92** | **55** | **5** | **291** |

The white-box count above is grouped by the module each unit serves: `WbAuthTest` 12 (7 registration + 5 login), `WbProfileTest` 15, `WbProfitTest` 10, `WbFertilizerTest` 3, `WbMandiFilterTest` 9, and `WbNumberFieldTest` 6 counted once as the shared primitive rather than being multiplied into each module.

---

## 3. Per-class results

These are the lines from `target/full-suite.log` of the green run. Wall-clock time is dominated by browser start-up; per-class times exclude the Vite server that was already running.

### 3.1 BVA (139 executions)

| # | Class | Tests | Failures | Errors | Skipped | Time |
|---|---|---|---|---|---|---|
| 1 | `bva.BvaFertilizerTest` | 17 | 0 | 0 | 0 | 26.19 s |
| 2 | `bva.BvaLoginTest` | 7 | 0 | 0 | 0 | 12.65 s |
| 3 | `bva.BvaMandiTest` | 37 | 0 | 0 | 0 | 32.13 s |
| 4 | `bva.BvaProfileTest` | 21 | 0 | 0 | 0 | 53.79 s |
| 5 | `bva.BvaProfitTest` | 36 | 0 | 0 | 0 | 37.28 s |
| 6 | `bva.BvaRegistrationTest` | 21 | 0 | 0 | 0 | 33.08 s |
| | **BVA total** | **139** | **0** | **0** | **0** | |

### 3.2 ECP (92 executions)

| # | Class | Tests | Failures | Errors | Skipped | Time |
|---|---|---|---|---|---|---|
| 7 | `ecp.EcpFertilizerTest` | 16 | 0 | 0 | 0 | 13.21 s |
| 8 | `ecp.EcpLoginTest` | 10 | 0 | 0 | 0 | 15.12 s |
| 9 | `ecp.EcpMandiTest` | 17 | 0 | 0 | 0 | 16.38 s |
| 10 | `ecp.EcpProfileTest` | 19 | 0 | 0 | 0 | 42.20 s |
| 11 | `ecp.EcpProfitTest` | 15 | 0 | 0 | 0 | 13.63 s |
| 12 | `ecp.EcpRegistrationTest` | 15 | 0 | 0 | 0 | 21.79 s |
| | **ECP total** | **92** | **0** | **0** | **0** | |

### 3.3 White-box (55 executions)

| # | Class | Tests | Failures | Errors | Skipped | Time |
|---|---|---|---|---|---|---|
| 13 | `whitebox.WbAuthTest` | 12 | 0 | 0 | 0 | 6.92 s |
| 14 | `whitebox.WbFertilizerTest` | 3 | 0 | 0 | 0 | 3.25 s |
| 15 | `whitebox.WbMandiFilterTest` | 9 | 0 | 0 | 0 | 5.91 s |
| 16 | `whitebox.WbNumberFieldTest` | 6 | 0 | 0 | 0 | 4.24 s |
| 17 | `whitebox.WbProfileTest` | 15 | 0 | 0 | 0 | 8.36 s |
| 18 | `whitebox.WbProfitTest` | 10 | 0 | 0 | 0 | 5.81 s |
| | **White-box total** | **55** | **0** | **0** | **0** | |

### 3.4 Smoke (5 executions)

| # | Class | Tests | Failures | Errors | Skipped | Time |
|---|---|---|---|---|---|---|
| 19 | `SmokeTest` | 5 | 0 | 0 | 0 | 6.90 s |

### 3.5 Suite total

```
[INFO] Tests run: 291, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time:  06:01 min
```

The sum of the per-class times is 5 min 59 s; the 06:01 min figure is the authoritative Maven wall clock and includes JVM start-up, the Vite server check and report generation.

---

## 4. Execution sequence

The dates and times are the modification times of the saved logs, so the order below is the real order of work, not a reconstruction.

| Time | Run | Scope | Result | Log |
|---|---|---|---|---|
| 18:20 | BVA | `-Dtest='Bva*Test'` | 139/139, 0 failures | `target/bva-final.log` |
| 18:53 | ECP | `-Dtest='Ecp*Test'` | 92/92, 0 failures | `target/ecp-final.log` |
| 19:32 | White-box | `-Dtest='Wb*Test'` | 55/55, 0 failures, 53.64 s | `target/wb-final.log` |
| 19:43 | Re-run of one class | `-Dtest=BvaProfileTest` | 21/21, 0 failures, 62.51 s | `target/bva-profile-rerun.log` |
| **19:49** | **Full suite** | `mvn -B test` | **291/291, 0 failures, 06:01 min** | **`target/full-suite.log`** |

---

## 5. The one retry, stated plainly

The **first** full-suite attempt was not green: `BvaProfileTest` reported 5 errors out of 21, all of the form

```
org.openqa.selenium.NoSuchSessionException: invalid session id
  ... browser has closed the connection
```

with the first error appearing after 91.49 s inside case 17 and the remaining four failing immediately afterwards because the session was already gone.

Response:

1. The class was re-run on its own (`target/bva-profile-rerun.log`): **21/21 pass in 62.51 s**.
2. The full suite was re-run from the start: **291/291 pass in 06:01 min**.

The cause was the Edge process exiting mid-class, not an application or assertion failure: the same test inputs pass on the very next run, and no test code was changed between the two attempts. This is recorded as an **infrastructure flakiness observation** in `06-Defect-Report.md` rather than being hidden, and it is the reason `07-Regression-and-Release-Readiness.md` treats a single class re-run as the standard recovery step.

---

## 6. Evidence artefacts

| Artefact | Path | What it proves |
|---|---|---|
| Full-suite Maven log | `target/full-suite.log` | 291/0/0/0, `BUILD SUCCESS`, 06:01 min |
| Per-class text reports | `target/surefire-reports/*.txt` | summary line per class |
| XML reports | `target/surefire-reports/TEST-*.xml` | machine-readable results, timestamps |
| BVA log | `target/bva-final.log` | 139 BVA executions |
| ECP log | `target/ecp-final.log` | 92 ECP executions |
| White-box log | `target/wb-final.log` | 55 white-box executions, 53.64 s |
| Profile re-run | `target/bva-profile-rerun.log` | evidence that the flaky class passes alone |
| Failure screenshots | `target/evidence/` | written by `ScreenshotHandler` on failure; empty on the green run |
| ECP/BVA case tables | `test-documentation/02-ECP-TestCases.md`, `03-BVA-TestCases.md` | the ID → input → expected → actual → verdict mapping |
| White-box analysis | `test-documentation/04-CFG-and-Complexity.md` | complexity figures, CFGs, basis paths, decision coverage |

The Surefire XML files carry the execution timestamps, so the run can be tied to 14 November 2026 without relying on this document. No HTML Surefire report was generated for this run; the text and XML files are the original artefacts written by Maven.

One stale file exists: `target/surefire-reports/com.krishiconnect.qa.tests.ecp.DebugProfileTest.txt` (1 test) is left over from an earlier interactive debug session. `DebugProfileTest` is not in `src/test/java` and is **not** part of the 291; it is excluded from the archived evidence folder.

---

## 7. How to reproduce

```powershell
# 1. Toolchain (installed once, outside the repo)
$tools = "$env:LOCALAPPDATA\kc-tools"
$env:JAVA_HOME = "$tools\jdk\jdk-21.0.13+9"
$env:PATH = "$env:JAVA_HOME\bin;$tools\apache-maven-3.9.11\bin;$env:PATH"

# 2. Application dependencies (once)
cd <repo>\krishiconnect-build
npm install

# 3. Run everything; AppServer starts the Vite dev server if it is not already
#    reachable, and stops it at JVM shutdown only when the suite started it
cd <repo>
mvn -B test
```

Useful subsets:

```powershell
mvn -B test -Dtest="Bva*Test"     # 139
mvn -B test -Dtest="Ecp*Test"     # 92
mvn -B test -Dtest="Wb*Test"      # 55
mvn -B test -Dtest="SmokeTest"    # 5
mvn -B test -Dtest=BvaProfileTest # single-class recovery run
```

The suite is bound to `http://127.0.0.1:5173`. `AppServer.ensureStarted()` first probes that URL; if a server already answers it is reused and left running, otherwise the suite starts Vite with `--strictPort` and stops it via a JVM shutdown hook. There is no silent fallback to another port.

---

## 8. What this run does and does not claim

It claims:

- all 291 designed cases were executed against the real application in a real browser;
- every case passed, with the pass/fail recorded per case in the Surefire reports;
- the white-box cases executed the real validation modules through the dev-only bridge, not re-implemented logic;
- the suite is reproducible from a clean checkout with the commands in §7.

It does not claim:

- any line or branch coverage percentage from a Java/JS coverage tool — none was run;
- that the application is defect-free — four observations and one environment flake are recorded in `06-Defect-Report.md`;
- that the suite covers Firebase-authenticated production mode, mobile viewports, or browsers other than Edge — these are listed as residual risks in `07-Regression-and-Release-Readiness.md`.
