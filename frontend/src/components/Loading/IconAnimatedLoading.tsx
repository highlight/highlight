import { IconSolidLoading } from '@highlight-run/ui/components'
import { motion } from 'framer-motion'
import { CSSProperties } from 'react'

export const IconAnimatedLoading = ({
	size,
	style,
}: {
	size?: string | number
	style?: CSSProperties
}) => {
	return (
		<motion.div
			animate={{ rotate: 360 }}
			transition={{
				duration: 1,
				repeat: Infinity,
				ease: 'linear',
			}}
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: 14,
				height: 14,
				...style,
			}}
		>
			<IconSolidLoading size={size} />
		</motion.div>
	)
}
