package com.krishiconnect.qa.pages;

import org.openqa.selenium.WebDriver;

/** /dashboard */
public class DashboardPage extends BasePage {

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public void waitForLoad() {
        waitForUrlContaining("/dashboard");
        waitForTestId("dashboard-heading");
    }

    public String heading() {
        return text("dashboard-heading");
    }

    public String profilePanel() {
        return text("dashboard-profile");
    }
}
