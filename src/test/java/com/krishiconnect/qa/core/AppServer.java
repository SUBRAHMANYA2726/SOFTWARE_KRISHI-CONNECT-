package com.krishiconnect.qa.core;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;

/**
 * Starts the Vite dev server for the suite when it is not already running.
 *
 * The tests never sleep for a fixed UI delay: readiness is polled over HTTP
 * until the server answers or the timeout expires.
 */
public final class AppServer {

    private static Process process;
    private static boolean startedBySuite;

    private AppServer() {
    }

    public static synchronized void ensureStarted() {
        if (isReachable()) {
            return;
        }

        Path frontend = Config.frontendDir();
        if (!Files.isDirectory(frontend.resolve("node_modules"))) {
            throw new IllegalStateException(
                    "Frontend dependencies are missing. Run 'npm install' in " + frontend + " first.");
        }

        Path log = Config.repoRoot().resolve("target").resolve("vite-dev.log");
        try {
            Files.createDirectories(log.getParent());
            ProcessBuilder builder = new ProcessBuilder(
                    "cmd", "/c", "npm", "run", "dev", "--", "--host", "127.0.0.1",
                    "--port", String.valueOf(port()), "--strictPort");
            builder.directory(frontend.toFile());
            builder.redirectErrorStream(true);
            builder.redirectOutput(ProcessBuilder.Redirect.appendTo(log.toFile()));
            process = builder.start();
            startedBySuite = true;
            Runtime.getRuntime().addShutdownHook(new Thread(AppServer::stop));
        } catch (IOException error) {
            throw new IllegalStateException("Could not start the Vite dev server", error);
        }

        waitUntilReachable(Duration.ofSeconds(120));
    }

    public static synchronized void stop() {
        if (process == null || !startedBySuite) {
            return;
        }
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        process.destroy();
        try {
            if (!process.waitFor(10, java.util.concurrent.TimeUnit.SECONDS)) {
                process.destroyForcibly();
            }
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
        process = null;
        startedBySuite = false;
    }

    public static boolean isReachable() {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) URI.create(Config.baseUrl() + "/").toURL().openConnection();
            connection.setConnectTimeout(1000);
            connection.setReadTimeout(2000);
            connection.setRequestMethod("GET");
            int status = connection.getResponseCode();
            return status >= 200 && status < 500;
        } catch (IOException notYet) {
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static int port() {
        URI uri = URI.create(Config.baseUrl());
        return uri.getPort() > 0 ? uri.getPort() : 80;
    }

    private static void waitUntilReachable(Duration timeout) {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            if (!process.isAlive()) {
                throw new IllegalStateException("Vite dev server exited early. See target/vite-dev.log");
            }
            if (isReachable()) {
                return;
            }
            try {
                Thread.sleep(250);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for the Vite dev server", interrupted);
            }
        }
        throw new IllegalStateException("Vite dev server did not answer on " + Config.baseUrl() + " within " + timeout);
    }
}
