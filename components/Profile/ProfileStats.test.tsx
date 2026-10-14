import { render } from "@testing-library/react-native";
import ProfileStats from "./ProfileStats";
import { StatTypeKey } from "@/types/stat.types";

jest.mock("./ProfileStatItem", () => "StatView");

describe("ProfileStats Component", () => {
    it("should render as many items (StatView) as the provided stats object", () => {
        const mockStats: Partial<Record<StatTypeKey, number>> = {
            followersCount: 100,
            followingCount: 50,
            watchedMoviesCount: 10,
        };

        const { root } = render(<ProfileStats stats={mockStats} />);

        const statItems = root.findAllByType("StatView" as any);
        expect(statItems.length).toBe(3);
    });

    it("should render without errors when stats is undefined or an empty object", () => {
        const { root } = render(<ProfileStats stats={{}} />);
        const statItems = root.findAllByType("StatView" as any);

        expect(statItems.length).toBe(0);
    });
});
