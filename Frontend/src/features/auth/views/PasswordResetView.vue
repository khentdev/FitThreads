<template>
    <section class="flex justify-center items-center p-4 min-h-screen bg-surface-app">
        <div
            class="container flex flex-col gap-6 justify-center p-10 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
            <header class="flex flex-col gap-2 items-center text-center">
                <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                <p class="text-text-muted">Enter your new password.</p>
            </header>

            <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
                <div class="flex relative flex-col gap-2">
                    <div v-if="authStore.errors.formError" class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.formError }}</p>
                    </div>

                    <div class="flex relative items-center w-full">
                        <lock class="absolute left-4 size-6 stroke-text-muted" />
                        <input :type="showPassword ? 'text' : 'password'" id="new-password" name="new-password"
                            placeholder="New Password" required v-model="newPassword"
                            :disabled="authStore.states.isVerifyingResetPasswordToken"
                            class="pr-12 pl-12 w-full h-14 rounded-lg border shadow transition-colors placeholder:text-text-muted text-text-default border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:bg-surface-hover disabled:cursor-not-allowed" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-4 focus:outline-none text-text-muted hover:text-text-default">
                            <eye v-if="showPassword" class="size-5" />
                            <eye-off v-else class="size-5" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <div v-if="authStore.errors.passwordResetError"
                        class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.passwordResetError }}</p>
                    </div>

                    <div class="flex relative items-center w-full">
                        <lock class="absolute left-4 size-6 stroke-text-muted" />
                        <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm-password"
                            name="confirm-password" placeholder="Confirm Password" required v-model="confirmPassword"
                            :disabled="authStore.states.isVerifyingResetPasswordToken"
                            class="pr-12 pl-12 w-full h-14 rounded-lg border shadow transition-colors placeholder:text-text-muted text-text-default border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:bg-surface-hover disabled:cursor-not-allowed" />
                        <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute right-4 focus:outline-none text-text-muted hover:text-text-default">
                            <eye v-if="showConfirmPassword" class="size-5" />
                            <eye-off v-else class="size-5" />
                        </button>
                    </div>
                </div>
                <div v-if="passwordMismatchError" class="flex gap-2 items-center text-sm text-red-500">
                    <circle-alert class="self-start size-5 shrink-0" />
                    <p>{{ passwordMismatchError }}</p>
                </div>

                <button :disabled="authStore.states.isVerifyingResetPasswordToken"
                    class="h-14 font-bold rounded-lg transition-colors bg-solid-primary hover:bg-solid-hover text-bg-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus disabled:focus:ring-0 disabled:focus:border-0">
                    {{ buttonText }}
                </button>
            </form>

            <div class="flex gap-2 items-center w-full">
                <div class="w-full h-px bg-border-muted"></div>
                <p class="text-text-muted">OR</p>
                <div class="w-full h-px bg-border-muted"></div>
            </div>

            <AuthNavLink to="/auth/forgot-password" promptText="Link expired?" linkText="Request a new one"
                align="center" />
        </div>
    </section>
</template>

<script setup lang="ts">
    import { Lock, CircleAlert, Eye, EyeOff } from "lucide-vue-next"
    import AuthNavLink from "../components/AuthNavLink.vue"
    import { computed, onUnmounted, ref, watch } from "vue"
    import { useAuthStore } from "../store/authStore"
    import { useRoute } from "vue-router"

    const authStore = useAuthStore()
    const route = useRoute()

    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const passwordMismatchError = ref('')

    const buttonText = computed(() => {
        if (authStore.states.isVerifyingResetPasswordToken) return 'Resetting...'
        return 'Reset Password'
    })

    const handleSubmit = async () => {
        passwordMismatchError.value = ''
        if (newPassword.value !== confirmPassword.value) {
            passwordMismatchError.value = "Passwords do not match."
            return
        }

        const token = route.query["token"] as string
        if (!token) return

        await authStore.verifyPasswordResetToken({
            token,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value
        })
    }

    watch([newPassword, confirmPassword], () => {
        authStore.clearErrors()
        passwordMismatchError.value = ""
    })
    onUnmounted(() => {
        authStore.clearErrors()
    })
</script>
