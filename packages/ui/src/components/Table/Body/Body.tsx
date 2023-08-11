import React, { Children } from 'react'

import { FullRow } from '../FullRow/FullRow'

import { Box } from '../../Box/Box'
import { Text } from '../../Text/Text'
import { IconSolidLoading } from '../../icons/'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	customEmpty?: React.ReactNode
	loading?: boolean
	customLoading?: React.ReactNode
	error?: string
	customError?: React.ReactNode
}

export const Body: React.FC<Props> = ({
	children,
	customEmpty,
	loading,
	customLoading,
	error,
	customError,
}) => {
	const renderBodyContent = () => {
		if (loading) {
			return (
				customLoading ?? (
					<FullRow>
						<IconSolidLoading className={styles.loadingIcon} />
						<Text>Loading...</Text>
					</FullRow>
				)
			)
		}

		if (error) {
			return (
				customError ?? (
					<FullRow>
						<Text color="bad">{error}</Text>
					</FullRow>
				)
			)
		}

		const emptyRows = Children.toArray(children).length === 0
		if (emptyRows) {
			return (
				customEmpty ?? (
					<FullRow>
						<Text>No results</Text>
					</FullRow>
				)
			)
		}

		return children
	}

	return <Box cssClass={styles.body}>{renderBodyContent()}</Box>
}
