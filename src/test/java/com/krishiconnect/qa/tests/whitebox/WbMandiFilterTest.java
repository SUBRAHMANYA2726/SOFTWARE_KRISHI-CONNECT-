package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
 * WB-MND-01 … WB-MND-09 — basis paths of {@code filterPrices}
 * (mandiService.js lines 29–41). V(G) = 9; the nine paths add one new edge each
 * and cover all 25 edges of the predicate CFG.
 *
 * Each path is the predicate as it runs for one row. Because the predicate is
 * applied to all 32 sample rows inside {@code rows.filter}, one call traverses
 * both the "row matches" and the "row rejected" side of every filter; the cases
 * below are chosen so that both sides are exercised for the crop, district,
 * market and search guards.
 */
class WbMandiFilterTest extends BaseTest {

    record Case(String id, String crop, String district, String market, String search,
                int expectedCount, String rowField, String rowValue) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                // WB-MND-01: every guard false (all sentinels, empty search)
                Arguments.of(new Case("WB-MND-01", null, null, null, null, 32, null, null)),
                // WB-MND-02: crop guard true, row crop matches
                Arguments.of(new Case("WB-MND-02", "Ragi", null, null, null, 4, "crop", "Ragi")),
                // WB-MND-03: crop guard true, row crop differs (28 rows rejected)
                Arguments.of(new Case("WB-MND-03", "Sugarcane", null, null, null, 4, "crop", "Sugarcane")),
                // WB-MND-04: district guard true, row district matches
                Arguments.of(new Case("WB-MND-04", null, "Mandya", null, null, 3, "district", "Mandya")),
                // WB-MND-05: district guard true, row district differs
                Arguments.of(new Case("WB-MND-05", null, "Tumakuru", null, null, 2, "district", "Tumakuru")),
                // WB-MND-06: market guard true, row market matches
                Arguments.of(new Case("WB-MND-06", null, null, "Tumakuru APMC", null, 1, "market", "Tumakuru APMC")),
                // WB-MND-07: market guard true, row market differs
                Arguments.of(new Case("WB-MND-07", null, null, "Mandya APMC", null, 3, "market", "Mandya APMC")),
                // WB-MND-08: search true, haystack does not contain the needle
                Arguments.of(new Case("WB-MND-08", null, null, null, "xyz", 0, null, null)),
                // WB-MND-09: search true, haystack contains the needle
                Arguments.of(new Case("WB-MND-09", null, null, null, "ragi", 6, null, null)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Basis paths of filterPrices")
    void basisPath(Case testCase) {
        Map<String, Object> filters = new HashMap<>();
        putIfPresent(filters, "crop", testCase.crop());
        putIfPresent(filters, "district", testCase.district());
        putIfPresent(filters, "market", testCase.market());
        putIfPresent(filters, "search", testCase.search());

        JsBridge bridge = new JsBridge(driver());
        Map<String, Object> result = bridge.filterPrices(filters);
        List<Map<String, Object>> rows = JsBridge.rows(result);

        assertEquals(32, bridge.mandiRowCount(), testCase.id() + " sample dataset size");        assertEquals(testCase.expectedCount(), ((Number) result.get("count")).intValue(),
                testCase.id() + " filtered row count");

        for (Map<String, Object> row : rows) {
            if (testCase.rowField() != null) {
                assertEquals(testCase.rowValue(), row.get(testCase.rowField()),
                        testCase.id() + " row fails the active filter: " + row);
            }
            if (testCase.search() != null) {
                String haystack = (row.get("crop") + " " + row.get("cropKn") + " "
                        + row.get("market") + " " + row.get("district")).toLowerCase();
                assertTrue(haystack.contains(testCase.search().toLowerCase()),
                        testCase.id() + " row does not contain the search text: " + row);
            }
        }
    }

    private static void putIfPresent(Map<String, Object> filters, String key, String value) {
        if (value != null) {
            filters.put(key, value);
        }
    }
}
