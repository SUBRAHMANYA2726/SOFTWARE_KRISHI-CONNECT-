package com.krishiconnect.qa.core;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;

/**
 * Creates the browser used by every test.
 *
 * The browser is chosen with {@code -Dbrowser=edge|chrome} (default {@code edge}).
 * On this machine Smart App Control blocks the unsigned ChromeDriver binary, while
 * Microsoft's signed EdgeDriver runs normally, so Edge is the default. Chrome is
 * still supported for machines where its driver is allowed.
 *
 * Driver binaries are resolved by Selenium Manager unless {@code webdriver.*.driver}
 * is already provided, so no driver path is hard-coded.
 */
public final class DriverFactory {

    private DriverFactory() {
    }

    public static WebDriver create() {
        String browser = Config.browser();
        WebDriver driver = switch (browser) {
            case "chrome" -> createChrome();
            case "edge" -> createEdge();
            default -> throw new IllegalArgumentException(
                    "Unsupported browser '" + browser + "'. Use -Dbrowser=edge or -Dbrowser=chrome.");
        };
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1440, 900));
        return driver;
    }

    private static WebDriver createChrome() {
        ChromeOptions options = new ChromeOptions();
        if (Config.headless()) {
            options.addArguments("--headless=new");
        }
        options.addArguments(
                "--window-size=1440,900",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-search-engine-choice-screen",
                "--lang=en-IN");
        options.setExperimentalOption("prefs", Map.of("intl.accept_languages", "en-IN,en"));
        return new ChromeDriver(options);
    }

    private static WebDriver createEdge() {
        EdgeOptions options = new EdgeOptions();
        if (Config.headless()) {
            options.addArguments("--headless=new");
        }
        options.addArguments(
                "--window-size=1440,900",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check",
                "--lang=en-IN");
        options.setExperimentalOption("prefs", Map.of("intl.accept_languages", "en-IN,en"));

        Path localDriver = Config.toolDir().resolve("edge").resolve("msedgedriver.exe");
        if (Files.isRegularFile(localDriver)) {
            System.setProperty("webdriver.edge.driver", localDriver.toString());
        }
        return new EdgeDriver(options);
    }
}
