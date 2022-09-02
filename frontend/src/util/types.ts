/**
 * Makes all properties required. Unlike Typescript's Required utility type, this type allows for fields to be nullish.
 * This is useful when you want to enforce all properties to be consumed.
 */
export type Complete<T> = {
	[P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
		? T[P]
		: T[P] | undefined
}
