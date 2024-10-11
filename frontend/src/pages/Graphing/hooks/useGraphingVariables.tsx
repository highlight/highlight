import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import { Variable } from '@/graph/generated/schemas'
import { getQueryKey } from '@/pages/Graphing/components/VariablesModal'
import _ from 'lodash'
import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

export interface UseGraphingVariables {
	values: Map<string, string[]>
	variables: Variable[]
	setCurrentValues: (key: string, values: string[]) => void
	loading: boolean
}

export function useGraphingVariables(
	dashboardId: string,
): UseGraphingVariables {
	const { data, loading } = useGetVisualizationQuery({
		variables: { id: dashboardId },
	})

	const [params, setParams] = useSearchParams()

	const values = useMemo(() => {
		const values = new Map<string, string[]>()
		data?.visualization.variables.forEach((v) => {
			const paramMarshalled = params.get(getQueryKey(v.key))
			if (paramMarshalled === null) {
				values.set(v.key, v.defaultValues)
			} else {
				values.set(v.key, JSON.parse(paramMarshalled))
			}
		})
		return values
	}, [data?.visualization.variables, params])

	const defaultValues = useMemo(() => {
		const defaultValues = new Map<string, string[]>()
		data?.visualization.variables.forEach((v) => {
			defaultValues.set(v.key, v.defaultValues)
		})
		return defaultValues
	}, [data?.visualization.variables])

	const setCurrentValues = useCallback(
		(key: string, values: string[]) => {
			setParams(
				(prev) => {
					if (_.isEqual(values, defaultValues.get(key))) {
						prev.delete(getQueryKey(key))
					} else {
						prev.set(getQueryKey(key), JSON.stringify(values))
					}
					return prev
				},
				{ replace: true },
			)
		},
		[defaultValues, setParams],
	)

	return {
		values,
		variables: data?.visualization.variables ?? [],
		setCurrentValues,
		loading,
	}
}
