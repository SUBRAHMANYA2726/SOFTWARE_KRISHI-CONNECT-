package com.krishiconnect.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * The shared profile form used by /onboarding ({@code prefix="onboarding"}) and
 * /settings ({@code prefix="settings"}).
 */
public class ProfileFormPage extends BasePage {

    private final String prefix;

    public ProfileFormPage(WebDriver driver, String prefix) {
        super(driver);
        this.prefix = prefix;
    }

    public ProfileFormPage openOnboarding() {
        open("/onboarding");
        waitForTestId(prefix + "-form");
        return this;
    }

    public ProfileFormPage openSettings() {
        open("/settings");
        waitForTestId(prefix + "-form");
        return this;
    }

    public ProfileFormPage fillName(String value) {
        fill(prefix + "-name", value);
        return this;
    }

    public ProfileFormPage fillVillage(String value) {
        fill(prefix + "-village", value);
        return this;
    }

    public ProfileFormPage fillFarmArea(String value) {
        fill(prefix + "-farmArea", value);
        return this;
    }

    public ProfileFormPage selectDistrict(String district) {
        selectByValue(prefix + "-district", district);
        return this;
    }

    public ProfileFormPage selectTaluk(String taluk) {
        selectByValue(prefix + "-taluk", taluk);
        return this;
    }

    public ProfileFormPage selectIrrigation(String irrigation) {
        selectByValue(prefix + "-irrigation", irrigation);
        return this;
    }

    public ProfileFormPage chooseLanguage(String language) {
        click(prefix + "-language-" + language);
        return this;
    }

    public ProfileFormPage toggleCrop(String crop) {
        click("crop-" + crop.toLowerCase());
        return this;
    }

    public ProfileFormPage selectCrops(String... crops) {
        for (String crop : crops) {
            toggleCrop(crop);
        }
        return this;
    }

    public ProfileFormPage clearCrops() {
        for (WebElement button : driver.findElements(By.cssSelector("[data-testid^='crop-'][aria-pressed='true']"))) {
            button.click();
        }
        return this;
    }

    public int selectedCropCount() {
        return driver.findElements(By.cssSelector("[data-testid^='crop-'][aria-pressed='true']")).size();
    }

    public String cropCounterText() {
        return driver.findElement(By.xpath("//span[contains(normalize-space(.), '/5')]")).getText().trim();
    }

    public boolean isTalukDisabled() {
        return !visible(prefix + "-taluk").isEnabled();
    }

    public String villageValue() {
        return value(prefix + "-village");
    }

    public String nameValue() {
        return value(prefix + "-name");
    }

    public void submit() {
        click(prefix + "-submit");
    }

    /** Suffix is the field name without prefix: name, village, district, taluk, farmArea, irrigation, language, crops. */
    public String errorCode(String suffix) {
        return errorCodeOf("error-" + prefix + "-" + suffix);
    }

    public boolean hasError(String suffix) {
        return super.hasError("error-" + prefix + "-" + suffix);
    }

    public void waitForDashboard() {
        waitForUrlContaining("/dashboard");
        waitForTestId("dashboard-heading");
    }

    public String districtValue() {
        return value(prefix + "-district");
    }

    public String talukValue() {
        return value(prefix + "-taluk");
    }

    public String farmAreaValue() {
        return value(prefix + "-farmArea");
    }
}
