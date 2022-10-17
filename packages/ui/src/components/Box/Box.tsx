import React from 'react'
import { base } from '../../css/reset.css'
import spaces from '../../css/spaces'
import { Sprinkles, sprinkles } from '../../css/sprinkles.css'

interface Props extends Sprinkles {
	children: React.ReactNode
}

const Box: React.FC<Props> = ({ children, ...rest }) => {
	return (
		<div
			className={[
				base,
				sprinkles({
					background: { darkMode: 'purple900', lightMode: 'white' },
					color: { darkMode: 'white', lightMode: 'black' },
					...rest,
				}),
			].join(' ')}
		>
			{children}
		</div>
	)
}

export default Box
