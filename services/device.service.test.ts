import { DeviceService } from "./device.service";
import { client } from "@/api/client";

jest.mock("@/api/client", () => ({
    client: {
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("DeviceService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call POST /v1/devices on registerDevice", async () => {
        (client.post as jest.Mock).mockResolvedValue({
            success: true,
            data: { id: "dev-123", locale: "tr" },
        });

        const res = await DeviceService.registerDevice({
            pushToken: "ExponentPushToken[abc]",
            locale: "tr",
            platform: "ios",
        });

        expect(client.post).toHaveBeenCalledWith(
            "/v1/devices",
            {
                pushToken: "ExponentPushToken[abc]",
                locale: "tr",
                platform: "ios",
            },
            { auth: true },
        );
        expect(res).toEqual({ id: "dev-123", locale: "tr" });
    });

    it("should call PATCH /v1/devices/:id on updateDeviceLocale", async () => {
        (client.patch as jest.Mock).mockResolvedValue({
            success: true,
            data: { id: "dev-123", locale: "en" },
        });

        await DeviceService.updateDeviceLocale("dev-123", "en");

        expect(client.patch).toHaveBeenCalledWith(
            "/v1/devices/dev-123",
            { locale: "en" },
            { auth: true },
        );
    });

    it("should call DELETE /v1/devices/:id on deleteDevice", async () => {
        (client.delete as jest.Mock).mockResolvedValue({
            success: true,
        });

        await DeviceService.deleteDevice("dev-123");

        expect(client.delete).toHaveBeenCalledWith(
            "/v1/devices/dev-123",
            { auth: true },
        );
    });
});
