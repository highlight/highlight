import React from 'react'
import { Text } from '../../Text/Text'

type Props = {
	children: React.ReactNode
}

export const Header: React.FC<Props> = ({ children }) => {
	return <Text color="n11">{children}</Text>
}
