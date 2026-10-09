import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Linking, Alert } from "react-native";
import SignupScreen from "@/app/(auth)/signup";

const mockHandleRegister = jest.fn();

jest.mock("@/hooks/auth/useRegister", () => ({
    useRegister: () => ({
        username: "testuser",
        setUsername: jest.fn(),
        email: "test@example.com",
        setEmail: jest.fn(),
        password: "password123",
        setPassword: jest.fn(),
        confirmPassword: "password123",
        setConfirmPassword: jest.fn(),
        isLoading: false,
        error: null,
        handleRegister: mockHandleRegister,
    }),
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/hooks/auth/useGoogleLogin", () => ({
    useGoogleLogin: () => ({
        isLoading: false,
        handleGoogleLogin: jest.fn(),
    }),
}));

describe("SignupScreen Consent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Linking, "openURL").mockImplementation(() => Promise.resolve(true));
        jest.spyOn(Alert, "alert").mockImplementation(() => {});
    });

    it("opens terms of service URL when link is pressed", () => {
        const { getByTestId } = render(<SignupScreen />);
        const termsLink = getByTestId("signup-terms-link");

        fireEvent.press(termsLink);
        expect(Linking.openURL).toHaveBeenCalledWith("https://mensola.app/terms");
    });

    it("opens privacy policy URL when link is pressed", () => {
        const { getByTestId } = render(<SignupScreen />);
        const privacyLink = getByTestId("signup-privacy-link");

        fireEvent.press(privacyLink);
        expect(Linking.openURL).toHaveBeenCalledWith("https://mensola.app/privacy-policy");
    });

    it("does not call handleRegister if terms are not accepted", () => {
        const { getByTestId } = render(<SignupScreen />);
        const submitButton = getByTestId("signup-submit-button");

        fireEvent.press(submitButton);
        expect(mockHandleRegister).not.toHaveBeenCalled();
    });

    it("calls handleRegister once terms checkbox is accepted", () => {
        const { getByTestId } = render(<SignupScreen />);
        const checkbox = getByTestId("signup-terms-checkbox");
        const submitButton = getByTestId("signup-submit-button");

        fireEvent.press(checkbox);
        fireEvent.press(submitButton);

        expect(mockHandleRegister).toHaveBeenCalledTimes(1);
    });
});
