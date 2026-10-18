import { renderHook, act, waitFor } from "@testing-library/react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { setupNetworkListener, useNetworkStatus } from "./network";

jest.mock("@react-native-community/netinfo", () => {
    let listener: ((state: any) => void) | null = null;
    return {
        addEventListener: jest.fn((cb) => {
            listener = cb;
            return jest.fn();
        }),
        fetch: jest.fn(() =>
            Promise.resolve({
                isConnected: true,
                isInternetReachable: true,
                type: "wifi",
            }),
        ),
        __triggerState: (state: any) => {
            if (listener) listener(state);
        },
    };
});

describe("network utility", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("setupNetworkListener", () => {
        it("registers NetInfo listener with onlineManager and updates online state", () => {
            const setOnlineSpy = jest.spyOn(onlineManager, "setOnline");

            setupNetworkListener();

            expect(NetInfo.addEventListener).toHaveBeenCalled();

            // Simulate offline event
            act(() => {
                (NetInfo as any).__triggerState({
                    isConnected: false,
                    isInternetReachable: false,
                    type: "none",
                });
            });

            expect(setOnlineSpy).toHaveBeenCalledWith(false);

            // Simulate back online
            act(() => {
                (NetInfo as any).__triggerState({
                    isConnected: true,
                    isInternetReachable: true,
                    type: "wifi",
                });
            });

            expect(setOnlineSpy).toHaveBeenCalledWith(true);

            setOnlineSpy.mockRestore();
        });
    });

    describe("useNetworkStatus hook", () => {
        it("initializes with online status and transitions to offline and back online", async () => {
            const { result } = renderHook(() => useNetworkStatus());

            await waitFor(() => {
                expect(result.current.isOnline).toBe(true);
            });
            expect(result.current.hasBeenOffline).toBe(false);

            // Go offline
            act(() => {
                (NetInfo as any).__triggerState({
                    isConnected: false,
                    isInternetReachable: false,
                    type: "none",
                });
            });

            expect(result.current.isOnline).toBe(false);
            expect(result.current.hasBeenOffline).toBe(true);

            // Come back online
            act(() => {
                (NetInfo as any).__triggerState({
                    isConnected: true,
                    isInternetReachable: true,
                    type: "cellular",
                });
            });

            expect(result.current.isOnline).toBe(true);
            expect(result.current.hasBeenOffline).toBe(true);
        });
    });
});
