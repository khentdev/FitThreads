<template>
    <section class="flex justify-center items-center p-4 min-h-screen bg-surface-app">
        <div
            class="container flex flex-col gap-6 justify-center p-10 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
            <header class="flex flex-col gap-2 items-center text-center">
                <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                <p class="text-text-muted">Enter your email to reset your password.</p>
            </header>

            <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <mail class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="email" id="email" autocomplete="email" name="email" placeholder="Email" required v-model="email"
                            :disabled="authStore.states.isSendingResetPasswordLink || remainingSeconds > 0"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors placeholder:text-text-muted text-text-default border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:bg-surface-hover disabled:cursor-not-allowed" />
                    </div>
                    <div v-if="authStore.errors.emailError || authStore.errors.formError"
                        class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.emailError || authStore.errors.formError }}</p>
                    </div>
                </div>

                <button :disabled="authStore.states.isSendingResetPasswordLink || remainingSeconds > 0"
                    class="h-14 font-bold rounded-lg transition-colors bg-solid-primary hover:bg-solid-hover text-bg-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus disabled:focus:ring-0 disabled:focus:border-0">
                    {{ buttonText }}
                </button>
            </form>

            <div class="flex gap-2 items-center w-full">
                <div class="w-full h-px bg-border-muted"></div>
                <p class="text-text-muted">OR</p>
                <div class="w-full h-px bg-border-muted"></div>
            </div>

            <AuthNavLink to="/auth/login" promptText="Remember your password?" linkText="Log in" align="center" />
        </div>
    </section>
</template>

<script setup lang="ts">
    import { Mail, CircleAlert } from "lucide-vue-next"
    import AuthNavLink from "../components/AuthNavLink.vue"
    import { computed, onMounted, onUnmounted, ref, } from "vue"
    import { useStorage } from "@vueuse/core"
    import { useAuthStore } from "../store/authStore"
    import { useRouter } from "vue-router"
    import { useUnverifiedEmail } from "../composables/useUnverifiedEmail"

    const authStore = useAuthStore()
    const router = useRouter()
    const { setUnverifiedEmail } = useUnverifiedEmail()

    const email = useStorage('resetPasswordEmail', '')
    const resendEndTime = useStorage('resetPasswordEndTime', 0)
    const remainingSeconds = ref(0)
    const canResend = ref(true)

    let cooldownInterval: ReturnType<typeof setInterval> | null = null

    const buttonText = computed(() => {
        if (authStore.states.isSendingResetPasswordLink) return 'Sending...'
        if (remainingSeconds.value > 0) return `Resend in ${remainingSeconds.value}s`
        return 'Send Reset Link'
    })

    const handleSubmit = async () => {
        if (!canResend.value) return
        const res = await authStore.sendResetPasswordLink(email.value)
        if (res?.success) startResendCooldown()
        else if (res?.verified === false && res.email) {
            setUnverifiedEmail(String(res.email))
            router.push({ name: 'verify' })
        }
    }

    const updateRemainingTime = () => {
        const now = Date.now()
        const diff = Math.ceil((resendEndTime.value - now) / 1000)

        if (diff > 0) {
            remainingSeconds.value = diff
            canResend.value = false
        } else {
            remainingSeconds.value = 0
            canResend.value = true
            if (cooldownInterval) {
                clearInterval(cooldownInterval)
                cooldownInterval = null
            }
        }
    }

    const startResendCooldown = () => {
        resendEndTime.value = Date.now() + 60 * 1000
        updateRemainingTime()
        if (!cooldownInterval) {
            cooldownInterval = setInterval(updateRemainingTime, 1000)
        }
    }

    onMounted(() => {
        updateRemainingTime()
        if (remainingSeconds.value > 0) {
            cooldownInterval = setInterval(updateRemainingTime, 1000)
        }
    })

    onUnmounted(() => {
        if (cooldownInterval) {
            clearInterval(cooldownInterval)
            cooldownInterval = null
        }
        authStore.clearErrors()
    })
</script>
