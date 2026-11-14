package com.krishiconnect.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/** /calculator/fertilizer */
public class FertilizerPage extends BasePage {

    public FertilizerPage(WebDriver driver) {
        super(driver);
    }

    public FertilizerPage open() {
        open("/calculator/fertilizer");
        waitForTestId("fertilizer-form");
        return this;
    }

    public FertilizerPage fillForm(String cropId, String landArea) {
        selectByValue("fertilizer-crop", cropId);
        fill("fertilizer-landArea", landArea);
        return this;
    }

    public void calculate() {
        click("fertilizer-calculate");
    }

    public void reset() {
        click("fertilizer-reset");
    }

    public String errorCode(String field) {
        return errorCodeOf("error-fertilizer-" + field);
    }

    public boolean hasError(String field) {
        return super.hasError("error-fertilizer-" + field);
    }

    public boolean hasResult() {
        return isVisibleNow("fertilizer-result");
    }

    public void waitForResult() {
        waitForTestId("fertilizer-result");
    }

    public String targetN() {
        return targetValue("fertilizer-target-n");
    }

    public String targetP() {
        return targetValue("fertilizer-target-p");
    }

    public String targetK() {
        return targetValue("fertilizer-target-k");
    }

    /**
     * The nutrient card renders the label, the value and the unit as three
     * paragraphs; the value is the second one.
     */
    private String targetValue(String id) {
        WebElement card = visible(id);
        return card.findElements(By.tagName("p")).get(1).getText().trim();
    }

    /** Full quantity text of a product row, e.g. "3,519 kg". */
    public String product(String productId) {
        WebElement row = visible("fertilizer-product-" + productId);
        return row.findElements(By.tagName("span")).get(1).getText().trim();
    }

    /** The raw hectares value shown in the result header. */
    public String hectares() {
        WebElement header = visible("fertilizer-result")
                .findElement(By.xpath(".//p[contains(normalize-space(.), 'land in hectares')]"));
        String text = header.getText().trim();
        return text.split(" ")[0];
    }

    public String season() {
        WebElement header = visible("fertilizer-result")
                .findElement(By.xpath(".//p[contains(normalize-space(.), 'land in hectares')]"));
        String text = header.getText().trim();
        return text.substring(text.indexOf('·') + 1).trim();
    }

    public String selectedCrop() {
        return selectedOption("fertilizer-crop");
    }

    public String selectedCropValue() {
        return value("fertilizer-crop");
    }

    public String doseHint() {
        return text("fertilizer-dose-hint");
    }

    public String areaValue() {
        return value("fertilizer-landArea");
    }
}
