import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import classNames from 'classnames'
import React from 'react'

import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed'
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
			{visible && <SessionFeed />}
		</div>
	)
})

export default SearchPanel
