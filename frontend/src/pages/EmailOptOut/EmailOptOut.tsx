import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { EmailOptOutCategory } from '@graph/schemas'
import { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import { useGetEmailOptOutsQuery } from '../../graph/generated/hooks'

const OptOutRow = (label, info, state, setState) => {
	;<li></li>
}

export const EmailOptOutPage = () => {
	const [{ admin_id, token }] = useQueryParams({
		admin_id: StringParam,
		token: StringParam,
	})

	const { data, loading } = useGetEmailOptOutsQuery({
		variables: { token: token ?? '', admin_id: admin_id ?? '' },
		// skip: !token || !admin_id,
	})

	console.log('data', data)

	const { setLoadingState } = useAppLoadingContext()
	useEffect(() => {
		if (!loading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState])

	if (!token || !admin_id || !data?.email_opt_outs) {
		return null
	}

	const categories = [
		{
			label: 'Digests',
			info: 'Weekly summaries of user activity and errors for your projects',
			type: EmailOptOutCategory.Digests,
		},
	]
	const optOuts = new Set<EmailOptOutCategory>()
	for (const o of data?.email_opt_outs) {
		if (o === EmailOptOutCategory.All) {
			for (const c of categories) {
				optOuts.add(c.type)
			}
		} else {
			optOuts.add(o)
		}
	}

	return null

	// return <ul>{categories.map(c => OptOutRow(c.label, c.info, optOuts.has(c.type), ()))}</ul>
}
