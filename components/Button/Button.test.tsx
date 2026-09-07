import { render, fireEvent } from "@testing-library/react-native";
import Button from "./index";

describe("Button Component", () => {
    it("should render label correctly", () => {
        const { getByText } = render(
            <Button label="Giriş Yap" onPress={() => {}} />
        );

        expect(getByText("Giriş Yap")).toBeTruthy();
    });

    it("should call onPress when pressed", () => {
        const mockOnPress = jest.fn();

        const { getByText } = render(
            <Button label="Giriş Yap" onPress={mockOnPress} />
        );

        const button = getByText("Giriş Yap");
        fireEvent.press(button);

        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("should render ActivityIndicator and not call onPress when loading", () => {
        const mockOnPress = jest.fn();

        const { queryByText, UNSAFE_getByType } = render(
            <Button label="Giriş Yap" onPress={mockOnPress} loading={true} />
        );

        expect(queryByText("Giriş Yap")).toBeNull();
        expect(mockOnPress).not.toHaveBeenCalled();
    });

    it("should render ActivityIndicator when isLoading is true", () => {
        const mockOnPress = jest.fn();

        const { queryByText } = render(
            <Button label="Giriş Yap" onPress={mockOnPress} isLoading={true} />
        );

        expect(queryByText("Giriş Yap")).toBeNull();
    });

    it("should not call onPress when disabled", () => {
        const mockOnPress = jest.fn();

        const { getByText } = render(
            <Button label="Giriş Yap" onPress={mockOnPress} disabled={true} />
        );

        const button = getByText("Giriş Yap");
        fireEvent.press(button);

        expect(mockOnPress).not.toHaveBeenCalled();
    });
});
