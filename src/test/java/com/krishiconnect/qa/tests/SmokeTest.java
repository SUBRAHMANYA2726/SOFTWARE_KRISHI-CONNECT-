package com.krishiconnect.qa.tests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.MandiPage;
import com.krishiconnect.qa.pages.ProfitPage;
import com.krishiconnect.qa.support.Flows;
import com.krishiconnect.qa.support.JsBridge;
import com.krishiconnect.qa.support.TestData;

/** Verifies the harness itself: app reachable, bridge present, a full UI journey works. */
class SmokeTest extends BaseTest {

    @Test
    @DisplayName("App shell renders after the NotFound.jsx restore")
    void appRenders() {
        assertTrue(driver.getTitle().contains("KrishiConnect"), "Unexpected title: " + driver.getTitle());
        Object rootChildren = ((JavascriptExecutor) driver)
                .executeScript("return document.getElementById('root').children.length");
        assertTrue(((Number) rootChildren).intValue() > 0, "React root is empty");
    }

    @Test
    @DisplayName("Development bridge exposes the real calculation modules")
    void bridgeWorks() {
        JsBridge bridge = new JsBridge(driver);
        Map<String, Object> result = bridge.calculateProfit(Map.of(
                "landArea", "1",
                "yieldPerAcre", "20",
                "sellingPrice", "2000",
                "cultivationCost", "10000"));
        assertEquals(Boolean.TRUE, result.get("ok"));
        assertEquals(30000.0, JsBridge.number(result, "profit"), 0.001);
        assertEquals("PROFIT", result.get("status"));
    }

    @Test
    @DisplayName("A new account can register, onboard and reach the dashboard")
    void registerOnboardDashboard() {
        Flows.registerAndOnboard(driver, TestData.uniqueEmail("smoke"));
        com.krishiconnect.qa.pages.DashboardPage dashboard = new com.krishiconnect.qa.pages.DashboardPage(driver);
        assertTrue(dashboard.heading().contains("BVA"),
                "Dashboard greeting should name the farmer: " + dashboard.heading());
        assertTrue(driver.getCurrentUrl().endsWith("/dashboard"), "Unexpected URL: " + driver.getCurrentUrl());
    }

    @Test
    @DisplayName("Profit calculator reference scenario renders the computed values")
    void profitUiReference() {
        ProfitPage page = new ProfitPage(driver).open();
        page.fillForm("1", "20", "2000", "10000");
        page.calculate();
        page.waitForResult();
        assertEquals("Profit", page.status());
        assertEquals("₹30,000", page.net());
        assertEquals("₹40,000", page.revenue());
        assertEquals("₹10,000", page.expenditure());
        assertEquals("20 quintals", page.totalYield());
        assertEquals("75%", page.margin());
        assertEquals("₹500.00", page.breakEven());
    }

    @Test
    @DisplayName("Mandi page defaults to the full sample dataset")
    void mandiDefaults() {
        MandiPage page = new MandiPage(driver).open();
        assertEquals(32, page.reportedCount());
        assertEquals(32, page.visibleRowCount());
    }
}
