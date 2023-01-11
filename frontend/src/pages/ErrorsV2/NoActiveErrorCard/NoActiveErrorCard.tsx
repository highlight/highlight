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
				<Box mb="6" display="flex" flexDirection="column" gap="16">
					<Text color="moderate">
						View a recent error or find a specific error message,
						URL, or segment.
					</Text>
					<Box>
						<Button
							trackingId="NoActiveErrorPerformASearch"
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

export default NoActiveErrorCard
