import { logger } from "./logger";
import * as monitoring from "./monitoring";

jest.mock("./monitoring", () => ({
    captureException: jest.fn(),
}));

describe("Logger Utility (utils/logger.ts)", () => {
    const originalDev = (global as any).__DEV__;
    let consoleLogSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleDebugSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleInfoSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleDebugSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        (global as any).__DEV__ = originalDev;
    });

    describe("when in development (__DEV__ === true)", () => {
        beforeEach(() => {
            (global as any).__DEV__ = true;
        });

        it("logs to console.log", () => {
            logger.log("test log", 123);
            expect(consoleLogSpy).toHaveBeenCalledWith("test log", 123);
        });

        it("logs to console.info", () => {
            logger.info("test info", { a: 1 });
            expect(consoleInfoSpy).toHaveBeenCalledWith("test info", { a: 1 });
        });

        it("logs to console.warn", () => {
            logger.warn("test warning");
            expect(consoleWarnSpy).toHaveBeenCalledWith("test warning");
        });

        it("logs to console.debug", () => {
            logger.debug("test debug");
            expect(consoleDebugSpy).toHaveBeenCalledWith("test debug");
        });

        it("logs to console.error and forwards to monitoring", () => {
            const err = new Error("Sample error");
            logger.error("Error occurred", err, { contextKey: "value" });

            expect(consoleErrorSpy).toHaveBeenCalledWith("Error occurred", err, { contextKey: "value" });
            expect(monitoring.captureException).toHaveBeenCalledWith(err, {
                logMessage: "Error occurred",
                contextKey: "value",
            });
        });
    });

    describe("when in production (__DEV__ === false)", () => {
        beforeEach(() => {
            (global as any).__DEV__ = false;
        });

        it("suppresses console.log", () => {
            logger.log("test log");
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it("suppresses console.info", () => {
            logger.info("test info");
            expect(consoleInfoSpy).not.toHaveBeenCalled();
        });

        it("suppresses console.warn", () => {
            logger.warn("test warn");
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("suppresses console.debug", () => {
            logger.debug("test debug");
            expect(consoleDebugSpy).not.toHaveBeenCalled();
        });

        it("suppresses console.error but still forwards to monitoring", () => {
            const err = new Error("Production error");
            logger.error("Something went wrong", err);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(monitoring.captureException).toHaveBeenCalledWith(err, {
                logMessage: "Something went wrong",
            });
        });
    });
});
