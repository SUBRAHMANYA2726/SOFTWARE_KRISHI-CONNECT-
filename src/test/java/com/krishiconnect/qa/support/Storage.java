package com.krishiconnect.qa.support;

import java.util.Map;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

/**
 * Reads and clears the demo-mode storage the app uses when Firebase is absent
 * ({@code localAdapter.js} keys).
 *
 * Tests must not guess what was persisted: the assertions read the same records
 * the application writes.
 */
public final class Storage {

    public static final String USERS_KEY = "kc.demo.users.v1";
    public static final String SESSION_KEY = "kc.demo.session.v1";
    public static final String PROFILE_PREFIX = "kc.demo.profile.";

    private Storage() {
    }

    public static void clearAll(WebDriver driver) {
        ((JavascriptExecutor) driver)
                .executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
    }

    /**
     * Writes the same two records the demo adapter writes on registration: one
     * public user record and the session uid. Used only to satisfy the
     * protected route for calculator and mandi cases, where sign-in is a
     * precondition rather than the behaviour under test.
     */
    public static void seedSession(WebDriver driver, String uid, String email, String displayName) {
        ((JavascriptExecutor) driver).executeScript(
                "const uid = arguments[0], email = arguments[1], name = arguments[2];"
                        + "const users = [{ uid, email, displayName: name, provider: 'password',"
                        + "  createdAt: new Date().toISOString() }];"
                        + "localStorage.setItem(arguments[3], JSON.stringify(users));"
                        + "localStorage.setItem(arguments[4], uid);",
                uid, email, displayName, USERS_KEY, SESSION_KEY);
    }

    /**
     * Writes a complete demo profile for the seeded uid. Used where the module
     * under test reads {@code profile.primaryCrops} on load.
     */
    public static void seedProfile(WebDriver driver, String uid, String... primaryCrops) {
        ((JavascriptExecutor) driver).executeScript(
                "const uid = arguments[0], crops = Array.from(arguments[1]);"
                        + "const now = new Date().toISOString();"
                        + "localStorage.setItem(arguments[2] + uid, JSON.stringify({"
                        + "  uid, fullName: 'BVA Farmer', village: 'KRS Halli', district: 'Mandya',"
                        + "  taluk: 'Mandya', language: 'en', farmArea: 1, irrigation: 'Rainfed',"
                        + "  primaryCrops: crops, createdAt: now, updatedAt: now }));",
                uid, java.util.List.of(primaryCrops), PROFILE_PREFIX);
    }

    /** Signs the current demo user out but keeps registered users and profiles. */
    public static void clearSession(WebDriver driver) {
        ((JavascriptExecutor) driver)
                .executeScript("window.localStorage.removeItem(arguments[0]);", SESSION_KEY);
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> currentProfile(WebDriver driver) {
        Object value = ((JavascriptExecutor) driver).executeScript(
                "for (let i = 0; i < localStorage.length; i++) {"
                        + "  const key = localStorage.key(i);"
                        + "  if (key && key.startsWith(arguments[0])) return JSON.parse(localStorage.getItem(key));"
                        + "}"
                        + "return null;", PROFILE_PREFIX);
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    public static java.util.List<Map<String, Object>> users(WebDriver driver) {
        Object value = ((JavascriptExecutor) driver).executeScript(
                "const raw = localStorage.getItem(arguments[0]); return raw ? JSON.parse(raw) : [];", USERS_KEY);
        return (java.util.List<Map<String, Object>>) value;
    }

    public static int userCount(WebDriver driver) {
        return users(driver).size();
    }

    public static boolean hasSession(WebDriver driver) {
        Object value = ((JavascriptExecutor) driver)
                .executeScript("return localStorage.getItem(arguments[0]) !== null;", SESSION_KEY);
        return Boolean.TRUE.equals(value);
    }
}
