package com.krishiconnect.qa.tests.bva;

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
import com.krishiconnect.qa.pages.ProfileFormPage;
import com.krishiconnect.qa.pages.SettingsPage;
import com.krishiconnect.qa.support.Flows;
import com.krishiconnect.qa.support.Storage;

/** BVA-PRO-01 … BVA-PRO-21 — farmer profile boundaries through the onboarding form. */
class BvaProfileTest extends BaseTest {

    private static final String[] FIVE_CROPS = {"Ragi", "Paddy", "Maize", "Jowar", "Groundnut"};

    /**
     * @param errorField       field suffix when the case must be rejected, else {@code null}
     * @param storedFarmArea   expected persisted value for accepted cases, else {@code null}
     * @param expectedCounter  expected crop counter text, else {@code null}
     */
    record Case(String id, String name, String farmArea, String village, String[] crops,
                String irrigation, String taluk, String errorField, String errorCode,
                Double storedFarmArea, String expectedCounter) {
    }

    static Stream<Arguments> cases() {
        return Stream.of(
                Arguments.of(new Case("BVA-PRO-01", null, "0", null, null, null, null,
                        "farmArea", "BELOW_MIN", null, null)),
                Arguments.of(new Case("BVA-PRO-02", null, "0.05", null, null, null, null,
                        "farmArea", "BELOW_MIN", null, null)),
                Arguments.of(new Case("BVA-PRO-03", null, "0.09", null, null, null, null,
                        "farmArea", "BELOW_MIN", null, null)),
                Arguments.of(new Case("BVA-PRO-04", null, "0.1", null, null, null, null,
                        null, null, 0.1, null)),
                Arguments.of(new Case("BVA-PRO-05", null, "0.1001", null, null, null, null,
                        null, null, 0.1001, null)),
                Arguments.of(new Case("BVA-PRO-06", null, "999.99", null, null, null, null,
                        null, null, 999.99, null)),
                Arguments.of(new Case("BVA-PRO-07", null, "1000", null, null, null, null,
                        null, null, 1000.0, null)),
                Arguments.of(new Case("BVA-PRO-08", null, "1000.01", null, null, null, null,
                        "farmArea", "ABOVE_MAX", null, null)),
                Arguments.of(new Case("BVA-PRO-09", null, "1001", null, null, null, null,
                        "farmArea", "ABOVE_MAX", null, null)),
                Arguments.of(new Case("BVA-PRO-10", "A", null, null, null, null, null,
                        "name", "TOO_SHORT", null, null)),
                Arguments.of(new Case("BVA-PRO-11", "AB", null, null, null, null, null,
                        null, null, null, null)),
                Arguments.of(new Case("BVA-PRO-12", "A".repeat(60), null, null, null, null, null,
                        null, null, null, null)),
                Arguments.of(new Case("BVA-PRO-13", "A".repeat(61), null, null, null, null, null,
                        "name", "TOO_LONG", null, null)),
                Arguments.of(new Case("BVA-PRO-14", null, null, null, new String[] {"Ragi"}, null, null,
                        null, null, null, "1/5")),
                Arguments.of(new Case("BVA-PRO-15", null, null, null, FIVE_CROPS, null, null,
                        null, null, null, "5/5")),
                Arguments.of(new Case("BVA-PRO-17", null, null, "V".repeat(80), null, null, null,
                        null, null, null, null)),
                Arguments.of(new Case("BVA-PRO-18", null, null, "V".repeat(81), null, null, null,
                        null, null, null, null)),
                Arguments.of(new Case("BVA-PRO-19", null, null, null, null, "", null,
                        "irrigation", "REQUIRED", null, null)),
                Arguments.of(new Case("BVA-PRO-20", null, null, null, null, null, "",
                        "taluk", "REQUIRED", null, null)),
                Arguments.of(new Case("BVA-PRO-21", "  A  ", null, null, null, null, null,
                        "name", "TOO_SHORT", null, null)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    @DisplayName("Profile boundaries")
    void profileBoundary(Case testCase) {
        WebDriver driver = driver();
        Flows.register(driver, "bva." + testCase.id().toLowerCase() + "." + System.nanoTime() + "@example.com");

        ProfileFormPage form = new ProfileFormPage(driver, "onboarding")
                .fillName(testCase.name() == null ? "BVA Farmer" : testCase.name())
                .fillVillage(testCase.village() == null ? "KRS Halli" : testCase.village())
                .selectDistrict("Mandya")
                .selectTaluk(testCase.taluk() == null ? "Mandya" : testCase.taluk())
                .fillFarmArea(testCase.farmArea() == null ? "1" : testCase.farmArea())
                .selectIrrigation(testCase.irrigation() == null ? "Rainfed" : testCase.irrigation());

        String[] crops = testCase.crops() == null ? new String[] {"Ragi"} : testCase.crops();
        form.selectCrops(crops);

        if (testCase.expectedCounter() != null) {
            assertEquals(testCase.expectedCounter(), form.cropCounterText(),
                    testCase.id() + " unexpected crop counter after selection");
        }

        form.submit();

        if (testCase.errorCode() == null) {
            form.waitForDashboard();
            Map<String, Object> profile = Storage.currentProfile(driver);
            assertTrue(profile != null, testCase.id() + " profile was not persisted");
            if (testCase.storedFarmArea() != null) {
                assertEquals(testCase.storedFarmArea(), ((Number) profile.get("farmArea")).doubleValue(), 0.000001,
                        testCase.id() + " persisted farmArea");
            }
            if (testCase.village() != null) {
                int storedLength = ((String) profile.get("village")).length();
                assertEquals(Math.min(80, testCase.village().length()), storedLength,
                        testCase.id() + " stored village length");
                SettingsPage settings = new SettingsPage(driver).open();
                assertEquals(storedLength, settings.form().villageValue().length(),
                        testCase.id() + " village length on the settings form");
            }
        } else {
            assertEquals(testCase.errorCode(), form.errorCode(testCase.errorField()),
                    testCase.id() + " unexpected error code for " + testCase.errorField());
            assertTrue(form.currentUrl().endsWith("/onboarding"),
                    testCase.id() + " should stay on /onboarding but was " + form.currentUrl());
        }
    }

    /**
     * The source reading suggested the {@code TOO_MANY} error was cleared in the
     * same update (BVA-OBS-04). Execution disproved that: the error is rendered
     * when the sixth crop is clicked, so this case passes. The note is kept here
     * because the doc previously listed it as a candidate defect.
     */
    @Test
    @DisplayName("BVA-PRO-16 a sixth crop must be rejected with TOO_MANY")
    void sixthCropRejected() {
        WebDriver driver = driver();
        Flows.register(driver, "bva.pro.16." + System.nanoTime() + "@example.com");

        ProfileFormPage form = new ProfileFormPage(driver, "onboarding")
                .fillName("BVA Farmer")
                .fillVillage("KRS Halli")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("1")
                .selectIrrigation("Rainfed");
        form.selectCrops(FIVE_CROPS);
        form.toggleCrop("Cotton");

        assertEquals("5/5", form.cropCounterText(), "BVA-PRO-16 the sixth crop must not be selected");
        assertTrue(form.hasError("crops"),
                "BVA-PRO-16 expected TOO_MANY feedback for a sixth crop");
    }
}
