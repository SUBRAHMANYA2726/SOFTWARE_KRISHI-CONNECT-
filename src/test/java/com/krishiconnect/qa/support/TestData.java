package com.krishiconnect.qa.support;

/** Shared input values so the tests never duplicate literals. */
public final class TestData {

    public static final String PASSWORD = "farmer2026";
    public static final String NAME = "BVA Farmer";
    public static final String DISTRICT = "Mandya";
    public static final String TALUK = "Mandya";
    public static final String IRRIGATION = "Rainfed";
    public static final String FARM_AREA = "1";
    public static final String CROP = "Ragi";

    private TestData() {
    }

    /** Demo mode persists users in localStorage, so every accepted case needs a fresh address. */
    public static String uniqueEmail(String prefix) {
        return prefix + "." + System.nanoTime() + "@example.com";
    }
}
