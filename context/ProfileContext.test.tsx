import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import { ProfileProvider, useProfileContext } from "./ProfileContext";
import { useProfile } from "../hooks/profile/useProfile";
import { useGlobalUser } from "@/context/AuthContext";
import { useRouter } from "expo-router";

jest.mock("../hooks/profile/useProfile", () => ({
    useProfile: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
    useGlobalUser: jest.fn(),
}));

jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue || key,
    }),
}));

const mockPush = jest.fn();

const mockProfileData = {
    id: "user-123",
    username: "testuser",
    fullname: "Test User",
    bio: "Hello world",
    avatar: "https://example.com/avatar.jpg",
    favoriteMovies: [{ id: "m1" }, { id: "m2" }, { id: "m3" }, { id: "m4" }],
    favoriteTracks: [{ id: "t1" }, { id: "t2" }],
    mutualFollowers: [],
    isFollowingByMe: false,
    isPendingByMe: false,
    hasPendingRequestFromUser: false,
    hasAccess: true,
    isPrivate: false,
    subscriptionTier: "pro",
    watchedMoviesCount: 42,
    followersCount: 100,
    followingCount: 50,
    likedMoviesCount: 10,
};

describe("ProfileContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (useGlobalUser as jest.Mock).mockReturnValue({
            user: { id: "user-123" },
        });
    });

    it("throws error when useProfileContext is consumed outside ProfileProvider", () => {
        const Consumer = () => {
            useProfileContext();
            return null;
        };

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<Consumer />)).toThrow(
            "useProfileContext must be used within a ProfileProvider",
        );
        consoleSpy.mockRestore();
    });

    it("shows skeleton while loading or when profile is not loaded", () => {
        (useProfile as jest.Mock).mockReturnValue({
            profile: undefined,
            fetchProfile: jest.fn(),
            isLoading: true,
            error: null,
        });

        render(
            <ProfileProvider>
                <Text>Child Content</Text>
            </ProfileProvider>,
        );

        expect(screen.queryByText("Child Content")).toBeNull();
    });

    it("shows error view and retry button when error is present", () => {
        const mockFetchProfile = jest.fn();
        (useProfile as jest.Mock).mockReturnValue({
            profile: undefined,
            fetchProfile: mockFetchProfile,
            isLoading: false,
            error: "Failed to load profile",
        });

        render(
            <ProfileProvider>
                <Text>Child Content</Text>
            </ProfileProvider>,
        );

        expect(screen.getByText("Failed to load profile")).toBeTruthy();
        expect(screen.getByText("Tekrar Deneyin")).toBeTruthy();

        fireEvent.press(screen.getByText("Tekrar Deneyin"));
        expect(mockFetchProfile).toHaveBeenCalledTimes(1);
    });

    it("provides correct headerData, bodyData, footerData and memoizes context value", () => {
        const mockFetchProfile = jest.fn();
        (useProfile as jest.Mock).mockReturnValue({
            profile: mockProfileData,
            fetchProfile: mockFetchProfile,
            isLoading: false,
            error: null,
        });

        let contextInstance1: ReturnType<typeof useProfileContext> | undefined;
        let contextInstance2: ReturnType<typeof useProfileContext> | undefined;

        const Consumer = () => {
            const ctx = useProfileContext();
            if (!contextInstance1) {
                contextInstance1 = ctx;
            } else {
                contextInstance2 = ctx;
            }
            return (
                <>
                    <Text testID="username">{ctx.headerData.username}</Text>
                    <Text testID="isOwn">{String(ctx.isOwnProfile)}</Text>
                    <Text testID="moviesCount">{String(ctx.bodyData.favoriteMovies?.length)}</Text>
                    <TouchableOpacity
                        testID="stat-btn"
                        onPress={() => ctx.handleStatPress("watchedMoviesCount")}>
                        <Text>Stat</Text>
                    </TouchableOpacity>
                </>
            );
        };

        const { rerender } = render(
            <ProfileProvider userId="me">
                <Consumer />
            </ProfileProvider>,
        );

        expect(screen.getByTestId("username").props.children).toBe("testuser");
        expect(screen.getByTestId("isOwn").props.children).toBe("true");
        // Slices to max 3 items
        expect(screen.getByTestId("moviesCount").props.children).toBe("3");

        // Test stat press for own profile
        fireEvent.press(screen.getByTestId("stat-btn"));
        expect(mockPush).toHaveBeenCalledWith("/me/watched");

        // Rerender parent with same props
        rerender(
            <ProfileProvider userId="me">
                <Consumer />
            </ProfileProvider>,
        );

        // Referential equality check: context value should be memoized and identical
        expect(contextInstance1).toBeDefined();
        expect(contextInstance2).toBeDefined();
        expect(contextInstance1).toBe(contextInstance2);
    });

    it("routes to /users/[userId]/... when viewing another user's profile", () => {
        (useGlobalUser as jest.Mock).mockReturnValue({
            user: { id: "user-current" },
        });
        (useProfile as jest.Mock).mockReturnValue({
            profile: { ...mockProfileData, id: "user-other" },
            fetchProfile: jest.fn(),
            isLoading: false,
            error: null,
        });

        const Consumer = () => {
            const ctx = useProfileContext();
            return (
                <TouchableOpacity
                    testID="stat-btn"
                    onPress={() => ctx.handleStatPress("followersCount")}>
                    <Text>Followers</Text>
                </TouchableOpacity>
            );
        };

        render(
            <ProfileProvider userId="user-other">
                <Consumer />
            </ProfileProvider>,
        );

        fireEvent.press(screen.getByTestId("stat-btn"));
        expect(mockPush).toHaveBeenCalledWith("/users/user-other/followers");
    });
});
