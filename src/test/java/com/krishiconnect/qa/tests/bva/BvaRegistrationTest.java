package com.krishiconnect.qa.tests.bva;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.RegisterPage;

/** BVA-REG-01 … BVA-REG-21 — boundaries of validateRegistration through the UI. */
class BvaRegistrationTest extends BaseTest {

    private static final String PASSWORD = "farmer2026";

    record Case(String id, String name, String email, String password, String confirm,
                String errorField, String errorCode) {
    }

    static Stream<Arguments> cases() {
        String a = "A";
        String local254 = "a".repeat(242) + "@example.com";
        String local255 = "a".repeat(243) + "@example.com";
        return Stream.of(
                Arguments.of(new Case("BVA-REG-01", a, "bva.reg.01@example.com", PASSWORD, PASSWORD,
                        "fullName", "TOO_SHORT")),
                Arguments.of(new Case("BVA-REG-02", "AB", "bva.reg.02@example.com", PASSWORD, PASSWORD,
                        null, null)),
                Arguments.of(new Case("BVA-REG-03", "ABC", "bva.reg.03@example.com", PASSWORD, PASSWORD,
                        null, null)),
                Arguments.of(new Case("BVA-REG-04", "A".repeat(59), "bva.reg.04@example.com", PASSWORD, PASSWORD,
                        null, null)),
                Arguments.of(new Case("BVA-REG-05", "A".repeat(60), "bva.reg.05@example.com", PASSWORD, PASSWORD,
                        null, null)),
                Arguments.of(new Case("BVA-REG-06", "A".repeat(61), "bva.reg.06@example.com", PASSWORD, PASSWORD,
                        "fullName", "TOO_LONG")),
                Arguments.of(new Case("BVA-REG-07", "   A   ", "bva.reg.07@example.com", PASSWORD, PASSWORD,
                        "fullName", "TOO_SHORT")),
                Arguments.of(new Case("BVA-REG-08", "BVA Farmer", "bva.reg.08@example.com", "ab12345", "ab12345",
                        "password", "PASSWORD_TOO_SHORT")),
                Arguments.of(new Case("BVA-REG-09", "BVA Farmer", "bva.reg.09@example.com", "ab123456", "ab123456",
                        null, null)),
                Arguments.of(new Case("BVA-REG-10", "BVA Farmer", "bva.reg.10@example.com", "abc123456", "abc123456",
                        null, null)),
                Arguments.of(new Case("BVA-REG-11", "BVA Farmer", "bva.reg.11@example.com",
                        "a1" + "x".repeat(125), "a1" + "x".repeat(125), null, null)),
                Arguments.of(new Case("BVA-REG-12", "BVA Farmer", "bva.reg.12@example.com",
                        "a1" + "x".repeat(126), "a1" + "x".repeat(126), null, null)),
                Arguments.of(new Case("BVA-REG-13", "BVA Farmer", "bva.reg.13@example.com",
                        "a1" + "x".repeat(127), "a1" + "x".repeat(127), "password", "PASSWORD_TOO_LONG")),
                Arguments.of(new Case("BVA-REG-14", "BVA Farmer", "bva.reg.14@example.com", "abc1234", "abc1234",
                        "password", "PASSWORD_TOO_SHORT")),
                Arguments.of(new Case("BVA-REG-15", "BVA Farmer", "bva.reg.15@example.com",
                        "A".repeat(128), "A".repeat(128), "password", "PASSWORD_WEAK")),
                Arguments.of(new Case("BVA-REG-16", "BVA Farmer", local254, PASSWORD, PASSWORD, null, null)),
                Arguments.of(new Case("BVA-REG-17", "BVA Farmer", local255, PASSWORD, PASSWORD,
                        "email", "INVALID_EMAIL")),
                Arguments.of(new Case("BVA-REG-18", "BVA Farmer", "a@b.c", PASSWORD, PASSWORD,
                        "email", "INVALID_EMAIL")),
                Arguments.of(new Case("BVA-REG-19", "BVA Farmer", "a@b.co", PASSWORD, PASSWORD, null, null)),
                Arguments.of(new Case("BVA-REG-20", "BVA Farmer", "bva.reg.20@example.com", PASSWORD,
                        PASSWORD + " ", "confirmPassword", "PASSWORD_MISMATCH")),
                Arguments.of(new Case("BVA-REG-21", "BVA Farmer", "bva.reg.21@example.com", PASSWORD, "",
                        "confirmPassword", "REQUIRED")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Registration boundaries")
    void registrationBoundary(Case testCase) {
        WebDriver driver = driver();
        RegisterPage page = new RegisterPage(driver).open();
        page.fill(testCase.name(), testCase.email(), testCase.password(), testCase.confirm());
        page.submit();

        if (testCase.errorCode() == null) {
            page.waitForOnboarding();
            assertTrue(page.currentUrl().endsWith("/onboarding"),
                    testCase.id() + " should reach onboarding but was " + page.currentUrl());
        } else {
            assertEquals(testCase.errorCode(), page.errorCode(testCase.errorField()),
                    testCase.id() + " unexpected error code for " + testCase.errorField());
            assertTrue(page.currentUrl().endsWith("/register"),
                    testCase.id() + " should stay on /register but was " + page.currentUrl());
        }

        if (testCase.id().equals("BVA-REG-08")) {
            assertFalse(page.hasError("confirmPassword"),
                    "BVA-REG-08 must not also flag confirmPassword");
        }
    }
}
