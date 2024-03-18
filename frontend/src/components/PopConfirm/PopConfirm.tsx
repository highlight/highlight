import { Popconfirm as AntDesignPopconfirm, PopconfirmProps } from 'antd'

import styles from './PopConfirm.module.css'

type Props = Pick<
	PopconfirmProps,
	| 'cancelText'
	| 'okText'
	| 'children'
	| 'onConfirm'
	| 'onCancel'
	| 'placement'
	| 'align'
	| 'okButtonProps'
	| 'visible'
> & {
	title: string
	description: string
}

const PopConfirm = ({ children, title, description, ...props }: Props) => {
	return (
		<AntDesignPopconfirm
			{...props}
			icon={null}
			overlayClassName={styles.popConfirmContainer}
			title={
				<>
					<h4>{title}</h4>
					<p className={styles.description}>{description}</p>
				</>
			}
		>
			{children}
		</AntDesignPopconfirm>
	)
}

export default PopConfirm
