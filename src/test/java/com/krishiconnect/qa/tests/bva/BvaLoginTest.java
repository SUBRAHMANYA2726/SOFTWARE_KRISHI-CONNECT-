package com.krishiconnect.qa.tests.bva;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.LoginPage;
import com.krishiconnect.qa.support.Flows;

/**
 * BVA-LOG-01 … BVA-LOG-07.
 *
 * The demo account is created once for the class, so the cases keep the users
 * record and clear only the session between runs.
 */
class BvaLoginTest extends BaseTest {

    private static final String EMAIL = "bva.login@example.com";
    private static final String PASSWORD = "farmer2026";
    private static final String LONG_EMAIL_254 = "a".repeat(242) + "@example.com";
    private static final String LONG_EMAIL_255 = "a".repeat(243) + "@example.com";

    record Case(String id, String email, String password, String errorField, String errorCode,
                boolean expectsAuthError) {
    }

    @BeforeAll
    void createAccount() {
        Flows.registerAndOnboard(driver, EMAIL);
    }

    @Override
    protected boolean clearStorageEachTest() {
        return false;
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(new Case("BVA-LOG-01", EMAIL, "", "password", "REQUIRED", false)),
                Arguments.of(new Case("BVA-LOG-02", EMAIL, "x", null, null, true)),
                Arguments.of(new Case("BVA-LOG-03", EMAIL, "farm202", null, null, true)),
                Arguments.of(new Case("BVA-LOG-04", EMAIL, "a1" + "x".repeat(127), null, null, true)),
                Arguments.of(new Case("BVA-LOG-05", EMAIL, " ", null, null, true)),
                Arguments.of(new Case("BVA-LOG-06", LONG_EMAIL_254, PASSWORD, null, null, true)),
                Arguments.of(new Case("BVA-LOG-07", LONG_EMAIL_255, PASSWORD, "email", "INVALID_EMAIL", false)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Login boundaries")
    void loginBoundary(Case testCase) {
        WebDriver driver = driver();
        LoginPage page = new LoginPage(driver).open();
        page.fillCredentials(testCase.email(), testCase.password());
        page.submit();

        if (testCase.errorCode() != null) {
            assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                    testCase.id() + " unexpected client error code");
        } else {
            assertFalse(page.hasError("password"),
                    testCase.id() + " must not apply a password length rule on login");
            assertFalse(page.hasError("email"),
                    testCase.id() + " must not reject this email client-side");
        }

        if (testCase.expectsAuthError()) {
            page.waitForAlert();
            assertTrue(page.alertText().toLowerCase().contains("incorrect"),
                    testCase.id() + " expected the invalid-credentials alert but was: " + page.alertText());
            assertTrue(page.currentUrl().endsWith("/login"),
                    testCase.id() + " should stay on /login");
        } else {
            assertFalse(page.isVisibleNow("auth-error"),
                    testCase.id() + " should not reach the auth backend");
        }
    }
}
