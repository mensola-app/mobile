import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TabBar from "./index";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ bottom: 20, top: 0, left: 0, right: 0 })
}));

jest.mock("../../constants/tabs", () => ({
    TABS_CONFIG: {
        Home: { activeIcon: "home", inactiveIcon: "home-outline" },
        Settings: { activeIcon: "settings", inactiveIcon: "settings-outline" }
    }
}));

describe("TabBar Component", () => {
    const mockEmit = jest.fn();
    const mockNavigate = jest.fn();

    const mockProps = {
        state: {
            index: 0,
            routes: [
                { key: "home-key", name: "Home" },
                { key: "settings-key", name: "Settings" }
            ]
        },
        navigation: {
            emit: mockEmit,
            navigate: mockNavigate
        }
    } as unknown as BottomTabBarProps;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("tüm rotaları (tab butonlarını) doğru şekilde render etmeli", () => {
        const { getByTestId } = render(<TabBar {...mockProps} />);

        expect(getByTestId("tab-button-Home")).toBeTruthy();
        expect(getByTestId("tab-button-Settings")).toBeTruthy();
    });

    it("aktif olmayan bir taba basıldığında navigate fonksiyonunu tetiklemeli", () => {
        mockEmit.mockReturnValue({ defaultPrevented: false });

        const { getByTestId } = render(<TabBar {...mockProps} />);

        fireEvent.press(getByTestId("tab-button-Settings"));

        expect(mockEmit).toHaveBeenCalledWith({
            type: "tabPress",
            target: "settings-key",
            canPreventDefault: true
        });

        expect(mockNavigate).toHaveBeenCalledWith("Settings");
    });

    it("zaten aktif olan bir taba basıldığında yeniden navigate etmemeli", () => {
        mockEmit.mockReturnValue({ defaultPrevented: false });

        const { getByTestId } = render(<TabBar {...mockProps} />);

        fireEvent.press(getByTestId("tab-button-Home"));

        expect(mockEmit).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("eğer event.defaultPrevented true dönerse navigate etmemeli", () => {
        mockEmit.mockReturnValue({ defaultPrevented: true });

        const { getByTestId } = render(<TabBar {...mockProps} />);

        fireEvent.press(getByTestId("tab-button-Settings"));

        expect(mockEmit).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("tabBarBadge olduğunda rozeti render etmeli", () => {
        const propsWithBadge = {
            ...mockProps,
            descriptors: {
                "settings-key": {
                    options: {
                        tabBarBadge: true,
                    },
                },
            },
        } as unknown as BottomTabBarProps;

        const { getByTestId } = render(<TabBar {...propsWithBadge} />);
        expect(getByTestId("tab-badge-Settings")).toBeTruthy();
    });

    it("tabBarStyle display none olduğunda null dönmeli", () => {
        const propsWithHiddenTabBar = {
            ...mockProps,
            descriptors: {
                "home-key": {
                    options: {
                        tabBarStyle: { display: "none" },
                    },
                },
            },
        } as unknown as BottomTabBarProps;

        const { queryByTestId } = render(<TabBar {...propsWithHiddenTabBar} />);
        expect(queryByTestId("tab-button-Home")).toBeNull();
    });

    it("odaklanılan alt ekran [statType] olduğunda null dönmeli", () => {
        const propsWithNestedStatType = {
            ...mockProps,
            state: {
                index: 0,
                routes: [
                    {
                        key: "home-key",
                        name: "Home",
                        state: {
                            index: 1,
                            routes: [{ name: "index" }, { name: "[statType]" }],
                        },
                    },
                    { key: "settings-key", name: "Settings" },
                ],
            },
        } as unknown as BottomTabBarProps;

        const { queryByTestId } = render(<TabBar {...propsWithNestedStatType} />);
        expect(queryByTestId("tab-button-Home")).toBeNull();
    });
});
