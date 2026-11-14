package com.krishiconnect.qa.tests.bva;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.MandiPage;
import com.krishiconnect.qa.support.Storage;

/**
 * BVA-MND-01 … BVA-MND-30 — mandi search ladder, filter boundaries and the
 * singular/plural result counter.
 *
 * Expected row counts come from executing {@code filterPrices} against the real
 * sample dataset, never from hand arithmetic.
 */
class BvaMandiTest extends BaseTest {

    /** /mandi is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_bva_mandi", "bva.mandi@example.com", "BVA Mandi");
    }

    record SearchCase(String id, String search, boolean viaJs, int rows,
                      String countText, boolean empty) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> searchCases() {
        return Stream.of(
                Arguments.of(new SearchCase("BVA-MND-01", "", false, 32, "32 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-02", " ", false, 32, "32 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-03", "   ", false, 32, "32 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-04", "a", false, 32, "32 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-05", "r", false, 29, "29 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-06", "ra", false, 16, "16 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-07", "rag", false, 6, "6 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-08", "ragi", false, 6, "6 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-09", "RAGI", false, 6, "6 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-10", "ragi ", false, 6, "6 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-11", "ragi  ragi", false, 0, "0 rows", true)),
                Arguments.of(new SearchCase("BVA-MND-12", "ragi \u0cb0\u0cbe\u0c97\u0cbf", true, 4, "4 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-13", "\u0cb0\u0cbe\u0c97\u0cbf", true, 4, "4 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-14", "apmc", false, 32, "32 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-15", "hubballi", false, 2, "2 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-16", "mandya", false, 3, "3 rows", false)),
                Arguments.of(new SearchCase("BVA-MND-17", "xyz", false, 0, "0 rows", true)),
                Arguments.of(new SearchCase("BVA-MND-18", "2026", false, 0, "0 rows", true)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("searchCases")
    @DisplayName("Mandi search-length staircase")
    void searchBoundary(SearchCase testCase) {
        WebDriver driver = driver();
        MandiPage page = new MandiPage(driver).open();
        if (testCase.viaJs()) {
            page.searchViaJs(testCase.search());
        } else {
            page.search(testCase.search());
        }
        page.waitForCount(testCase.rows());

        assertEquals(testCase.rows(), page.reportedCount(), testCase.id() + " reported count");
        assertEquals(testCase.rows(), page.visibleRowCount(), testCase.id() + " rendered row count");
        assertTrue(page.countText().startsWith(testCase.countText()),
                testCase.id() + " counter text should start with '" + testCase.countText()
                        + "' but was: " + page.countText());
        assertEquals(testCase.empty(), page.isEmptyStateVisible(),
                testCase.id() + " empty-state visibility");
        if (testCase.empty()) {
            assertEquals(0, page.visibleRowCount(), testCase.id() + " must render no rows");
        }
    }

    record FilterCase(String id, String search, String crop, String district, String market,
                      int rows, String countText, boolean empty, List<String> fragments) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> filterCases() {
        return Stream.of(
                Arguments.of(new FilterCase("BVA-MND-19", null, "Ragi", "Mandya", null,
                        1, "1 row", false, List.of("Ragi", "Mandya APMC", "Mandya"))),
                Arguments.of(new FilterCase("BVA-MND-20", "hubballi", null, null, null,
                        2, "2 rows", false, List.of("Hubballi APMC"))),
                Arguments.of(new FilterCase("BVA-MND-21", null, null, null, null,
                        32, "32 rows", false, List.of("Ragi", "Sugarcane"))),
                Arguments.of(new FilterCase("BVA-MND-22", null, "Ragi", "Kolar", null,
                        0, "0 rows", true, List.of())),
                Arguments.of(new FilterCase("BVA-MND-24", null, null, "Kolar", null,
                        1, "1 row", false, List.of("Tomato", "Kolar APMC", "Kolar"))),
                Arguments.of(new FilterCase("BVA-MND-25", null, null, "Mandya", null,
                        3, "3 rows", false, List.of("Ragi", "Paddy", "Sugarcane", "Mandya"))),
                Arguments.of(new FilterCase("BVA-MND-26", null, null, null, "Mandya APMC",
                        3, "3 rows", false, List.of("Mandya APMC"))),
                Arguments.of(new FilterCase("BVA-MND-29", null, "Tomato", "Kolar", null,
                        1, "1 row", false, List.of("Tomato", "Kolar APMC"))),
                Arguments.of(new FilterCase("BVA-MND-30", "hubballi", "Onion", null, null,
                        1, "1 row", false, List.of("Onion", "Hubballi APMC", "Dharwad"))));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("filterCases")
    @DisplayName("Mandi filter and result-count boundaries")
    void filterBoundary(FilterCase testCase) {
        WebDriver driver = driver();
        MandiPage page = new MandiPage(driver).open();
        if (testCase.search() != null) {
            page.search(testCase.search());
        }
        if (testCase.crop() != null) {
            page.selectCrop(testCase.crop());
        }
        if (testCase.district() != null) {
            page.selectDistrict(testCase.district());
        }
        if (testCase.market() != null) {
            page.selectMarket(testCase.market());
        }
        page.waitForCount(testCase.rows());

        assertEquals(testCase.rows(), page.reportedCount(), testCase.id() + " reported count");
        assertEquals(testCase.rows(), page.visibleRowCount(), testCase.id() + " rendered row count");
        assertTrue(page.countText().startsWith(testCase.countText()),
                testCase.id() + " counter text should start with '" + testCase.countText()
                        + "' but was: " + page.countText());
        assertEquals(testCase.empty(), page.isEmptyStateVisible(),
                testCase.id() + " empty-state visibility");

        String joined = String.join("\n", page.rowTexts());
        for (String fragment : testCase.fragments()) {
            assertTrue(joined.contains(fragment),
                    testCase.id() + " result rows should contain '" + fragment + "' but were:\n" + joined);
        }
    }

    @ParameterizedTest(name = "BVA-MND-23 [{0}]")
    @ValueSource(strings = {"Cotton", "Groundnut", "Maize", "Onion", "Paddy", "Ragi", "Sugarcane", "Tomato"})
    @DisplayName("BVA-MND-23 every crop has exactly four rows")
    void everyCropHasFourRows(String crop) {
        WebDriver driver = driver();
        MandiPage page = new MandiPage(driver).open();
        page.selectCrop(crop);
        page.waitForCount(4);

        assertEquals(4, page.reportedCount(), "BVA-MND-23 " + crop + " reported count");
        assertEquals(4, page.visibleRowCount(), "BVA-MND-23 " + crop + " rendered rows");
        assertTrue(page.countText().startsWith("4 rows"),
                "BVA-MND-23 " + crop + " counter text: " + page.countText());
        for (String row : page.rowTexts()) {
            assertTrue(row.contains(crop), "BVA-MND-23 " + crop + " row should contain the crop: " + row);
        }
    }

    @Test
    @DisplayName("BVA-MND-27 district change resets the market filter")
    void districtChangeResetsMarket() {
        WebDriver driver = driver();
        MandiPage page = new MandiPage(driver).open();

        page.selectDistrict("Mandya");
        page.selectMarket("Mandya APMC");
        page.waitForCount(3);
        assertEquals(3, page.reportedCount(), "BVA-MND-27 baseline for Mandya APMC");

        page.selectDistrict("Tumakuru");
        page.waitForCount(2);

        assertEquals(2, page.reportedCount(), "BVA-MND-27 rows after the district change");
        assertEquals(2, page.visibleRowCount(), "BVA-MND-27 rendered rows after the district change");
        assertEquals("All markets", page.selectedMarket(),
                "BVA-MND-27 the market sentinel must be restored");
        assertEquals(List.of("All markets", "Pavagada APMC", "Tumakuru APMC"), page.marketOptions(),
                "BVA-MND-27 market options must be scoped to Tumakuru");

        String joined = String.join("\n", page.rowTexts());
        assertTrue(joined.contains("Tumakuru APMC"), "BVA-MND-27 missing Tumakuru APMC:\n" + joined);
        assertTrue(joined.contains("Pavagada APMC"), "BVA-MND-27 missing Pavagada APMC:\n" + joined);
    }

    @Test
    @DisplayName("BVA-MND-28 clear filters restores the full dataset")
    void clearFiltersFromZeroResults() {
        WebDriver driver = driver();
        MandiPage page = new MandiPage(driver).open();

        page.search("xyz");
        page.waitForCount(0);
        assertTrue(page.isEmptyStateVisible(), "BVA-MND-28 empty state must be visible before clearing");

        page.clear();
        page.waitForCount(32);

        assertEquals("", page.searchValue(), "BVA-MND-28 search input must be empty");
        assertEquals("All crops", page.selectedCrop(), "BVA-MND-28 crop sentinel");
        assertEquals("All districts", page.selectedDistrict(), "BVA-MND-28 district sentinel");
        assertEquals("All markets", page.selectedMarket(), "BVA-MND-28 market sentinel");
        assertEquals(32, page.visibleRowCount(), "BVA-MND-28 rendered rows after clearing");
        assertFalse(page.isEmptyStateVisible(), "BVA-MND-28 empty state must be removed");
    }
}
