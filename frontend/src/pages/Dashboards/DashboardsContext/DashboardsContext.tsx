import { FetchResult } from '@apollo/client'
import { UpsertDashboardMutation, useUpsertVisualizationMutation } from '@graph/operations'
import * as Types from '@graph/schemas'
import {
	DashboardDefinition,
	DashboardMetricConfigInput,
	Maybe,
} from '@graph/schemas'
import { createContext } from '@util/context/context'
import { useState } from 'react'

interface DashboardsContext {
	allAdmins: Maybe<
		{ __typename?: 'Admin' } & Pick<
			Types.Admin,
			'id' | 'name' | 'email' | 'photo_url'
		>
	>[]
	dashboards: Maybe<DashboardDefinition>[]
	updateDashboard: ({
		id,
		name,
		metrics,
		layout,
	}: {
		id?: string
		name: string
		metrics: DashboardMetricConfigInput[]
		layout?: string
	}) => Promise<FetchResult<UpsertDashboardMutatio>>
}

const [useDashboardsContext, DashboardsContextProvider] =
	createContext<DashboardsContext>('Dashboards')

const DashboardsProvider = ({ children }) => {
	const [dashboards, setDashboards] = useState<Maybe<DashboardDefinition>[]>([])
        const [upsertVisualizationMutation] = useUpsertVisualizationMutation();

	const updateDashboard = async ({
		id,
		name,
		metrics,
		layout,
	}: {
		id?: string
		name: string
		metrics: DashboardMetricConfigInput[]
		layout?: string
	}) => {
		const result = await upsertDashboardMutation({
			variables: { id, name, metrics, layout },
		})

		const newDashboard = result.data?.upsertDashboard
		if (newDashboard) {
			const uniqueDashboards = dashboards.filter((dashboard, index, self) =>
				index === self.findIndex((d) => d.id === newDashboard.id)
			)
			setDashboards([...uniqueDashboards, newDashboard])
		}

		return result
	}

	return (
		<DashboardsContext.Provider value={{ dashboards, updateDashboard }}>
			{children}
		</DashboardsContext.Provider>
	)
}

export { useDashboardsContext, DashboardsProvider as DashboardsContextProvider } 
