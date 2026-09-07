import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ProfileHeader from "./ProfileHeader";
import { useProfileContext } from "../../context/ProfileContext";
import { notificationService } from "@/services/notification.service";

jest.mock("../../context/ProfileContext", () => ({
    useProfileContext: jest.fn(),
}));

const mockInvalidateQueries = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

jest.mock("@/services/notification.service", () => ({
    notificationService: {
        acceptFollowRequest: jest.fn().mockResolvedValue({ success: true }),
        declineFollowRequest: jest.fn().mockResolvedValue({ success: true }),
    },
}));

const mockHandleStatPress = jest.fn();
const mockRefetch = jest.fn().mockResolvedValue(undefined);

describe("ProfileHeader Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should display username, fullname, and bio if they exist", () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-1",
                username: "janedoe",
                fullname: "Jane Doe",
                bio: "Test bio",
                profilePicture: "url",
                stats: {},
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByText } = render(<ProfileHeader />);

        expect(getByText("@janedoe")).toBeTruthy();
        expect(getByText("Jane Doe")).toBeTruthy();
        expect(getByText("Test bio")).toBeTruthy();
    });

    it("should not crash and only display username if fullname and bio are missing", () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-1",
                username: "janedoe",
                profilePicture: "url",
                stats: {},
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByText, queryByText } = render(<ProfileHeader />);

        expect(getByText("@janedoe")).toBeTruthy();
        expect(queryByText("Test bio")).toBeNull();
    });

    it("should render follow request banner when hasPendingRequestFromUser is true", () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-123",
                username: "alex",
                fullname: "Alex Smith",
                stats: {},
                hasPendingRequestFromUser: true,
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByTestId, getByText } = render(<ProfileHeader />);

        expect(getByTestId("profile-follow-request-banner")).toBeTruthy();
        expect(getByTestId("profile-accept-follow-request")).toBeTruthy();
        expect(getByTestId("profile-decline-follow-request")).toBeTruthy();
        expect(getByText("notifications.accept")).toBeTruthy();
        expect(getByText("notifications.decline")).toBeTruthy();
    });

    it("should call acceptFollowRequest when accept button is pressed on banner", async () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-123",
                username: "alex",
                fullname: "Alex Smith",
                stats: {},
                hasPendingRequestFromUser: true,
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByTestId } = render(<ProfileHeader />);

        fireEvent.press(getByTestId("profile-accept-follow-request"));

        await waitFor(() => {
            expect(notificationService.acceptFollowRequest).toHaveBeenCalledWith("user-123");
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it("should call declineFollowRequest when decline button is pressed on banner", async () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-123",
                username: "alex",
                fullname: "Alex Smith",
                stats: {},
                hasPendingRequestFromUser: true,
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByTestId } = render(<ProfileHeader />);

        fireEvent.press(getByTestId("profile-decline-follow-request"));

        await waitFor(() => {
            expect(notificationService.declineFollowRequest).toHaveBeenCalledWith("user-123");
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it("should show alert when taste card button is pressed but user does not have 3 movies and 3 tracks", () => {
        const alertSpy = jest.spyOn(Alert, "alert");

        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-123",
                username: "alex",
                isOwnProfile: true,
                stats: {},
            },
            bodyData: {
                favoriteMovies: [{ id: "m1" }],
                favoriteTracks: [{ id: "t1" }],
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByTestId } = render(<ProfileHeader />);
        const tasteCardBtn = getByTestId("profile-taste-card-button");
        expect(tasteCardBtn).toBeTruthy();

        fireEvent.press(tasteCardBtn);

        expect(alertSpy).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("should navigate to /taste-card when user has at least 3 movies and 3 tracks", () => {
        (useProfileContext as jest.Mock).mockReturnValue({
            headerData: {
                id: "user-123",
                username: "alex",
                fullname: "Alex Smith",
                isOwnProfile: true,
                stats: {},
            },
            bodyData: {
                favoriteMovies: [
                    { id: "m1", title: "Movie 1" },
                    { id: "m2", title: "Movie 2" },
                    { id: "m3", title: "Movie 3" },
                ],
                favoriteTracks: [
                    { id: "t1", title: "Track 1" },
                    { id: "t2", title: "Track 2" },
                    { id: "t3", title: "Track 3" },
                ],
            },
            handleStatPress: mockHandleStatPress,
            refetch: mockRefetch,
        });

        const { getByTestId } = render(<ProfileHeader />);
        const tasteCardBtn = getByTestId("profile-taste-card-button");

        fireEvent.press(tasteCardBtn);

        expect(mockPush).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: "/taste-card",
                params: expect.objectContaining({
                    user: expect.stringContaining("alex"),
                    favoriteMovies: expect.stringContaining("Movie 1"),
                    favoriteTracks: expect.stringContaining("Track 1"),
                }),
            }),
        );
    });
});
