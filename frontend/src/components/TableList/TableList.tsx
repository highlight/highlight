import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import LoadingBox from '@components/LoadingBox'
import TextViewer from '@components/TextViewer'
import { Box, Tag, Text } from '@highlight-run/ui/components'
import { Props as TruncateProps } from '@highlight-run/ui/src/components/private/Truncate/Truncate'
import { copyToClipboard } from '@util/string'
import React, { isValidElement, ReactElement } from 'react'

import * as style from './TableList.css'

const TRUNCATED_ITEMS_LIMIT = 3

export interface TableListItem {
	keyDisplayValue: string
	valueDisplayValue: React.ReactNode | object | undefined
	valueInfoTooltipMessage?: React.ReactNode
	lines?: TruncateProps['lines']
	data?: object
}

export const TableList = ({
	data,
	truncateable,
	loading,
	noDataMessage,
}: {
	data: TableListItem[]
	truncateable?: boolean
	loading?: boolean
	noDataMessage?: string | React.ReactNode
}) => {
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
							lines={item.lines}
							as="span"
							color="weak"
							wrap="breakWord"
							cssClass={style.keyDisplayValue}
						>
							{item.keyDisplayValue}
						</Text>
					)
					return (
						<Box
							key={item.keyDisplayValue}
							cssClass={style.sessionAttributeRow({
								json:
									(typeof item.valueDisplayValue ===
										'object' &&
										!isValidElement(
											item.valueDisplayValue,
										)) ||
									!!item.data,
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
								<TextViewer
									title={title}
									data={item.valueDisplayValue as object}
									downloadFileName={item.keyDisplayValue}
								/>
							) : !item.data ? (
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
							) : (
								<TextViewer
									title={title}
									data={item.data}
									downloadFileName={item.keyDisplayValue}
									repr={
										item.valueDisplayValue as ReactElement<any>
									}
								/>
							)}
						</Box>
					)
				})}
				{!truncated && loading && <LoadingBox />}
				{!loading && filtered.length === 0 && noDataMessage}
			</Box>
			{truncateable && filtered.length > TRUNCATED_ITEMS_LIMIT && (
				<Box mt="4">
					<Tag
						onClick={() => setTruncated(!truncated)}
						kind="secondary"
						emphasis="medium"
						shape="basic"
					>
						Show {truncated ? 'more' : 'less'}
					</Tag>
				</Box>
			)}
		</Box>
	)
}
