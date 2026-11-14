package com.krishiconnect.qa.pages;

import org.openqa.selenium.WebDriver;

/** /login */
public class LoginPage extends BasePage {

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage open() {
        open("/login");
        waitForTestId("login-form");
        return this;
    }

    public LoginPage fillCredentials(String email, String password) {
        fill("login-email", email);
        fill("login-password", password);
        return this;
    }

    public void submit() {
        click("login-submit");
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

    public boolean demoNoticeVisible() {
        return isVisibleNow("login-demo-notice");
    }

    public boolean googleSignInVisible() {
        return isVisibleNow("google-signin");
    }

    public void waitForDashboard() {
        waitForUrlContaining("/dashboard");
        waitForTestId("dashboard-heading");
    }
}
