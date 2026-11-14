package com.krishiconnect.qa.support;

import java.util.List;
import java.util.Map;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.krishiconnect.qa.core.Config;

/**
 * Drives the development-only bridge from {@code src/dev/testBridge.js}.
 *
 * The bridge delegates to the same modules the browser runs, which lets the
 * white-box tests execute branches that the UI cannot reach (for example the
 * unreachable {@code BELOW_MIN} branch of cultivation cost).
 */
public final class JsBridge {

    private final WebDriver driver;

    public JsBridge(WebDriver driver) {
        this.driver = driver;
        driver.get(Config.baseUrl() + "/");
        new WebDriverWait(driver, Config.uiTimeout())
                .until(d -> Boolean.TRUE.equals(script(d, "return !!(window.__kcTest && window.__kcTest.version)")));
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateProfit(Map<String, Object> raw) {
        return (Map<String, Object>) call("calculateProfit", raw);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateFertilizer(Map<String, Object> raw) {
        return (Map<String, Object>) call("calculateFertilizer", raw);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> validateProfile(Map<String, Object> raw) {
        return (Map<String, Object>) call("validateProfile", raw);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> validateRegistration(Map<String, Object> raw) {
        return (Map<String, Object>) call("validateRegistration", raw);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> validateLogin(Map<String, Object> raw) {
        return (Map<String, Object>) call("validateLogin", raw);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> filterPrices(Map<String, Object> filters) {
        return (Map<String, Object>) ((JavascriptExecutor) driver).executeScript(
                "const rows = window.__kcTest.filterPrices(arguments[0]); return { count: rows.length, rows };", filters);
    }

    public long mandiRowCount() {
        Object value = ((JavascriptExecutor) driver).executeScript("return window.__kcTest.mandiRowCount()");
        return ((Number) value).longValue();
    }

    public String formatINR(double value, boolean decimals) {
        return (String) ((JavascriptExecutor) driver)
                .executeScript("return window.__kcTest.formatINR(arguments[0], arguments[1])",
                        value, decimals ? Map.of("decimals", true) : Map.of());
    }

    public String formatNumber(double value) {
        return (String) ((JavascriptExecutor) driver).executeScript("return window.__kcTest.formatNumber(arguments[0])", value);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> limits() {
        return (Map<String, Object>) ((JavascriptExecutor) driver).executeScript("return window.__kcTest.limits");
    }

    /** Extracts the error code for one field from a validation result, or null when the field is valid. */
    @SuppressWarnings("unchecked")
    public static String fieldError(Map<String, Object> result, String field) {
        Object errors = result.get("errors");
        if (!(errors instanceof Map<?, ?> map)) {
            return null;
        }
        Object entry = map.get(field);
        if (!(entry instanceof Map<?, ?> error)) {
            return null;
        }
        Object code = error.get("code");
        return code == null ? null : code.toString();
    }

    public static double number(Map<String, Object> result, String key) {
        return ((Number) result.get(key)).doubleValue();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> map(Map<String, Object> result, String key) {
        return (Map<String, Object>) result.get(key);
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> rows(Map<String, Object> result) {
        return (List<Map<String, Object>>) result.get("rows");
    }

    private Object call(String function, Map<String, Object> argument) {
        return ((JavascriptExecutor) driver)
                .executeScript("return window.__kcTest." + function + "(arguments[0]);", argument);
    }

    private static Object script(WebDriver driver, String script) {
        return ((JavascriptExecutor) driver).executeScript(script);
    }
}
