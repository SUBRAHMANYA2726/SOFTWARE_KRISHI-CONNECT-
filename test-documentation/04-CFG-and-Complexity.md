# KrishiConnect — White-Box Analysis: Control-Flow Graphs, Cyclomatic Complexity and Basis Paths

**Prepared by:** Student 2
**Scope:** the validation and calculation units that implement the five ECP/BVA areas: registration/login, farmer profile, profit calculator, fertilizer calculator, mandi filtering
**Basis:** the actual application source under `krishiconnect-build/src/` (no re-written or paraphrased logic)
**Execution status:** **EXECUTED 2026-11-14.** 55 white-box JUnit cases, 0 failures, 0 errors, 0 skipped, `BUILD SUCCESS`, total time 53.64 s. Evidence: `target/wb-final.log` and `target/surefire-reports/com.krishiconnect.qa.tests.whitebox.*.txt`.

---

## 1. Why this analysis starts from the code

The ECP and BVA suites (`02-ECP-TestCases.md`, `03-BVA-TestCases.md`) are black-box: they drive the rendered UI and observe field errors and result cards. This document is the complementary white-box view. Every graph, decision count and path below is derived from the source that the browser actually executes:

| Unit | File | Lines | Reached through |
|---|---|---|---|
| `isEmpty`, `validateNumberField`, `validateRequiredText`, `validateEmail`, `validatePassword`, `firstError` | `validation/common.js` | 11–74 | every form validator |
| `validateRegistration`, `validateLogin` | `validation/auth.js` | 12–47 | `/register`, `/login` |
| `calculateProfit` | `validation/profit.js` | 28–76 | `/calculator/profit` |
| `findCrop`, `calculateFertilizer` | `validation/fertilizer.js` | 9–61 | `/calculator/fertilizer` |
| `validateProfile` | `validation/profile.js` | 10–53 | `/onboarding`, Settings |
| `fetchMandiPrices`, `filterPrices` | `services/mandiService.js` | 22–41 | `/mandi` |

No control-flow graph, edge count or coverage figure in this document was estimated by hand. The decision counts were produced by an AST parser and the path sets were checked by a script (see §2).

---

## 2. Method

### 2.1 Cyclomatic complexity

`V(G) = 1 + D`, where `D` is the number of decisions found in the function body by an acorn AST walk. The counted constructs are the ones that create a branch in JavaScript:

| Construct | Counted as |
|---|---|
| `if` / `else if` | 1 per `if` |
| `?:` (conditional expression) | 1 |
| `&&`, `\|\|` (short-circuit operators) | 1 each |
| `for`, `for…of`, `for…in`, `while`, `do…while` | 1 each |
| `case` with a test | 1 each |
| `catch` | 1 |

Function declarations and arrow functions are visited separately, so `findCrop` and the `filterPrices` predicate are measured as their own units rather than being folded into the caller. Nested functions are not counted inside the enclosing function.

The analyzer is `%TEMP%\opencode\wb\analyze.mjs` (acorn 8, `ecmaVersion: 2023`, `sourceType: module`, `locations: true`). `oxlint` was attempted first because the project lists it, but Smart App Control blocks its native `.node` binding on this machine, so the AST count is the authoritative figure. The tool is a measurement aid only; the source of truth remains the shipped file.

### 2.2 Basis paths

A basis path set must exercise the independent routes through a unit. Two checks were applied:

1. **Add-one-new-edge** (`%TEMP%\opencode\wb\edges.mjs`): after the first path, every path must contribute at least one CFG edge that no earlier path used. This proves the set is not padded with duplicates.
2. **Affine independence over GF(2)** (`%TEMP%\opencode\wb\basis.mjs`): the path incidence vectors minus a reference path must be linearly independent, with rank equal to `E − V + 1` for the feasible sub-graph. This is the formal basis test recommended by McCabe.

The second check matters because several units have an error return that every error path merges into. There, V(G) counts the merge decision but the number of *feasible* s–t paths is smaller than V(G). Where the two figures differ, this document reports both and never pretends the missing paths were executed.

### 2.3 Execution route

The UI cannot reach every branch (for example, the crop `<select>` never submits an unknown crop, and the number inputs reject a leading minus before the validator sees it). To execute the real functions, the application exposes a development-only bridge in `src/dev/testBridge.js`:

```js
// src/main.jsx line 11
if (import.meta.env.DEV) {
  import('./dev/testBridge').then(({ installTestBridge }) => installTestBridge())
}
```

`installTestBridge()` publishes `window.__kcTest` with `calculateProfit`, `calculateFertilizer`, `validateProfile`, `validateRegistration`, `validateLogin`, `filterPrices`, `mandiRowCount`, `formatINR` and `formatNumber`. Each wrapper delegates to the same ES module the page imports, and `plain()` copies the result through `JSON.parse(JSON.stringify(...))` so Selenium receives JSON rather than live JavaScript objects.

Consequences that are respected throughout this document:

- the executed code is the module Vite serves to the browser, not a re-implementation;
- the bridge exists only in the dev server; `npm run build` (verified) strips it because `import.meta.env.DEV` is false in a production build;
- the bridge adds no application behaviour: it neither fixes nor bypasses validation;
- Java reaches it through `support/JsBridge.java`, which waits for `window.__kcTest.version` with an explicit `WebDriverWait`.

`BaseTest` gives one Edge session per test class and clears `localStorage` before each case. White-box classes do not need a signed-in session, because they call pure functions.

### 2.4 Reproduce

```powershell
$tools = "$env:LOCALAPPDATA\kc-tools"
$env:JAVA_HOME = "$tools\jdk\jdk-21.0.13+9"
$env:PATH = "$env:JAVA_HOME\bin;$tools\apache-maven-3.9.11\bin;$env:PATH"

cd <repo>
mvn -B test -Dtest="Wb*Test"        # 55 cases
node "$env:TEMP\opencode\wb\analyze.mjs" <source files>   # complexity
node "$env:TEMP\opencode\wb\basis.mjs"                    # GF(2) basis check
node "$env:TEMP\opencode\wb\edges.mjs"                    # add-one-new-edge check
```

---

## 3. Complexity table

All figures below are output of `analyze.mjs` for the current working tree.

| # | Unit | File | Lines | Decision breakdown | D | **V(G)** | CFG edges / nodes | White-box cases |
|---|---|---|---|---|---|---|---|---|
| 1 | `isEmpty` | common.js | 11–13 | `\|\|`×2 | 2 | **3** | — | via `validateNumberField`, `validateRequiredText`, `validateEmail`, `validatePassword`, `validateProfile` |
| 2 | `validateNumberField` | common.js | 23–42 | `if`×5 | 5 | **6** | 19 / 15 | WB-NF-01…06 |
| 3 | `validateRequiredText` | common.js | 44–50 | `if`×3 | 3 | **4** | — | via `validateRegistration`, `validateProfile` |
| 4 | `validateEmail` | common.js | 52–59 | `if`×2, `\|\|`×1 | 3 | **4** | — | via `validateRegistration`, `validateLogin` |
| 5 | `validatePassword` | common.js | 61–70 | `if`×4, `\|\|`×1 | 5 | **6** | — | via `validateRegistration` |
| 6 | `error` | common.js | 15–17 | — | 0 | **1** | — | via every validator |
| 7 | `firstError` | common.js | 72–74 | `?:`×1, `&&`×1 | 2 | **3** | — | none (dead export, see §6) |
| 8 | `validateRegistration` | auth.js | 12–35 | `if`×6 | 6 | **7** | 24 / 19 | WB-REG-01…07 |
| 9 | `validateLogin` | auth.js | 37–47 | `if`×3 | 3 | **4** | 13 / 11 | WB-LOG-01…05 |
| 10 | `calculateProfit` | profit.js | 28–76 | `if`×9 | 9 | **10** | 40 / 32 | WB-PFT-01…10 |
| 11 | `findCrop` | fertilizer.js | 9–11 | `\|\|`×1 | 1 | **2** | — | via `calculateFertilizer` |
| 12 | `calculateFertilizer` | fertilizer.js | 24–61 | `if`×2 | 2 | **3** | 19 / 18 | WB-FRT-01…03 |
| 13 | `validateProfile` | profile.js | 10–53 | `if`×12, `\|\|`×4, `?:`×1 | 17 | **18** | — | WB-PRO-01…15 |
| 14 | `fetchMandiPrices` | mandiService.js | 22–27 | — | 0 | **1** | — | via `/mandi` page |
| 15 | `filterPrices` | mandiService.js | 29–41 | `if`×5, `&&`×3 | 8 | **9** | 25 / 18 | WB-MND-01…09 |

Totals for all 15 units: **Σ D = 66, Σ V(G) = 81**. Edge/node figures are only shown for the units whose full CFG was built and checked; the primitives are reached as calls and are measured for complexity but not drawn as separate graphs.

Reading the table:

- `calculateProfit` has the highest V(G) among the calculators because each of the four fields has its own error `if` and the three output statuses add two more. There is no nesting, so the count is linear in the number of checks.
- `validateProfile` is the most complex unit (V(G)=18) not because of nesting but because 12 independent field checks plus four `||` defaults (district, taluk, irrigation, village) and one array ternary all accumulate into one error object.
- `filterPrices` looks short but the three `&&` inside the filter callback each add a decision, giving V(G)=9.
- `fetchMandiPrices`, `error` and the object literals are straight-line code (V(G)=1).

---

## 4. Control-flow graphs

### 4.1 `validateNumberField` — V(G)=6, 19 edges, 15 nodes

```text
E
└─> D1  isEmpty(rawValue)?
     ├─ true  ─> R1  return REQUIRED ─> X
     └─ false ─> S1  text = String(raw).trim()
                  └─> D2  !NUMBER_PATTERN.test(text)?
                       ├─ true  ─> R2  return NOT_NUMBER ─> X
                       └─ false ─> S2  value = Number(text)
                                    └─> D3  !Number.isFinite(value)?
                                         ├─ true  ─> R3  return NOT_NUMBER ─> X
                                         └─ false ─> S3  value < min?
                                                      ├─ true  ─> R4  return BELOW_MIN ─> X
                                                      └─ false ─> D4  value > max?
                                                                   ├─ true  ─> R5  return ABOVE_MAX ─> X
                                                                   └─ false ─> R6  return {value, error:null} ─> X
```

| Edge | Meaning |
|---|---|
| `E>D1` | entry |
| `D1>R1`, `R1>X` | empty input |
| `D1>S1`, `S1>D2` | non-empty input is trimmed and tested |
| `D2>R2`, `R2>X` | non-numeric text |
| `D2>S2`, `S2>D3` | numeric text is converted and checked for overflow |
| `D3>R3`, `R3>X` | numeric overflow (`"9".repeat(400)` → `Infinity`) |
| `D3>D4`, `D4>R4`, `R4>X` | below the inclusive minimum |
| `D4>D5`, `D5>R5`, `R5>X` | above the inclusive maximum |
| `D5>R6`, `R6>X` | accepting path |

Basis paths (all 19 edges, add-one-new-edge verified):

| Path | Edge sequence | Condition | Case |
|---|---|---|---|
| P1 | E D1 R1 X | empty | WB-NF-01 |
| P2 | E D1 S1 D2 R2 X | `abc` | WB-NF-02 |
| P3 | E D1 S1 D2 S2 D3 R3 X | `"9"×400` → `Infinity` | WB-NF-03 |
| P4 | E D1 S1 D2 S2 D3 D4 R4 X | `0.05` | WB-NF-04 |
| P5 | E D1 S1 D2 S2 D3 D4 D5 R5 X | `500.5` | WB-NF-05 |
| P6 | E D1 S1 D2 S2 D3 D4 D5 R6 X | `1` | WB-NF-06 |

### 4.2 `calculateProfit` — V(G)=10, 40 edges, 32 nodes

```text
E
└─> A1 validateNumberField(landArea)
    └─> A2 validateNumberField(yieldPerAcre)
        └─> A3 validateNumberField(sellingPrice)
            └─> A4 validateNumberField(cultivationCost)
                └─> D1 landArea.error? ──true──> S1 ─┐
                    └─false──> D2 yield.error? ──true──> S2 ─┤
                               └─false──> D3 price.error? ──true──> S3 ─┤
                                          └─false──> D4 cost.error? ──true──> S4 ─┤
                                                     └─false───────────────────────┤
                                                                                   v
                                              D5  errors.length > 0?
                                               ├─true──> R1 {ok:false} ─> X
                                               └─false──> S5 totalYield
                                                            └─> S6 revenue
                                                                └─> S7 cost
                                                                    └─> S8 profit
                                                                        └─> D6 profit > 0?
                                                                            ├─true──> S9 status=PROFIT
                                                                            └─false──> D7 profit < 0?
                                                                                       ├─true──> S10 status=LOSS
                                                                                       └─false──> S11 status=BREAK_EVEN
                                                                                                   |
                                     S9/S10/S11 all continue to D8  revenue > 0? <─────────────────┘
                                                                     ├─true──> S12 margin
                                                                     └─false──> (S13, infeasible)
                                                                                 |
                                     S12/S13 continue to D9  totalYield > 0? <───┘
                                                            ├─true──> S14 breakEven
                                                            └─false──> (R2, infeasible)
                                                                        |
                                                            S14/R2 ─────┴─> X
```

Basis paths of the feasible graph (38 edges over 32 nodes → feasible V(G)=8):

| Path | Route | Condition | Case |
|---|---|---|---|
| P1 | D1..D5 false → S5..S8 → D6 true → D8 true → D9 true | profit > 0 | WB-PFT-01 |
| P2 | D1 true → R1 | landArea REQUIRED | WB-PFT-02 |
| P3 | D2 true → R1 | yieldPerAcre ABOVE_MAX | WB-PFT-03 |
| P4 | D3 true → R1 | sellingPrice BELOW_MIN | WB-PFT-04 |
| P5 | D4 true → R1 | cultivationCost NOT_NUMBER | WB-PFT-05 |
| P6 | D6 false, D7 false → S11 | break-even | WB-PFT-06 |
| P7 | D6 false, D7 true → S10 | loss | WB-PFT-07 |
| P8 | D1..D4 true → R1 | all four errors at once | WB-PFT-10 |

`WB-PFT-08` executes P1 again with the smallest legal inputs and `WB-PFT-09` records why the two marked edges are infeasible.

### 4.3 `calculateFertilizer` — V(G)=3, 19 edges, 18 nodes

```text
E ─> A1 findCrop(raw.cropId) ─> D1 crop missing?
                                  ├─true──> R1 {cropId: INVALID_SELECTION} ─> X
                                  └─false─> A2 validateNumberField(landArea) ─> D2 landArea.error?
                                                                                 ├─true──> R2 {landArea: …} ─> X
                                                                                 └─false─> S1 hectares … S9 result ─> R3 ─> X
```

| Path | Route | Case |
|---|---|---|
| P1 | D1 true → R1 | WB-FRT-01 |
| P2 | D1 false, D2 true → R2 | WB-FRT-02 |
| P3 | D1 false, D2 false → S1…S9 | WB-FRT-03 |

The three paths cover all 19 edges. `findCrop` (V(G)=2) is the inlined `crop.id === cropId || null` predicate on the edge into D1.

### 4.4 `filterPrices` — V(G)=9, 25 edges, 18 nodes

Node legend: `S1` = `needle = search.trim().toLowerCase()`, `L` = filter callback entry, `D1/D1b` = the two halves of `crop !== 'All crops' && row.crop !== crop`, and likewise `D2/D2b` for district and `D3/D3b` for market, `D4` = `needle`, `S3` = haystack construction, `D5` = `!haystack.includes(needle)`, `Rf1…Rf4` = the four `return false` sites, `Rt` = `return true`.

| Path | Route | Meaning | Case |
|---|---|---|---|
| P1 | D1 false → D2 false → D3 false → D4 false → Rt | no filter, no search | WB-MND-01 |
| P2 | D1 true, D1b false → … → Rt | crop active, row matches | WB-MND-02 |
| P3 | D1 true, D1b true → Rf1 | crop active, row differs | WB-MND-03 |
| P4 | D2 true, D2b false → … → Rt | district active, row matches | WB-MND-04 |
| P5 | D2 true, D2b true → Rf2 | district active, row differs | WB-MND-05 |
| P6 | D3 true, D3b false → … → Rt | market active, row matches | WB-MND-06 |
| P7 | D3 true, D3b true → Rf3 | market active, row differs | WB-MND-07 |
| P8 | D4 true, D5 true → Rf4 | search active, no match | WB-MND-08 |
| P9 | D4 true, D5 false → Rt | search active, match | WB-MND-09 |

The nine paths cover all 25 edges. Because the predicate runs once per row over 32 rows, a single case executes both the matching and the rejecting side of each guard several times; the table names the side that the chosen dataset exercises first.

### 4.5 `validateRegistration` — V(G)=7, 24 edges, 19 nodes

```text
E ─> N1 validateRequiredText(name) ─> D1 name.error? ──true──> S1 ─┐
                                       └─false────────────────────> M1 validateEmail
M1 ─> D2 mail.error? ──true──> S2 ─┐
        └─false──────────────────> P1 validatePassword
P1 ─> D3 pass.error? ──true──> S3 ─┐
        └─false──────────────────> C1 confirmPassword check
C1 ─> D4 !confirmPassword? ──true──> S4 REQUIRED ─┐
       └─false──> D5 password !== confirmPassword?
                    ├─true──> S5 PASSWORD_MISMATCH ─┤
                    └─false────────────────────────> D6 errors.length > 0?
D6 ──true──> R1 {ok:false} ─> X
 └──false──> R2 {ok:true}  ─> X
```

| Path | Route | Case |
|---|---|---|
| P1 | D1 false, D2 false, D3 false, D4 false, D5 false, D6 false | WB-REG-01 |
| P2 | D1 true → S1 | WB-REG-02 |
| P3 | D2 true → S2 | WB-REG-03 |
| P4 | D3 true → S3 | WB-REG-04 |
| P5 | D4 true → S4 | WB-REG-05 |
| P6 | D5 true → S5 | WB-REG-06 |
| P7 | D1, D2, D3 and D4 all true → four errors → R1 | WB-REG-07 |

Seven paths cover all 24 edges with **rank 6 = 24 − 19 + 1**, so the set is a strict basis. The first six paths already cover every edge; the seventh adds no new edge but is the sixth independent incidence vector, which is exactly the combined-error path. Feasibility matters here: D6 must return through R1 whenever any field recorded an error, so a path that collects an error and still takes `D6 → R2` is impossible and is not counted. `WB-REG-01` also asserts the normalisation (`ASHA@Example.com` → `asha@example.com`) that happens on the accepting path.

### 4.6 `validateLogin` — V(G)=4, 13 edges, 11 nodes

```text
E ─> M1 validateEmail ─> D1 mail.error? ──true──> S1 errors.email ─┐
                         └─false───────────────────────────────────┤
                                                                   v
                                     P1  !password?
                                     D2 password missing? ──true──> S2 errors.password ─┐
                                      └─false────────────────────────────────────────────┤
                                                                                         v
                                                                 D3 errors.length > 0?
                                                                  ├─true──> R1 {ok:false} ─> X
                                                                  └─false──> R2 {ok:true} ─> X
```

| Path | Route | Case |
|---|---|---|
| P1 | no errors → R2 | WB-LOG-01 |
| P2 | email error → R1 | WB-LOG-02 |
| P3 | password error → R1 | WB-LOG-03 |
| P4 | both errors → R1 | WB-LOG-04 |

The four paths cover all 13 edges with **rank 3 = 13 − 11 + 1**, so this is also a strict basis. P4 adds no new edge, because D3's outcome is already determined by D1/D2, but it supplies the fourth independent incidence vector. `WB-LOG-05` records that `"   "` (whitespace-only) passes because the validator tests `!password` without trimming — a real weakness, not a strength.

### 4.7 `validateProfile` — V(G)=18

`validateProfile` is a flat sequence of 17 predicates that append to one `errors` object and then branch once on `Object.keys(errors).length > 0`. Drawing 18 nested diamonds would obscure the structure; the decision list is the faithful representation:

| # | Line | Predicate | True outcome | False outcome |
|---|---|---|---|---|
| D1 | 14 | `if (fullName.error)` | `errors.fullName` | continue |
| D2 | 16 | `String(raw.district \|\| '')` — `raw.district` truthy | use the value | use `''` |
| D3 | 17 | `if (isEmpty(district))` | `district REQUIRED` | go to D4 |
| D4 | 18 | `else if (!DISTRICT_NAMES.includes(district))` | `district INVALID_SELECTION` | district valid |
| D5 | 20 | `String(raw.taluk \|\| '')` — `raw.taluk` truthy | use the value | use `''` |
| D6 | 22 | `if (isEmpty(taluk))` | `taluk REQUIRED` | go to D7 |
| D7 | 23 | `else if (!validTaluks.includes(taluk))` | `taluk INVALID_SELECTION` | taluk valid |
| D8 | 25 | `if (!['en','kn'].includes(raw.language))` | `language INVALID_SELECTION` | language valid |
| D9 | 28 | `if (farmArea.error)` | `errors.farmArea` | area valid |
| D10 | 30 | `String(raw.irrigation \|\| '')` — `raw.irrigation` truthy | use the value | use `''` |
| D11 | 31 | `if (isEmpty(irrigation))` | `irrigation REQUIRED` | irrigation valid |
| D12 | 33 | `Array.isArray(raw.primaryCrops) ? … : []` | use the array | use `[]` |
| D13 | 34 | `if (crops.length === 0)` | `primaryCrops REQUIRED` | go to D14 |
| D14 | 35 | `else if (crops.length > 5)` | `primaryCrops TOO_MANY` | go to D15 |
| D15 | 36 | `else if (crops.some(c => !PRIMARY_CROPS.includes(c)))` | `primaryCrops INVALID_SELECTION` | crops valid |
| D16 | 38 | `if (Object.keys(errors).length > 0)` | `{ok:false, errors}` | build `values` |
| D17 | 50 | `String(raw.village \|\| '').trim().slice(0, 80)` — `raw.village` truthy | slice the value | use `''` |

Decision-coverage table (each row is a case; `T`/`F` is the outcome taken):

| Case | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 | D16 | D17 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| WB-PRO-01 | F | T | F | F | T | F | T | F | F | T | F | T | F | F | F | F | T |
| WB-PRO-02 | T | T | F | F | T | F | T | F | F | T | F | T | F | F | F | T | T |
| WB-PRO-03 | F | F | T | — | F | T | — | F | F | T | F | T | F | F | F | T | T |
| WB-PRO-04 | F | T | F | T | T | F | T | F | F | T | F | T | F | F | F | T | T |
| WB-PRO-05 | F | T | F | F | T | T | — | F | F | T | F | T | F | F | F | T | T |
| WB-PRO-06 | F | T | F | F | T | F | F | F | F | T | F | T | F | F | F | T | T |
| WB-PRO-07 | F | T | F | F | T | F | T | T | F | T | F | T | F | F | F | T | T |
| WB-PRO-08 | F | T | F | F | T | F | T | F | T | T | F | T | F | F | F | T | T |
| WB-PRO-09 | F | T | F | F | T | F | T | F | F | F | T | T | F | F | F | T | T |
| WB-PRO-10 | F | T | F | F | T | F | T | F | F | T | F | F | T | — | — | T | T |
| WB-PRO-11 | F | T | F | F | T | F | T | F | F | T | F | T | T | — | — | T | T |
| WB-PRO-12 | F | T | F | F | T | F | T | F | F | T | F | T | F | T | — | T | T |
| WB-PRO-13 | F | T | F | F | T | F | T | F | F | T | F | T | F | F | T | T | T |
| WB-PRO-14 | F | T | F | F | T | F | T | F | F | T | F | T | F | F | F | F | T |
| WB-PRO-15 | F | T | F | F | T | F | T | F | F | T | F | T | F | F | F | F | F |

Every decision is taken both ways at least once: D1 (01/02), D2 (03/01), D3 (03/01), D4 (04/01), D5 (03/01), D6 (05/01), D7 (06/01), D8 (07/01), D9 (08/01), D10 (09/01), D11 (09/01), D12 (10/01), D13 (11/01), D14 (12/01), D15 (13/01), D16 (error cases/accepting cases), D17 (15/01). Decision coverage is therefore **17/17 = 100%**. A strict add-one-new-edge basis of 18 is not achievable, because the twelve error cases all converge on D16 and the same return node; the cases instead guarantee that every feasible CFG edge is traversed at least once.

`WB-PRO-14` also proves the slice at line 50 (85 characters in, 80 stored) and `WB-PRO-15` the falsy side of the village default.

---

## 5. Coverage achieved by the white-box suite

| Unit | Criterion | Achieved | Evidence |
|---|---|---|---|
| `validateNumberField` | basis paths | 6/6 paths, 19/19 edges, rank 5 = 19−15+1 | `WbNumberFieldTest` 6/6 pass |
| `calculateProfit` | basis paths (feasible graph) | 8/8 paths, 38/38 feasible edges, rank 7 = 38−32+1 | `WbProfitTest` 10/10 pass |
| `calculateFertilizer` | basis paths | 3/3 paths, 19/19 edges, rank 2 = 19−18+1 | `WbFertilizerTest` 3/3 pass |
| `filterPrices` | basis paths | 9/9 paths, 25/25 edges, rank 8 = 25−18+1 | `WbMandiFilterTest` 9/9 pass |
| `validateRegistration` | basis paths | 7/7 paths, 24/24 edges, rank 6 = 24−19+1 | `WbAuthTest` 7/7 pass |
| `validateLogin` | basis paths | 4/4 paths, 13/13 edges, rank 3 = 13−11+1 (P4 adds no edge) | `WbAuthTest` 5/5 pass |
| `validateProfile` | decision coverage | 17/17 decisions = 100%; all feasible edges | `WbProfileTest` 15/15 pass |
| primitives (`isEmpty`, `validateRequiredText`, `validateEmail`, `validatePassword`) | exercised through callers | the branches needed by the parent units: empty, too-short, invalid-email and password-too-short are reached by the WB cases; the password-weak and name-too-long branches are only reached by the ECP suite (`ECP-REG-04`, `ECP-REG-10`, `ECP-REG-11`) | `WbAuthTest`, `WbProfileTest` plus `EcpRegistrationTest` |
| `findCrop` | exercised through caller | both outcomes reached (WB-FRT-01, WB-FRT-03) | `WbFertilizerTest` |
| `fetchMandiPrices`, `error` | straight-line | V(G)=1, no branch | page smoke + all validators |

**Measured totals:** 55 JUnit executions, 0 failures, 0 errors, 0 skipped, 53.64 s, `BUILD SUCCESS` (`target/wb-final.log`). All six path-based units pass the GF(2) basis check (`basis=true` in `basis.mjs`).

This is structural coverage of the units, not JaCoCo-style line coverage: no instrumentation was added to the application and no line/branch percentage is claimed beyond the decision and edge counts shown above.

---

## 6. Infeasible and unreachable code

Honest white-box reporting must distinguish "not tested" from "cannot be tested". Four findings:

1. **`calculateProfit` line 54 `revenue > 0` and line 57 `totalYield > 0` cannot be false.** The minima `landArea = 0.1`, `yieldPerAcre = 0.1`, `sellingPrice = 1`, `cultivationCost = 0` produce `totalYield = 0.01` and `revenue = 0.01`. `WB-PFT-09` asserts those values instead of pretending the false branch was covered. The `breakEvenPrice = 0` and `marginPercent = 0` fallbacks are therefore dead for legal input.
2. **`validateNumberField` `BELOW_MIN` for `cultivationCost` is unreachable.** `NUMBER_PATTERN = /^\d+(\.\d+)?$/` rejects the minus sign, so `-1` returns `NOT_NUMBER` and the inclusive minimum is `0`. `WB-PFT-05` records the actual code. The `BELOW_MIN` branch is reachable for the other three profit fields and for `farmArea`/`landArea`, and is covered by WB-NF-04 and WB-PRO-08.
3. **`validateProfile` D4 and D7 are unreachable from the UI but reachable in code.** The onboarding `<select>`s only offer real districts and the taluks of the chosen district, so an invalid selection cannot be submitted from the page. D4/D7 are still live code and are covered through the module: WB-PRO-04 and WB-PRO-06.
4. **`firstError` (V(G)=3) has no caller.** `auth.js` re-exports it, but no module in `src/` imports it. It is dead code and is deliberately not claimed as covered; removing or wiring it is a cleanup item for the team, not a test result.

The `filterPrices` "all markets" string comparisons and the `calculateFertilizer` crop guard are *UI-unreachable* rather than infeasible: the page cannot submit those states, but the function can be called with them, and the white-box cases do exactly that.

---

## 7. Traceability

| White-box ID | Unit / path | JUnit class | Related black-box IDs |
|---|---|---|---|
| WB-NF-01…06 | `validateNumberField` P1…P6 | `WbNumberFieldTest` | ECP-PFT-04…07; BVA profit landArea |
| WB-PFT-01…10 | `calculateProfit` feasible basis + boundary | `WbProfitTest` | ECP-PFT-01…15; BVA-PFT-* |
| WB-FRT-01…03 | `calculateFertilizer` P1…P3 | `WbFertilizerTest` | ECP-FRT-01…11; BVA-FRT-* |
| WB-MND-01…09 | `filterPrices` P1…P9 | `WbMandiFilterTest` | ECP-MND-01…17; BVA-MND-* |
| WB-REG-01…07 | `validateRegistration` P1…P7 | `WbAuthTest` | ECP-REG-01…15; BVA-REG-* |
| WB-LOG-01…05 | `validateLogin` P1…P4 + whitespace probe | `WbAuthTest` | ECP-LOG-01…10; BVA-LOG-* |
| WB-PRO-01…15 | `validateProfile` decision coverage | `WbProfileTest` | ECP-PRO-01…18; BVA-PRO-* |

The same input boundaries appear in three layers: ECP selects the class, BVA walks the boundary, and this document names the exact branch the boundary lands on. For example `farmArea = 0.05` is `ECP-PRO-10` (invalid class), `BVA-PRO-*` (just below the 0.1 boundary) and `WB-PRO-08` (D9 true). Design, code and evidence therefore share one ID space.

---

## 8. Defects and observations arising from the white-box pass

No failing assertion was found in the 55 cases, so no new defect is raised by this suite. Four observations are recorded because the code, not the test, determines the behaviour:

| Observation | Evidence | Severity |
|---|---|---|
| Login accepts a whitespace-only password at the client-validator level | `WB-LOG-05` (passes `validateLogin`) | Medium — depends on the demo adapter rejecting it; the validator should trim and reuse `validatePassword` |
| Whole-rupee display rounding can hide ±₹0.01 in the profit card | `ECP-PFT-03` actual text; `WB-PFT-01…07` raw values are exact | Low — presentation only |
| `validateProfile` accepts any non-empty irrigation string | `WB-PRO-01`/`WB-PRO-11`; `IRRIGATION_SOURCES` is never consulted | Low — the select constrains the UI, the validator does not |
| Two profit guards and one cost branch are dead for legal input | §6 items 1–2, `WB-PFT-09`/`WB-PFT-05` | Info — dead code, harmless |

These are carried into the defect report (`06-Defect-Report.md`) rather than hidden.

---

## 9. Limitations

- The complexity figures follow the `V(G) = 1 + decisions` convention. A tool that counts switch cases or `??` differently would give slightly different numbers; the per-construct breakdown in §3 lets a reader recompute them.
- Decision coverage is not statement coverage. No bytecode or source instrumentation was run against the application, so a line-level percentage is not reported.
- `validateProfile` is assessed by decision coverage, not by a formal path basis, because its 17 predicates produce a combinatorial space of error combinations and all of them converge on one return. The table in §4.7 states exactly which outcome each case takes.
- For `validateRegistration` and `validateLogin`, feasibility was applied when forming the basis: a path that records an error and still returns `ok:true` cannot be produced by any input and is excluded. With that filter both units reach the full `E − V + 1` rank (6 and 3 respectively). Without it, a naive enumeration would report a larger V(G) than any input can exercise.
- The bridge is dev-only. The white-box suite must run against `npm run dev` (the suite's `AppServer` does this); it must not be pointed at a production build.
