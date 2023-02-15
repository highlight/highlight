import clsx from 'clsx'
import React from 'react'

import SvgShareIcon from '../../../static/ShareIcon'
import Button, { GenericHighlightButtonProps } from '../Button/Button'
import styles from './ShareButton.module.scss'
type Props = {} & Pick<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> &
	GenericHighlightButtonProps

const ShareButton = (props: Props) => {
	return (
		<Button
			type="link"
			{...props}
			className={clsx(props.className, styles.button)}
		>
			<SvgShareIcon />
			Share
		</Button>
	)
}

export default ShareButton
