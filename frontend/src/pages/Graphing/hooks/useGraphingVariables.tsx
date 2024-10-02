import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import { Variable } from '@/graph/generated/schemas'
import { getQueryKey } from '@/pages/Graphing/components/VariablesModal'
import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

export interface UseGraphingVariables {
	values: Map<string, string>
	variables: Variable[]
	setCurrentValue: (key: string, value: string) => void
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
		const values = new Map<string, string>()
		data?.visualization.variables.forEach((v) => {
			values.set(v.key, params.get(getQueryKey(v.key)) ?? v.defaultValue)
		})
		return values
	}, [data?.visualization.variables, params])

	const defaultValues = useMemo(() => {
		const defaultValues = new Map<string, string>()
		data?.visualization.variables.forEach((v) => {
			defaultValues.set(v.key, v.defaultValue)
		})
		return defaultValues
	}, [data?.visualization.variables])

	const setCurrentValue = useCallback(
		(key: string, value: string) => {
			setParams(
				(prev) => {
					if (value !== defaultValues.get(key)) {
						prev.set(getQueryKey(key), value)
					} else {
						prev.delete(getQueryKey(key))
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
		setCurrentValue,
		loading,
	}
}
