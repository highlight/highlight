import { LoadingOutlined } from '@ant-design/icons'
import { IconSearch } from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import { Spin } from 'antd'
import classNames from 'classnames'
import React from 'react'

import styles from './DropdownIndicator.module.scss'

export const DropdownIndicator = React.memo(
	({ isLoading, height }: { isLoading: boolean; height?: number }) => {
		const style: { height: number | undefined } = { height: undefined }
		if (height) {
			style.height = height
		}
		return isLoading ? (
			<div
				className={classNames(
					styles.loadingIconContainer,
					styles.dropdownIndicator,
					styles.spinner,
				)}
				style={style}
			>
				<Spin
					indicator={
						<LoadingOutlined className={styles.loadingIcon} />
					}
				/>
			</div>
		) : (
			<div
				className={classNames(styles.dropdownIndicator, styles.search)}
			>
				<IconSearch color={vars.color.n11} size={14} />
			</div>
		)
	},
)
