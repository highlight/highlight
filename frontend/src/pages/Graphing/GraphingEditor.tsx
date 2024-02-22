import {
	Badge,
	Box,
	Button,
	Form,
	IconSolidCheveronDown,
	Input,
	Label,
	Menu,
	Text,
	useFormStore,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { Divider } from 'antd'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Switch from '@/components/Switch/Switch'
import Graph from '@/pages/Graphing/components/Graph'

import * as style from './GraphingEditor.css'

const PRODUCTS = ['Traces', 'Logs', 'Sessions', 'Errors']
const VIEW_TYPES = ['Line chart', 'Bar chart', 'Pie chart', 'Table', 'List']
const FUNCTION_TYPES = [
	'Count',
	'Min',
	'Avg',
	'P50',
	'P90',
	'P95',
	'P99',
	'Max',
	'Sum',
]

const OptionDropdown = ({
	options,
	selection,
	setSelection,
}: {
	options: string[]
	selection: string
	setSelection: (option: string) => void
}) => {
	return (
		<Menu>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="medium"
				style={{
					border: vars.border.divider,
					width: '100%',
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					justifyContent="space-between"
				>
					<Box display="flex" flexGrow={1}>
						{selection}
					</Box>
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{options.map((p) => (
					<Menu.Item
						key={p}
						onClick={() => {
							setSelection(p)
						}}
					>
						{p}
					</Menu.Item>
				))}
			</Menu.List>
		</Menu>
	)
}

export const GraphingEditor = () => {
	const [product, setProduct] = useState(PRODUCTS[0])
	const [viewType, setViewType] = useState(VIEW_TYPES[0])
	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [metric, setMetric] = useState('')
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [bucketByEnabled, setBucketByEnabled] = useState(true)

	const formStore = useFormStore({
		defaultValues: {},
	})

	return (
		<>
			<Helmet>
				<title>Edit Metric View</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<Box
						width="full"
						cssClass={style.editGraphHeader}
						borderBottom="dividerWeak"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						paddingLeft="12"
						paddingRight="8"
						py="6"
					>
						<Text size="small" weight="medium">
							Edit Metric View
						</Text>
						<Box display="flex" gap="4">
							<Button emphasis="low" kind="secondary">
								Cancel
							</Button>
							<Button>
								Create metric view&nbsp;
								<Badge
									variant="outlinePurple"
									shape="basic"
									size="small"
									label={[cmdKey, 'S'].join('+')}
								/>
							</Button>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						height="full"
					>
						<Box display="flex" cssClass={style.graphWrapper}>
							<Graph
								data={[1, 2, 10, 3, 2, 1, 1, 3, 5, 2, 3, 4].map(
									(val, idx) => ({
										xAxis: idx,
										series1: val,
										series2: val + (idx * idx) / 8,
									}),
								)}
								chartLabel="Graph title"
								yAxisLabel="yAxisLabel"
								xAxisKey="xAxis"
								strokeColor="#000000"
								fillColor="#555555"
							/>
						</Box>
						<Box
							display="flex"
							borderLeft="dividerWeak"
							height="full"
							cssClass={style.graphEditSidebar}
						>
							<Form
								store={formStore}
								className={style.graphEditSidebar}
							>
								<Box p="12" width="full">
									<Label
										label="Metric view title"
										name="title"
									/>
									<Input
										type="text"
										name="title"
										placeholder="Enter name displayed as the title"
									/>
								</Box>
								<Divider className="m-0" />
								<Box p="12" width="full">
									<Label label="Source" name="source" />
									<OptionDropdown
										options={PRODUCTS}
										selection={product}
										setSelection={setProduct}
									/>
								</Box>
								<Divider className="m-0" />
								<Box p="12" width="full">
									<Label label="View type" name="viewType" />
									<OptionDropdown
										options={VIEW_TYPES}
										selection={viewType}
										setSelection={setViewType}
									/>
								</Box>
								<Divider className="m-0" />
								<Box p="12" width="full">
									<Label label="Function" name="function" />
									<OptionDropdown
										options={FUNCTION_TYPES}
										selection={functionType}
										setSelection={setFunctionType}
									/>
									<OptionDropdown
										options={FUNCTION_TYPES}
										selection={functionType}
										setSelection={setFunctionType}
									/>
									<Label label="Filters" name="filters" />
									<Input
										type="text"
										name="filters"
										placeholder="Enter search filters"
									/>
								</Box>
								<Divider className="m-0" />
								<Box p="12" width="full">
									<Box
										display="flex"
										flexDirection="row"
										gap="6"
									>
										<Label
											label="Group by"
											name="groupBy"
										/>
										<Switch
											trackingId="groupByEnabled"
											size="small"
											checked={groupByEnabled}
											onChange={(enabled) => {
												setGroupByEnabled(enabled)
											}}
										/>
									</Box>
									<Input
										type="text"
										name="filters"
										placeholder="Enter search filters"
									/>
									<Label label="Limit" name="limit" />
									<Input
										type="number"
										name="limit"
										placeholder="Enter limit"
									/>
									<Label label="By" name="limitBy" />
									<OptionDropdown
										options={FUNCTION_TYPES}
										selection={functionType}
										setSelection={setFunctionType}
									/>
									<OptionDropdown
										options={FUNCTION_TYPES}
										selection={functionType}
										setSelection={setFunctionType}
									/>
									<Label label="Filters" name="filters" />
								</Box>
								<Divider className="m-0" />
								<Box p="12" width="full">
									<Box
										display="flex"
										flexDirection="row"
										gap="6"
									>
										<Label
											label="Bucket by"
											name="bucketBy"
										/>
										<Switch
											trackingId="bucketByEnabled"
											size="small"
											checked={bucketByEnabled}
											onChange={(enabled) => {
												setBucketByEnabled(enabled)
											}}
										/>
									</Box>
									<Input
										type="text"
										name="filters"
										placeholder="Enter search filters"
									/>
									<Label label="Buckets" name="bucketCount" />
									<Input
										type="number"
										name="bucketCount"
										placeholder="Enter bucket count"
									/>
								</Box>
							</Form>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
