package com.krishiconnect.qa.pages;

import org.openqa.selenium.WebDriver;

/** /register */
public class RegisterPage extends BasePage {

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public RegisterPage open() {
        open("/register");
        waitForTestId("register-form");
        return this;
    }

    public RegisterPage fill(String fullName, String email, String password, String confirmPassword) {
        fill("register-name", fullName);
        fill("register-email", email);
        fill("register-password", password);
        fill("register-confirm-password", confirmPassword);
        return this;
    }

    public void submit() {
        click("register-submit");
    }

    public String errorCode(String field) {
        return errorCodeOf("error-" + field);
    }

    public boolean hasError(String field) {
        return super.hasError("error-" + field);
    }

    public String alertText() {
        return text("auth-error");
    }

    public void waitForAlert() {
        waitForTestId("auth-error");
    }

    public void waitForOnboarding() {
        waitForUrlContaining("/onboarding");
        waitForTestId("onboarding-form");
    }
}
