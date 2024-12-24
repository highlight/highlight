import { IconSolidLoading } from '@highlight-run/ui/components'
import { motion } from 'framer-motion'

export const IconAnimatedLoading = ({ size }: { size?: string | number }) => {
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
			}}
		>
			<IconSolidLoading size={size} />
		</motion.div>
	)
}
