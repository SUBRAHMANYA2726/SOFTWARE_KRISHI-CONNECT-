package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.ProfitPage;
import com.krishiconnect.qa.support.JsBridge;
import com.krishiconnect.qa.support.Storage;

/** ECP-PFT-01 … ECP-PFT-15 — profit calculator equivalence classes. */
class EcpProfitTest extends BaseTest {

    /** /calculator/profit is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_ecp_profit", "ecp.profit@example.com", "ECP Profit");
    }

    record Case(String id, String landArea, String yieldPerAcre, String sellingPrice, String cultivationCost,
                String errorField, String errorCode, String status, String totalYield, String revenue,
                String expenditure, String net, String margin, String breakEven) {
        @Override
        public String toString() {
            return id;
        }
    }

    private static Case ok(String id, String la, String ya, String sp, String cc, String status,
                           String totalYield, String revenue, String expenditure, String net,
                           String margin, String breakEven) {
        return new Case(id, la, ya, sp, cc, null, null, status, totalYield, revenue, expenditure, net, margin, breakEven);
    }

    private static Case reject(String id, String la, String ya, String sp, String cc, String field, String code) {
        return new Case(id, la, ya, sp, cc, field, code, null, null, null, null, null, null, null);
    }

    static Stream<Arguments> outcomeCases() {
        return Stream.of(
                Arguments.of(ok("ECP-PFT-01", "1", "20", "2000", "10000", "Profit",
                        "20 quintals", "₹40,000", "₹10,000", "₹30,000", "75%", "₹500.00")),
                Arguments.of(ok("ECP-PFT-02", "1", "20", "2000", "40000", "Break-even",
                        null, null, null, "₹0", "0%", "₹2,000.00")),
                Arguments.of(ok("ECP-PFT-03", "1", "20", "2000", "50000", "Loss",
                        null, null, null, "-₹10,000", "-25%", "₹2,500.00")),
                Arguments.of(ok("ECP-PFT-12", "1", "20", "2000", "0", "Profit",
                        null, null, null, "₹40,000", "100%", "₹0.00")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("outcomeCases")
    @DisplayName("Profit outcomes and displayed values")
    void profitOutcome(Case testCase) {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm(testCase.landArea(), testCase.yieldPerAcre(), testCase.sellingPrice(),
                testCase.cultivationCost());
        page.calculate();
        page.waitForResult();

        assertEquals(testCase.status(), page.status(), testCase.id() + " status");
        if (testCase.totalYield() != null) {
            assertEquals(testCase.totalYield(), page.totalYield(), testCase.id() + " total yield");
        }
        if (testCase.revenue() != null) {
            assertEquals(testCase.revenue(), page.revenue(), testCase.id() + " revenue");
        }
        if (testCase.expenditure() != null) {
            assertEquals(testCase.expenditure(), page.expenditure(), testCase.id() + " expenditure");
        }
        assertEquals(testCase.net(), page.net(), testCase.id() + " net result");
        assertEquals(testCase.margin(), page.margin(), testCase.id() + " margin");
        assertEquals(testCase.breakEven(), page.breakEven(), testCase.id() + " break-even price");
    }

    static Stream<Arguments> rejectionCases() {
        return Stream.of(
                Arguments.of(reject("ECP-PFT-07", "0.05", "20", "2000", "10000", "landArea", "BELOW_MIN")),
                Arguments.of(reject("ECP-PFT-08", "1", "600", "2000", "10000", "yieldPerAcre", "ABOVE_MAX")),
                Arguments.of(reject("ECP-PFT-09", "1", "20", "0", "10000", "sellingPrice", "BELOW_MIN")),
                Arguments.of(reject("ECP-PFT-10", "1", "20", "100001", "10000", "sellingPrice", "ABOVE_MAX")),
                Arguments.of(reject("ECP-PFT-11", "1", "20", "2000", "-1", "cultivationCost", "NOT_NUMBER")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("rejectionCases")
    @DisplayName("Profit field equivalence classes are rejected")
    void profitRejection(Case testCase) {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm(testCase.landArea(), testCase.yieldPerAcre(), testCase.sellingPrice(),
                testCase.cultivationCost());
        page.calculate();

        assertFalse(page.hasResult(), testCase.id() + " must not render a result card");
        assertTrue(page.hasSummaryError(), testCase.id() + " must show the error summary");
        assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                testCase.id() + " unexpected error code for " + testCase.errorField());
    }

    @Test
    @DisplayName("ECP-PFT-04 an empty form reports four REQUIRED errors")
    void emptyForm() {
        ProfitPage page = new ProfitPage(driver()).open();
        page.calculate();

        assertFalse(page.hasResult(), "ECP-PFT-04 must not render a result card");
        assertTrue(page.hasSummaryError(), "ECP-PFT-04 must show the error summary");
        assertEquals("REQUIRED", page.errorCode("landArea"), "ECP-PFT-04 landArea");
        assertEquals("REQUIRED", page.errorCode("yieldPerAcre"), "ECP-PFT-04 yieldPerAcre");
        assertEquals("REQUIRED", page.errorCode("sellingPrice"), "ECP-PFT-04 sellingPrice");
        assertEquals("REQUIRED", page.errorCode("cultivationCost"), "ECP-PFT-04 cultivationCost");
    }

    @Test
    @DisplayName("ECP-PFT-05 a whitespace-only land area is REQUIRED")
    void whitespaceLandArea() {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm("1", "20", "2000", "10000");
        // A number input sanitises the spaces to an empty value, which is the
        // same state a real user sees after typing only whitespace.
        page.fillViaJs("profit-landArea", "   ");
        page.calculate();

        assertFalse(page.hasResult(), "ECP-PFT-05 must not render a result card");
        assertEquals("REQUIRED", page.errorCode("landArea"), "ECP-PFT-05 landArea");
    }

    @Test
    @DisplayName("ECP-PFT-06 a non-numeric land area is NOT_NUMBER at function level")
    void nonNumericLandArea() {
        JsBridge bridge = new JsBridge(driver());
        Map<String, Object> result = bridge.calculateProfit(Map.of(
                "landArea", "abc",
                "yieldPerAcre", "20",
                "sellingPrice", "2000",
                "cultivationCost", "10000"));

        assertEquals(Boolean.FALSE, result.get("ok"));
        assertEquals("NOT_NUMBER", JsBridge.fieldError(result, "landArea"));
        assertNull(JsBridge.fieldError(result, "yieldPerAcre"),
                "ECP-PFT-06 the other fields are valid");
    }

    @Test
    @DisplayName("ECP-PFT-13 all four invalid fields are reported in one submit")
    void fourErrorsAtOnce() {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm("0.05", "600", "0", "-1");
        page.calculate();

        assertFalse(page.hasResult(), "ECP-PFT-13 must not render a result card");
        assertTrue(page.hasSummaryError(), "ECP-PFT-13 must show the error summary");
        assertEquals("BELOW_MIN", page.errorCode("landArea"), "ECP-PFT-13 landArea");
        assertEquals("ABOVE_MAX", page.errorCode("yieldPerAcre"), "ECP-PFT-13 yieldPerAcre");
        assertEquals("BELOW_MIN", page.errorCode("sellingPrice"), "ECP-PFT-13 sellingPrice");
        assertEquals("NOT_NUMBER", page.errorCode("cultivationCost"), "ECP-PFT-13 cultivationCost");
    }

    @Test
    @DisplayName("ECP-PFT-14 the crop label is optional")
    void labelOptional() {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm("1", "20", "2000", "10000");
        page.calculate();
        page.waitForResult();

        assertEquals("", page.label(), "ECP-PFT-14 the label must stay empty");
        assertEquals("Profit", page.status(), "ECP-PFT-14 the calculation must still run");
    }

    @Test
    @DisplayName("ECP-PFT-15 reset clears the fields, result and summary")
    void resetClearsEverything() {
        ProfitPage page = new ProfitPage(driver()).open();
        page.fillForm("1", "20", "2000", "10000");
        page.calculate();
        page.waitForResult();
        assertTrue(page.hasResult(), "ECP-PFT-15 precondition: a result must be visible");

        page.reset();

        assertTrue(page.isFormEmpty(), "ECP-PFT-15 all fields must be cleared");
        assertFalse(page.hasResult(), "ECP-PFT-15 the result card must be removed");
        assertFalse(page.hasSummaryError(), "ECP-PFT-15 the summary must be hidden");
    }
}
