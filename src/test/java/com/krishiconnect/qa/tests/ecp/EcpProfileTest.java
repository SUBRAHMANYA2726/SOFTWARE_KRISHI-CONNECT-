package com.krishiconnect.qa.tests.ecp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;

import com.krishiconnect.qa.core.BaseTest;
import com.krishiconnect.qa.pages.DashboardPage;
import com.krishiconnect.qa.pages.ProfileFormPage;
import com.krishiconnect.qa.pages.SettingsPage;
import com.krishiconnect.qa.support.Flows;
import com.krishiconnect.qa.support.JsBridge;
import com.krishiconnect.qa.support.Storage;

/**
 * ECP-PRO-01 … ECP-PRO-18 — farmer profile equivalence classes.
 *
 * Every UI case starts from a freshly registered account so the onboarding
 * form is genuinely empty rather than pre-filled by a prior case.
 */
class EcpProfileTest extends BaseTest {

    private static final String[] FIVE_CROPS = {"Ragi", "Paddy", "Maize", "Jowar", "Groundnut"};

    private ProfileFormPage startOnboarding() {
        Flows.register(driver(), "ecp.pro." + System.nanoTime() + "@example.com");
        return new ProfileFormPage(driver(), "onboarding");
    }

    private ProfileFormPage validProfile() {
        return startOnboarding()
                .fillName("Asha Rao")
                .fillVillage("KRS Halli")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi", "Paddy");
    }

    record Case(String id, String name, String farmArea, String errorSuffix, String errorCode) {
        @Override
        public String toString() {
            return id;
        }
    }

    static Stream<Arguments> rejectionCases() {
        return Stream.of(
                Arguments.of(new Case("ECP-PRO-02", "", null, "name", "REQUIRED")),
                Arguments.of(new Case("ECP-PRO-03", "A", null, "name", "TOO_SHORT")),
                Arguments.of(new Case("ECP-PRO-04", "A".repeat(61), null, "name", "TOO_LONG")),
                Arguments.of(new Case("ECP-PRO-09", null, "", "farmArea", "REQUIRED")),
                Arguments.of(new Case("ECP-PRO-10", null, "0", "farmArea", "BELOW_MIN")),
                Arguments.of(new Case("ECP-PRO-11", null, "1000.5", "farmArea", "ABOVE_MAX")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("rejectionCases")
    @DisplayName("Profile field equivalence classes are rejected")
    void rejectedClass(Case testCase) {
        ProfileFormPage form = validProfile();
        if (testCase.name() != null) {
            form.fillName(testCase.name());
        }
        if (testCase.farmArea() != null) {
            form.fillFarmArea(testCase.farmArea());
        }
        form.submit();

        assertEquals(testCase.errorCode(), form.errorCode(testCase.errorSuffix()),
                testCase.id() + " unexpected error code for " + testCase.errorSuffix());
        assertTrue(form.currentUrl().endsWith("/onboarding"),
                testCase.id() + " should stay on /onboarding but was " + form.currentUrl());
    }

    @Test
    @DisplayName("ECP-PRO-01 a fully valid profile is saved and shown on the dashboard")
    void validProfileSaved() {
        WebDriver driver = driver();
        validProfile().submit();

        new DashboardPage(driver).waitForLoad();
        String panel = new DashboardPage(driver).profilePanel();
        assertTrue(panel.contains("Asha Rao"), "ECP-PRO-01 profile name missing: " + panel);
        assertTrue(panel.contains("Mandya"), "ECP-PRO-01 district/taluk missing: " + panel);
        assertFalse(new ProfileFormPage(driver, "onboarding").hasError("name"),
                "ECP-PRO-01 no field error should remain");

        Map<String, Object> profile = Storage.currentProfile(driver);
        assertTrue(profile != null, "ECP-PRO-01 profile was not persisted");
        assertEquals("Asha Rao", profile.get("fullName"));
        assertEquals(2.5, ((Number) profile.get("farmArea")).doubleValue(), 0.000001);
    }

    @Test
    @DisplayName("ECP-PRO-05 missing district is rejected and the taluk stays disabled")
    void missingDistrict() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .fillVillage("KRS Halli")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi", "Paddy");

        assertTrue(form.isTalukDisabled(), "ECP-PRO-05 taluk must be disabled until a district is chosen");
        form.submit();
        assertEquals("REQUIRED", form.errorCode("district"), "ECP-PRO-05 district error");
        assertTrue(form.currentUrl().endsWith("/onboarding"), "ECP-PRO-05 should stay on /onboarding");
    }

    @Test
    @DisplayName("ECP-PRO-06 missing taluk is rejected")
    void missingTaluk() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .fillVillage("KRS Halli")
                .selectDistrict("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi", "Paddy");
        form.submit();

        assertEquals("REQUIRED", form.errorCode("taluk"), "ECP-PRO-06 taluk error");
        assertTrue(form.currentUrl().endsWith("/onboarding"), "ECP-PRO-06 should stay on /onboarding");
    }

    @Test
    @DisplayName("ECP-PRO-07 changing the district clears the selected taluk")
    void districtChangeResetsTaluk() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .fillVillage("KRS Halli")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi", "Paddy");

        form.selectDistrict("Mysuru");
        assertEquals("", form.talukValue(), "ECP-PRO-07 taluk must be cleared when the district changes");
        form.submit();
        assertEquals("REQUIRED", form.errorCode("taluk"), "ECP-PRO-07 taluk must become required again");
    }

    @Test
    @DisplayName("ECP-PRO-08 a taluk from another district is rejected by the validator")
    void talukFromOtherDistrictRejected() {
        JsBridge bridge = new JsBridge(driver());
        Map<String, Object> result = bridge.validateProfile(Map.of(
                "fullName", "Asha Rao",
                "village", "KRS Halli",
                "district", "Mandya",
                "taluk", "Mysuru",
                "language", "en",
                "farmArea", "2.5",
                "irrigation", "Canal",
                "primaryCrops", java.util.List.of("Ragi", "Paddy")));

        assertEquals(Boolean.FALSE, result.get("ok"));
        assertEquals("INVALID_SELECTION", JsBridge.fieldError(result, "taluk"),
                "ECP-PRO-08 taluk must be rejected, not required");
        assertNull(JsBridge.fieldError(result, "district"),
                "ECP-PRO-08 the district itself is valid");
    }

    @ParameterizedTest(name = "ECP-PRO-12 farmArea {0}")
    @ValueSource(strings = {"0.1", "1000"})
    @DisplayName("ECP-PRO-12 boundary-valid farm areas are accepted")
    void boundaryFarmAreasAccepted(String farmArea) {
        WebDriver driver = driver();
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea(farmArea)
                .selectIrrigation("Rainfed")
                .selectCrops("Ragi");
        form.submit();
        form.waitForDashboard();

        Map<String, Object> profile = Storage.currentProfile(driver);
        assertEquals(Double.parseDouble(farmArea), ((Number) profile.get("farmArea")).doubleValue(), 0.000001,
                "ECP-PRO-12 persisted farmArea for " + farmArea);
    }

    @Test
    @DisplayName("ECP-PRO-13 missing irrigation is rejected")
    void missingIrrigation() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectCrops("Ragi");
        form.submit();

        assertEquals("REQUIRED", form.errorCode("irrigation"), "ECP-PRO-13 irrigation error");
    }

    @Test
    @DisplayName("ECP-PRO-14 at least one crop is required")
    void noCropsRejected() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal");
        form.submit();

        assertEquals("REQUIRED", form.errorCode("crops"), "ECP-PRO-14 crops error");
    }

    @Test
    @DisplayName("ECP-PRO-15 a sixth crop is refused with TOO_MANY feedback")
    void sixthCropRejected() {
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal");
        form.selectCrops(FIVE_CROPS);
        assertEquals("5/5", form.cropCounterText(), "ECP-PRO-15 five crops must be selected");

        form.toggleCrop("Cotton");
        assertEquals("5/5", form.cropCounterText(), "ECP-PRO-15 the sixth crop must not be added");
        assertTrue(form.hasError("crops"), "ECP-PRO-15 expected TOO_MANY feedback for the sixth crop");
    }

    @Test
    @DisplayName("ECP-PRO-16 a single crop is enough to save the profile")
    void singleCropAccepted() {
        WebDriver driver = driver();
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi");
        form.submit();
        form.waitForDashboard();

        assertTrue(new DashboardPage(driver).profilePanel().contains("Asha Rao"),
                "ECP-PRO-16 profile should be saved with one crop");
    }

    @Test
    @DisplayName("ECP-PRO-17 an 81-character village is silently truncated to 80")
    void villageTruncated() {
        WebDriver driver = driver();
        String village = "V".repeat(81);
        ProfileFormPage form = startOnboarding()
                .fillName("Asha Rao")
                .fillVillage(village)
                .selectDistrict("Mandya")
                .selectTaluk("Mandya")
                .fillFarmArea("2.5")
                .selectIrrigation("Canal")
                .selectCrops("Ragi");
        form.submit();
        form.waitForDashboard();

        Map<String, Object> profile = Storage.currentProfile(driver);
        assertEquals(80, ((String) profile.get("village")).length(),
                "ECP-PRO-17 persisted village must be 80 characters");
        assertEquals(80, new SettingsPage(driver).open().form().villageValue().length(),
                "ECP-PRO-17 the settings form must reload the truncated value");
    }

    @Test
    @DisplayName("ECP-PRO-18 settings persist an edited farm area")
    void settingsPersistEdit() {
        WebDriver driver = driver();
        String uid = "demo_ecp_pro18";
        Storage.seedSession(driver, uid, "ecp.pro18@example.com", "Asha Rao");
        Storage.seedProfile(driver, uid, "Ragi");

        SettingsPage settings = new SettingsPage(driver).open();
        settings.form().fillFarmArea("3.5");
        String toast = settings.saveAndWaitForToast();

        assertEquals("Farm profile updated.", toast, "ECP-PRO-18 success toast");
        SettingsPage reloaded = new SettingsPage(driver).open();
        assertEquals("3.5", reloaded.form().farmAreaValue(), "ECP-PRO-18 the value must survive a reload");
        Map<String, Object> profile = Storage.currentProfile(driver);
        assertEquals(3.5, ((Number) profile.get("farmArea")).doubleValue(), 0.000001,
                "ECP-PRO-18 persisted farmArea");
    }
}
