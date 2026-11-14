package com.krishiconnect.qa.pages;

import org.openqa.selenium.WebDriver;

/** /calculator/profit */
public class ProfitPage extends BasePage {

    public ProfitPage(WebDriver driver) {
        super(driver);
    }

    public ProfitPage open() {
        open("/calculator/profit");
        waitForTestId("profit-form");
        return this;
    }

    public ProfitPage fillForm(String landArea, String yieldPerAcre, String sellingPrice, String cultivationCost) {
        fill("profit-landArea", landArea);
        fill("profit-yieldPerAcre", yieldPerAcre);
        fill("profit-sellingPrice", sellingPrice);
        fill("profit-cultivationCost", cultivationCost);
        return this;
    }

    public void calculate() {
        click("profit-calculate");
    }

    public void reset() {
        click("profit-reset");
    }

    public String errorCode(String field) {
        return errorCodeOf("error-profit-" + field);
    }

    public boolean hasError(String field) {
        return super.hasError("error-profit-" + field);
    }

    public boolean hasSummaryError() {
        return isVisibleNow("profit-error-summary");
    }

    public boolean hasResult() {
        return isVisibleNow("profit-result");
    }

    public void waitForResult() {
        waitForTestId("profit-result");
    }

    public String label() {
        return value("profit-label");
    }

    public String fieldValue(String field) {
        return value("profit-" + field);
    }

    public boolean isFormEmpty() {
        return fieldValue("label").isEmpty()
                && fieldValue("landArea").isEmpty()
                && fieldValue("yieldPerAcre").isEmpty()
                && fieldValue("sellingPrice").isEmpty()
                && fieldValue("cultivationCost").isEmpty();
    }

    public String status() {
        return text("profit-result-status");
    }

    public String net() {
        return text("profit-net-result");
    }

    public String revenue() {
        return text("profit-revenue");
    }

    public String expenditure() {
        return text("profit-expenditure");
    }

    public String totalYield() {
        return text("profit-total-yield");
    }

    public String margin() {
        return text("profit-margin");
    }

    public String breakEven() {
        return text("profit-break-even");
    }
}
