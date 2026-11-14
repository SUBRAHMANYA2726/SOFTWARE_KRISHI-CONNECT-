package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.support.JsBridge;

/**
 * WB-NF-01 … WB-NF-06 — basis paths of {@code validateNumberField}
 * (common.js lines 23–42), executed through the real module.
 *
 * V(G) = 6. The six cases are the basis set from 04-CFG-and-Complexity.md
 * (P1 … P6): every path introduces at least one edge that the earlier paths do
 * not use, and together they cover all 19 edges of the CFG.
 *
 * The function is reached through calculateProfit so the same instance the
 * browser runs is exercised; the other three profit fields keep their valid
 * values, so only the landArea branch changes.
 */
class WbNumberFieldTest extends BaseTest {

    record Case(String id, String landArea, String expectedCode) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                // P1: empty -> REQUIRED
                Arguments.of(new Case("WB-NF-01", "", "REQUIRED")),
                // P2: pattern rejects letters -> NOT_NUMBER
                Arguments.of(new Case("WB-NF-02", "abc", "NOT_NUMBER")),
                // P3: digits match the pattern but overflow to Infinity -> NOT_NUMBER
                Arguments.of(new Case("WB-NF-03", "9".repeat(400), "NOT_NUMBER")),
                // P4: below the inclusive minimum -> BELOW_MIN
                Arguments.of(new Case("WB-NF-04", "0.05", "BELOW_MIN")),
                // P5: above the inclusive maximum -> ABOVE_MAX
                Arguments.of(new Case("WB-NF-05", "500.5", "ABOVE_MAX")),
                // P6: the only accepting path
                Arguments.of(new Case("WB-NF-06", "1", null)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Basis paths of validateNumberField")
    void basisPath(Case testCase) {
        JsBridge bridge = new JsBridge(driver());
        Map<String, Object> result = bridge.calculateProfit(Map.of(
                "landArea", testCase.landArea(),
                "yieldPerAcre", "20",
                "sellingPrice", "2000",
                "cultivationCost", "10000"));

        if (testCase.expectedCode() == null) {
            assertEquals(Boolean.TRUE, result.get("ok"), testCase.id() + " must accept the boundary value");
            assertEquals(1.0, JsBridge.number(JsBridge.map(result, "values"), "landArea"), 0.000001,
                    testCase.id() + " parsed land area");
            assertNull(JsBridge.fieldError(result, "landArea"), testCase.id() + " must not report an error");
            return;
        }

        assertEquals(Boolean.FALSE, result.get("ok"), testCase.id() + " must reject the value");
        assertEquals(testCase.expectedCode(), JsBridge.fieldError(result, "landArea"),
                testCase.id() + " unexpected error code");
        assertNull(JsBridge.fieldError(result, "yieldPerAcre"),
                testCase.id() + " the other fields are valid and must stay silent");
        assertTrue(!result.containsKey("status"), testCase.id() + " no calculation may run when a field is invalid");
    }
}
