package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.support.JsBridge;

/**
 * WB-FRT-01 … WB-FRT-03 — basis paths of {@code calculateFertilizer}
 * (fertilizer.js lines 24–60). V(G) = 3 and the three paths cover all 19 edges.
 *
 * The unknown-crop and below-minimum cases are not reachable through the select
 * and number inputs, so the test drives the module directly; the valid case is
 * also checked in the browser by ECP-FRT-01.
 */
class WbFertilizerTest extends BaseTest {

    @Test
    @DisplayName("WB-FRT-01 unknown crop returns INVALID_SELECTION and skips the area check")
    void unknownCrop() {
        Map<String, Object> result = new JsBridge(driver()).calculateFertilizer(Map.of(
                "cropId", "dragonfruit",
                "landArea", "0"));

        assertEquals(Boolean.FALSE, result.get("ok"), "WB-FRT-01 must reject the crop");
        assertEquals("INVALID_SELECTION", JsBridge.fieldError(result, "cropId"), "WB-FRT-01 cropId");
        assertNull(JsBridge.fieldError(result, "landArea"),
                "WB-FRT-01 the guard returns before landArea is validated");
    }

    @Test
    @DisplayName("WB-FRT-02 a known crop with an out-of-range area returns BELOW_MIN")
    void areaBelowMinimum() {
        Map<String, Object> result = new JsBridge(driver()).calculateFertilizer(Map.of(
                "cropId", "ragi",
                "landArea", "0.05"));

        assertEquals(Boolean.FALSE, result.get("ok"), "WB-FRT-02 must reject the area");
        assertEquals("BELOW_MIN", JsBridge.fieldError(result, "landArea"), "WB-FRT-02 landArea");
        assertNull(JsBridge.fieldError(result, "cropId"), "WB-FRT-02 the crop is valid");
    }

    @Test
    @DisplayName("WB-FRT-03 a valid crop and area follow the calculation path")
    void validCalculation() {
        Map<String, Object> result = new JsBridge(driver()).calculateFertilizer(Map.of(
                "cropId", "ragi",
                "landArea", "1"));

        assertEquals(Boolean.TRUE, result.get("ok"), "WB-FRT-03 must accept the input");
        assertEquals(0.405, JsBridge.number(result, "hectares"), 0.000001, "WB-FRT-03 hectares");

        Map<String, Object> target = JsBridge.map(result, "target");
        assertEquals(20.25, JsBridge.number(target, "n"), 0.000001, "WB-FRT-03 target N");
        assertEquals(16.2, JsBridge.number(target, "p"), 0.000001, "WB-FRT-03 target P");
        assertEquals(10.13, JsBridge.number(target, "k"), 0.000001, "WB-FRT-03 target K");

        Map<String, Object> products = JsBridge.map(result, "products");
        assertEquals(35.2, JsBridge.number(JsBridge.map(products, "dap"), "quantityKg"), 0.000001, "WB-FRT-03 DAP");
        assertEquals(30.2, JsBridge.number(JsBridge.map(products, "urea"), "quantityKg"), 0.000001, "WB-FRT-03 urea");
        assertEquals(16.9, JsBridge.number(JsBridge.map(products, "mop"), "quantityKg"), 0.000001, "WB-FRT-03 MOP");
    }
}
