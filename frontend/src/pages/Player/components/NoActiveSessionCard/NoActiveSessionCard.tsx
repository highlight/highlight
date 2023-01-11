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
				<Box mb="6" display="flex" flexDirection="column" gap="16">
					<Text color="moderate">
						View a recent session or find a specific identifier,
						URL, or segment.
					</Text>
					<Box>
						<Button
							trackingId="NoActiveSessionPerformASearch"
							iconLeft={<SvgSearchIcon />}
							onClick={() => {
								setIsQuickSearchOpen(true)
							}}
						>
							<Text size="small">Perform a Search</Text>
						</Button>
					</Box>
				</Box>
			</Callout>
		</Box>
	)
}

export default NoActiveSessionCard
