package com.krishiconnect.qa.pages;

import org.openqa.selenium.WebDriver;

/** /settings */
public class SettingsPage extends BasePage {

    public SettingsPage(WebDriver driver) {
        super(driver);
    }

    public SettingsPage open() {
        open("/settings");
        waitForTestId("settings-form");
        return this;
    }

    public String email() {
        return text("settings-email");
    }

    public String uid() {
        return text("settings-uid");
    }

    public ProfileFormPage form() {
        return new ProfileFormPage(driver, "settings");
    }

    /** Submits the settings form and returns the success toast text. */
    public String saveAndWaitForToast() {
        form().submit();
        return text("toast");
    }
}
