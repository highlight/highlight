import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import validator from 'validator'

import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip'
import styles from './StreamElementPayload.module.css'
import { isJson } from './utils'

interface StreamElementProps {
	payload?: string
	searchQuery?: string
}

const StreamElementPayload = ({ payload, searchQuery }: StreamElementProps) => {
	if (!payload) {
		return null
	}

	const validatorUrlOptions: validator.IsURLOptions = {
		require_host: false,
		allow_trailing_dot: true,
		require_protocol: true,
		require_tld: false,
	}

	if (validator.isURL(payload, validatorUrlOptions)) {
		return (
			<div>
				<a
					href={payload}
					target="_blank"
					rel="noopener noreferrer"
					className={styles.anchor}
				>
					{searchQuery ? (
						<TextHighlighter
							searchWords={searchQuery.split(' ')}
							textToHighlight={payload}
						/>
					) : (
						payload
					)}
				</a>
			</div>
		)
	}

	if (isJson(payload)) {
		const object = JSON.parse(payload)
		const keys = Object.keys(object)
		// Do not show keys that have empty values.
		const emptyValuesRemovedKeys = keys.filter((key) => object[key] !== '')

		return (
			<div className={styles.objectList}>
				{emptyValuesRemovedKeys.map((key) => (
					<>
						<span className={styles.objectKey}>
							{searchQuery ? (
								<TextHighlighter
									searchWords={searchQuery.split(' ')}
									textToHighlight={key}
								/>
							) : (
								key
							)}
						</span>{' '}
						<span className={styles.objectValue}>
							{validator.isURL(
								object[key]?.toString() || '',
								validatorUrlOptions,
							) ? (
								<a href={object[key]}>
									{searchQuery ? (
										<TextHighlighter
											searchWords={searchQuery.split(' ')}
											textToHighlight={object[key]}
										/>
									) : (
										object[key]
									)}
								</a>
							) : searchQuery ? (
								<TextHighlighter
									searchWords={searchQuery.split(' ')}
									textToHighlight={object[key]?.toString()}
								/>
							) : (
								object[key]?.toString() || (
									<span>
										undefined{' '}
										<InfoTooltip
											title={`No value was provided for ${key} from your application.`}
											align={{ offset: [12, 0] }}
											placement="topRight"
										/>
									</span>
								)
							)}
						</span>
					</>
				))}
			</div>
		)
	}

	return (
		<div>
			{searchQuery ? (
				<TextHighlighter
					searchWords={searchQuery.split(' ')}
					textToHighlight={payload}
				/>
			) : (
				payload
			)}
		</div>
	)
}

export default StreamElementPayload
