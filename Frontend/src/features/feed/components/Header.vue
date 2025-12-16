<template>
    <aside
        class="flex fixed bottom-0 left-0 z-50 justify-center items-center p-3 w-full h-16 bg-surface-app md:relative md:w-20 md:min-h-screen md:flex-col md:justify-between">
        <nav class="flex flex-row gap-6 justify-between items-center w-full md:flex-col md:mt-auto md:mb-auto">
            <template v-for="link in navigationLinks.filter(l => !l.toBottom)" :key="link.name">
                <RouterLink :to="{ name: link.name, params: { username: link.param?.value } }" custom
                    v-slot="{ isExactActive, navigate, href }">
                    <a :href="href"
                        class="flex justify-center items-center w-full h-12 rounded-xl transition-colors group hover:bg-surface-elevated"
                        :class="[
                            isExactActive || link.isOwnProfile?.value ? 'text-text-default' : 'text-text-muted',
                            link.activeBg ? 'bg-surface-elevated' : '',
                        ]" :aria-label="link.label" @click.prevent="handleNavClick(link, navigate)">
                        <component :is="link.icon" class="transition-all duration-200 size-7" :class="[
                            isExactActive || link.isOwnProfile?.value ? 'text-text-default stroke-3' : 'text-text-muted group-hover:text-text-default group-hover:stroke-3'
                        ]" />
                    </a>
                </RouterLink>
            </template>
        </nav>
        <nav class="hidden w-full md:flex md:flex-col md:mb-4 md:items-center">
            <template v-for="link in navigationLinks.filter(l => l.toBottom)" :key="link.name">
                <RouterLink :to="{ name: link.name }" custom v-slot="{ isExactActive, navigate, href }">
                    <a :href="href"
                        class="flex justify-center items-center w-16 h-12 rounded-xl transition-colors group hover:bg-surface-elevated"
                        :class="[
                            isExactActive ? 'text-text-default' : 'text-text-muted',
                        ]" :aria-label="link.label" @click.prevent="() => navigate()">
                        <component :is="link.icon" class="transition-all duration-200 size-7" :class="[
                            isExactActive ? 'text-text-default stroke-3' : 'text-text-muted group-hover:text-text-default group-hover:stroke-3'
                        ]" />
                    </a>
                </RouterLink>
            </template>
        </nav>

        <LoginModalPopup :is-open="modal.isOpen" :context="modal.context" @close="closeModal" />
    </aside>
</template>

<script setup lang="ts">
    import { Home, Search, Plus, Settings, User } from 'lucide-vue-next'
    import { useAuthStore } from '../../auth/store/authStore';
    import { computed, reactive, ref, watch } from 'vue';
    import { useRoute } from 'vue-router';
    import LoginModalPopup from '../../../shared/components/LoginModalPopup.vue';
    import type { LoginModalPopupProps } from '../../../shared/components/LoginModalPopup.vue';

    const authStore = useAuthStore()
    const route = useRoute()

    const isOwnProfile = ref(false)
    watch([() => authStore.getUsername, () => route.params['username']], ([username, routeUsername]) => {
        isOwnProfile.value = username === routeUsername
    }, { immediate: true })

    const modal = reactive<{
        isOpen: boolean;
        context: LoginModalPopupProps['context'];
    }>({
        isOpen: false,
        context: 'create-post'
    })

    const closeModal = (): void => {
        modal.isOpen = false
    }

    const handleNavClick = (link: NavigationLink, navigate: () => void): void => {
        const requiresAuth = link.name === 'create-post' || link.name === 'profile'
        if (requiresAuth && !authStore.hasAuthenticated) {
            modal.context = link.name as LoginModalPopupProps['context']
            modal.isOpen = true
            return
        }
        navigate()
    }

    type NavigationLink = {
        name: string;
        icon: any;
        label: string;
        activeBg?: boolean;
        toBottom?: boolean;
        isOwnProfile?: any;
        param?: any;
    }

    const navigationLinks: NavigationLink[] = [
        {
            name: 'feed',
            icon: Home,
            label: 'Home'
        },
        {
            name: 'search',
            icon: Search,
            label: 'Search'
        },
        {
            name: 'create-post',
            icon: Plus,
            label: 'Create',
            activeBg: true
        },
        {
            name: 'profile',
            icon: User,
            label: 'Profile',
            isOwnProfile,
            param: computed(() => {
                if (authStore.getUsername) return authStore.getUsername
                return 'unknown'
            })
        },
        {
            name: 'settings',
            icon: Settings,
            label: 'Settings',
            toBottom: true
        },
    ]
</script>
