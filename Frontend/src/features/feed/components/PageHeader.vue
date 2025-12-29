<template>
    <div class="sticky top-0 z-30 w-full backdrop-blur-3xl md:max-w-2xl bg-surface-app/85">
        <div class="flex relative justify-center items-center px-4 w-full h-14 md:px-0">
            <button
                class="absolute left-4 p-1 transition-all duration-300 transform md:rounded-full md:hover:shadow md:border-border-muted md:border md:hover:shadow-black/10 active:scale-90 hover:scale-110"
                v-if="goPreviousPage" @click="backToPreviousPage"><arrow-left
                    class="size-6 md:size-4 text-text-default" /></button>
            <button @click="actionFn?.()" class="text-lg font-bold text-text-default">{{ title }}
            </button>
            <button class="absolute right-4 md:hidden" v-if="showMenu" @click.stop="toggleDropDown">
                <Menu class="size-6 stroke-text-muted" />
            </button>

            <!-- Dropdown - settings button -->
            <Transition enter-active-class="transition-all duration-300 ease-in-out"
                leave-active-class="transition-all duration-300 ease-in-out" enter-from-class="opacity-0 scale-0"
                enter-to-class="opacity-100 scale-100" leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-0">
                <div class="block absolute right-4 top-full w-full rounded-xl border shadow-md origin-top-right bg-bg-primary border-border-muted max-w-52 h-fit md:hidden"
                    v-if="showMenu && isDropDownMenuOpen" v-on-click-outside.bubble="closeDropDown">
                    <div class="flex flex-col gap-3 justify-center items-center p-2 w-full h-fit">
                        <RouterLink :to="{ name: 'settings' }" @click="closeDropDown"
                            class="p-2 w-full h-full rounded-xl transition-all transform hover:bg-surface-hover active:scale-90">
                            <span class="font-medium text-text-default">Settings</span>
                        </RouterLink>
                    </div>
                </div>
            </Transition>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { vOnClickOutside } from "@vueuse/components";
    import { Menu, ArrowLeft } from 'lucide-vue-next';
    import { ref } from 'vue';
    import { useRouter } from "vue-router";

    const router = useRouter()

    withDefaults(defineProps<{
        title: string
        actionFn?: () => void,
        showMenu?: boolean,
        goPreviousPage?: boolean
    }>(), { showMenu: true, goPreviousPage: false })


    const isDropDownMenuOpen = ref(false)
    const toggleDropDown = () => {
        isDropDownMenuOpen.value = !isDropDownMenuOpen.value
    }
    const closeDropDown = () => {
        isDropDownMenuOpen.value = false
    }

    const backToPreviousPage = () => {
        router.go(-1)
    }

</script>
