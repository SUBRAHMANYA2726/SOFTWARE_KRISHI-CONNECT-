package com.krishiconnect.qa.core;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestExecutionExceptionHandler;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

/**
 * Saves a screenshot next to the Surefire report when a test throws.
 *
 * Runs at the point of failure, before {@code @AfterEach}, so the browser is
 * still open and the evidence matches the failing state.
 */
public class ScreenshotHandler implements TestExecutionExceptionHandler {

    @Override
    public void handleTestExecutionException(ExtensionContext context, Throwable throwable) throws Throwable {
        Object instance = context.getRequiredTestInstance();
        if (instance instanceof BaseTest test) {
            WebDriver driver = test.driver();
            if (driver != null) {
                capture(context, driver);
            }
        }
        throw throwable;
    }

    private void capture(ExtensionContext context, WebDriver driver) {
        try {
            Path directory = Config.repoRoot().resolve("target").resolve("evidence");
            Files.createDirectories(directory);
            String name = context.getRequiredTestClass().getSimpleName()
                    + "-" + context.getRequiredTestMethod().getName()
                    + "-" + Instant.now().toEpochMilli() + ".png";
            File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Files.copy(screenshot.toPath(), directory.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException | RuntimeException ignored) {
            // Evidence capture must never hide the original failure.
        }
    }
}
