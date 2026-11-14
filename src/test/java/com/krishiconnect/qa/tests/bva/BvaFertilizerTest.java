package com.krishiconnect.qa.tests.bva;

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
import com.krishiconnect.qa.pages.FertilizerPage;
import com.krishiconnect.qa.support.JsBridge;
import com.krishiconnect.qa.support.Storage;

/** BVA-FRT-01 … BVA-FRT-17 — fertilizer calculator boundaries and rounding order. */
class BvaFertilizerTest extends BaseTest {

    /** /calculator/fertilizer is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_bva_fert", "bva.fert@example.com", "BVA Fertilizer");
    }

    record Case(String id, String cropId, String area, String errorField, String errorCode,
                String hectares, String n, String p, String k, String dap, String urea, String mop) {
    }

    private static Case reject(String id, String cropId, String area, String field, String code) {
        return new Case(id, cropId, area, field, code, null, null, null, null, null, null, null);
    }

    private static Case ok(String id, String cropId, String area, String hectares, String n, String p, String k,
                           String dap, String urea, String mop) {
        return new Case(id, cropId, area, null, null, hectares, n, p, k, dap, urea, mop);
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(reject("BVA-FRT-01", "ragi", "0", "landArea", "BELOW_MIN")),
                Arguments.of(reject("BVA-FRT-02", "ragi", "0.05", "landArea", "BELOW_MIN")),
                Arguments.of(reject("BVA-FRT-03", "ragi", "0.09", "landArea", "BELOW_MIN")),
                Arguments.of(ok("BVA-FRT-04", "ragi", "0.1", "0.04",
                        "2", "1.6", "1", "3.5 kg", "3 kg", "1.7 kg")),
                Arguments.of(ok("BVA-FRT-05", "ragi", "0.1001", "0.041",
                        "2.05", "1.64", "1.03", "3.6 kg", "3 kg", "1.7 kg")),
                Arguments.of(ok("BVA-FRT-06", "ragi", "99.99", "40.465",
                        "2023.25", "1618.6", "1011.63", "3,518.7 kg", "3,021.5 kg", "1,686.1 kg")),
                Arguments.of(ok("BVA-FRT-07", "ragi", "100", "40.469",
                        "2023.45", "1618.76", "1011.73", "3,519 kg", "3,021.8 kg", "1,686.2 kg")),
                Arguments.of(reject("BVA-FRT-08", "ragi", "100.01", "landArea", "ABOVE_MAX")),
                Arguments.of(reject("BVA-FRT-09", "ragi", "101", "landArea", "ABOVE_MAX")),
                Arguments.of(reject("BVA-FRT-10", "ragi", "-1", "landArea", "NOT_NUMBER")),
                Arguments.of(ok("BVA-FRT-11", "ragi", "0.10", "0.04",
                        "2", "1.6", "1", "3.5 kg", "3 kg", "1.7 kg")),
                Arguments.of(ok("BVA-FRT-12", "paddy", "0.1", "0.04",
                        "4", "2", "2", "4.3 kg", "7 kg", "3.3 kg")),
                Arguments.of(ok("BVA-FRT-13", "paddy", "100", "40.469",
                        "4046.9", "2023.45", "2023.45", "4,398.8 kg", "7,076.3 kg", "3,372.4 kg")),
                Arguments.of(ok("BVA-FRT-14", "sugarcane", "0.1", "0.04",
                        "10", "3", "3", "6.5 kg", "19.2 kg", "5 kg")),
                Arguments.of(ok("BVA-FRT-15", "groundnut", "0.1", "0.04",
                        "1", "2", "3", "4.3 kg", "0.5 kg", "5 kg")),
                Arguments.of(reject("BVA-FRT-17", "", "0.1", "crop", "INVALID_SELECTION")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Fertilizer calculator boundaries")
    void fertilizerBoundary(Case testCase) {
        WebDriver driver = driver();
        FertilizerPage page = new FertilizerPage(driver).open();
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

    @Test
    @DisplayName("BVA-FRT-16 unknown crop ID is rejected before area validation")
    void unknownCropAtFunctionLevel() {
        JsBridge bridge = new JsBridge(driver());
        Map<String, Object> result = bridge.calculateFertilizer(Map.of("cropId", "dragonfruit", "landArea", "0.1"));
        assertEquals(Boolean.FALSE, result.get("ok"));
        assertEquals("INVALID_SELECTION", JsBridge.fieldError(result, "cropId"));
        assertNull(JsBridge.fieldError(result, "landArea"),
                "BVA-FRT-16 must stop before validating landArea");
        assertTrue(result.get("errors") instanceof Map);
    }
}
