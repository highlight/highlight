import 'react-loading-skeleton/dist/skeleton.css'

import React from 'react'
import SkeletonComponent, { SkeletonProps } from 'react-loading-skeleton'

import styles from './Skeleton.module.scss'

type Props = Pick<
	SkeletonProps,
	'height' | 'width' | 'count' | 'containerClassName' | 'circle' | 'style'
>

export const Skeleton = (props: Props) => {
	return (
		<SkeletonComponent
			{...props}
			className={styles.skeleton}
		></SkeletonComponent>
	)
}
