import { LoadingOutlined } from '@ant-design/icons'
import { IconSolidSearch } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { Spin } from 'antd'
import clsx from 'clsx'
import React from 'react'

import styles from './DropdownIndicator.module.css'

export const DropdownIndicator = React.memo(
	({ isLoading, height }: { isLoading: boolean; height?: number }) => {
		const style: { height: number | undefined } = { height: undefined }
		if (height) {
			style.height = height
		}
		return isLoading ? (
			<div
				className={clsx(
					styles.loadingIconContainer,
					styles.dropdownIndicator,
					styles.spinner,
				)}
				style={style}
			>
				<Spin indicator={<LoadingOutlined color={vars.color.n9} />} />
			</div>
		) : (
			<div className={clsx(styles.dropdownIndicator, styles.search)}>
				<IconSolidSearch color={vars.color.n9} />
			</div>
		)
	},
)
