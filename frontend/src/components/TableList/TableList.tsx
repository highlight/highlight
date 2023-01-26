import { Button } from '@components/Button'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import JsonViewerV2 from '@components/JsonViewerV2/JsonViewerV2'
import LoadingBox from '@components/LoadingBox'
import { Box, Tag, Text } from '@highlight-run/ui'
import { Props as TruncateProps } from '@highlight-run/ui/src/components/private/Truncate/Truncate'
import { copyToClipboard } from '@util/string'
import React, { isValidElement } from 'react'

import * as style from './TableList.css'

const TRUNCATED_ITEMS_LIMIT = 3

export interface TableListItem {
	keyDisplayValue: string
	valueDisplayValue: React.ReactNode | object | undefined
	valueInfoTooltipMessage?: React.ReactNode
	lines?: TruncateProps['lines']
}

export const TableList = function ({
	data,
	truncateable,
	loading,
}: {
	data: TableListItem[]
	truncateable?: boolean
	loading?: boolean
}) {
	const [truncated, setTruncated] = React.useState(true)
	const filtered = data.filter((x) => x.valueDisplayValue)
	const items =
		truncateable && truncated
			? filtered.slice(0, TRUNCATED_ITEMS_LIMIT)
			: filtered
	return (
		<Box display="flex" flexDirection="column" width="full">
			<Box display="flex" flexDirection="column" gap="4" width="full">
				{items.map((item) => {
					if (!item.valueDisplayValue) {
						return null
					}
					const title = (
						<Text
							size="xSmall"
							cssClass={style.sessionAttributeText}
							lines={item.lines}
						>
							{item.keyDisplayValue}
						</Text>
					)
					return (
						<Box
							key={item.keyDisplayValue}
							className={style.sessionAttributeRow({
								json:
									typeof item.valueDisplayValue ===
										'object' &&
									!isValidElement(item.valueDisplayValue),
							})}
							onClick={() =>
								item.valueDisplayValue &&
								typeof item.valueDisplayValue !== 'object' &&
								copyToClipboard(
									item.valueDisplayValue.toLocaleString(),
								)
							}
						>
							{typeof item.valueDisplayValue === 'object' &&
							!isValidElement(item.valueDisplayValue) ? (
								<JsonViewerV2
									title={title}
									data={item.valueDisplayValue as object}
									downloadFileName={item.keyDisplayValue}
								/>
							) : (
								<>
									{title}
									<Tag
										kind="secondary"
										shape="basic"
										size="medium"
										emphasis="low"
										iconRight={
											item.valueInfoTooltipMessage ? (
												<InfoTooltip
													title={
														item.valueInfoTooltipMessage
													}
												/>
											) : undefined
										}
									>
										{item.valueDisplayValue}
									</Tag>
								</>
							)}
						</Box>
					)
				})}
				{!truncated && loading && <LoadingBox />}
			</Box>
			{truncateable && filtered.length > TRUNCATED_ITEMS_LIMIT && (
				<Box>
					<Button
						onClick={() => setTruncated(!truncated)}
						kind="secondary"
						emphasis="medium"
						size="xSmall"
						trackingId="errorBodyToggleContent"
					>
						Show {truncated ? 'more' : 'less'}
					</Button>
				</Box>
			)}
		</Box>
	)
}
