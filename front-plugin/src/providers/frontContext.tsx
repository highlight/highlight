import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react'
import Front from '@frontapp/plugin-sdk'
import { WebViewContext } from '@frontapp/plugin-sdk/dist/webViewSdkTypes'

/*
 * Context.
 */

export const FrontContext = createContext<WebViewContext | undefined>(undefined)

/*
 * Hook.
 */

export function useFrontContext() {
	return useContext(FrontContext)
}

/*
 * Component.
 */

export const FrontContextProvider = ({ children }: PropsWithChildren) => {
	const [context, setContext] = useState<WebViewContext>()

	useEffect(() => {
		const subscription = Front.contextUpdates.subscribe((frontContext) => {
			setContext(frontContext)
		})
		return () => subscription.unsubscribe()
	}, [])

	return (
		<FrontContext.Provider value={context}>
			{children}
		</FrontContext.Provider>
	)
}
