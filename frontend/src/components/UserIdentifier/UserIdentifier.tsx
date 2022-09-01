import CopyText from '@components/CopyText/CopyText'
import Tooltip from '@components/Tooltip/Tooltip'
import { getDisplayNameAndField } from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import classNames from 'classnames'
import React from 'react'

import { Session } from '../../graph/generated/schemas'
import { EmptySessionsSearchParams } from '../../pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '../../pages/Sessions/SearchContext/SearchContext'
import Button from '../Button/Button/Button'
import styles from './UserIdentifier.module.scss'

interface Props {
	session: Session
	className?: string
}

const UserIdentifier = ({ session, className }: Props) => {
	const { setSearchParams } = useSearchContext()

	const hasIdentifier = !!session?.identifier
	const [displayValue, field] = getDisplayNameAndField(session)

	// copy
	return (
		<Tooltip title={displayValue} mouseEnterDelay={0}>
			<CopyText
				text={displayValue}
				onCopyTooltipText={`Copied identifier to clipboard!`}
				custom={
					<Button
						className={classNames(styles.button, className)}
						trackingId="UserIdentifer"
						type="text"
						onClick={() => {
							const newSearchParams = {
								...EmptySessionsSearchParams,
							}

							if (hasIdentifier && field !== null) {
								newSearchParams.user_properties = [
									{
										id: '0',
										name: field,
										value: displayValue,
									},
								]
							} else if (session?.fingerprint) {
								newSearchParams.device_id =
									session.fingerprint.toString()
							}

							setSearchParams(newSearchParams)
						}}
					>
						{displayValue}
					</Button>
				}
				inline
			/>
		</Tooltip>
	)
}

export default UserIdentifier
