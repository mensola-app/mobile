import { render } from "@testing-library/react-native";
import ProfileView from "./index";

jest.mock("./ProfileHeader", () => "ProfileHeader");
jest.mock("./ProfileBody", () => "ProfileBody");
jest.mock("./ProfileFooter", () => "ProfileFooter");

jest.mock("@/context/ProfileContext", () => ({
    useProfileContext: () => ({
        hasAccess: true,
        isLoading: false,
        refetch: jest.fn(),
    }),
}));

describe("ProfileView Component", () => {
    it("should render all child components successfully", () => {
        const { UNSAFE_getByType } = render(<ProfileView />);

        expect(UNSAFE_getByType("ProfileHeader" as any)).toBeTruthy();
        expect(UNSAFE_getByType("ProfileBody" as any)).toBeTruthy();
        expect(UNSAFE_getByType("ProfileFooter" as any)).toBeTruthy();
    });
});
