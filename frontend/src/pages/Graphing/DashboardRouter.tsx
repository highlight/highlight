import { Navigate, Route, Routes } from 'react-router-dom'

import { Dashboard } from '@/pages/Graphing/Dashboard'
import { ExpandedGraph } from '@/pages/Graphing/ExpandedGraph'
import { GraphingEditor } from '@/pages/Graphing/GraphingEditor'

const DashboardRouter = () => {
	return (
		<Routes>
			<Route path="*" element={<Navigate to="1" replace />} />
			<Route path=":dashboard_id" element={<Dashboard />} />
			<Route
				path=":dashboard_id/edit/:graph_id"
				element={<GraphingEditor />}
			/>
			<Route path=":dashboard_id/new" element={<GraphingEditor />} />
			<Route
				path=":dashboard_id/view/:graph_id"
				element={<ExpandedGraph />}
			/>
		</Routes>
	)
}

export default DashboardRouter
