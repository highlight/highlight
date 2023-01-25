import { createContext } from '../../../../util/context/context'

export enum DevToolTabType {
	Errors = 'Errors',
	Console = 'Console',
	Network = 'Network',
}
interface DevToolsContext {
	openDevTools: boolean
	setOpenDevTools: (val: boolean) => void
	devToolsTab: DevToolTabType
	setDevToolsTab: (val: DevToolTabType) => void
}

export const [useDevToolsContext, DevToolsContextProvider] =
	createContext<DevToolsContext>('DevTools')
