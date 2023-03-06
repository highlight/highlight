import { Avatar } from '@components/Avatar/Avatar'
import { getPercentageDisplayValue } from '@components/ProgressBarTable/utils/utils'
import { Session } from '@graph/schemas'
import { getIdentifiedUserProfileImage } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import clsx from 'clsx'
import React from 'react'

import styles from './ProgressBarTableColumns.module.scss'

interface ProgressBarTablePercentageProps {
	percent: number
}

export const ProgressBarTablePercentage = ({
	percent,
}: ProgressBarTablePercentageProps) => {
	return (
		<div className={styles.percentContainer}>
			<div
				className={styles.barGraph}
				style={
					{
						'--percentage': `${percent}%`,
					} as React.CSSProperties
				}
			></div>
			<span>{getPercentageDisplayValue(percent / 100)}</span>
		</div>
	)
}

interface ProgressBarTableRowGroupProps {
	alignment?: 'leading' | 'ending'
}

export const ProgressBarTableRowGroup: React.FC<
	React.PropsWithChildren<ProgressBarTableRowGroupProps>
> = ({ alignment = 'leading', children }) => {
	return (
		<div
			className={clsx(styles.rowGroup, {
				[styles.endingAlignment]: alignment === 'ending',
			})}
		>
			{children}
		</div>
	)
}

interface ProgressBarTablePillProps {
	icon?: React.ReactNode
	displayValue: string
}

export const ProgressBarTablePill = ({
	displayValue,
	icon,
}: ProgressBarTablePillProps) => {
	return (
		<div className={styles.pill}>
			{icon && icon}
			{displayValue}
		</div>
	)
}

interface ProgressBarTableUserAvatarProps {
	userProperties: string
	identifier: string
}

export const ProgressBarTableUserAvatar = ({
	identifier,
	userProperties,
}: ProgressBarTableUserAvatarProps) => {
	return (
		<Avatar
			seed={identifier}
			style={{
				height: 'var(--size-large)',
				width: 'var(--size-large)',
				borderRadius: 'var(--size-xSmall)',
				border: '1px solid var(--text-primary-inverted)',
				flexShrink: 0,
			}}
			customImage={getIdentifiedUserProfileImage({
				user_properties: userProperties,
			} as Session)}
		/>
	)
}
