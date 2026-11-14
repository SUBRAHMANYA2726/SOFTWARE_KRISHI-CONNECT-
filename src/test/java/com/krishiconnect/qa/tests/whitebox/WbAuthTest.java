package com.krishiconnect.qa.tests.whitebox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.support.JsBridge;

/**
 * WB-REG-01 … WB-REG-06 and WB-LOG-01 … WB-LOG-05 — white-box paths of
 * {@code validateRegistration} (auth.js lines 12–35, V(G) = 7) and
 * {@code validateLogin} (auth.js lines 37–47, V(G) = 4).
 *
 * Registration has seven feasible basis paths covering all 24 edges with
 * affine rank 6 = 24 − 19 + 1: the accepting path, the five single-field error
 * paths, and the combined path (WB-REG-07). The final predicate
 * ({@code errors.length > 0}) is determined by the earlier checks, so a path
 * that records an error and still returns {@code ok:true} is infeasible and is
 * not counted.
 *
 * Login has four feasible s-t paths covering all 13 edges. The first three are
 * the basis of the feasible graph (rank 2 = 13 − 11 + 1); the fourth (both
 * email and password invalid) adds no edge, because the final predicate is
 * determined by the first two, and is kept so that the combined-error state is
 * executed as well.
 */
class WbAuthTest extends BaseTest {

    record RegCase(String id, String fullName, String email, String password, String confirm,
                   String errorField, String errorCode) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> registrationCases() {
        return Stream.of(
                Arguments.of(new RegCase("WB-REG-01", "Asha Rao", "ASHA@Example.com", "farmer2026", "farmer2026", null, null)),
                Arguments.of(new RegCase("WB-REG-02", "A", "asha@example.com", "farmer2026", "farmer2026", "fullName", "TOO_SHORT")),
                Arguments.of(new RegCase("WB-REG-03", "Asha Rao", "asha@", "farmer2026", "farmer2026", "email", "INVALID_EMAIL")),
                Arguments.of(new RegCase("WB-REG-04", "Asha Rao", "asha@example.com", "farm202", "farm202", "password", "PASSWORD_TOO_SHORT")),
                Arguments.of(new RegCase("WB-REG-05", "Asha Rao", "asha@example.com", "farmer2026", "", "confirmPassword", "REQUIRED")),
                Arguments.of(new RegCase("WB-REG-06", "Asha Rao", "asha@example.com", "farmer2026", "Farmer2026", "confirmPassword", "PASSWORD_MISMATCH")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("registrationCases")
    @DisplayName("Paths of validateRegistration")
    void registrationPath(RegCase testCase) {
        Map<String, Object> result = new JsBridge(driver()).validateRegistration(Map.of(
                "fullName", testCase.fullName(),
                "email", testCase.email(),
                "password", testCase.password(),
                "confirmPassword", testCase.confirm()));

        if (testCase.errorField() == null) {
            assertEquals(Boolean.TRUE, result.get("ok"), testCase.id() + " must accept the form");
            Map<String, Object> values = JsBridge.map(result, "values");
            assertEquals("Asha Rao", values.get("fullName"), testCase.id() + " trimmed full name");
            assertEquals("asha@example.com", values.get("email"), testCase.id() + " normalised email");
            assertNull(result.get("errors"), testCase.id() + " no errors on the accepting path");
            return;
        }

        assertEquals(Boolean.FALSE, result.get("ok"), testCase.id() + " must reject the form");
        assertEquals(testCase.errorCode(), JsBridge.fieldError(result, testCase.errorField()),
                testCase.id() + " unexpected error code");
    }

    /**
     * WB-REG-07 is the combined-error path. It adds the last edge pair that the
     * six single-field cases leave unused and makes the seven-path set affinely
     * independent (rank 6 = 24 − 19 + 1).
     */
    @Test
    @DisplayName("WB-REG-07 all four registration fields invalid report four errors")
    void registrationCombinedErrors() {
        Map<String, Object> result = new JsBridge(driver()).validateRegistration(Map.of(
                "fullName", "A",
                "email", "asha@",
                "password", "farm202",
                "confirmPassword", ""));

        assertEquals(Boolean.FALSE, result.get("ok"), "WB-REG-07 must reject the form");
        assertEquals("TOO_SHORT", JsBridge.fieldError(result, "fullName"), "WB-REG-07 fullName");
        assertEquals("INVALID_EMAIL", JsBridge.fieldError(result, "email"), "WB-REG-07 email");
        assertEquals("PASSWORD_TOO_SHORT", JsBridge.fieldError(result, "password"), "WB-REG-07 password");
        assertEquals("REQUIRED", JsBridge.fieldError(result, "confirmPassword"), "WB-REG-07 confirmPassword");
        assertEquals(4, JsBridge.map(result, "errors").size(), "WB-REG-07 all four errors are collected");
        assertNull(result.get("values"), "WB-REG-07 no values are returned when errors exist");
    }

    record LoginCase(String id, String email, String password, String emailCode, String passwordCode) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> loginCases() {
        return Stream.of(
                Arguments.of(new LoginCase("WB-LOG-01", "Asha@Example.com", "farmer2026", null, null)),
                Arguments.of(new LoginCase("WB-LOG-02", "asha@", "farmer2026", "INVALID_EMAIL", null)),
                Arguments.of(new LoginCase("WB-LOG-03", "asha@example.com", "", null, "REQUIRED")),
                Arguments.of(new LoginCase("WB-LOG-04", "asha@", "", "INVALID_EMAIL", "REQUIRED")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("loginCases")
    @DisplayName("Paths of validateLogin")
    void loginPath(LoginCase testCase) {
        Map<String, Object> result = new JsBridge(driver()).validateLogin(Map.of(
                "email", testCase.email(),
                "password", testCase.password()));

        assertEquals(testCase.emailCode() == null && testCase.passwordCode() == null,
                Boolean.TRUE.equals(result.get("ok")), testCase.id() + " ok flag");
        assertEquals(testCase.emailCode(), JsBridge.fieldError(result, "email"), testCase.id() + " email code");
        assertEquals(testCase.passwordCode(), JsBridge.fieldError(result, "password"), testCase.id() + " password code");

        if (testCase.emailCode() == null && testCase.passwordCode() == null) {
            assertEquals("asha@example.com", JsBridge.map(result, "values").get("email"),
                    testCase.id() + " the email is normalised before use");
        }
    }

    /**
     * The login validator only checks {@code !password}, so a whitespace-only
     * password passes client validation. This is recorded as evidence for the
     * observation in ECP-LOG and is not a passing strength rule.
     */
    @Test
    @DisplayName("WB-LOG-05 a whitespace-only password passes validateLogin")
    void whitespacePasswordPasses() {
        Map<String, Object> result = new JsBridge(driver()).validateLogin(Map.of(
                "email", "asha@example.com",
                "password", "   "));

        assertEquals(Boolean.TRUE, result.get("ok"), "WB-LOG-05 the validator does not trim the password");
        assertNull(JsBridge.fieldError(result, "password"), "WB-LOG-05 no password error is produced");
        assertTrue("   ".equals(JsBridge.map(result, "values").get("password")),
                "WB-LOG-05 the raw value reaches the authentication call");
    }
}
