import { Ariakit } from '@highlight-run/ui/components'
import { createContext } from '@util/context/context'
import type { Dispatch, SetStateAction } from 'react'

interface GlobalContext {
	showKeyboardShortcutsGuide: boolean
	toggleShowKeyboardShortcutsGuide: Dispatch<SetStateAction<boolean>>
	showBanner: boolean
	toggleShowBanner: Dispatch<SetStateAction<boolean>>
	commandBarDialog: Ariakit.DialogStore
}

export const [useGlobalContext, GlobalContextProvider] =
	createContext<GlobalContext>('Global')
