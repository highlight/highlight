import React from 'react'
import { sprinkles } from '../../css/sprinkles.css'

type Props = React.PropsWithChildren

const Card: React.FC<Props> = ({ children }) => {
	return <div className={sprinkles({ padding: 'large' })}>{children}</div>
}

export default Card
