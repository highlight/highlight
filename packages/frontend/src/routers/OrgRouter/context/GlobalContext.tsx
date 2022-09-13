import { createContext } from '@util/context/context'

interface GlobalContext {
	showKeyboardShortcutsGuide: boolean
	toggleShowKeyboardShortcutsGuide: (nextValue?: boolean) => void
	showBanner: boolean
	toggleShowBanner: (nextValue?: boolean) => void
}

export const [useGlobalContext, GlobalContextProvider] =
	createContext<GlobalContext>('Global')
