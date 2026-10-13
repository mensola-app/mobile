import { useQuery } from "@tanstack/react-query";
import { HomeService, HomeData } from "@/services/home.service";

interface UseHomeReturn {
    data: HomeData | null;
    isLoading: boolean;
    isRefetching: boolean;
    error: string | null;
    refetch: () => Promise<any>;
}

export const useHome = (): UseHomeReturn => {
    const { data, isLoading, isRefetching, error, refetch } = useQuery<HomeData>({
        queryKey: ["homeData"],
        queryFn: async () => {
            const response = await HomeService.getHomeData();
            if (!response.success || !response.data) {
                throw new Error("Veriler yüklenirken bir sorun oluştu.");
            }
            return response.data;
        },
    });

    return {
        data: data ?? null,
        isLoading,
        isRefetching,
        error: error ? (error instanceof Error ? error.message : "Sunucuya bağlanılamadı.") : null,
        refetch,
    };
};
