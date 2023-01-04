import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import JsonViewerV2 from '@components/JsonViewerV2/JsonViewerV2'
import { Box, Text } from '@highlight-run/ui'
import { Props as TruncateProps } from '@highlight-run/ui/src/components/private/Truncate/Truncate'
import { copyToClipboard } from '@util/string'
import clsx from 'clsx'
import React, { isValidElement } from 'react'

import * as style from './TableList.css'

export interface TableListItem {
	keyDisplayValue: string
	valueDisplayValue: React.ReactNode | object | undefined
	valueInfoTooltipMessage?: React.ReactNode
	lines?: TruncateProps['lines']
}

export const TableList = function ({ data }: { data: TableListItem[] }) {
	return (
		<Box display="flex" flexDirection="column" gap="4" width="full">
			{data.map((item) => {
				const title = (
					<Box
						display="flex"
						alignItems="center"
						style={{ height: 20 }}
					>
						<Text
							size="xSmall"
							cssClass={style.sessionAttributeText}
							lines={item.lines}
						>
							{item.keyDisplayValue}
						</Text>
					</Box>
				)
				return (
					item.valueDisplayValue && (
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
									<Box
										display="flex"
										gap="4"
										width="full"
										alignItems="center"
										style={{ height: 20 }}
									>
										<Text
											size="xSmall"
											cssClass={clsx(
												style.sessionAttributeText,
												style.secondaryText,
											)}
										>
											{item.valueDisplayValue}
										</Text>
										{item.valueInfoTooltipMessage && (
											<InfoTooltip
												title={
													item.valueInfoTooltipMessage
												}
												className={style.infoTooltip}
											/>
										)}
									</Box>
								</>
							)}
						</Box>
					)
				)
			})}
		</Box>
	)
}
