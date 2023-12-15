import { motion } from 'framer-motion'
import React from 'react'

export const AnimateIn = ({ children }: React.PropsWithChildren) => {
	return (
		<motion.div
			initial={{ bottom: -200 }}
			animate={{
				bottom: -38,
			}}
			transition={{
				type: 'spring',
				bounce: 0.4,
				duration: 0.8,
				delay: 1,
			}}
			style={{
				position: 'fixed',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				zIndex: 2000,
			}}
		>
			{children}
		</motion.div>
	)
}

export const AnimateBugLeft = ({
	loaded,
	children,
}: React.PropsWithChildren<{ loaded: boolean }>) => {
	const orig = { left: -300, top: 0, opacity: 0 }
	const final = {
		left: -120,
		top: 125,
		opacity: 1,
		transition: {
			opacity: { delay: 1.2 },
			top: {
				type: 'spring',
				bounce: 0.4,
				duration: 0.8,
				delay: 1,
			},
			left: {
				type: 'spring',
				bounce: 0.4,
				duration: 0.8,
				delay: 1,
			},
		},
	}

	return (
		<motion.div
			initial={orig}
			animate={final}
			style={{
				position: 'absolute',
				width: 250,
			}}
		>
			{children}
		</motion.div>
	)
}

export const AnimateBugRight = ({
	loaded,
	children,
}: React.PropsWithChildren<{ loaded: boolean }>) => {
	const orig = { right: -275, top: -95, opacity: 0 }
	const final = {
		right: -95,
		top: 30,
		opacity: 1,
		transition: {
			opacity: { delay: 1.2 },
			top: {
				type: 'spring',
				bounce: 0.4,
				duration: 0.8,
				delay: 1,
			},
			right: {
				type: 'spring',
				bounce: 0.4,
				duration: 0.8,
				delay: 1,
			},
		},
	}

	return (
		<motion.div
			initial={orig}
			animate={loaded ? final : orig}
			style={{
				position: 'absolute',
				width: 250,
			}}
		>
			{children}
		</motion.div>
	)
}

export const AnimateCarouselImage = ({
	loaded,
	children,
}: React.PropsWithChildren<{ loaded: boolean }>) => {
	const orig = { bottom: -20, opacity: 0 }
	const final = { bottom: -20, opacity: 1 }
	return (
		<motion.div
			initial={orig}
			animate={loaded ? final : orig}
			transition={{
				type: 'spring',
				bounce: 0.2,
				duration: 0.4,
			}}
			className="absolute right-0 sm:w-[280px] md:w-[300px] lg:w-[450px] xl:w-[450px]"
		>
			{children}
		</motion.div>
	)
}

export const AnimateFeatureHeroRight = ({
	loaded,
	children,
	delay,
}: React.PropsWithChildren<{ loaded: boolean; delay?: number }>) => {
	const orig = { right: '-500px', opacity: 0 }
	const final = { right: '-30px', opacity: 1 }
	return (
		<motion.div
			initial={orig}
			animate={loaded ? final : orig}
			transition={{
				type: 'spring',
				bounce: 0.2,
				duration: 0.4,
				delay: delay || 0,
			}}
			className="absolute lg:-translate-y-96 xl:-translate-y-16 lg:w-[550px] xl:w-[650px] ultra:w-[500px]"
		>
			{children}
		</motion.div>
	)
}

export const AnimateFeatureHeroXL = ({
	loaded,
	children,
	delay,
}: React.PropsWithChildren<{ loaded: boolean; delay?: number }>) => {
	const orig = { right: '-500px', opacity: 0 }
	const final = { right: '0px', opacity: 1 }
	return (
		<motion.div
			initial={orig}
			animate={loaded ? final : orig}
			transition={{
				type: 'spring',
				bounce: 0.2,
				duration: 0.4,
				delay: delay || 0,
			}}
			className="absolute ultra:w-[650px] translate-x-24 translate-y-8 h-full flex flex-col justify-center overflow-hidden"
		>
			{children}
		</motion.div>
	)
}

export const AnimateMobileCarouselImage = ({
	loaded,
	children,
}: React.PropsWithChildren<{ loaded: boolean }>) => {
	const orig = { bottom: -300, opacity: 0 }
	const final = { bottom: 30, opacity: 1 }
	return (
		<motion.div
			initial={orig}
			animate={loaded ? final : orig}
			transition={{
				type: 'spring',
				bounce: 0.2,
				duration: 0.4,
			}}
			className="absolute bottom-0 border-2 border-red-500 h-[200px] w-[200px]"
		>
			{children}
		</motion.div>
	)
}
