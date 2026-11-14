package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.FertilizerPage;
import com.krishiconnect.qa.support.Storage;

/** ECP-FRT-01 … ECP-FRT-11 — fertilizer calculator equivalence classes. */
class EcpFertilizerTest extends BaseTest {

    /** /calculator/fertilizer is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_ecp_fert", "ecp.fert@example.com", "ECP Fertilizer");
    }

    record Case(String id, String cropId, String area, String errorField, String errorCode,
                String hectares, String n, String p, String k, String dap, String urea, String mop) {
        @Override
        public String toString() {
            return id;
        }
    }

    private static Case ok(String id, String cropId, String area, String hectares, String n, String p, String k,
                           String dap, String urea, String mop) {
        return new Case(id, cropId, area, null, null, hectares, n, p, k, dap, urea, mop);
    }

    private static Case reject(String id, String cropId, String area, String field, String code) {
        return new Case(id, cropId, area, field, code, null, null, null, null, null, null, null);
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(ok("ECP-FRT-01", "ragi", "1", "0.405",
                        "20.25", "16.2", "10.13", "35.2 kg", "30.2 kg", "16.9 kg")),
                Arguments.of(ok("ECP-FRT-02", "paddy", "2", "0.809",
                        "80.9", "40.45", "40.45", "87.9 kg", "141.5 kg", "67.4 kg")),
                Arguments.of(reject("ECP-FRT-03", "", "1", "crop", "INVALID_SELECTION")),
                Arguments.of(reject("ECP-FRT-04", "ragi", "", "landArea", "REQUIRED")),
                Arguments.of(reject("ECP-FRT-05", "ragi", "0", "landArea", "BELOW_MIN")),
                Arguments.of(reject("ECP-FRT-06", "ragi", "0.05", "landArea", "BELOW_MIN")),
                Arguments.of(reject("ECP-FRT-07", "ragi", "100.01", "landArea", "ABOVE_MAX")),
                Arguments.of(reject("ECP-FRT-08", "ragi", "-1", "landArea", "NOT_NUMBER")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Fertilizer doses and validation classes")
    void fertilizerClass(Case testCase) {
        FertilizerPage page = new FertilizerPage(driver()).open();
        page.fillForm(testCase.cropId(), testCase.area());
        page.calculate();

        if (testCase.errorCode() != null) {
            assertFalse(page.hasResult(), testCase.id() + " must not render a result card");
            assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                    testCase.id() + " unexpected error code for " + testCase.errorField());
            return;
        }

        page.waitForResult();
        assertEquals(testCase.hectares(), page.hectares(), testCase.id() + " hectares");
        assertEquals(testCase.n(), page.targetN(), testCase.id() + " target N");
        assertEquals(testCase.p(), page.targetP(), testCase.id() + " target P");
        assertEquals(testCase.k(), page.targetK(), testCase.id() + " target K");
        assertEquals(testCase.dap(), page.product("dap"), testCase.id() + " DAP");
        assertEquals(testCase.urea(), page.product("urea"), testCase.id() + " urea");
        assertEquals(testCase.mop(), page.product("mop"), testCase.id() + " MOP");
    }

    @ParameterizedTest(name = "ECP-FRT-09 crop {0}")
    @ValueSource(strings = {"ragi", "paddy", "maize", "groundnut", "cotton", "sugarcane"})
    @DisplayName("ECP-FRT-09 every supported crop produces a complete result")
    void everyCropProducesResult(String cropId) {
        FertilizerPage page = new FertilizerPage(driver()).open();
        page.fillForm(cropId, "1");
        page.calculate();
        page.waitForResult();

        assertFalse(page.hasError("crop"), "ECP-FRT-09 " + cropId + " crop error");
        assertFalse(page.hasError("landArea"), "ECP-FRT-09 " + cropId + " landArea error");
        assertFalse(page.hectares().isBlank(), "ECP-FRT-09 " + cropId + " hectares");
        assertFalse(page.targetN().isBlank(), "ECP-FRT-09 " + cropId + " N");
        assertFalse(page.targetP().isBlank(), "ECP-FRT-09 " + cropId + " P");
        assertFalse(page.targetK().isBlank(), "ECP-FRT-09 " + cropId + " K");
        assertTrue(page.product("dap").endsWith("kg"), "ECP-FRT-09 " + cropId + " DAP quantity");
        assertTrue(page.product("urea").endsWith("kg"), "ECP-FRT-09 " + cropId + " urea quantity");
        assertTrue(page.product("mop").endsWith("kg"), "ECP-FRT-09 " + cropId + " MOP quantity");
    }

    @Test
    @DisplayName("ECP-FRT-10 reset clears the crop, area and result")
    void resetClearsResult() {
        FertilizerPage page = new FertilizerPage(driver()).open();
        page.fillForm("ragi", "1");
        page.calculate();
        page.waitForResult();

        page.reset();

        assertEquals("", page.selectedCropValue(), "ECP-FRT-10 crop must be cleared");
        assertEquals("", page.areaValue(), "ECP-FRT-10 land area must be cleared");
        assertFalse(page.hasResult(), "ECP-FRT-10 the result card must be removed");
    }

    @Test
    @DisplayName("ECP-FRT-11 the calculator pre-selects a crop from the profile")
    void profileCropPreselected() {
        WebDriver driver = driver();
        String uid = "demo_ecp_fert11";
        Storage.seedSession(driver, uid, "ecp.fert11@example.com", "ECP Farmer");
        Storage.seedProfile(driver, uid, "Ragi");

        FertilizerPage page = new FertilizerPage(driver).open();
        assertEquals("ragi", page.selectedCropValue(), "ECP-FRT-11 the profile crop must be pre-selected");
        assertTrue(page.isVisibleNow("fertilizer-dose-hint"), "ECP-FRT-11 the dose hint must be visible");
    }
}
