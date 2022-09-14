import Button from '@components/Button/Button/Button'
import SvgAnnotationDotsIcon from '@icons/AnnotationDotsIcon'
import React from 'react'

import styles from './ErrorCommentButton.module.scss'

interface Props {
	onClick: () => void
	trackingId?: string
}

export function ErrorCommentButton({
	onClick,
	trackingId,
	children,
}: React.PropsWithChildren<Props>) {
	if (!children)
		// list the default text in an array to avoid
		// an automatic addition of <span> that breaks styling
		children = [
			<SvgAnnotationDotsIcon key={0} />,
			<span key={1}>Comment</span>,
		]
	return (
		<Button
			type="primary"
			trackingId={trackingId ?? 'ErrorCommentButton'}
			onClick={onClick}
			className={styles.button}
		>
			{children}
		</Button>
	)
}
