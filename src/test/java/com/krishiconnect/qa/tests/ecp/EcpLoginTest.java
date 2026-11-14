package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.DashboardPage;
import com.krishiconnect.qa.pages.LoginPage;
import com.krishiconnect.qa.support.Flows;

/**
 * ECP-LOG-01 … ECP-LOG-10 — login equivalence classes.
 *
 * The demo account is created once for the class; only the session is cleared
 * between cases so the registered user record survives.
 */
class EcpLoginTest extends BaseTest {

    private static final String EMAIL = "ecp.login@example.com";
    private static final String PASSWORD = "farmer2026";

    @BeforeAll
    void createAccount() {
        Flows.registerAndOnboard(driver, EMAIL);
    }

    @Override
    protected boolean clearStorageEachTest() {
        return false;
    }

    record Case(String id, String email, String password, String errorField, String errorCode,
                Outcome outcome) {
        @Override
        public String toString() {
            return id;
        }
    }

    enum Outcome {
        DASHBOARD, AUTH_ERROR, CLIENT_ERROR
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(new Case("ECP-LOG-01", EMAIL, PASSWORD, null, null, Outcome.DASHBOARD)),
                Arguments.of(new Case("ECP-LOG-02", "", PASSWORD, "email", "REQUIRED", Outcome.CLIENT_ERROR)),
                Arguments.of(new Case("ECP-LOG-03", "asha@", PASSWORD, "email", "INVALID_EMAIL", Outcome.CLIENT_ERROR)),
                Arguments.of(new Case("ECP-LOG-04", EMAIL, "", "password", "REQUIRED", Outcome.CLIENT_ERROR)),
                Arguments.of(new Case("ECP-LOG-05", "nobody@example.com", PASSWORD, null, null, Outcome.AUTH_ERROR)),
                Arguments.of(new Case("ECP-LOG-06", EMAIL, "wrongpass1", null, null, Outcome.AUTH_ERROR)),
                Arguments.of(new Case("ECP-LOG-07", EMAIL, "x", null, null, Outcome.AUTH_ERROR)),
                Arguments.of(new Case("ECP-LOG-08", "  ECP.LOGIN@EXAMPLE.COM  ", PASSWORD, null, null,
                        Outcome.DASHBOARD)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Login equivalence classes")
    void loginClass(Case testCase) {
        WebDriver driver = driver();
        LoginPage page = new LoginPage(driver).open();
        page.fillCredentials(testCase.email(), testCase.password());
        page.submit();

        switch (testCase.outcome()) {
            case CLIENT_ERROR -> {
                assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                        testCase.id() + " unexpected client error code");
                assertFalse(page.isVisibleNow("auth-error"),
                        testCase.id() + " must not reach the auth backend");
                assertTrue(page.currentUrl().endsWith("/login"), testCase.id() + " should stay on /login");
            }
            case AUTH_ERROR -> {
                assertFalse(page.hasError("password"),
                        testCase.id() + " must not apply a password strength rule on login");
                page.waitForAlert();
                assertTrue(page.alertText().toLowerCase().contains("incorrect"),
                        testCase.id() + " expected the invalid-credentials alert but was: " + page.alertText());
                assertTrue(page.currentUrl().endsWith("/login"), testCase.id() + " should stay on /login");
            }
            case DASHBOARD -> {
                page.waitForDashboard();
                DashboardPage dashboard = new DashboardPage(driver);
                assertTrue(dashboard.profilePanel().contains("BVA Farmer"),
                        testCase.id() + " dashboard must greet the signed-in profile: " + dashboard.profilePanel());
                assertFalse(page.isVisibleNow("auth-error"), testCase.id() + " must not show an auth error");
            }
        }
    }

    @Test
    @DisplayName("ECP-LOG-09 an authenticated user is redirected away from /login")
    void authenticatedUserRedirected() {
        WebDriver driver = driver();
        Flows.login(driver, EMAIL);

        // A signed-in user never sees the login form, so /login must be opened
        // without waiting for login-form to render.
        driver.get(com.krishiconnect.qa.core.Config.baseUrl() + "/login");
        new DashboardPage(driver).waitForLoad();
        assertTrue(driver.getCurrentUrl().endsWith("/dashboard"),
                "ECP-LOG-09 expected /dashboard but was " + driver.getCurrentUrl());
    }

    @Test
    @DisplayName("ECP-LOG-10 demo mode shows the demo notice and hides Google sign-in")
    void demoModeNotice() {
        WebDriver driver = driver();
        LoginPage page = new LoginPage(driver).open();

        assertTrue(page.demoNoticeVisible(), "ECP-LOG-10 the demo notice must be visible");
        assertFalse(page.googleSignInVisible(), "ECP-LOG-10 the Google button must be absent in demo mode");
    }
}
