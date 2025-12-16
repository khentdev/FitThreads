import { defineStore } from 'pinia';
import { ref, computed, reactive, watchEffect } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { profileService } from '../service';
import { useAuthStore } from '../../auth/store/authStore';
import { errorHandler } from '../../../core/errors/errorHandler';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../core/errors';
import * as PROFILE_ERROR_CODES from '../errors/profileErrorCodes';

export const useProfileStore = defineStore('profile', () => {

    const authStore = useAuthStore();

    const errors = reactive({
        profileFetchFailed: false,
        profileNotFound: false,
        serverError: false
    })

    const currentViewedUsername = ref<string | null>(null);
    const setViewedProfile = (username: string) => {
        currentViewedUsername.value = username;
    };
    const isOwnProfile = computed(() => currentViewedUsername.value === authStore.getUsername);
    const profileQuery = useQuery({
        refetchOnWindowFocus: false,
        queryKey: ['profile', currentViewedUsername],
        queryFn: () => profileService.getProfile(currentViewedUsername.value!),
        enabled: () => !!currentViewedUsername.value,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const retryFetchProfile = () => {
        profileQuery.refetch()
    }

    watchEffect(() => {
        if (profileQuery.data.value) {
            errors.profileFetchFailed = false;
            errors.profileNotFound = false;
            errors.serverError = false;
        }
    })

    watchEffect(() => {
        const error = profileQuery.error.value as AxiosError<ErrorResponse<PROFILE_ERROR_CODES.ProfileErrorCode>>
        if (error) {
            const { code, type } = errorHandler(error)
            if (code === PROFILE_ERROR_CODES.INVALID_USERNAME_FORMAT || code === PROFILE_ERROR_CODES.USER_NOT_FOUND)
                errors.profileNotFound = true;
            else if (code === PROFILE_ERROR_CODES.PROFILE_RETRIEVAL_FAILED) errors.profileFetchFailed = true;

            const types: typeof type[] = ["offline", "unreachable", "server_error", "timeout"]
            if (types.includes(type))
                errors.serverError = true;
        }
    })

    return {
        retryFetchProfile,
        isOwnProfile,
        profileQuery,
        setViewedProfile,
        currentViewedUsername,
        errors
    };
});
