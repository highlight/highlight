import { LoadingOutlined } from '@ant-design/icons'

import { Spin } from 'antd'
import React from 'react'

export const CircularSpinner = ({ style }: { style?: React.CSSProperties }) => {
	return (
		<Spin
			indicator={
				// @ts-ignore onPointerEnterCapture, onPointerLeaveCapture ignored by autoresize lib
				<LoadingOutlined
					style={{
						fontSize: 24,
						...style,
					}}
					spin
				/>
			}
		/>
	)
}
