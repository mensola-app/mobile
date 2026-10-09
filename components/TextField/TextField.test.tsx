import { render, fireEvent } from "@testing-library/react-native";
import TextField from "./index";

describe("TextField Component", () => {
    it("should render label correctly when provided", () => {
        const { getByText, queryByText } = render(
            <TextField label="E-posta" />
        );

        expect(getByText("E-posta")).toBeTruthy();
    });

    it("should not render label when not provided", () => {
        const { queryByText } = render(<TextField />);

        expect(queryByText("E-posta")).toBeNull();
    });

    it("should apply email preset props correctly", () => {
        const { getByPlaceholderText } = render(
            <TextField type="email" placeholder="E-postanızı girin" />
        );

        const input = getByPlaceholderText("E-postanızı girin");

        expect(input.props.keyboardType).toBe("email-address");
        expect(input.props.autoCapitalize).toBe("none");
        expect(input.props.autoCorrect).toBe(false);
    });

    it("should apply password preset props correctly", () => {
        const { getByPlaceholderText } = render(
            <TextField type="password" placeholder="Şifreniz" />
        );

        const input = getByPlaceholderText("Şifreniz");

        expect(input.props.secureTextEntry).toBe(true);
        expect(input.props.autoCapitalize).toBe("none");
    });

    it("should call onChangeText when user types", () => {
        const mockOnChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <TextField placeholder="Yazın..." onChangeText={mockOnChangeText} />
        );

        const input = getByPlaceholderText("Yazın...");

        fireEvent.changeText(input, "mensola");

        expect(mockOnChangeText).toHaveBeenCalledWith("mensola");
    });

    it("should trigger onSubmitEditing when submitted", () => {
        const mockOnSubmitEditing = jest.fn();
        const { getByPlaceholderText } = render(
            <TextField placeholder="Şifreniz" onSubmitEditing={mockOnSubmitEditing} returnKeyType="go" />
        );

        const input = getByPlaceholderText("Şifreniz");
        fireEvent(input, "submitEditing");

        expect(mockOnSubmitEditing).toHaveBeenCalled();
        expect(input.props.returnKeyType).toBe("go");
    });
});
