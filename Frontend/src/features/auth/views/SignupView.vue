<template>
    <section class="flex justify-center items-center p-4 min-h-screen bg-surface-app">
        <div
            class="container flex flex-col gap-6 justify-center p-10 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
            <header class="flex flex-col gap-2 items-center text-center">
                <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                <p class="text-text-muted">Join the fitness conversation.</p>
            </header>
            <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <user class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="text" placeholder="Username" required v-model="username"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
                    </div>
                    <div v-if="authStore.errors.usernameError || authStore.errors.formError"
                        class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.usernameError || authStore.errors.formError }}</p>
                    </div>
                </div>
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <mail class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="email" placeholder="Email" required v-model="email"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
                    </div>
                    <div v-if="authStore.errors.emailError" class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.emailError }}</p>
                    </div>
                </div>
                <div class="flex relative flex-col gap-2">
                    <div class="flex relative items-center w-full">
                        <lock class="absolute left-4 size-6 stroke-text-muted" />
                        <input type="password" placeholder="Password" minlength="6" required v-model="password"
                            class="pr-6 pl-12 w-full h-14 rounded-lg border shadow transition-colors border-surface-elevated focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
                    </div>
                    <div v-if="authStore.errors.passwordError" class="flex gap-2 items-center text-sm text-red-500">
                        <circle-alert class="self-start size-5 shrink-0" />
                        <p>{{ authStore.errors.passwordError }}</p>
                    </div>
                </div>
                <button :disabled="authStore.states.isSigningUp"
                    class="h-14 font-bold rounded-lg transition-colors bg-solid-primary hover:bg-solid-hover text-bg-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus disabled:focus:ring-0 disabled:focus:border-0">
                    {{ authStore.states.isSigningUp ? 'Signing up...' : 'Sign Up' }}
                </button>
            </form>
            <AuthNavLink to="/auth/login" promptText="Already have an account?" linkText="Log in" align="center"
                class="mt-2" />
        </div>
    </section>
</template>

<script setup lang="ts">
    import { Mail, Lock, User, CircleAlert } from "lucide-vue-next"
    import AuthNavLink from "../components/AuthNavLink.vue"
    import { useRouter, onBeforeRouteLeave } from "vue-router";
    import { ref, watch } from "vue";
    import { useUnverifiedEmail } from "../composables/useUnverifiedEmail";
    import { useAuthStore } from "../store/authStore";

    const authStore = useAuthStore()
    const { setUnverifiedEmail } = useUnverifiedEmail()

    const router = useRouter()
    const username = ref('')
    const email = ref('')
    const password = ref('')

    const handleSubmit = async () => {
        const cachedPassword = password.value
        password.value = ""

        const res = await authStore.signupUser(username.value, email.value, cachedPassword)
        if (res?.success && res.email) {
            const emailRes = typeof res.email === "string" ? res.email : ""
            setUnverifiedEmail(emailRes)
            router.push({ name: 'verify' })
        }
    }

    watch([username, email, password], () => {
        authStore.clearErrors()
    })

    onBeforeRouteLeave(() => {
        authStore.clearErrors()
    })
</script>
