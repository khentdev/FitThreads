<template>
    <section class="flex justify-center items-center p-4 min-h-screen bg-surface-app">
        <div
            class="container flex flex-col gap-6 justify-center p-8 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
            <header class="flex flex-col gap-2 items-center text-center">
                <h1 class="text-3xl font-bold md:text-4xl text-text-default">Verify Your Email</h1>
                <p class="text-xs md:text-sm text-text-muted">We've sent a verification code to</p>
                <p class="text-xs font-medium md:text-sm text-text-secondary">{{ userEmail }}</p>
            </header>

            <form class="flex flex-col gap-6" @submit.prevent="handleVerifyOTP">
                <div class="flex flex-col gap-2 w-full">
                    <label for="otp-input" class="text-sm font-medium text-left text-text-muted">
                        Enter verification code
                    </label>
                    <input id="otp-input" ref="otpInputRef" v-model="otpCode" type="text" inputmode="numeric"
                        maxlength="6" placeholder="000000" @input="handleOTPInput"
                        class="px-4 h-12 text-base font-medium tracking-widest text-center rounded-lg border shadow transition-colors md:h-14 md:text-lg border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />

                    <p class="text-xs text-center text-text-muted">Enter the 6-digit code</p>
                    <div v-if="authStore.errors.otpError || authStore.errors.formError"
                        class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.otpError || authStore.errors.formError }}</p>
                    </div>
                </div>

                <button type="submit" :disabled="authStore.states.isVerifyingOTP || !isOTPComplete"
                    class="h-12 font-bold rounded-lg transition-colors md:h-14 bg-solid-primary hover:bg-solid-hover text-bg-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus disabled:focus:ring-0 disabled:focus:border-0">
                    {{ authStore.states.isVerifyingOTP ? 'Verifying...' : 'Verify Email' }}
                </button>
            </form>

            <div class="flex flex-col gap-3 items-center">
                <p class="text-sm text-text-muted">Didn't receive the code?</p>
                <button type="button" @click="handleResendOTP"
                    :disabled="authStore.states.isResendingOTP || canResend === false"
                    class="text-sm font-medium transition-colors text-text-secondary hover:text-solid-primary disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:underline">
                    {{ resendButtonText }}
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { CircleAlert } from "lucide-vue-next"
    import { ref, computed, onMounted, watch } from "vue"
    import { useUnverifiedEmail } from "../composables/useUnverifiedEmail"
    import { useRouter } from "vue-router"
    import { useAuthStore } from "../store/authStore"

    const authStore = useAuthStore()
    const { unverifiedEmail, clearUnverifiedEmail } = useUnverifiedEmail()
    const router = useRouter()

    const otpCode = ref<string>('')
    const otpInputRef = ref<HTMLInputElement | null>(null)
    const userEmail = ref<string>('')
    const otpError = ref<string>('')
    const isResending = ref<boolean>(false)
    const canResend = ref<boolean>(true)
    const resendCountdown = ref<number>(0)

    const isOTPComplete = computed(() => otpCode.value.length === 6)

    const resendButtonText = computed(() => {
        if (isResending.value) return 'Sending...'
        if (resendCountdown.value > 0) return `Resend in ${resendCountdown.value}s`
        return 'Resend code'
    })

    const handleOTPInput = (event: Event): void => {
        authStore.clearErrors()
        const input = event.target as HTMLInputElement
        const value = input.value

        otpError.value = ''
        const digitsOnly = value.replace(/\D/g, '')
        otpCode.value = digitsOnly.slice(0, 6)
    }

    const verificationSuccess = ref(false)
    const handleVerifyOTP = async (): Promise<void> => {
        if (!isOTPComplete.value) return
        const res = await authStore.verifyOTP(otpCode.value)
        if (res?.success) {
            verificationSuccess.value = true
            clearUnverifiedEmail()
            await router.push({ name: 'feed' })
        }

        if (!res?.success) {
            if (res?.redirect === "login") await router.push({ name: "login" })
            if (res?.redirect === "signup") await router.push({ name: "signup" })
        }
    }

    const startResendCountdown = (): void => {
        canResend.value = false
        resendCountdown.value = 60

        const interval = setInterval(() => {
            resendCountdown.value--
            if (resendCountdown.value <= 0) {
                clearInterval(interval)
                canResend.value = true
            }
        }, 1000)
    }

    const handleResendOTP = async (): Promise<void> => {
        if (!canResend.value) return
        otpError.value = ''
        otpCode.value = ''
        await authStore.resendOTP(userEmail.value)
        startResendCountdown()
        otpInputRef.value?.focus()
    }

    watch(unverifiedEmail, (newVal) => {
        if (!newVal && !verificationSuccess.value) {
            router.push({ name: 'signup' })
        } else if (newVal) {
            userEmail.value = newVal.email
        }
    }, { immediate: true })

    onMounted(() => {
        if (!unverifiedEmail.value) {
            router.push({ name: 'signup' })
            return
        }
        userEmail.value = unverifiedEmail.value.email
        otpInputRef.value?.focus()
    })
</script>
