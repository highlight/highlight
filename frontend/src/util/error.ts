import { ErrorObject } from '@graph/schemas'

const delimiter = '</error_group_secure_id><error_id>'

export function deserializeErrorIdentifier(param: string) {
	const [errorGroupSecureId, errorId] = param.split(delimiter)
	return { errorGroupSecureId, errorId }
}

export function serializeErrorIdentifier(error: ErrorObject) {
	return `${error.error_group_secure_id}${delimiter}${error.id}`
}
