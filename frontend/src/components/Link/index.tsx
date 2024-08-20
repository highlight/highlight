import clsx from 'clsx'
import React from 'react'
import { LinkProps, Link as ReactRouterLink } from 'react-router-dom'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & LinkProps

export const Link: React.FC<Props> = ({ children, ...linkProps }) => {
	return (
		<ReactRouterLink className={clsx(styles.link)} {...linkProps}>
			{children}
		</ReactRouterLink>
	)
}
