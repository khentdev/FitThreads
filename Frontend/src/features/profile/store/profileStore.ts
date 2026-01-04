import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { computed, reactive, ref, watchEffect } from 'vue';
import type { ErrorResponse } from '../../../core/errors';
import { errorHandler } from '../../../core/errors/errorHandler';
import { useToast } from '../../../shared/composables/toast/useToast';
import { useAuthStore } from '../../auth/store/authStore';
import * as PROFILE_ERROR_CODES from '../errors/profileErrorCodes';
import { profileService } from '../service';
import type { UserProfile } from '../types';
import { useRouter } from 'vue-router';

export const useProfileStore = defineStore('profile', () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const authStore = useAuthStore();
    const router = useRouter()

    const errors = reactive({
        profileFetchFailed: false,
        profileNotFound: false,
        serverError: false
    })

    const currentViewedUsername = ref<string | null>(null);
    const setViewedProfile = (username: string) => {
        const queryKey = ['profile', { username }]
        const state = queryClient.getQueryState(queryKey)
        if (state?.status === 'error') {
            queryClient.resetQueries({ queryKey })
        }

        currentViewedUsername.value = username;
        errors.profileFetchFailed = false;
        errors.profileNotFound = false;
        errors.serverError = false;
    };
    const isOwnProfile = computed(() => currentViewedUsername.value === authStore.getUsername);
    const profileQuery = useQuery({
        refetchOnWindowFocus: false,
        queryKey: ['profile', { username: currentViewedUsername }],
        queryFn: () => profileService.getProfile(currentViewedUsername.value!),
        enabled: () => !!currentViewedUsername.value,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const retryFetchProfile = () => {
        errors.profileFetchFailed = false;
        errors.profileNotFound = false;
        errors.serverError = false;
        profileQuery.refetch()
    }


    watchEffect(() => {
        const error = profileQuery.error.value as AxiosError<ErrorResponse<PROFILE_ERROR_CODES.ProfileErrorCode>>
        if (error) {
            const { code, type, message } = errorHandler(error)
            if (code === PROFILE_ERROR_CODES.GET_USER_PROFILE_RATELIMIT_EXCEEDED) {
                toast.error(message)
                currentViewedUsername.value = null
                router.push({ name: "feed" })
            }
            if (code === PROFILE_ERROR_CODES.INVALID_USERNAME_FORMAT || code === PROFILE_ERROR_CODES.USER_NOT_FOUND)
                errors.profileNotFound = true;
            else if (code === PROFILE_ERROR_CODES.PROFILE_RETRIEVAL_FAILED) errors.profileFetchFailed = true;

            const types: typeof type[] = ["offline", "unreachable", "server_error", "timeout"]
            if (types.includes(type))
                errors.serverError = true;
        }
    })

    /**
     * Update profile mutation with optimistic updates
     * Optimistically updates ONLY the authenticated user's bio in the cache
     * Rolls back on error
     */
    const updateProfileMutation = useMutation({
        mutationFn: ({ bio }: { bio: string }) => profileService.updateProfile({ bio }),
        onMutate: async (variables) => {
            const { bio } = variables

            const queryKey = ["profile", { username: authStore.getUsername }]
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData<UserProfile>(queryKey)
            if (previousData) {
                queryClient.setQueryData(queryKey, {
                    ...previousData,
                    bio
                })
            }
            return { queryKey, previousData }
        },
        onSuccess: async (data, _, onMutateResult) => {
            toast.success("Profile Updated Successfully!")
            if (onMutateResult?.queryKey) {
                queryClient.setQueryData(onMutateResult.queryKey, data)
            }
        },
        onError: (error: AxiosError<ErrorResponse<PROFILE_ERROR_CODES.ProfileErrorCode>>, _, context) => {
            if (context?.previousData && context?.queryKey) {
                queryClient.setQueryData(context.queryKey, context.previousData)
            }

            const { type, code, message } = errorHandler(error)
            const codes = [PROFILE_ERROR_CODES.PROFILE_UPDATE_FAILED, PROFILE_ERROR_CODES.INVALID_PROFILE_BIO, PROFILE_ERROR_CODES.PROFILE_BIO_LENGTH_EXCEEDED]
            if (code && codes.includes(code)) toast.error(message)

            const types: typeof type[] = ["unreachable", "timeout", "offline", "server_error"]
            if (types.includes(type)) toast.error(message)
        }
    })
    const updateProfile = ({ bio }: { bio: string }) => updateProfileMutation.mutateAsync({ bio })


    return {
        retryFetchProfile,
        isOwnProfile,
        profileQuery,
        setViewedProfile,
        currentViewedUsername,
        errors,
        updateProfile
    };
});
