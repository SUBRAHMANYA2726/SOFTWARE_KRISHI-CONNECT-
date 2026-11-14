package com.krishiconnect.qa.core;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

/** Ensures the web app is reachable once per test class. */
public class AppServerExtension implements BeforeAllCallback {

    @Override
    public void beforeAll(ExtensionContext context) {
        AppServer.ensureStarted();
    }
}
