<template>
    <section class="flex justify-center items-center p-4 min-h-screen bg-surface-app">
        <div
            class="container flex flex-col gap-6 justify-center p-10 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
            <header class="flex flex-col gap-2 items-center text-center">
                <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                <p class="text-text-muted">Share your fitness thoughts.</p>
            </header>
            <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <mail class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="username" placeholder="Username" required v-model="username"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors placeholder:text-text-muted text-text-default border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
                    </div>
                    <div v-if="authStore.errors.usernameError || authStore.errors.formError"
                        class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{
                            authStore.errors.usernameError || authStore.errors.formError
                            }}</p>
                    </div>
                </div>
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <lock class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="password" placeholder="Password" minlength="6" required v-model="password"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors placeholder:text-text-muted text-text-default border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
                    </div>
                    <div v-if="authStore.errors.passwordError" class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{
                            authStore.errors.passwordError
                            }}</p>
                    </div>
                </div>
                <button :disabled="authStore.states.isLoggingIn"
                    class="h-14 font-bold rounded-lg transition-colors bg-solid-primary hover:bg-solid-hover text-bg-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus disabled:focus:ring-0 disabled:focus:border-0">
                    {{ authStore.states.isLoggingIn ? 'Logging in...' : 'Login' }}
                </button>
            </form>
            <AuthNavLink to="/auth/forgot-password" linkText="Forgot password?" align="center" />
            <div class="flex gap-2 items-center w-full">
                <div class="w-full h-px bg-border-muted"></div>
                <p class="text-text-muted">OR</p>
                <div class="w-full h-px bg-border-muted"></div>
            </div>
            <button @click="() => router.push({ name: 'magic-link' })"
                class="h-14 font-bold rounded-lg border-2 transition-colors cursor-pointer text-text-secondary focus:outline-none focus:border-none focus:ring-2 focus:ring-border-focus border-border-default">Continue
                with magic link</button>
            <AuthNavLink to="/auth/signup" promptText="Don't have an account?" linkText="Sign up" align="center"
                class="mt-2" />
        </div>
    </section>
</template>

<script setup lang="ts">
    import { Mail, Lock, CircleAlert } from "lucide-vue-next"
    import { onBeforeRouteLeave, useRouter, useRoute } from "vue-router";
    import AuthNavLink from "../components/AuthNavLink.vue"
    import { ref, watch } from "vue";
    import { useAuthStore } from "../store/authStore";
    import { useUnverifiedEmail } from "../composables/useUnverifiedEmail";

    const authStore = useAuthStore()
    const { setUnverifiedEmail, clearUnverifiedEmail } = useUnverifiedEmail()
    const router = useRouter();
    const route = useRoute()
    const username = ref('')
    const password = ref('')

    const handleSubmit = async () => {
        let cachedPassword = password.value
        password.value = ""

        const res = await authStore.loginUser(username.value, cachedPassword)
        if (res?.success && res.verified) {
            clearUnverifiedEmail()
            const next = route.query["next"] as string
            if (next && next.startsWith("/")) router.push(next)
            else router.push({ name: "feed" })
        }
        else if (res?.verified === false && res.email) {
            setUnverifiedEmail(String(res.email))
            router.push({ name: "verify" })
        }
    }

    watch([username, password], () => {
        authStore.clearErrors()
    })

    onBeforeRouteLeave(() => {
        authStore.clearErrors()
    })
</script>
