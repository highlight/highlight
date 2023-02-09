import clsx from 'clsx'
import React from 'react'
import { useLocation } from 'react-router'

import styles from './FieldsBox.module.scss'

export const FieldsBox = ({
	children,
	id,
}: React.PropsWithChildren<{ id?: string }>) => {
	const location = useLocation()
	const divRef = React.createRef<HTMLDivElement>()
	React.useEffect(() => {
		window.setTimeout(() => {
			if (divRef.current && location.hash === `#${id}`) {
				divRef.current.scrollIntoView()
			}
		}, 1)
	}, [id, location.hash, divRef])
	return (
		<div
			id={id}
			ref={divRef}
			className={clsx(styles.fieldsBox, {
				[styles.focus]: location.hash === `#${id}`,
			})}
		>
			{children}
		</div>
	)
}
