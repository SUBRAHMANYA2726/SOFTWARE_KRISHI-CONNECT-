package com.krishiconnect.qa.tests.bva;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.ProfitPage;
import com.krishiconnect.qa.support.Storage;

/** BVA-PFT-01 … BVA-PFT-36 — profit calculator boundaries, with the page's exact display strings. */
class BvaProfitTest extends BaseTest {

    /** /calculator/profit is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_bva_profit", "bva.profit@example.com", "BVA Profit");
    }

    record Case(String id, String landArea, String yieldPerAcre, String sellingPrice, String cultivationCost,
                String errorField, String errorCode, String status, String totalYield, String revenue,
                String expenditure, String net, String margin, String breakEven) {
    }

    private static Case ok(String id, String la, String ya, String sp, String cc, String status,
                           String totalYield, String revenue, String expenditure, String net,
                           String margin, String breakEven) {
        return new Case(id, la, ya, sp, cc, null, null, status, totalYield, revenue, expenditure, net, margin, breakEven);
    }

    private static Case reject(String id, String la, String ya, String sp, String cc,
                               String field, String code) {
        return new Case(id, la, ya, sp, cc, field, code, null, null, null, null, null, null, null);
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(reject("BVA-PFT-01", "0.09", "20", "2000", "10000", "landArea", "BELOW_MIN")),
                Arguments.of(ok("BVA-PFT-02", "0.1", "20", "2000", "10000", "Loss",
                        "2 quintals", "₹4,000", "₹10,000", "-₹6,000", "-150%", "₹5,000.00")),
                Arguments.of(ok("BVA-PFT-03", "0.11", "20", "2000", "10000", "Loss",
                        "2.2 quintals", "₹4,400", null, "-₹5,600", "-127.3%", "₹4,545.45")),
                Arguments.of(ok("BVA-PFT-04", "499.99", "20", "2000", "10000", "Profit",
                        "9,999.8 quintals", "₹1,99,99,600", null, "₹1,99,89,600", "99.9%", "₹1.00")),
                Arguments.of(ok("BVA-PFT-05", "500", "20", "2000", "10000", "Profit",
                        "10,000 quintals", "₹2,00,00,000", null, "₹1,99,90,000", "100%", "₹1.00")),
                Arguments.of(reject("BVA-PFT-06", "500.01", "20", "2000", "10000", "landArea", "ABOVE_MAX")),
                Arguments.of(reject("BVA-PFT-07", "501", "20", "2000", "10000", "landArea", "ABOVE_MAX")),
                Arguments.of(reject("BVA-PFT-08", "1", "0.09", "2000", "10000", "yieldPerAcre", "BELOW_MIN")),
                Arguments.of(ok("BVA-PFT-09", "1", "0.1", "2000", "10000", "Loss",
                        "0.1 quintals", "₹200", null, "-₹9,800", "-4900%", "₹1,00,000.00")),
                Arguments.of(ok("BVA-PFT-10", "1", "0.11", "2000", "10000", "Loss",
                        "0.11 quintals", "₹220", null, "-₹9,780", "-4445.5%", "₹90,909.09")),
                Arguments.of(ok("BVA-PFT-11", "1", "499.99", "2000", "10000", "Profit",
                        "499.99 quintals", "₹9,99,980", null, "₹9,89,980", "99%", "₹20.00")),
                Arguments.of(ok("BVA-PFT-12", "1", "500", "2000", "10000", "Profit",
                        "500 quintals", "₹10,00,000", null, "₹9,90,000", "99%", "₹20.00")),
                Arguments.of(reject("BVA-PFT-13", "1", "500.01", "2000", "10000", "yieldPerAcre", "ABOVE_MAX")),
                Arguments.of(reject("BVA-PFT-14", "1", "20", "0", "10000", "sellingPrice", "BELOW_MIN")),
                Arguments.of(reject("BVA-PFT-15", "1", "20", "0.99", "10000", "sellingPrice", "BELOW_MIN")),
                Arguments.of(ok("BVA-PFT-16", "1", "20", "1", "10000", "Loss",
                        null, "₹20", null, "-₹9,980", "-49900%", "₹500.00")),
                Arguments.of(ok("BVA-PFT-17", "1", "20", "1.01", "10000", "Loss",
                        null, "₹20", null, "-₹9,980", "-49405%", "₹500.00")),
                Arguments.of(ok("BVA-PFT-18", "1", "20", "99999.99", "10000", "Profit",
                        null, "₹20,00,000", null, "₹19,90,000", "99.5%", "₹500.00")),
                Arguments.of(ok("BVA-PFT-19", "1", "20", "100000", "10000", "Profit",
                        null, "₹20,00,000", null, "₹19,90,000", "99.5%", "₹500.00")),
                Arguments.of(reject("BVA-PFT-20", "1", "20", "100000.01", "10000", "sellingPrice", "ABOVE_MAX")),
                Arguments.of(reject("BVA-PFT-21", "1", "20", "100001", "10000", "sellingPrice", "ABOVE_MAX")),
                Arguments.of(reject("BVA-PFT-22", "1", "20", "2000", "-0.01", "cultivationCost", "NOT_NUMBER")),
                Arguments.of(ok("BVA-PFT-23", "1", "20", "2000", "0", "Profit",
                        null, null, null, "₹40,000", "100%", "₹0.00")),
                Arguments.of(ok("BVA-PFT-24", "1", "20", "2000", "0.01", "Profit",
                        null, null, null, "₹40,000", "100%", "₹0.00")),
                Arguments.of(ok("BVA-PFT-25", "1", "20", "2000", "39999.99", "Profit",
                        null, null, null, "₹0", "0%", "₹2,000.00")),
                Arguments.of(ok("BVA-PFT-26", "1", "20", "2000", "40000", "Break-even",
                        null, null, null, "₹0", "0%", "₹2,000.00")),
                Arguments.of(ok("BVA-PFT-27", "1", "20", "2000", "40000.01", "Loss",
                        null, null, null, "-₹0", "0%", "₹2,000.00")),
                Arguments.of(ok("BVA-PFT-28", "1", "20", "2000", "9999999.99", "Loss",
                        null, null, null, "-₹99,60,000", "-24900%", "₹5,00,000.00")),
                Arguments.of(ok("BVA-PFT-29", "1", "20", "2000", "10000000", "Loss",
                        null, null, null, "-₹99,60,000", "-24900%", "₹5,00,000.00")),
                Arguments.of(reject("BVA-PFT-30", "1", "20", "2000", "10000000.01", "cultivationCost", "ABOVE_MAX")),
                Arguments.of(ok("BVA-PFT-31", "0.1", "0.1", "1", "0", "Profit",
                        "0.01 quintals", "₹0", null, "₹0", "100%", "₹0.00")),
                Arguments.of(ok("BVA-PFT-32", "500", "500", "100000", "10000000", "Profit",
                        "2,50,000 quintals", "₹25,00,00,00,000", null, "₹24,99,00,00,000", "100%", "₹40.00")),
                Arguments.of(reject("BVA-PFT-34", "-1", "20", "2000", "10000", "landArea", "NOT_NUMBER")),
                Arguments.of(ok("BVA-PFT-35", "000.1", "20", "2000", "10000", "Loss",
                        "2 quintals", "₹4,000", "₹10,000", "-₹6,000", "-150%", "₹5,000.00")),
                Arguments.of(ok("BVA-PFT-36", "0.10", "20", "2000", "10000", "Loss",
                        "2 quintals", "₹4,000", "₹10,000", "-₹6,000", "-150%", "₹5,000.00")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Profit calculator boundaries")
    void profitBoundary(Case testCase) {
        WebDriver driver = driver();
        ProfitPage page = new ProfitPage(driver).open();
        page.fillForm(testCase.landArea(), testCase.yieldPerAcre(), testCase.sellingPrice(),
                testCase.cultivationCost());
        page.calculate();

        if (testCase.errorCode() != null) {
            assertFalse(page.hasResult(), testCase.id() + " must not render a result card");
            assertTrue(page.hasSummaryError(), testCase.id() + " must show the error summary");
            if ("MULTI".equals(testCase.errorCode())) {
                assertEquals("BELOW_MIN", page.errorCode("landArea"), "BVA-PFT-33 landArea");
                assertEquals("BELOW_MIN", page.errorCode("yieldPerAcre"), "BVA-PFT-33 yieldPerAcre");
                assertEquals("BELOW_MIN", page.errorCode("sellingPrice"), "BVA-PFT-33 sellingPrice");
                assertEquals("ABOVE_MAX", page.errorCode("cultivationCost"), "BVA-PFT-33 cultivationCost");
            } else {
                assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                        testCase.id() + " unexpected error code for " + testCase.errorField());
            }
            return;
        }

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
        if (testCase.net() != null) {
            assertEquals(testCase.net(), page.net(), testCase.id() + " net result");
        }
        if (testCase.margin() != null) {
            assertEquals(testCase.margin(), page.margin(), testCase.id() + " margin");
        }
        if (testCase.breakEven() != null) {
            assertEquals(testCase.breakEven(), page.breakEven(), testCase.id() + " break-even price");
        }
    }

    @Test
    @DisplayName("BVA-PFT-33 reports four field errors in one submit")
    void fourErrorsAtOnce() {
        ProfitPage page = new ProfitPage(driver).open();
        page.fillForm("0.09", "0.09", "0.99", "10000000.01");
        page.calculate();
        assertFalse(page.hasResult());
        assertTrue(page.hasSummaryError());
        assertEquals("BELOW_MIN", page.errorCode("landArea"));
        assertEquals("BELOW_MIN", page.errorCode("yieldPerAcre"));
        assertEquals("BELOW_MIN", page.errorCode("sellingPrice"));
        assertEquals("ABOVE_MAX", page.errorCode("cultivationCost"));
    }
}
