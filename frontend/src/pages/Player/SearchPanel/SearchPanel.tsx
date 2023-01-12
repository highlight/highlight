import { SessionFeedV3 } from '@pages/Sessions/SessionsFeedV3/SessionsFeedV3'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import classNames from 'classnames'
import React from 'react'

import styles from './SearchPanel.module.scss'

interface Props {
	visible: boolean
}

const SearchPanel = React.memo(({ visible }: Props) => {
	const { showBanner } = useGlobalContext()
	return (
		<div
			className={classNames(styles.searchPanel, {
				[styles.bannerShown]: showBanner,
			})}
		>
			{visible && <SessionFeedV3 />}
		</div>
	)
})

export default SearchPanel
