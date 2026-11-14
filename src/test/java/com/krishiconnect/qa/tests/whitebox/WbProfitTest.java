package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.support.JsBridge;

/**
 * WB-PFT-01 … WB-PFT-10 — basis paths of {@code calculateProfit}
 * (profit.js lines 28–75).
 *
 * Structural V(G) = 10. Two guard edges are infeasible for any legal input
 * (the false side of line 54 {@code revenue > 0} and of line 57
 * {@code totalYield > 0}); the remaining graph has 38 edges over 32 nodes, so
 * its feasible V(G) is 8. The eight basis paths are WB-PFT-01 … WB-PFT-07 plus
 * WB-PFT-10: the seven paths of {@code calculateProfit (feasible)} in the basis
 * script cover all 38 edges, and the combined-error path makes the set
 * affinely independent (rank 7 = 38 − 32 + 1). WB-PFT-08 is an extra
 * minimum-legal-input value case on the same path as WB-PFT-01, and WB-PFT-09
 * records the boundary that keeps the two guard edges unreachable.
 */
class WbProfitTest extends BaseTest {

    record ErrorCase(String id, String landArea, String yieldPerAcre, String sellingPrice,
                     String cultivationCost, String errorField, String errorCode) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> errorCases() {
        return Stream.of(
                Arguments.of(new ErrorCase("WB-PFT-02", "", "20", "2000", "10000", "landArea", "REQUIRED")),
                Arguments.of(new ErrorCase("WB-PFT-03", "1", "600", "2000", "10000", "yieldPerAcre", "ABOVE_MAX")),
                Arguments.of(new ErrorCase("WB-PFT-04", "1", "20", "0", "10000", "sellingPrice", "BELOW_MIN")),
                Arguments.of(new ErrorCase("WB-PFT-05", "1", "20", "2000", "-1", "cultivationCost", "NOT_NUMBER")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("errorCases")
    @DisplayName("Error branches of calculateProfit")
    void errorBranch(ErrorCase testCase) {
        Map<String, Object> result = bridge().calculateProfit(Map.of(
                "landArea", testCase.landArea(),
                "yieldPerAcre", testCase.yieldPerAcre(),
                "sellingPrice", testCase.sellingPrice(),
                "cultivationCost", testCase.cultivationCost()));

        assertEquals(Boolean.FALSE, result.get("ok"), testCase.id() + " must reject the input");
        assertEquals(testCase.errorCode(), JsBridge.fieldError(result, testCase.errorField()),
                testCase.id() + " unexpected error code");
        assertNull(result.get("status"), testCase.id() + " no status is produced for an invalid form");
    }

    record OutcomeCase(String id, String landArea, String yieldPerAcre, String sellingPrice,
                       String cultivationCost, String status, double totalYield, double revenue,
                       double cost, double profit, double margin, double breakEven) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> outcomeCases() {
        return Stream.of(
                Arguments.of(new OutcomeCase("WB-PFT-01", "1", "20", "2000", "10000", "PROFIT",
                        20, 40000, 10000, 30000, 75, 500)),
                Arguments.of(new OutcomeCase("WB-PFT-06", "1", "20", "2000", "40000", "BREAK_EVEN",
                        20, 40000, 40000, 0, 0, 2000)),
                Arguments.of(new OutcomeCase("WB-PFT-07", "1", "20", "2000", "50000", "LOSS",
                        20, 40000, 50000, -10000, -25, 2500)),
                Arguments.of(new OutcomeCase("WB-PFT-08", "0.1", "0.1", "1", "0", "PROFIT",
                        0.01, 0.01, 0, 0.01, 100, 0)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("outcomeCases")
    @DisplayName("Calculation path and the three status branches")
    void outcome(OutcomeCase testCase) {
        Map<String, Object> result = bridge().calculateProfit(Map.of(
                "landArea", testCase.landArea(),
                "yieldPerAcre", testCase.yieldPerAcre(),
                "sellingPrice", testCase.sellingPrice(),
                "cultivationCost", testCase.cultivationCost()));

        assertEquals(Boolean.TRUE, result.get("ok"), testCase.id() + " must accept the input");
        assertEquals(testCase.status(), result.get("status"), testCase.id() + " status");
        assertEquals(testCase.totalYield(), JsBridge.number(result, "totalYield"), 0.000001, testCase.id() + " totalYield");
        assertEquals(testCase.revenue(), JsBridge.number(result, "revenue"), 0.000001, testCase.id() + " revenue");
        assertEquals(testCase.cost(), JsBridge.number(result, "cost"), 0.000001, testCase.id() + " cost");
        assertEquals(testCase.profit(), JsBridge.number(result, "profit"), 0.000001, testCase.id() + " profit");
        assertEquals(testCase.margin(), JsBridge.number(result, "marginPercent"), 0.000001, testCase.id() + " marginPercent");
        assertEquals(testCase.breakEven(), JsBridge.number(result, "breakEvenPrice"), 0.000001, testCase.id() + " breakEvenPrice");
    }

    /**
     * WB-PFT-10 is the combined-error path. It adds no new edge that
     * WB-PFT-02 … WB-PFT-05 do not already cover, but it is the eighth
     * independent path of the feasible graph: without it the seven other paths
     * span only 6 of the 7 dimensions of the feasible cycle space.
     */
    @Test
    @DisplayName("WB-PFT-10 all four fields invalid report four errors and stop the calculation")
    void combinedErrors() {
        Map<String, Object> result = bridge().calculateProfit(Map.of(
                "landArea", "",
                "yieldPerAcre", "600",
                "sellingPrice", "0",
                "cultivationCost", "-1"));

        assertEquals(Boolean.FALSE, result.get("ok"), "WB-PFT-10 must reject the input");
        assertEquals("REQUIRED", JsBridge.fieldError(result, "landArea"), "WB-PFT-10 landArea");
        assertEquals("ABOVE_MAX", JsBridge.fieldError(result, "yieldPerAcre"), "WB-PFT-10 yieldPerAcre");
        assertEquals("BELOW_MIN", JsBridge.fieldError(result, "sellingPrice"), "WB-PFT-10 sellingPrice");
        assertEquals("NOT_NUMBER", JsBridge.fieldError(result, "cultivationCost"), "WB-PFT-10 cultivationCost");
        assertEquals(4, JsBridge.map(result, "errors").size(), "WB-PFT-10 all four errors are collected");
        assertNull(result.get("status"), "WB-PFT-10 no status is produced for an invalid form");
    }

    /**
     * The two guards {@code if (revenue > 0)} and {@code if (totalYield > 0)}
     * cannot be false: the smallest legal inputs still produce 0.01 quintals and
     * INR 0.01. This case records the boundary that makes those two edges
     * infeasible rather than pretending to cover them.
     */
    @Test
    @DisplayName("WB-PFT-09 minimum legal inputs keep both guard conditions true")
    void infeasibleGuards() {
        Map<String, Object> result = bridge().calculateProfit(Map.of(
                "landArea", "0.1",
                "yieldPerAcre", "0.1",
                "sellingPrice", "1",
                "cultivationCost", "0"));

        assertTrue(JsBridge.number(result, "totalYield") > 0,
                "WB-PFT-09 totalYield stays positive, so the breakEvenPrice guard is always taken");
        assertTrue(JsBridge.number(result, "revenue") > 0,
                "WB-PFT-09 revenue stays positive, so the margin guard is always taken");
        assertEquals(0.0, JsBridge.number(result, "breakEvenPrice"), 0.000001,
                "WB-PFT-09 zero cost keeps the break-even price at zero");
    }

    private JsBridge bridge() {
        return new JsBridge(driver());
    }
}
