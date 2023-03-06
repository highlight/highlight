import { createContext } from '@util/context/context'
import { DialogState } from 'ariakit/dialog'

interface GlobalContext {
	showKeyboardShortcutsGuide: boolean
	toggleShowKeyboardShortcutsGuide: (nextValue?: boolean) => void
	showBanner: boolean
	toggleShowBanner: (nextValue?: boolean) => void
	commandBarDialog: DialogState
}

export const [useGlobalContext, GlobalContextProvider] =
	createContext<GlobalContext>('Global')
