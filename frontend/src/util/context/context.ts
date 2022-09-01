import React from 'react'

/**
 * Wrapper for React.createContext. Allows you to create a context without having to define the default values.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function createContext<A extends {} | null>(displayName: string) {
	const ctx = React.createContext<A | undefined>(undefined)
	ctx.displayName = displayName
	function useContext() {
		const c = React.useContext(ctx)
		if (c === undefined)
			throw new Error('useContext must be inside a Provider with a value')
		return c
	}
	return [useContext, ctx.Provider] as const // 'as const' makes TypeScript infer a tuple
}
