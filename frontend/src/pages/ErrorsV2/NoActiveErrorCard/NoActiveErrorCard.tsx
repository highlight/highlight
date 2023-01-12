import { Button } from '@components/Button'
import { Box, Callout, Text } from '@highlight-run/ui'
import SvgSearchIcon from '@icons/SearchIcon'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import React, { useEffect } from 'react'

import styles from './NoActiveErrorCard.module.scss'

const NoActiveErrorCard = () => {
	const { setShowLeftPanel } = useErrorPageConfiguration()
	const { setIsQuickSearchOpen } = useSearchContext()

	useEffect(() => {
		setShowLeftPanel(true)
	}, [setShowLeftPanel])

	return (
		<Box cssClass={styles.card}>
			<Callout title="Let's squash some bugs!">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
				>
					<Text color="moderate">
						View a recent error or find a specific error message,
						URL, or segment.
					</Text>
					<Button
						size="xSmall"
						trackingId="NoActiveErrorPerformASearch"
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

export default NoActiveErrorCard
