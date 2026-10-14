import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Animated, AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useQueryClient } from "@tanstack/react-query";
import { ImportService } from "@/services/import.service";
import { ImportJobProgress, ImportType } from "@/types/import.types";
import { logger } from "@/utils/logger";

export interface UseImportJobOptions<TStep extends string> {
    storageKey: string;
    keepAwakeTag: string;
    isVisible: boolean;
    defaultStep: TStep;
    onSuccessQueryKeys?: string[][];
    onSuccess?: () => void;
    genericErrorMessage: string;
    pollingIntervalMs?: number;
    maxConsecutiveErrors?: number;
    maxJobDurationMs?: number;
}

export function useImportJob<TStep extends string>(options: UseImportJobOptions<TStep>) {
    const {
        storageKey,
        keepAwakeTag,
        isVisible,
        defaultStep,
        pollingIntervalMs = 2500,
        maxConsecutiveErrors = 3,
        maxJobDurationMs = 15 * 60 * 1000,
    } = options;

    const queryClient = useQueryClient();
    const queryClientRef = useRef(queryClient);
    queryClientRef.current = queryClient;

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const [step, setStep] = useState<TStep>(defaultStep);
    const [jobId, setJobId] = useState<string | null>(null);
    const [progressData, setProgressData] = useState<ImportJobProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [animatedProgress] = useState(() => new Animated.Value(0));
    const isPollingActiveRef = useRef<boolean>(false);
    const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const consecutiveErrorsRef = useRef<number>(0);
    const jobStartTimeRef = useRef<number | null>(null);
    const jobIdRef = useRef<string | null>(jobId);

    // Keep jobIdRef in sync
    useEffect(() => {
        jobIdRef.current = jobId;
    }, [jobId]);

    const progressWidth = useMemo(
        () =>
            animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
            }),
        [animatedProgress],
    );

    const percent = useMemo(() => {
        if (!progressData || progressData.totalItems <= 0) return 0;
        return Math.min(100, Math.round((progressData.processedItems / progressData.totalItems) * 100));
    }, [progressData]);

    const stopPolling = useCallback(() => {
        isPollingActiveRef.current = false;
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
        }
        consecutiveErrorsRef.current = 0;
    }, []);

    const schedulePoll = useCallback(
        (delayMs: number, pollFn: () => Promise<void>) => {
            if (!isPollingActiveRef.current) return;
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
            pollingTimeoutRef.current = setTimeout(() => {
                pollFn();
            }, delayMs);
        },
        [],
    );

    const startPolling = useCallback(
        (targetJobId: string) => {
            stopPolling();
            isPollingActiveRef.current = true;
            jobIdRef.current = targetJobId;
            consecutiveErrorsRef.current = 0;
            if (!jobStartTimeRef.current) {
                jobStartTimeRef.current = Date.now();
            }

            const poll = async () => {
                if (!isPollingActiveRef.current || !jobIdRef.current) return;

                const currentOpts = optionsRef.current;
                const maxDuration = currentOpts.maxJobDurationMs ?? maxJobDurationMs;
                const genericError = currentOpts.genericErrorMessage;
                const initialStep = currentOpts.defaultStep;

                // Max job duration timeout protection
                if (jobStartTimeRef.current && Date.now() - jobStartTimeRef.current > maxDuration) {
                    stopPolling();
                    await AsyncStorage.removeItem(storageKey).catch(() => {});
                    setError(genericError);
                    setStep(initialStep);
                    logger.warn("Import job timed out after maximum duration", { jobId: jobIdRef.current });
                    return;
                }

                try {
                    const data = await ImportService.getImportProgress(jobIdRef.current);
                    if (!isPollingActiveRef.current) return;

                    consecutiveErrorsRef.current = 0;
                    setProgressData(data);

                    if (data.status === "completed") {
                        stopPolling();
                        await AsyncStorage.removeItem(storageKey).catch(() => {});
                        setStep("completed" as TStep);

                        if (currentOpts.onSuccessQueryKeys) {
                            for (const qk of currentOpts.onSuccessQueryKeys) {
                                queryClientRef.current.invalidateQueries({ queryKey: qk });
                            }
                        }
                        currentOpts.onSuccess?.();
                        return;
                    }

                    if (data.status === "failed") {
                        stopPolling();
                        await AsyncStorage.removeItem(storageKey).catch(() => {});
                        setStep(initialStep);
                        setError(genericError);
                        return;
                    }

                    // Scheduled next poll when current request succeeds
                    const interval = currentOpts.pollingIntervalMs ?? pollingIntervalMs;
                    schedulePoll(interval, poll);
                } catch (err: any) {
                    if (!isPollingActiveRef.current) return;

                    consecutiveErrorsRef.current += 1;
                    const errStatus = err?.status || err?.response?.status;
                    const maxErrors = currentOpts.maxConsecutiveErrors ?? maxConsecutiveErrors;

                    if (errStatus === 404) {
                        stopPolling();
                        await AsyncStorage.removeItem(storageKey).catch(() => {});
                        setStep(initialStep);
                        setError(genericError);
                        return;
                    }

                    if (consecutiveErrorsRef.current >= maxErrors) {
                        stopPolling();
                        await AsyncStorage.removeItem(storageKey).catch(() => {});
                        setStep(initialStep);
                        setError(genericError);
                        logger.warn("Import job stopped due to consecutive polling errors", {
                            jobId: jobIdRef.current,
                            errors: consecutiveErrorsRef.current,
                        });
                        return;
                    }

                    // Exponential backoff for temporary network errors: 2.5s, 5s, 7.5s...
                    const interval = currentOpts.pollingIntervalMs ?? pollingIntervalMs;
                    const backoffDelay = interval * (1 + consecutiveErrorsRef.current);
                    schedulePoll(backoffDelay, poll);
                }
            };

            // Run first poll immediately
            poll();
        },
        [
            maxConsecutiveErrors,
            maxJobDurationMs,
            pollingIntervalMs,
            schedulePoll,
            stopPolling,
            storageKey,
        ],
    );

    const hasInitializedRef = useRef<boolean>(false);

    // Check for existing active job when modal becomes visible
    useEffect(() => {
        let isMounted = true;
        if (isVisible) {
            if (hasInitializedRef.current) return;
            hasInitializedRef.current = true;

            AsyncStorage.getItem(storageKey)
                .then(async (savedJobId) => {
                    if (!isMounted) return;
                    if (savedJobId && !jobIdRef.current) {
                        setJobId(savedJobId);
                        jobIdRef.current = savedJobId;
                        try {
                            const status = await ImportService.getImportProgress(savedJobId);
                            if (!isMounted) return;
                            setProgressData(status);
                            if (status.status === "completed") {
                                await AsyncStorage.removeItem(storageKey).catch(() => {});
                                setStep("completed" as TStep);
                            } else if (status.status === "failed") {
                                await AsyncStorage.removeItem(storageKey).catch(() => {});
                                setStep(defaultStep);
                                setError(optionsRef.current.genericErrorMessage);
                            } else {
                                setStep("progress" as TStep);
                            }
                        } catch (fetchErr: any) {
                            if (!isMounted) return;
                            const status = fetchErr?.status || fetchErr?.response?.status;
                            if (status === 404) {
                                await AsyncStorage.removeItem(storageKey).catch(() => {});
                                setStep(defaultStep);
                            } else {
                                setStep("progress" as TStep);
                            }
                        }
                    } else if (!jobIdRef.current) {
                        setStep((prev) =>
                            prev === "uploading" || prev === "progress" || prev === "completed"
                                ? prev
                                : defaultStep,
                        );
                    }
                })
                .catch(() => {
                    if (isMounted && !jobIdRef.current) {
                        setStep((prev) =>
                            prev === "uploading" || prev === "progress" || prev === "completed"
                                ? prev
                                : defaultStep,
                        );
                    }
                });
        } else {
            hasInitializedRef.current = false;
            stopPolling();
        }

        return () => {
            isMounted = false;
        };
    }, [defaultStep, isVisible, stopPolling, storageKey]);

    // Keep screen awake while in progress
    useEffect(() => {
        if (step === "progress" && isVisible) {
            activateKeepAwakeAsync(keepAwakeTag).catch(() => {});
        } else {
            deactivateKeepAwake(keepAwakeTag).catch(() => {});
        }
        return () => {
            deactivateKeepAwake(keepAwakeTag).catch(() => {});
        };
    }, [step, isVisible, keepAwakeTag]);

    // Animate progress bar fill
    useEffect(() => {
        if (progressData && progressData.totalItems > 0) {
            const ratio = Math.min(1, progressData.processedItems / progressData.totalItems);
            Animated.timing(animatedProgress, {
                toValue: ratio,
                duration: 400,
                useNativeDriver: false,
            }).start();
        } else if (step === defaultStep) {
            animatedProgress.setValue(0);
        }
    }, [animatedProgress, defaultStep, progressData, step]);

    // Trigger polling when in progress step and visible
    useEffect(() => {
        if (step === "progress" && jobId && isVisible) {
            if (!isPollingActiveRef.current || jobIdRef.current !== jobId) {
                startPolling(jobId);
            }
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [step, jobId, isVisible, startPolling, stopPolling]);

    const wasInBackgroundRef = useRef<boolean>(false);

    // Handle AppState changes (pause polling in background, resume when active)
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
            if (nextState === "background" || nextState === "inactive") {
                wasInBackgroundRef.current = true;
                if (pollingTimeoutRef.current) {
                    clearTimeout(pollingTimeoutRef.current);
                    pollingTimeoutRef.current = null;
                }
            } else if (nextState === "active" && wasInBackgroundRef.current) {
                wasInBackgroundRef.current = false;
                if (isPollingActiveRef.current && jobIdRef.current && step === "progress" && isVisible) {
                    startPolling(jobIdRef.current);
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isVisible, startPolling, step]);

    // Start a brand-new import job
    const startJob = useCallback(
        async (newJobId: string, initialTotalItems = 0, initialType?: ImportType) => {
            hasInitializedRef.current = true;
            setError(null);
            setJobId(newJobId);
            jobIdRef.current = newJobId;
            jobStartTimeRef.current = Date.now();
            setProgressData({
                jobId: newJobId,
                userId: "",
                status: "queued",
                type: initialType,
                totalItems: initialTotalItems,
                processedItems: 0,
                successCount: 0,
                failedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            setStep("progress" as TStep);
            await AsyncStorage.setItem(storageKey, newJobId).catch(() => {});
        },
        [storageKey],
    );

    // Cancel or reset current active job
    const cancelOrResetJob = useCallback(async () => {
        stopPolling();
        await AsyncStorage.removeItem(storageKey).catch(() => {});
        setJobId(null);
        jobIdRef.current = null;
        setProgressData(null);
        setError(null);
        setStep(defaultStep);
        animatedProgress.setValue(0);
    }, [defaultStep, stopPolling, storageKey, animatedProgress]);

    return {
        step,
        setStep,
        jobId,
        setJobId,
        progressData,
        setProgressData,
        error,
        setError,
        progressWidth,
        percent,
        startJob,
        startPolling,
        stopPolling,
        cancelOrResetJob,
    };
}
