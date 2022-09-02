import { isValidElement, ReactNode } from 'react'

export function isRenderable(value: unknown): value is ReactNode {
	return (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		value === null ||
		value === undefined ||
		// @ts-ignore
		isValidElement(value) ||
		(Array.isArray(value) && value.every(isRenderable))
	)
}
