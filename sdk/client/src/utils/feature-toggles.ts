import fetch from 'cross-fetch'

export type FeatureToggles = {
	[key: string]: boolean
}

const FETCH_FEATURE_TOGGLES_QUERY = `
  query FetchFeatureToggles($organization_verbose_id: String!, $user_identifier: String!) {
    fetchFeatureToggles(organization_verbose_id: $organization_verbose_id, user_identifier: $user_identifier)
  }
`

export const getFeatureToggles = async (
	organizationId: string,
	userIdentifier: string,
): Promise<FeatureToggles> => {
	if (!organizationId) {
		return {}
	}

	let featureToggles = {}
	const backendUrl = 'https://localhost:8082/public'

	try {
		const r = await fetch(backendUrl, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: FETCH_FEATURE_TOGGLES_QUERY,
				variables: {
					organization_verbose_id: organizationId,
					user_identifier: userIdentifier,
				},
			}),
		})

		const results = await r.json()
		featureToggles = results?.data?.fetchFeatureToggles ?? {}
	} catch (e) {}

	return featureToggles
}
