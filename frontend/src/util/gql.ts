import { OnQueryUpdated } from '@apollo/client'
import { indexeddbCache } from '@util/db'

export const invalidateRefetch: OnQueryUpdated<any> = async (observable) => {
	await indexeddbCache.deleteItem({
		operation: observable.queryName ?? '',
		variables: observable.variables,
	})
	await observable.refetch()
}
