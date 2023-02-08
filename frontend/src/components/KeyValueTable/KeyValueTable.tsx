import JsonViewer from '@components/JsonViewer/JsonViewer'
import React from 'react'

import InfoTooltip from '../InfoTooltip/InfoTooltip'
import styles from './KeyValueTable.module.scss'

interface Props {
	data: KeyValueTableRow[]
	noDataMessage?: string | React.ReactNode
	tableClassName?: string
}

export interface KeyValueTableRow {
	keyDisplayValue: string
	valueDisplayValue: string | React.ReactNode | object
	/** Set this if the value needs an InfoTooltip. */
	valueInfoTooltipMessage?: string | React.ReactNode
	renderType: 'string' | 'json' | 'react-node'
}

const KeyValueTable = ({
	tableClassName,
	data,
	noDataMessage = <p>No data</p>,
}: Props) => {
	return (
		<div className={clsx(styles.table, tableClassName)}>
			{data.length === 0
				? noDataMessage
				: data.map(
						({
							keyDisplayValue,
							valueDisplayValue,
							valueInfoTooltipMessage,
							renderType,
						}) => (
							<React.Fragment
								key={`${keyDisplayValue}-${valueDisplayValue}-${valueInfoTooltipMessage}`}
							>
								<p className={styles.key}>{keyDisplayValue}</p>
								<div className={styles.value}>
									{renderType === 'string' ? (
										<>
											{valueDisplayValue}{' '}
											{!!valueInfoTooltipMessage && (
												<InfoTooltip
													title={
														valueInfoTooltipMessage
													}
													className={
														styles.infoTooltip
													}
												/>
											)}
										</>
									) : renderType === 'react-node' ? (
										<>
											{valueDisplayValue}
											{!!valueInfoTooltipMessage && (
												<InfoTooltip
													title={
														valueInfoTooltipMessage
													}
													className={
														styles.infoTooltip
													}
												/>
											)}
										</>
									) : !!valueDisplayValue ? (
										<JsonViewer
											src={valueDisplayValue as object}
											collapsed
											allowDownload
											downloadFileName={`${keyDisplayValue}`}
										/>
									) : (
										'undefined'
									)}
								</div>
							</React.Fragment>
						),
				  )}
		</div>
	)
}

export default KeyValueTable
