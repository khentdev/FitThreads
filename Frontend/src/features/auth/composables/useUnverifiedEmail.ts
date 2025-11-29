import { useStorage } from '@vueuse/core'

export const useUnverifiedEmail = () => {
    const unverifiedEmail = useStorage<{ email: string } | null>(
        'unverifiedUserEmail',
        null,
        localStorage,
        {
            serializer: {
                read: (v: string) => {
                    try {
                        return JSON.parse(v)
                    } catch {
                        return null
                    }
                },
                write: (v: { email: string } | null) => JSON.stringify(v)
            }
        }
    )

    const setUnverifiedEmail = (email: string) => {
        unverifiedEmail.value = { email }
    }

    const clearUnverifiedEmail = () => {
        unverifiedEmail.value = null
    }

    return {
        unverifiedEmail,
        setUnverifiedEmail,
        clearUnverifiedEmail,
    }
}
