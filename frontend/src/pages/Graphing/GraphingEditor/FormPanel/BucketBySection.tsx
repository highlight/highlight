import { Input, Select, TagSwitchGroup } from '@highlight-run/ui/components'
import React from 'react'

import { TIMESTAMP_KEY } from '@/pages/Graphing/components/Graph'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { BUCKET_FREQUENCIES } from '@pages/Graphing/util'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { Combobox } from '@/pages/Graphing/Combobox'
import {
	BUCKET_BY_OPTIONS,
	BucketBySetting,
	MAX_BUCKET_SIZE,
} from '@pages/Graphing/constants'
import { SidebarSection } from '@/pages/Graphing/GraphingEditor/FormPanel/SidebarSection'

import * as style from '../GraphingEditor.css'

type Props = {
	isPreview: boolean
	searchOptionsConfig: any
	variableKeys: string[]
}

export const BucketBySection: React.FC<Props> = ({
	isPreview,
	searchOptionsConfig,
	variableKeys,
}) => {
	const {
		settings,
		setBucketByEnabled,
		setBucketBySetting,
		setBucketByKey,
		setBucketCount,
		setBucketInterval,
	} = useGraphingEditorContext()

	if (settings.viewType === 'Funnel chart') {
		return null
	}

	return (
		<SidebarSection>
			<LabeledRow
				label="Bucket by"
				name="bucketBy"
				tooltip="The method for determining the bucket sizes - can be a fixed interval or fixed count."
				enabled={settings.bucketByEnabled}
				setEnabled={setBucketByEnabled}
			>
				<TagSwitchGroup
					options={BUCKET_BY_OPTIONS}
					defaultValue={settings.bucketBySetting}
					onChange={(o: string | number) => {
						setBucketBySetting(o as BucketBySetting)
					}}
					cssClass={style.tagSwitch}
					disabled={isPreview}
				/>
			</LabeledRow>
			{settings.bucketByEnabled &&
				settings.bucketBySetting === 'Count' && (
					<>
						<LabeledRow
							label="Bucket field"
							name="bucketField"
							tooltip="A numeric field for bucketing results along the X-axis. Timestamp for time series charts, numeric fields for histograms, can be disabled to aggregate all results within the time range."
						>
							<Combobox
								selection={settings.bucketByKey}
								setSelection={setBucketByKey}
								searchConfig={searchOptionsConfig}
								defaultKeys={[TIMESTAMP_KEY, ...variableKeys]}
								onlyNumericKeys
								disabled={isPreview}
							/>
						</LabeledRow>
						<LabeledRow
							label="Buckets"
							name="bucketCount"
							tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets. Currently, the max is 100."
						>
							<Input
								type="number"
								name="bucketCount"
								placeholder="Enter bucket count"
								value={settings.bucketCount}
								onChange={(e) => {
									const newValue = Math.min(
										MAX_BUCKET_SIZE,
										parseInt(e.target.value),
									)

									setBucketCount(newValue)
								}}
								cssClass={style.input}
								disabled={isPreview}
							/>
						</LabeledRow>
					</>
				)}
			{settings.bucketByEnabled &&
				settings.bucketBySetting === 'Interval' && (
					<LabeledRow
						label="Bucket interval"
						name="bucketInterval"
						tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
					>
						<Select
							options={BUCKET_FREQUENCIES}
							value={settings.bucketInterval}
							onValueChange={(o) => {
								setBucketInterval(o.value)
							}}
							disabled={isPreview}
						/>
					</LabeledRow>
				)}
		</SidebarSection>
	)
}
