import { OnQueryUpdated } from '@apollo/client'
import { indexeddbCache } from '@util/db'
import { wait } from '@util/time'

export const gqlSanitize = (object: any): any => {
	const omitTypename = (key: any, value: any) =>
		key === '__typename' ? undefined : value
	const newPayload = JSON.parse(JSON.stringify(object), omitTypename)
	return newPayload
}

export const delayedRefetch: OnQueryUpdated<any> = async (observable) => {
	await indexeddbCache.deleteItem({
		operation: observable.queryName ?? '',
		variables: observable.variables,
	})
	await wait(500)
	await observable.refetch()
}
