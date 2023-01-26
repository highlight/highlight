import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'

import { createContext } from '../../../../util/context/context'

interface DevToolsContext {
	openDevTools: boolean
	setOpenDevTools: (val: boolean) => void
	devToolsTab: Tab
	setDevToolsTab: (val: Tab) => void
}

export const [useDevToolsContext, DevToolsContextProvider] =
	createContext<DevToolsContext>('DevTools')
