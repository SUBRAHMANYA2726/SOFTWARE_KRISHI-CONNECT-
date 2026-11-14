package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.MandiPage;
import com.krishiconnect.qa.support.Storage;

/** ECP-MND-01 … ECP-MND-17 — mandi search and filter equivalence classes. */
class EcpMandiTest extends BaseTest {

    /** /mandi is behind ProtectedRoute, so each case starts signed in. */
    @Override
    protected void prepareStorage() {
        Storage.clearAll(driver());
        Storage.seedSession(driver(), "demo_ecp_mandi", "ecp.mandi@example.com", "ECP Mandi");
    }

    private MandiPage openMandi() {
        return new MandiPage(driver()).open();
    }

    private static void assertAllRowsContain(MandiPage page, String fragment, String context) {
        for (String row : page.rowTexts()) {
            assertTrue(row.contains(fragment), context + " row should contain '" + fragment + "': " + row);
        }
    }

    @Test
    @DisplayName("ECP-MND-01 the full sample dataset is shown with the sample notice")
    void fullDataset() {
        MandiPage page = openMandi();
        page.waitForCount(32);

        assertEquals(32, page.visibleRowCount(), "ECP-MND-01 rendered rows");
        assertTrue(page.countText().startsWith("32 rows"), "ECP-MND-01 count text: " + page.countText());
        assertTrue(page.sampleNoticeVisible(), "ECP-MND-01 the sample-data notice must be visible");
    }

    @Test
    @DisplayName("ECP-MND-02 filtering by crop keeps only that crop")
    void filterByCrop() {
        MandiPage page = openMandi();
        page.selectCrop("Ragi");
        page.waitForCount(4);

        assertEquals(4, page.visibleRowCount(), "ECP-MND-02 rendered rows");
        assertTrue(page.countText().startsWith("4 rows"), "ECP-MND-02 count text: " + page.countText());
        assertAllRowsContain(page, "Ragi", "ECP-MND-02");
    }

    @Test
    @DisplayName("ECP-MND-03 filtering by district keeps only that district")
    void filterByDistrict() {
        MandiPage page = openMandi();
        page.selectDistrict("Mandya");
        page.waitForCount(3);

        assertEquals(3, page.visibleRowCount(), "ECP-MND-03 rendered rows");
        assertAllRowsContain(page, "Mandya", "ECP-MND-03");
        String joined = String.join("\n", page.rowTexts());
        assertTrue(joined.contains("Ragi"), "ECP-MND-03 expected a Ragi row:\n" + joined);
        assertTrue(joined.contains("Paddy"), "ECP-MND-03 expected a Paddy row:\n" + joined);
        assertTrue(joined.contains("Sugarcane"), "ECP-MND-03 expected a Sugarcane row:\n" + joined);
    }

    @Test
    @DisplayName("ECP-MND-04 filtering by market keeps only that market")
    void filterByMarket() {
        MandiPage page = openMandi();
        page.selectMarket("Mandya APMC");
        page.waitForCount(3);

        assertEquals(3, page.visibleRowCount(), "ECP-MND-04 rendered rows");
        assertAllRowsContain(page, "Mandya APMC", "ECP-MND-04");
    }

    @Test
    @DisplayName("ECP-MND-05 crop plus district narrows the result to one row")
    void cropAndDistrict() {
        MandiPage page = openMandi();
        page.selectCrop("Ragi");
        page.selectDistrict("Mandya");
        page.waitForCount(1);

        assertEquals(1, page.visibleRowCount(), "ECP-MND-05 rendered rows");
        assertTrue(page.countText().startsWith("1 row"), "ECP-MND-05 singular count text: " + page.countText());
        String row = page.rowTexts().get(0);
        assertTrue(row.contains("Ragi"), "ECP-MND-05 row: " + row);
        assertTrue(row.contains("Mandya"), "ECP-MND-05 row: " + row);
        assertTrue(row.contains("Mandya APMC"), "ECP-MND-05 row: " + row);
    }

    @Test
    @DisplayName("ECP-MND-06 searching a market substring matches every row")
    void searchMarketText() {
        MandiPage page = openMandi();
        page.search("apmc");
        page.waitForCount(32);

        assertEquals(32, page.visibleRowCount(), "ECP-MND-06 rendered rows");
        assertAllRowsContain(page, "APMC", "ECP-MND-06");
    }

    @Test
    @DisplayName("ECP-MND-07 searching a crop also matches district substrings")
    void searchCropSubstring() {
        MandiPage page = openMandi();
        page.search("ragi");
        page.waitForCount(6);

        assertEquals(6, page.visibleRowCount(), "ECP-MND-07 rendered rows");
        List<String> rows = page.rowTexts();
        long cropRows = rows.stream().filter(row -> row.contains("Ragi")).count();
        assertEquals(4, cropRows, "ECP-MND-07 expected four Ragi crop rows");
        String joined = String.join("\n", rows);
        assertTrue(joined.contains("Kalaburagi"), "ECP-MND-07 expected Kalaburagi district matches:\n" + joined);
    }

    @Test
    @DisplayName("ECP-MND-08 searching in Kannada finds the same rows")
    void searchKannada() {
        MandiPage page = openMandi();
        page.searchViaJs("\u0cb0\u0cbe\u0c97\u0cbf");
        page.waitForCount(4);

        assertEquals(4, page.visibleRowCount(), "ECP-MND-08 rendered rows");
        assertAllRowsContain(page, "Ragi", "ECP-MND-08");
    }

    @Test
    @DisplayName("ECP-MND-09 a no-match search shows the empty state")
    void noMatchEmptyState() {
        MandiPage page = openMandi();
        page.search("xyz");
        page.waitForCount(0);

        assertEquals(0, page.visibleRowCount(), "ECP-MND-09 must render no rows");
        assertTrue(page.countText().startsWith("0 rows"), "ECP-MND-09 count text: " + page.countText());
        assertTrue(page.isEmptyStateVisible(), "ECP-MND-09 the empty state must be visible");
    }

    @Test
    @DisplayName("ECP-MND-10 a whitespace-only search behaves like an empty search")
    void whitespaceSearch() {
        MandiPage page = openMandi();
        page.search("   ");
        page.waitForCount(32);

        assertEquals(32, page.visibleRowCount(), "ECP-MND-10 rendered rows");
        assertFalse(page.isEmptyStateVisible(), "ECP-MND-10 the empty state must not appear");
    }

    @Test
    @DisplayName("ECP-MND-11 search is case-insensitive")
    void caseInsensitiveSearch() {
        MandiPage page = openMandi();
        page.search("APMC");
        page.waitForCount(32);

        assertEquals(32, page.visibleRowCount(), "ECP-MND-11 rendered rows");
    }

    @Test
    @DisplayName("ECP-MND-12 crop and district combine with the search box")
    void cropDistrictAndSearch() {
        MandiPage page = openMandi();
        page.selectCrop("Tomato");
        page.selectDistrict("Kolar");
        page.search("kolar");
        page.waitForCount(1);

        assertEquals(1, page.visibleRowCount(), "ECP-MND-12 rendered rows");
        String row = page.rowTexts().get(0);
        assertTrue(row.contains("Tomato"), "ECP-MND-12 row: " + row);
        assertTrue(row.contains("Kolar"), "ECP-MND-12 row: " + row);
        assertTrue(row.contains("Kolar APMC"), "ECP-MND-12 row: " + row);
    }

    @Test
    @DisplayName("ECP-MND-13 price and date text are not part of the search")
    void dateNotSearched() {
        MandiPage page = openMandi();
        page.search("2026");
        page.waitForCount(0);

        assertEquals(0, page.visibleRowCount(), "ECP-MND-13 must render no rows");
        assertTrue(page.isEmptyStateVisible(), "ECP-MND-13 the empty state must be visible");
    }

    @Test
    @DisplayName("ECP-MND-14 changing the district resets the market filter")
    void districtChangeResetsMarket() {
        MandiPage page = openMandi();
        page.selectDistrict("Mandya");
        page.selectMarket("Mandya APMC");
        page.waitForCount(3);

        page.selectDistrict("Tumakuru");
        page.waitForCount(2);

        assertEquals("All markets", page.selectedMarket(), "ECP-MND-14 the market sentinel must be restored");
        assertEquals(2, page.visibleRowCount(), "ECP-MND-14 rendered rows");
        String joined = String.join("\n", page.rowTexts());
        assertTrue(joined.contains("Ragi"), "ECP-MND-14 expected a Ragi row:\n" + joined);
        assertTrue(joined.contains("Groundnut"), "ECP-MND-14 expected a Groundnut row:\n" + joined);
    }

    @Test
    @DisplayName("ECP-MND-15 clearing the filters restores the full dataset")
    void clearFilters() {
        MandiPage page = openMandi();
        page.search("xyz");
        page.selectCrop("Ragi");
        page.selectDistrict("Mandya");
        page.waitForCount(0);

        page.clear();
        page.waitForCount(32);

        assertEquals("", page.searchValue(), "ECP-MND-15 search input must be empty");
        assertEquals("All crops", page.selectedCrop(), "ECP-MND-15 crop sentinel");
        assertEquals("All districts", page.selectedDistrict(), "ECP-MND-15 district sentinel");
        assertEquals("All markets", page.selectedMarket(), "ECP-MND-15 market sentinel");
        assertEquals(32, page.visibleRowCount(), "ECP-MND-15 rendered rows after clearing");
    }

    @Test
    @DisplayName("ECP-MND-16 the market list is scoped to the selected district")
    void marketListScopedToDistrict() {
        MandiPage page = openMandi();
        page.selectDistrict("Mandya");

        assertEquals(List.of("All markets", "Mandya APMC"), page.marketOptions(),
                "ECP-MND-16 market options for Mandya");
    }

    @Test
    @DisplayName("ECP-MND-17 markup in the search box is treated as text")
    void scriptPayloadTreatedAsText() {
        WebDriver driver = driver();
        MandiPage page = openMandi();
        ((JavascriptExecutor) driver).executeScript("window.__ecpXss = false;");

        page.search("<script>alert(1)</script>");
        page.waitForCount(0);

        assertEquals(0, page.visibleRowCount(), "ECP-MND-17 must render no rows");
        assertTrue(page.isEmptyStateVisible(), "ECP-MND-17 the empty state must be visible");
        assertFalse(Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript("return window.__ecpXss")),
                "ECP-MND-17 the payload must not execute");
    }
}
