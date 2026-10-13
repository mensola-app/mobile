import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import ErrorFallback from "./index";
import { captureException } from "@/utils/monitoring";

jest.mock("@/utils/monitoring", () => ({
    captureException: jest.fn(),
}));

describe("ErrorFallback", () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders a fallback UI and reports the error once", () => {
        const error = new Error("boom");
        const { getByText } = render(<ErrorFallback error={error} retry={jest.fn()} />);

        expect(getByText("common.errorBoundaryTitle")).toBeTruthy();
        expect(captureException).toHaveBeenCalledTimes(1);
        expect(captureException).toHaveBeenCalledWith(error, { source: "RootErrorBoundary" });
    });

    it("calls retry when the button is pressed", () => {
        const retry = jest.fn();
        const { getByText } = render(<ErrorFallback error={new Error("boom")} retry={retry} />);

        fireEvent.press(getByText("common.retry"));

        expect(retry).toHaveBeenCalledTimes(1);
    });
});
