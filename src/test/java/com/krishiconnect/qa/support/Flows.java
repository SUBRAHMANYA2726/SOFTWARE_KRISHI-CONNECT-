package com.krishiconnect.qa.support;

import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.pages.DashboardPage;
import com.krishiconnect.qa.pages.ProfileFormPage;
import com.krishiconnect.qa.pages.RegisterPage;
import com.krishiconnect.qa.pages.SettingsPage;

/** Multi-page journeys reused by several tests. */
public final class Flows {

    private Flows() {
    }

    /** Registers through the UI and stops on the onboarding form. */
    public static void register(WebDriver driver, String email) {
        new RegisterPage(driver)
                .open()
                .fill(TestData.NAME, email, TestData.PASSWORD, TestData.PASSWORD)
                .submit();
        new RegisterPage(driver).waitForOnboarding();
    }

    /** Registers and completes onboarding with baseline valid values. */
    public static void registerAndOnboard(WebDriver driver, String email) {
        register(driver, email);
        new ProfileFormPage(driver, "onboarding")
                .fillName(TestData.NAME)
                .selectDistrict(TestData.DISTRICT)
                .selectTaluk(TestData.TALUK)
                .fillFarmArea(TestData.FARM_AREA)
                .selectIrrigation(TestData.IRRIGATION)
                .toggleCrop(TestData.CROP)
                .submit();
        new DashboardPage(driver).waitForLoad();
    }

    /** Signs an existing demo user in through the UI and waits for the dashboard. */
    public static void login(WebDriver driver, String email) {
        new com.krishiconnect.qa.pages.LoginPage(driver)
                .open()
                .fillCredentials(email, TestData.PASSWORD);
        new com.krishiconnect.qa.pages.LoginPage(driver).submit();
        new DashboardPage(driver).waitForLoad();
    }

    public static SettingsPage openSettings(WebDriver driver) {
        SettingsPage page = new SettingsPage(driver);
        page.open();
        return page;
    }
}
