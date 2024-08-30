import clsx from 'clsx'
import React, { useMemo } from 'react'
import ReactNiceAvatar, { genConfig } from 'react-nice-avatar'

import { generateRandomColor } from '../../util/color'
import styles from './Avatar.module.css'

const { userAvatar, userAvatarBorder, userAvatarText, userAvatarWrapper } =
	styles

const BACKGROUND_COLORS = [
	'--color-purple-300',
	'--color-blue-400',
	'--color-blue-300',
	'--color-purple-400',
	'--color-green-400',
	'--color-green-500',
	'--color-yellow-400',
	'--color-orange-400',
	'--color-red-300',
] as const

const EAR_SIZES = ['big', 'small'] as const
const EYE_STYLES = ['circle', 'oval', 'smile'] as const
const FACE_COLORS = [
	'#F9C9B6',
	'#AC6651',
	'#3b2219',
	'#a16e4b',
	'#d4aa78',
	'#e6bc98',
	'#ffe7d1',
] as const
const SEXES = ['man', 'woman'] as const
const HAIR_COLORS = [
	'#282828',
	'#000000',
	'#505050',
	'#dc95dc',
	'#50b4ff',
	'#5a3214',
	'#ff5050',
	'#11642f',
	'#3264c8',
	'#ffff5a',
	'#fe5caa',
	'#b4cdff',
] as const
const HAIR_STYLES = [
	'normal',
	'thick',
	'mohawk',
	'womanLong',
	'womanShort',
] as const
const HAT_STYLES = ['beanie', 'none'] as const
const GLASSES_STYLES = ['round', 'square', 'none'] as const
const NOSE_STYLES = ['short', 'long', 'round'] as const
const MOUTH_STYLES = ['laugh', 'smile', 'peace'] as const
const SHIRT_STYLES = ['hoody', 'short', 'polo'] as const

export const Avatar = ({
	style = {},
	seed,
	shape = 'circle',
	customImage,
	className,
}: {
	style?: React.CSSProperties
	seed: string
	shape?: 'circle' | 'rounded' | 'square'
	/** Use `customImage` instead of generating a random SVG Avatar. */
	customImage?: string
	className?: string
}) => {
	const config = useMemo(() => {
		const seedAsInt = getAvatarHash(seed)
		return genConfig({
			bgColor: `var(${
				BACKGROUND_COLORS[seedAsInt % BACKGROUND_COLORS.length]
			})`,
			earSize: EAR_SIZES[seedAsInt % EAR_SIZES.length],
			eyeStyle: EYE_STYLES[seedAsInt % EYE_STYLES.length],
			faceColor: FACE_COLORS[seedAsInt % FACE_COLORS.length],
			sex: SEXES[seedAsInt % SEXES.length],
			hairColor: HAIR_COLORS[seedAsInt % HAIR_COLORS.length],
			hairStyle: HAIR_STYLES[seedAsInt % HAIR_STYLES.length],
			hatColor: `var(${
				BACKGROUND_COLORS[(seedAsInt * 3) % BACKGROUND_COLORS.length]
			})`,
			hatStyle: HAT_STYLES[seedAsInt % HAT_STYLES.length],
			glassesStyle: GLASSES_STYLES[seedAsInt % GLASSES_STYLES.length],
			noseStyle: NOSE_STYLES[seedAsInt % NOSE_STYLES.length],
			mouthStyle: MOUTH_STYLES[seedAsInt % MOUTH_STYLES.length],
			shirtStyle: SHIRT_STYLES[seedAsInt % MOUTH_STYLES.length],
			shirtColor: '#5629c6',
		})
	}, [seed])

	if (customImage) {
		return (
			<img
				src={customImage}
				style={style}
				className={clsx(userAvatar, className)}
			/>
		)
	}

	return (
		<ReactNiceAvatar
			style={style as any}
			{...config}
			shape={shape}
			className={className}
		/>
	)
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

/**
 * Source:  https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
const getAvatarHash = (str: string) => {
	let hash = 0,
		i = 0
	const len = str.length
	while (i < len) {
		hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0
	}
	return hash + 2147483647 + 1
}

const SLACK_BRAND_COLOR = '#471547'
