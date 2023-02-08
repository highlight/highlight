import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import ColorHash from 'color-hash'
import React from 'react'

import styles from './Tag.module.scss'

interface Props {
	backgroundColor?: string
	color?: string
	infoTooltipText?: string
	/** Text and Background Colors are determined by the hash value. */
	autoColorsText?: string
	className?: string
}

const Tag: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	backgroundColor,
	color = 'var(--text-primary)',
	infoTooltipText,
	autoColorsText,
	className,
}) => {
	const hashBackgroundColor = autoColorsText
		? getTagBackgroundColor(autoColorsText)
		: undefined

	return (
		<div
			style={{
				backgroundColor: backgroundColor || hashBackgroundColor,
				color,
			}}
			className={clsx(className, styles.tag)}
		>
			{children}
			{infoTooltipText && <InfoTooltip title={infoTooltipText} />}
		</div>
	)
}

export default Tag

export const getTagBackgroundColor = (message: string) => {
	const colorHash = new ColorHash({ lightness: 0.9, saturation: 0.9 })
	const hashBackgroundColor = message ? colorHash.hex(message) : undefined

	return hashBackgroundColor
}
