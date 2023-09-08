import { Ariakit } from '@highlight-run/ui'
import { createContext } from '@util/context/context'

interface GlobalContext {
	showKeyboardShortcutsGuide: boolean
	toggleShowKeyboardShortcutsGuide: (nextValue?: boolean) => void
	showBanner: boolean
	toggleShowBanner: (nextValue?: boolean) => void
	commandBarDialog: Ariakit.DialogStore
}

export const [useGlobalContext, GlobalContextProvider] =
	createContext<GlobalContext>('Global')
