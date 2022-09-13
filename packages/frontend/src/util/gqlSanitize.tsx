export const gqlSanitize = (object: any): any => {
	const omitTypename = (key: any, value: any) =>
		key === '__typename' ? undefined : value
	const newPayload = JSON.parse(JSON.stringify(object), omitTypename)
	return newPayload
}
