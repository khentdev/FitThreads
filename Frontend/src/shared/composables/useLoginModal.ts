import { reactive } from 'vue';

type LoginModalContext = 'create-post' | 'profile' | 'like' | 'favorite';

const state = reactive<{
    isOpen: boolean;
    context: LoginModalContext;
}>({
    isOpen: false,
    context: 'like'
});

export const useLoginModal = () => {
    const openModal = (context: LoginModalContext): void => {
        state.context = context;
        state.isOpen = true;
    };

    const closeModal = (): void => {
        state.isOpen = false;
    };

    return {
        isOpen: (): boolean => state.isOpen,
        context: (): LoginModalContext => state.context,
        openModal,
        closeModal
    };
};
