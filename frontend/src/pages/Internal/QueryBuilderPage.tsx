// import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
//import MaterialConfig from "react-awesome-query-builder/lib/config/material";
import 'react-awesome-query-builder/lib/css/compact_styles.css' //optional, for more compact styles
import 'react-awesome-query-builder/lib/css/styles.css'

import JsonViewer from '@components/JsonViewer/JsonViewer'
import React, { useState } from 'react'
import { Builder, Query, Utils as QbUtils } from 'react-awesome-query-builder'
// types
import {
	BuilderProps,
	Config,
	ImmutableTree,
	JsonGroup,
} from 'react-awesome-query-builder'
// For AntDesign widgets only:
import AntdConfig from 'react-awesome-query-builder/lib/config/antd'

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig // or MaterialConfig or BasicConfig

// You need to provide your own config. See below 'Config format'
const config: Config = {
	...InitialConfig,
	fields: {
		qty: {
			label: 'Qty',
			type: 'number',
			fieldSettings: {
				min: 0,
			},
			valueSources: ['value'],
			preferWidgets: ['number'],
		},
		price: {
			label: 'Price',
			type: 'number',
			valueSources: ['value'],
			fieldSettings: {
				min: 10,
				max: 100,
			},
			preferWidgets: ['slider', 'rangeslider'],
		},
		color: {
			label: 'Color',
			type: 'select',
			valueSources: ['value'],
			fieldSettings: {
				listValues: [
					{ value: 'yellow', title: 'Yellow' },
					{ value: 'green', title: 'Green' },
					{ value: 'orange', title: 'Orange' },
				],
			},
		},
		is_promotion: {
			label: 'Promo?',
			type: 'boolean',
			operators: ['equal'],
			valueSources: ['value'],
		},
		name: {
			label: 'Nam!e',
			type: 'text',
		},
	},
}

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' }

const QueryBuilderPage: React.FC<React.PropsWithChildren<unknown>> = () => {
	const [state, setState] = useState({
		tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
		config: config,
	})

	const onChange = (immutableTree: ImmutableTree, config: Config) => {
		// Tip: for better performance you can apply `throttle` - see `examples/demo`
		setState({ tree: immutableTree, config: config })

		const jsonTree = QbUtils.getTree(immutableTree)
		console.log(jsonTree)
		// `jsonTree` can be saved to backend, and later loaded to `queryValue`
	}

	const renderBuilder = (props: BuilderProps) => (
		<div className="query-builder-container" style={{ padding: '10px' }}>
			<div className="query-builder qb-lite">
				<Builder {...props} />
			</div>
		</div>
	)

	return (
		<div>
			<Query
				{...config}
				value={state.tree}
				onChange={onChange}
				renderBuilder={renderBuilder}
			/>
			<div className="query-builder-result">
				<div>
					Query string:{' '}
					<pre>
						{JSON.stringify(
							QbUtils.queryString(state.tree, state.config),
						)}
					</pre>
				</div>
				<div>
					MongoDb query:{' '}
					<pre>
						{JSON.stringify(
							QbUtils.mongodbFormat(state.tree, state.config),
						)}
					</pre>
				</div>
				<div>
					SQL where:{' '}
					<pre>
						{JSON.stringify(
							QbUtils.sqlFormat(state.tree, state.config),
						)}
					</pre>
				</div>
				<div>
					JsonLogic:{' '}
					<pre>
						{JSON.stringify(
							QbUtils.jsonLogicFormat(state.tree, state.config),
						)}
					</pre>
				</div>
				<div>
					Elastic:{' '}
					<pre>
						<JsonViewer
							collapsed={false}
							src={
								QbUtils.elasticSearchFormat(
									state.tree,
									state.config,
								) || {}
							}
						/>
						{JSON.stringify(
							QbUtils.elasticSearchFormat(
								state.tree,
								state.config,
							),
						)}
					</pre>
				</div>
			</div>
		</div>
	)
}

export default QueryBuilderPage
