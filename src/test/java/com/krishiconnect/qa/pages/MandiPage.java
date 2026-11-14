package com.krishiconnect.qa.pages;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.selenium.WebDriver;

/** /mandi */
public class MandiPage extends BasePage {

    private static final Pattern LEADING_COUNT = Pattern.compile("^(\\d+)");

    public MandiPage(WebDriver driver) {
        super(driver);
    }

    public MandiPage open() {
        open("/mandi");
        waitForTestId("mandi-results-count");
        // The counter exists before the sample rows arrive; waiting for the
        // table guarantees the dataset is loaded before a filter is applied.
        waitForTestId("mandi-table");
        return this;
    }

    public MandiPage search(String value) {
        fill("mandi-search", value);
        return this;
    }

    /** Search text that a headless keyboard cannot type (Kannada), set through the native value setter. */
    public MandiPage searchViaJs(String value) {
        fillViaJs("mandi-search", value);
        return this;
    }

    public MandiPage selectCrop(String crop) {
        selectByValue("mandi-crop", crop);
        return this;
    }

    public MandiPage selectDistrict(String district) {
        selectByValue("mandi-district", district);
        return this;
    }

    public MandiPage selectMarket(String market) {
        selectByValue("mandi-market", market);
        return this;
    }

    public MandiPage clear() {
        click("mandi-clear");
        return this;
    }

    public String countText() {
        return text("mandi-results-count");
    }

    /** Number of rows reported by the results counter. */
    public int reportedCount() {
        Matcher matcher = LEADING_COUNT.matcher(countText());
        if (!matcher.find()) {
            throw new AssertionError("Results counter does not start with a number: " + countText());
        }
        return Integer.parseInt(matcher.group(1));
    }

    /** Number of result rows actually rendered in the table (desktop layout). */
    public int visibleRowCount() {
        return countVisible("mandi-row");
    }

    public boolean isEmptyStateVisible() {
        return isVisibleNow("mandi-empty");
    }

    public boolean sampleNoticeVisible() {
        return isVisibleNow("mandi-sample-notice");
    }

    public List<String> marketOptions() {
        return optionTexts("mandi-market");
    }

    public String selectedMarket() {
        return selectedOption("mandi-market");
    }

    public String searchValue() {
        return value("mandi-search");
    }

    public String selectedCrop() {
        return selectedOption("mandi-crop");
    }

    public String selectedDistrict() {
        return selectedOption("mandi-district");
    }

    /** Waits until the results counter reports the expected number of rows. */
    public MandiPage waitForCount(int expected) {
        wait.until(d -> {
            try {
                return reportedCount() == expected;
            } catch (AssertionError | RuntimeException notYet) {
                return false;
            }
        });
        return this;
    }

    public java.util.List<String> rowTexts() {
        java.util.List<String> texts = new java.util.ArrayList<>();
        for (org.openqa.selenium.WebElement row : driver.findElements(testId("mandi-row"))) {
            try {
                if (row.isDisplayed()) {
                    texts.add(row.getText().trim());
                }
            } catch (org.openqa.selenium.StaleElementReferenceException ignored) {
                // Ignore rows re-rendered between the query and the read.
            }
        }
        return texts;
    }
}
