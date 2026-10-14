import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmptyState from "./index";

describe("EmptyState Component", () => {
    it("renders title correctly", () => {
        const { getByText, queryByTestId } = render(
            <EmptyState title="Listeniz henüz boş" />
        );

        expect(getByText("Listeniz henüz boş")).toBeTruthy();
        expect(queryByTestId("empty-action-button")).toBeNull();
    });

    it("renders subtitle when provided", () => {
        const { getByText } = render(
            <EmptyState
                title="İçerik bulunamadı"
                subtitle="Keşfetmeye başlayarak ilk öğeleri buraya ekleyin."
                testID="test-empty"
            />
        );

        expect(getByText("İçerik bulunamadı")).toBeTruthy();
        expect(getByText("Keşfetmeye başlayarak ilk öğeleri buraya ekleyin.")).toBeTruthy();
    });

    it("renders action button and handles onPress", () => {
        const handleActionPress = jest.fn();
        const { getByText, getByTestId } = render(
            <EmptyState
                title="Yorum bulunamadı"
                action={{
                    label: "Puanla & Yorum Yap",
                    icon: "star",
                    onPress: handleActionPress,
                    testID: "empty-action-btn",
                }}
            />
        );

        const button = getByTestId("empty-action-btn");
        expect(button).toBeTruthy();
        expect(getByText("Puanla & Yorum Yap")).toBeTruthy();

        fireEvent.press(button);
        expect(handleActionPress).toHaveBeenCalledTimes(1);
    });

    it("renders custom ReactNode icon when provided", () => {
        const { getByTestId } = render(
            <EmptyState
                title="Custom Icon"
                icon={<></>}
                testID="custom-empty"
            />
        );

        expect(getByTestId("custom-empty")).toBeTruthy();
        expect(getByTestId("custom-empty-icon-ring")).toBeTruthy();
    });
});
