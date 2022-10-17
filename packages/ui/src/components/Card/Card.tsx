import React from 'react'
import spaces from '../../css/spaces'
import { sprinkles } from '../../css/sprinkles.css'

interface Props extends React.PropsWithChildren {
	padding: keyof typeof spaces
}

const Card: React.FC<Props> = ({ children }) => {
	return (
		<div
			className={sprinkles({
				background: { lightMode: 'white', darkMode: 'purple900' },
				color: { lightMode: 'black', darkMode: 'white' },
			})}
		>
			{children}
		</div>
	)
}

export default Card
