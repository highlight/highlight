import { Button } from '@components/Button'
import {
	Box,
	IconOutlineArrowNarrowUp,
	Text,
} from '@highlight-run/ui/components'
import { AnimatePresence, motion } from 'framer-motion'

import * as style from './FeedResults.css'

interface Props {
	maxResults: number
	more: number
	pollingExpired: boolean
	type: 'sessions' | 'errors' | 'logs' | 'traces'
	onClick: () => void
}

export const AdditionalFeedResults = function ({
	maxResults,
	more,
	type,
	pollingExpired,
	onClick,
}: Props) {
	const rounded = ['sessions', 'errors'].includes(type)

	const countText = more >= maxResults ? `${maxResults}+` : more
	const resourceText = more === 1 ? type.slice(0, type.length - 1) : type

	return (
		<AnimatePresence>
			{more > 0 || pollingExpired ? (
				<motion.div
					key="AdditionalFeedResultsWrapper"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.1 }}
				>
					<Box
						paddingTop={rounded ? '8' : undefined}
						px={rounded ? '8' : undefined}
						width="full"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Button
							kind="secondary"
							size="small"
							emphasis={rounded ? 'medium' : 'low'}
							trackingId="SessionsFeedMore"
							className={style.variants({
								type: rounded ? 'rounded' : 'square',
							})}
							onClick={onClick}
						>
							<Box display="flex" alignItems="center" gap="8">
								<IconOutlineArrowNarrowUp />
								<Text>
									{pollingExpired
										? 'Load new results'
										: `${countText} new ${resourceText}`}
								</Text>
							</Box>
						</Button>
					</Box>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}
