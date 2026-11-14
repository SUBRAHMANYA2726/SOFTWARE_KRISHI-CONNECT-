package com.krishiconnect.qa.core;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.krishiconnect.qa.support.Storage;

/**
 * Common lifecycle.
 *
 * One browser is reused for all cases in a class (a fresh browser per case would
 * dominate the runtime of 200+ UI cases), and every case starts from a clean
 * storage state. Tests that need a persistent demo account opt out of the full
 * wipe and clear only the session key.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(AppServerExtension.class)
@ExtendWith(ScreenshotHandler.class)
public abstract class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeAll
    void launchBrowser() {
        driver = DriverFactory.create();
        wait = new WebDriverWait(driver, Config.uiTimeout());
    }

    @BeforeEach
    void openFreshSession() {
        driver.get(Config.baseUrl());
        prepareStorage();
        driver.navigate().refresh();
    }

    /**
     * Decides what every case starts with. Classes whose module is behind the
     * protected route override this to clear storage and then seed the demo
     * session the application itself uses (authentication is a precondition,
     * not the behaviour under test).
     */
    protected void prepareStorage() {
        if (clearStorageEachTest()) {
            Storage.clearAll(driver);
        } else {
            Storage.clearSession(driver);
        }
    }

    /** Override and return {@code false} when the class creates a demo account once in {@code @BeforeAll}. */
    protected boolean clearStorageEachTest() {
        return true;
    }

    @AfterAll
    void closeSession() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }

    public WebDriver driver() {
        return driver;
    }
}
