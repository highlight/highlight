import clsx from 'clsx'
import React from 'react'
import { IconSolidAvatar } from '@highlight-run/ui/components'

import { generateRandomColor } from '../../util/color'
import styles from './Avatar.module.css'

const { userAvatar, userAvatarBorder, userAvatarText, userAvatarWrapper } =
	styles

type AvatarProps = {
	style?: React.CSSProperties
	customImage?: string
	className?: string
	size?: number
}

export const Avatar = ({
	style = {},
	customImage,
	className,
	size = 20,
}: AvatarProps) => {
	if (customImage) {
		return (
			<img
				src={customImage}
				style={{
					...style,
					height: size,
					width: size,
				}}
				className={clsx(userAvatar, className)}
			/>
		)
	}

	return <IconSolidAvatar size={size} style={style} className={className} />
}

export const AdminAvatar = ({
	adminInfo,
	size,
	border,
}: {
	adminInfo?: { name?: string; photo_url?: string | null; email?: string }
	size: number
	border?: boolean
}) => {
	let isSlackEntity = false
	let name = adminInfo?.name
	if (name && (name[0] === '@' || name[0] === '#')) {
		name = name.slice(1)
		isSlackEntity = true
	}

	const identifier = name
		? name
				.split(' ')
				.map((e) => (e[0] ? e[0].toUpperCase() : ''))
				.join('')
		: adminInfo?.email
			? adminInfo.email[0].toUpperCase()
			: 'YOU'

	return (
		<div
			className={clsx(userAvatarWrapper, {
				[userAvatarBorder]: !!border,
			})}
		>
			{adminInfo?.photo_url ? (
				<img
					className={userAvatar}
					style={{
						height: size,
						width: size,
					}}
					src={adminInfo.photo_url}
				/>
			) : (
				<div
					style={{
						backgroundColor: isSlackEntity
							? SLACK_BRAND_COLOR
							: generateRandomColor(identifier),
						color: 'var(--text-primary-inverted)',
						height: size,
						width: size,
					}}
					className={userAvatarText}
				>
					{identifier}
				</div>
			)}
		</div>
	)
}

const SLACK_BRAND_COLOR = '#471547'
