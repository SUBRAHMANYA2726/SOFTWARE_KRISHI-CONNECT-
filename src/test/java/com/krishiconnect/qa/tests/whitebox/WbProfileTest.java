package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.support.JsBridge;

/**
 * WB-PRO-01 … WB-PRO-15 — decision coverage of {@code validateProfile}
 * (profile.js lines 10–53).
 *
 * Structural V(G) = 18: 12 {@code if}s, 4 short-circuit {@code ||} guards and
 * one ternary. Because the function collects every error before returning, all
 * error paths converge on the single {@code errors.length > 0} decision at
 * line 38, so the feasible path set is not a strict McCabe basis. The criterion
 * used here is decision coverage: the 15 cases below take both outcomes of
 * every one of the 17 predicates at least once (see the table in
 * 04-CFG-and-Complexity.md).
 *
 * WB-PRO-03 omits district and taluk, which takes the falsy side of the
 * {@code raw.district || ''} and {@code raw.taluk || ''} guards; WB-PRO-09
 * omits irrigation for the {@code raw.irrigation || ''} guard; WB-PRO-10 omits
 * primaryCrops for the ternary's false side; WB-PRO-15 omits village for
 * {@code raw.village || ''}. Every other case takes the truthy side.
 */
class WbProfileTest extends BaseTest {

    record Case(String id, Map<String, Object> input, Map<String, String> expectedErrors, String expectedVillage) {
        @Override
        public String toString() {
            return id;
        }
    }

    private static Map<String, Object> validProfile() {
        Map<String, Object> input = new HashMap<>();
        input.put("fullName", "Asha Rao");
        input.put("district", "Mandya");
        input.put("taluk", "Mandya");
        input.put("language", "en");
        input.put("farmArea", "2.5");
        input.put("irrigation", "Rainfed");
        input.put("primaryCrops", new ArrayList<>(List.of("Ragi")));
        input.put("village", "Kere");
        return input;
    }

    private static Case caseWith(String id, String field, Object value, String errorCode) {
        Map<String, Object> input = validProfile();
        input.put(field, value);
        return new Case(id, input, Map.of(field, errorCode), null);
    }

    static Stream<Arguments> cases() {
        // WB-PRO-01: the only accepting path; every guard is false.
        Case accepted = new Case("WB-PRO-01", validProfile(), Map.of(), "Kere");

        // WB-PRO-02: fullName error -> line 14 true.
        Case nameEmpty = caseWith("WB-PRO-02", "fullName", "", "REQUIRED");

        // WB-PRO-03: district and taluk absent -> district REQUIRED (line 17)
        // and taluk REQUIRED (line 22); also the falsy side of both || guards.
        Map<String, Object> noDistrict = validProfile();
        noDistrict.remove("district");
        noDistrict.remove("taluk");
        Case districtEmpty = new Case("WB-PRO-03", noDistrict,
                Map.of("district", "REQUIRED", "taluk", "REQUIRED"), null);

        // WB-PRO-04: unknown district -> line 17 false, line 18 true. The taluk
        // list of an unknown district is empty, so taluk also reports invalid.
        Map<String, Object> unknownDistrict = validProfile();
        unknownDistrict.put("district", "Atlantis");
        Case districtUnknown = new Case("WB-PRO-04", unknownDistrict,
                Map.of("district", "INVALID_SELECTION", "taluk", "INVALID_SELECTION"), null);

        // WB-PRO-05: empty taluk -> line 22 true.
        Case talukEmpty = caseWith("WB-PRO-05", "taluk", "", "REQUIRED");

        // WB-PRO-06: taluk outside the selected district -> line 23 true.
        Case talukWrong = caseWith("WB-PRO-06", "taluk", "Hubballi", "INVALID_SELECTION");

        // WB-PRO-07: language outside {en, kn} -> line 25 true.
        Case languageInvalid = caseWith("WB-PRO-07", "language", "fr", "INVALID_SELECTION");

        // WB-PRO-08: farm area below 0.1 -> line 28 true.
        Case farmAreaLow = caseWith("WB-PRO-08", "farmArea", "0.05", "BELOW_MIN");

        // WB-PRO-09: irrigation absent -> irrigation REQUIRED (line 31) and the
        // falsy side of the irrigation || guard.
        Map<String, Object> noIrrigation = validProfile();
        noIrrigation.remove("irrigation");
        Case irrigationEmpty = new Case("WB-PRO-09", noIrrigation, Map.of("irrigation", "REQUIRED"), null);

        // WB-PRO-10: primaryCrops absent -> ternary false side, then line 34 true.
        Map<String, Object> noCrops = validProfile();
        noCrops.remove("primaryCrops");
        Case cropsMissing = new Case("WB-PRO-10", noCrops, Map.of("primaryCrops", "REQUIRED"), null);

        // WB-PRO-11: empty but present array -> ternary true side, line 34 true.
        Case cropsEmpty = caseWith("WB-PRO-11", "primaryCrops", new ArrayList<>(), "REQUIRED");

        // WB-PRO-12: six crops -> line 35 true.
        Case cropsTooMany = caseWith("WB-PRO-12", "primaryCrops",
                new ArrayList<>(List.of("Ragi", "Paddy", "Maize", "Jowar", "Groundnut", "Cotton")), "TOO_MANY");

        // WB-PRO-13: unknown crop name -> line 36 true.
        Case cropsUnknown = caseWith("WB-PRO-13", "primaryCrops",
                new ArrayList<>(List.of("Ragi", "Dragonfruit")), "INVALID_SELECTION");

        // WB-PRO-14: village longer than 80 characters -> accepted and sliced.
        Map<String, Object> longVillage = validProfile();
        longVillage.put("village", "v".repeat(85));
        Case villageLong = new Case("WB-PRO-14", longVillage, Map.of(), "v".repeat(80));

        // WB-PRO-15: village absent -> falsy side of the village || guard.
        Map<String, Object> noVillage = validProfile();
        noVillage.remove("village");
        Case villageMissing = new Case("WB-PRO-15", noVillage, Map.of(), "");

        return Stream.of(
                Arguments.of(accepted),
                Arguments.of(nameEmpty),
                Arguments.of(districtEmpty),
                Arguments.of(districtUnknown),
                Arguments.of(talukEmpty),
                Arguments.of(talukWrong),
                Arguments.of(languageInvalid),
                Arguments.of(farmAreaLow),
                Arguments.of(irrigationEmpty),
                Arguments.of(cropsMissing),
                Arguments.of(cropsEmpty),
                Arguments.of(cropsTooMany),
                Arguments.of(cropsUnknown),
                Arguments.of(villageLong),
                Arguments.of(villageMissing));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Decision-coverage paths of validateProfile")
    void path(Case testCase) {
        Map<String, Object> result = new JsBridge(driver()).validateProfile(testCase.input());

        assertEquals(testCase.expectedErrors().isEmpty(), Boolean.TRUE.equals(result.get("ok")),
                testCase.id() + " ok flag");

        if (!testCase.expectedErrors().isEmpty()) {
            Map<String, Object> errors = JsBridge.map(result, "errors");
            assertEquals(testCase.expectedErrors().size(), errors.size(),
                    testCase.id() + " unexpected set of error fields: " + errors.keySet());
            testCase.expectedErrors().forEach((field, code) ->
                    assertEquals(code, JsBridge.fieldError(result, field), testCase.id() + " code for " + field));
            assertNull(result.get("values"), testCase.id() + " no values are returned when errors exist");
            return;
        }

        Map<String, Object> values = JsBridge.map(result, "values");
        assertEquals("Asha Rao", values.get("fullName"), testCase.id() + " trimmed full name");
        assertEquals("Mandya", values.get("district"), testCase.id() + " district");
        assertEquals("Mandya", values.get("taluk"), testCase.id() + " taluk");
        assertEquals("en", values.get("language"), testCase.id() + " language");
        assertEquals(2.5, JsBridge.number(values, "farmArea"), 0.000001, testCase.id() + " farmArea");
        assertEquals("Rainfed", values.get("irrigation"), testCase.id() + " irrigation");
        assertEquals(List.of("Ragi"), values.get("primaryCrops"), testCase.id() + " primaryCrops");
        assertEquals(testCase.expectedVillage(), values.get("village"), testCase.id() + " village");
        assertTrue(values.get("village") instanceof String, testCase.id() + " village is normalised to a string");
    }
}
