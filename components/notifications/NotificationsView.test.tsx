import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NotificationsView from "./NotificationsView";
import { NotificationItem } from "./types";

describe("NotificationsView Component", () => {
    const mockNotifications: NotificationItem[] = [
        {
            id: "1",
            type: "follow_request",
            actor: { id: "u1", username: "alex", fullName: "Alex Smith" },
            createdAt: "5m ago",
            isRead: false,
        },
        {
            id: "2",
            type: "follow",
            actor: { id: "u2", username: "emma", fullName: "Emma Watson" },
            createdAt: "10m ago",
            isRead: true,
        },
    ];

    it("renders empty state when notification list is empty", () => {
        const { getByTestId } = render(<NotificationsView notifications={[]} />);

        expect(getByTestId("notification-empty-state")).toBeTruthy();
    });

    it("renders list of follow requests and notifications", () => {
        const onAcceptRequest = jest.fn();
        const onPressNotification = jest.fn();

        const { getByText, getByTestId } = render(
            <NotificationsView
                notifications={mockNotifications}
                onAcceptRequest={onAcceptRequest}
                onPressNotification={onPressNotification}
            />
        );

        expect(getByText("Alex Smith")).toBeTruthy();
        expect(getByText("Emma Watson ")).toBeTruthy();

        fireEvent.press(getByTestId("accept-request-1"));
        expect(onAcceptRequest).toHaveBeenCalledWith("1");

        fireEvent.press(getByTestId("notification-row-2"));
        expect(onPressNotification).toHaveBeenCalledWith(mockNotifications[1]);
    });

    it("renders RefreshControl and passes refreshing and onRefresh props", () => {
        const onRefresh = jest.fn();
        const { getByTestId } = render(
            <NotificationsView
                notifications={mockNotifications}
                onRefresh={onRefresh}
                refreshing={true}
            />
        );

        const flatList = getByTestId("notifications-flatlist");
        expect(flatList.props.refreshControl).toBeTruthy();
        expect(flatList.props.refreshControl.props.refreshing).toBe(true);
        expect(flatList.props.refreshControl.props.onRefresh).toBe(onRefresh);
    });
});
