import { ApiHandler, HasHeaders, HasStatus } from './util/withHighlight'

import { NodeOptions } from '@highlight-run/node'

export function Highlight(_: NodeOptions) {
	return <T extends HasHeaders, S extends HasStatus>(
		origHandler: ApiHandler<T, S>,
	): ApiHandler<T, S> => origHandler
}
