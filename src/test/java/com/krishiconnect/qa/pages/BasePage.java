package com.krishiconnect.qa.pages;

import java.util.List;
import java.util.stream.Collectors;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.krishiconnect.qa.core.Config;

/**
 * Shared behaviour for all page objects.
 *
 * Every lookup is driven by the application's own {@code data-testid}
 * attributes and explicit waits. There are no fixed sleeps.
 */
public abstract class BasePage {

    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Config.uiTimeout());
    }

    protected By testId(String id) {
        return By.cssSelector("[data-testid='" + id + "']");
    }

    protected WebElement visible(String id) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(testId(id)));
    }

    protected WebElement clickable(String id) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(testId(id)));
        scrollIntoView(element);
        wait.until(d -> isHitTarget(element));
        return element;
    }

    /** Scrolls instantly: the app sets CSS {@code scroll-behavior: smooth}, which would otherwise make clicks land mid-scroll. */
    protected void scrollIntoView(WebElement element) {
        ((JavascriptExecutor) driver)
                .executeScript("arguments[0].scrollIntoView({block:'center', inline:'center', behavior:'instant'});", element);
    }

    /** True when the element's centre point actually receives pointer events. */
    private boolean isHitTarget(WebElement element) {
        Object result = ((JavascriptExecutor) driver).executeScript(
                "const r = arguments[0].getBoundingClientRect();"
                        + "const x = r.left + r.width / 2; const y = r.top + r.height / 2;"
                        + "if (r.width === 0 || r.height === 0) return false;"
                        + "if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;"
                        + "const hit = document.elementFromPoint(x, y);"
                        + "return !!hit && (hit === arguments[0] || arguments[0].contains(hit));",
                element);
        return Boolean.TRUE.equals(result);
    }

    public void open(String path) {
        driver.get(Config.baseUrl() + path);
    }

    public void click(String id) {
        clickable(id).click();
    }

    public void fill(String id, String value) {
        WebElement element = visible(id);
        scrollIntoView(element);
        if (value.isEmpty()) {
            // WebElement.clear() updates the DOM value but not React's value
            // tracker, so a controlled input would keep its previous state.
            // fillViaJs bypasses the tracker and dispatches the input event.
            fillViaJs(id, "");
            return;
        }
        element.clear();
        element.sendKeys(value);
    }

    /**
     * Sets a controlled input's value through the native setter and fires an
     * {@code input} event. Used only where a headless keyboard cannot produce the
     * characters (Kannada search strings); React receives the same event a user
     * keystroke would produce.
     */
    public void fillViaJs(String id, String value) {
        WebElement element = visible(id);
        ((JavascriptExecutor) driver).executeScript(
                "const el = arguments[0];"
                        + "const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;"
                        + "setter.call(el, arguments[1]);"
                        + "el.dispatchEvent(new Event('input', { bubbles: true }));",
                element, value);
    }

    public String text(String id) {
        return visible(id).getText().trim();
    }

    public String value(String id) {
        return visible(id).getAttribute("value");
    }

    public void selectByValue(String id, String value) {
        new Select(visible(id)).selectByValue(value);
    }

    public void selectByText(String id, String value) {
        new Select(visible(id)).selectByVisibleText(value);
    }

    public String selectedOption(String id) {
        return new Select(visible(id)).getFirstSelectedOption().getText().trim();
    }

    public List<String> optionTexts(String id) {
        return new Select(visible(id)).getOptions().stream()
                .map(option -> option.getText().trim())
                .collect(Collectors.toList());
    }

    public boolean isVisibleNow(String id) {
        for (WebElement element : driver.findElements(testId(id))) {
            try {
                if (element.isDisplayed()) {
                    return true;
                }
            } catch (NoSuchElementException | org.openqa.selenium.StaleElementReferenceException ignored) {
                // The list is a snapshot; retry on the next call.
            }
        }
        return false;
    }

    public int countVisible(String id) {
        int count = 0;
        for (WebElement element : driver.findElements(testId(id))) {
            try {
                if (element.isDisplayed()) {
                    count++;
                }
            } catch (NoSuchElementException | org.openqa.selenium.StaleElementReferenceException ignored) {
                // Ignore elements that vanish between the query and the check.
            }
        }
        return count;
    }

    /** Reads {@code data-error-code} from the field error element, e.g. {@code error-fullName}. */
    public String errorCodeOf(String errorTestId) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(testId(errorTestId)));
        return element.getAttribute("data-error-code");
    }

    public boolean hasError(String errorTestId) {
        return isVisibleNow(errorTestId);
    }

    public void waitForUrlContaining(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }

    public void waitForTestId(String id) {
        visible(id);
    }

    public String currentUrl() {
        return driver.getCurrentUrl();
    }

    public boolean pageContains(String text) {
        return driver.getPageSource().contains(text);
    }

    /** Waits until the element's text equals the expected value, then returns it. */
    public String waitForText(String id, String expected) {
        return wait.until(d -> {
            for (WebElement element : d.findElements(testId(id))) {
                try {
                    if (element.isDisplayed() && element.getText().trim().equals(expected)) {
                        return expected;
                    }
                } catch (NoSuchElementException | org.openqa.selenium.StaleElementReferenceException ignored) {
                    // Retry on the next poll.
                }
            }
            return null;
        });
    }
}
