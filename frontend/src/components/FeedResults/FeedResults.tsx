import { Button } from '@components/Button'
import { Box, IconOutlineArrowNarrowUp, Text } from '@highlight-run/ui'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import * as style from './FeedResults.css'

interface Props {
	more: number
	type: 'sessions' | 'errors' | 'logs'
	onClick: () => void
}

export const AdditionalFeedResults = function ({ more, type, onClick }: Props) {
	return (
		<AnimatePresence>
			{more > 0 ? (
				<motion.div
					key="AdditionalFeedResultsWrapper"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.1 }}
				>
					<Box
						paddingTop={type === 'logs' ? undefined : '8'}
						px={type === 'logs' ? undefined : '8'}
						width="full"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Button
							kind="secondary"
							size="small"
							emphasis={type === 'logs' ? 'low' : 'medium'}
							trackingId="SessionsFeedMore"
							className={style.variants({ type })}
							onClick={onClick}
						>
							<Box display="flex" alignItems="center" gap="8">
								<IconOutlineArrowNarrowUp />
								<Text>
									{more}
									{type === 'logs'
										? more === 50
											? '+'
											: ''
										: ''}{' '}
									new{' '}
									{more === 1
										? type.slice(0, type.length - 1)
										: type}
								</Text>
							</Box>
						</Button>
					</Box>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}
