import { Button } from '@components/Button'
import { Box, Callout, Text } from '@highlight-run/ui'
import SvgSearchIcon from '@icons/SearchIcon'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import React, { useEffect } from 'react'

import styles from './NoActiveSessionCard.module.scss'

const NoActiveSessionCard = () => {
	const { setShowLeftPanel } = useErrorPageConfiguration()
	const { setIsQuickSearchOpen } = useSearchContext()

	useEffect(() => {
		setShowLeftPanel(true)
	}, [setShowLeftPanel])

	return (
		<Box cssClass={styles.card}>
			<Callout title="Ready to see your app?">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
				>
					<Text color="moderate">
						View a recent session or find a specific identifier,
						URL, or segment.
					</Text>
					<Button
						size="xSmall"
						trackingId="NoActiveSessionPerformASearch"
						onClick={() => {
							setIsQuickSearchOpen(true)
						}}
					>
						<Box display="flex" px="2" gap="4" alignItems="center">
							<SvgSearchIcon height={10} />
							<Text size="xSmall">Perform a Search</Text>
						</Box>
					</Button>
				</Box>
			</Callout>
		</Box>
	)
}

export default NoActiveSessionCard
