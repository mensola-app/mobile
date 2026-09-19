import React from "react";
import { Text, View } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import DynamicList from "./index";

describe("DynamicList Component Unit Tests", () => {
    const mockData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" }
    ];
    const renderItem = ({ item }: { item: (typeof mockData)[0] }) => (
        <Text>{item.name}</Text>
    );

    it("should render items horizontally by default", () => {
        const { getByText, UNSAFE_getByType } = render(
            <DynamicList
                title="Trending"
                data={mockData}
                renderItem={renderItem}
            />
        );

        expect(getByText("Item 1")).toBeTruthy();
        expect(getByText("Item 2")).toBeTruthy();

        const flatList = UNSAFE_getByType(require("react-native").FlatList);
        expect(flatList.props.horizontal).toBe(true);
    });

    it("should render items vertically when variant is set to vertical", () => {
        const { UNSAFE_getByType } = render(
            <DynamicList
                data={mockData}
                renderItem={renderItem}
                variant="vertical"
            />
        );

        const flatList = UNSAFE_getByType(require("react-native").FlatList);
        expect(flatList.props.horizontal).toBe(false);
    });

    it("should display the title and trigger onSeeAllPress callback when clicked", () => {
        const mockPress = jest.fn();
        const { getByText } = render(
            <DynamicList
                title="Latest Movies"
                data={mockData}
                renderItem={renderItem}
                onSeeAllPress={mockPress}
            />
        );

        expect(getByText("Latest Movies")).toBeTruthy();

        const seeAllButton = getByText("common.seeAll");
        fireEvent.press(seeAllButton);

        expect(mockPress).toHaveBeenCalledTimes(1);
    });

    it("should render custom separator when provided as a prop", () => {
        const CustomSeparator = () => (
            <View testID="custom-separator" style={{ height: 2 }} />
        );

        const { UNSAFE_getByType } = render(
            <DynamicList
                data={mockData}
                renderItem={renderItem}
                ItemSeparatorComponent={CustomSeparator}
            />
        );

        const flatList = UNSAFE_getByType(require("react-native").FlatList);
        expect(flatList.props.ItemSeparatorComponent).toBe(CustomSeparator);
    });
});
