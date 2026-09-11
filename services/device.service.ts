import { client } from "@/api/client";
import { ApiResponse } from "@/types/api";

export interface RegisterDevicePayload {
    pushToken: string;
    locale: string;
    platform?: string;
}

export interface RegisterDeviceResponse {
    id: string;
    locale?: string;
}

export const DeviceService = {
    /**
     * Registers or updates device push token and locale.
     * Returns the database record ID of the device.
     */
    registerDevice: async (data: RegisterDevicePayload): Promise<RegisterDeviceResponse | undefined> => {
        const response = await client.post<ApiResponse<RegisterDeviceResponse>>("/v1/devices", data, { auth: true });
        return response.data;
    },

    /**
     * Updates locale preference for the current registered device.
     */
    updateDeviceLocale: async (deviceId: string, locale: string): Promise<any> => {
        return await client.patch(`/v1/devices/${deviceId}`, { locale }, { auth: true });
    },

    /**
     * Removes the device registration upon user logout.
     */
    deleteDevice: async (deviceId: string): Promise<any> => {
        return await client.delete(`/v1/devices/${deviceId}`, { auth: true });
    },
};
