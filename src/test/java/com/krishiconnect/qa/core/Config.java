package com.krishiconnect.qa.core;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

/**
 * Single place where the suite reads its runtime configuration.
 *
 * Values come from Maven system properties (see pom.xml) so the same suite can
 * run headless in CI and headed on a developer machine without edits.
 */
public final class Config {

    private Config() {
    }

    public static String baseUrl() {
        return trimTrailingSlash(System.getProperty("baseUrl", "http://127.0.0.1:5173"));
    }

    public static boolean headless() {
        return Boolean.parseBoolean(System.getProperty("headless", "true"));
    }

    /** {@code edge} (default) or {@code chrome}. */
    public static String browser() {
        return System.getProperty("browser", "edge").trim().toLowerCase();
    }

    /** Local tool folder that holds the signed EdgeDriver, when present. */
    public static Path toolDir() {
        return Paths.get(System.getProperty("kcToolsDir",
                Paths.get(System.getProperty("user.home"), "AppData", "Local", "kc-tools").toString()));
    }

    public static Duration uiTimeout() {
        return Duration.ofSeconds(Long.parseLong(System.getProperty("uiTimeoutSeconds", "20")));
    }

    /** Repository root: the directory that contains pom.xml and krishiconnect-build/. */
    public static Path repoRoot() {
        return Paths.get(System.getProperty("user.dir")).toAbsolutePath();
    }

    public static Path frontendDir() {
        return repoRoot().resolve("krishiconnect-build");
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
