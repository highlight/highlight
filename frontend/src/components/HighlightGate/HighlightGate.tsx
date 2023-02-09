import { useAuthContext } from '@authentication/AuthContext'
import clsx from 'clsx'
import React from 'react'

interface Props {
	featureIsOn?: boolean
}

const HighlightGate: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	featureIsOn = true,
}) => {
	const { isHighlightAdmin } = useAuthContext()

	if (!isHighlightAdmin || !featureIsOn) {
		return null
	}

	return (
		<>
			{React.Children.map(children, (child) => {
				// @ts-expect-error
				return React.cloneElement(child, {
					className: clsx(
						// @ts-expect-error
						child?.props.className,
					),
				})
			})}
		</>
	)
}

export default HighlightGate
