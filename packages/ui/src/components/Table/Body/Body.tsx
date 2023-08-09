import React, { Children } from 'react'
import { Box } from '../../Box/Box'
import { IconSolidLoading } from '../../icons/'
import { Row } from '../Row/Row'
import { Cell } from '../Cell/Cell'
import { Text } from '../../Text/Text'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
}

// implicit props set from the parent table
type ParentPassedProps = {
	loading?: boolean
	error?: string
}

export const Body: React.FC<Props & ParentPassedProps> = ({
	children,
	loading,
	error,
}) => {
	const renderBodyContent = () => {
		if (loading) {
			return <LoadingBody />
		}

		if (error) {
			return <ErrorBody error={error} />
		}

		const empty = Children.toArray(children).length === 0
		if (empty) {
			return <EmptyBody />
		}

		return children
	}

	return <Box cssClass={styles.body}>{renderBodyContent()}</Box>
}

const LoadingBody: React.FC = () => (
	<Row gridColumns={['100%']}>
		<Cell justifyContent="center" my="8">
			<IconSolidLoading className={styles.loadingIcon} />
			<Text>Loading...</Text>
		</Cell>
	</Row>
)

const ErrorBody: React.FC<{ error: string }> = ({ error }) => (
	<Row gridColumns={['100%']}>
		<Cell justifyContent="center" my="8">
			<Text color="bad">{error}</Text>
		</Cell>
	</Row>
)

const EmptyBody: React.FC = () => (
	<Row gridColumns={['100%']}>
		<Cell justifyContent="center" my="8">
			<Text>No results</Text>
		</Cell>
	</Row>
)
