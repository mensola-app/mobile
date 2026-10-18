import React from "react";
import { render, screen, act } from "@testing-library/react-native";
import { OfflineBanner } from "./OfflineBanner";
import * as networkUtils from "@/utils/network";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) => {
            if (key === "common.offlineBanner") return options?.defaultValue || "İnternet bağlantısı yok";
            if (key === "common.onlineBanner") return options?.defaultValue || "Yeniden bağlandı";
            return options?.defaultValue || key;
        },
    }),
}));

jest.mock("@/utils/network", () => ({
    useNetworkStatus: jest.fn(() => ({ isOnline: true, hasBeenOffline: false })),
}));

describe("OfflineBanner Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("renders nothing when device is online and has never been offline", () => {
        const { toJSON } = render(
            <OfflineBanner isOnlineOverride={true} hasBeenOfflineOverride={false} />,
        );
        expect(toJSON()).toBeNull();
    });

    it("renders offline banner with alert text when offline", () => {
        render(<OfflineBanner isOnlineOverride={false} hasBeenOfflineOverride={true} />);

        expect(screen.getByText("İnternet bağlantısı yok")).toBeTruthy();
    });

    it("renders online banner when returning from offline, then auto-hides after timer", () => {
        const { rerender, queryByText } = render(
            <OfflineBanner isOnlineOverride={false} hasBeenOfflineOverride={true} />,
        );

        expect(queryByText("İnternet bağlantısı yok")).toBeTruthy();

        // Switch to online
        rerender(<OfflineBanner isOnlineOverride={true} hasBeenOfflineOverride={true} />);

        expect(queryByText("Yeniden bağlandı")).toBeTruthy();

        // Fast-forward 2.5s timer
        act(() => {
            jest.advanceTimersByTime(2500);
            jest.advanceTimersByTime(350); // animation duration
        });

        expect(queryByText("Yeniden bağlandı")).toBeNull();
    });
});
