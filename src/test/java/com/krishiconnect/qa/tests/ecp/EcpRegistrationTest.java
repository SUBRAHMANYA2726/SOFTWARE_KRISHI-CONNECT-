package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.RegisterPage;
import com.krishiconnect.qa.support.Storage;

/** ECP-REG-01 … ECP-REG-15 — registration equivalence classes through the UI. */
class EcpRegistrationTest extends BaseTest {

    private static final String PASSWORD = "farmer2026";

    record Case(String id, String name, String email, String password, String confirm,
                String errorField, String errorCode, String storedEmail) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> cases() {
        String longEmail255 = "a".repeat(243) + "@example.com";
        return Stream.of(
                Arguments.of(new Case("ECP-REG-01", "Asha Rao", "asha.rao.01@example.com",
                        PASSWORD, PASSWORD, null, null, "asha.rao.01@example.com")),
                Arguments.of(new Case("ECP-REG-02", "", "", "", "", null, "MULTI", null)),
                Arguments.of(new Case("ECP-REG-03", "A", "asha.rao.03@example.com",
                        PASSWORD, PASSWORD, "fullName", "TOO_SHORT", null)),
                Arguments.of(new Case("ECP-REG-04", "A".repeat(61), "asha.rao.04@example.com",
                        PASSWORD, PASSWORD, "fullName", "TOO_LONG", null)),
                Arguments.of(new Case("ECP-REG-05", "Asha Rao", "asha.example.com",
                        PASSWORD, PASSWORD, "email", "INVALID_EMAIL", null)),
                Arguments.of(new Case("ECP-REG-06", "Asha Rao", longEmail255,
                        PASSWORD, PASSWORD, "email", "INVALID_EMAIL", null)),
                Arguments.of(new Case("ECP-REG-07", "Asha Rao", "  ASHA.REG.07@EXAMPLE.COM  ",
                        PASSWORD, PASSWORD, null, null, "asha.reg.07@example.com")),
                Arguments.of(new Case("ECP-REG-08", "Asha Rao", "asha.rao.08@example.com",
                        "farm202", "farm202", "password", "PASSWORD_TOO_SHORT", null)),
                Arguments.of(new Case("ECP-REG-09", "Asha Rao", "asha.rao.09@example.com",
                        "a1" + "x".repeat(127), "a1" + "x".repeat(127), "password", "PASSWORD_TOO_LONG", null)),
                Arguments.of(new Case("ECP-REG-10", "Asha Rao", "asha.rao.10@example.com",
                        "farmerpass", "farmerpass", "password", "PASSWORD_WEAK", null)),
                Arguments.of(new Case("ECP-REG-11", "Asha Rao", "asha.rao.11@example.com",
                        "12345678", "12345678", "password", "PASSWORD_WEAK", null)),
                Arguments.of(new Case("ECP-REG-12", "Asha Rao", "asha.rao.12@example.com",
                        PASSWORD, "", "confirmPassword", "REQUIRED", null)),
                Arguments.of(new Case("ECP-REG-13", "Asha Rao", "asha.rao.13@example.com",
                        PASSWORD, "Farmer2026", "confirmPassword", "PASSWORD_MISMATCH", null)),
                Arguments.of(new Case("ECP-REG-15", "Asha Rao", "asha.rao.15@example.com",
                        " abc12345 ", " abc12345 ", null, null, "asha.rao.15@example.com")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Registration equivalence classes")
    void registrationClass(Case testCase) {
        WebDriver driver = driver();
        RegisterPage page = new RegisterPage(driver).open();
        page.fill(testCase.name(), testCase.email(), testCase.password(), testCase.confirm());
        page.submit();

        if (testCase.errorCode() == null) {
            page.waitForOnboarding();
            assertTrue(page.currentUrl().endsWith("/onboarding"),
                    testCase.id() + " should reach onboarding but was " + page.currentUrl());
            var users = Storage.users(driver);
            assertEquals(1, users.size(), testCase.id() + " demo user count");
            assertEquals(testCase.storedEmail(), users.get(0).get("email"),
                    testCase.id() + " stored email must be normalised");
            assertTrue(page.pageContains(testCase.storedEmail()),
                    testCase.id() + " onboarding header must show the stored email");
            return;
        }

        if ("MULTI".equals(testCase.errorCode())) {
            assertEquals("REQUIRED", page.errorCode("fullName"), testCase.id() + " fullName");
            assertEquals("REQUIRED", page.errorCode("email"), testCase.id() + " email");
            assertEquals("REQUIRED", page.errorCode("password"), testCase.id() + " password");
            assertEquals("REQUIRED", page.errorCode("confirmPassword"), testCase.id() + " confirmPassword");
        } else {
            assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                    testCase.id() + " unexpected code for " + testCase.errorField());
        }
        assertTrue(page.currentUrl().endsWith("/register"),
                testCase.id() + " should stay on /register but was " + page.currentUrl());
    }

    @Test
    @DisplayName("ECP-REG-14 duplicate email is rejected by the demo adapter")
    void duplicateEmailRejected() {
        WebDriver driver = driver();
        String email = "asha.dup@example.com";
        new RegisterPage(driver).open()
                .fill("Asha Rao", email, PASSWORD, PASSWORD)
                .submit();
        new RegisterPage(driver).waitForOnboarding();

        // Registration signed the user in; drop the session so /register renders again.
        Storage.clearSession(driver);
        RegisterPage second = new RegisterPage(driver).open();
        second.fill("Asha Rao", email, PASSWORD, PASSWORD);
        second.submit();
        second.waitForAlert();

        assertTrue(second.alertText().contains("already exists"),
                "ECP-REG-14 expected the duplicate-email message but was: " + second.alertText());
        assertTrue(second.currentUrl().endsWith("/register"),
                "ECP-REG-14 should stay on /register but was " + second.currentUrl());
        Map<String, Object> first = Storage.users(driver).get(0);
        assertEquals(email, first.get("email"), "ECP-REG-14 the original account must be unchanged");
    }
}
