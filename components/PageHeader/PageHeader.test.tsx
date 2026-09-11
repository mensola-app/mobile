import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PageHeader from "./index"; 
import { IHeaderAction } from "./types";

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 40, bottom: 0, left: 0, right: 0 })
}));

describe("PageHeader Component", () => {
    const mockNavigation = {
        goBack: jest.fn()
    } as any;

    const defaultProps = {
        navigation: mockNavigation,
        route: { key: "test-route", name: "TestRoute" },
        options: {
            title: "Test Title"
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders header title correctly", () => {
        const { getByText } = render(<PageHeader {...defaultProps} />);

        expect(getByText("Test Title")).toBeTruthy();
    });

    test("does NOT render back button when 'back' prop is undefined", () => {
        const { queryByTestId } = render(
            <PageHeader {...defaultProps} back={undefined} />
        );

        expect(queryByTestId("back-button")).toBeNull();
    });

    test("does NOT render back button when 'options.headerBackVisible' is false even if 'back' prop exists", () => {
        const mockBack = { href: "previous-route" };
        const propsWithHiddenBack = {
            ...defaultProps,
            options: {
                ...defaultProps.options,
                headerBackVisible: false,
            },
        };

        const { queryByTestId } = render(
            <PageHeader {...propsWithHiddenBack} back={mockBack} />
        );

        expect(queryByTestId("back-button")).toBeNull();
    });

    test("renders back button and calls navigation.goBack when pressed", () => {
        const mockBack = { href: "previous-route" };
        
        const { getByTestId } = render(
            <PageHeader {...defaultProps} back={mockBack} />
        );


        const backButton = getByTestId("back-button");
        fireEvent.press(backButton);

        expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });

    test("renders headerRightActions correctly and handles action presses", () => {
        const mockActionPress = jest.fn();

        const mockActions: IHeaderAction[] = [
            {
                id: "search",
                icon: "search-outline",
                onPress: mockActionPress
            }
        ];

        const propsWithActions = {
            ...defaultProps,
            options: {
                ...defaultProps.options,
                headerRightActions: mockActions
            }
        };

        const { getByTestId } = render(<PageHeader {...propsWithActions} />);

        const actionButton = getByTestId("action-button-search");
        expect(actionButton).toBeTruthy();

        fireEvent.press(actionButton);
        expect(mockActionPress).toHaveBeenCalledTimes(1);
    });
});
