import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import styles from './PopoverListContent.module.scss'

interface Props {
	listItems: React.ReactNode[]
	className?: string
	small?: boolean
	noHoverChange?: boolean
	virtual?: boolean
	virtualListHeight?: number
	maxHeight?: number
	defaultItemHeight?: number
}

const PopoverListContent = ({
	listItems,
	className,
	small = false,
	noHoverChange,
	virtual,
	virtualListHeight,
	maxHeight,
	defaultItemHeight,
}: Props) => {
	const virtuoso = useRef<VirtuosoHandle>(null)

	return (
		<ul
			className={clsx(styles.list, className)}
			style={{
				height: virtual ? `${virtualListHeight}px` : 'initial',
				maxHeight,
			}}
		>
			{!virtual ? (
				listItems.map((listItem, index) => (
					<li
						key={index}
						className={clsx(styles.item, {
							[styles.small]: small,
							[styles.noHoverChange]: noHoverChange,
						})}
					>
						{listItem}
					</li>
				))
			) : (
				<>
					<Virtuoso
						ref={virtuoso}
						overscan={1000}
						data={listItems}
						totalCount={listItems.length}
						defaultItemHeight={defaultItemHeight}
						itemContent={(index, item: any) => (
							<li
								key={`${index}-${item.id}`}
								className={clsx(styles.item, styles.virtual, {
									[styles.small]: small,
									[styles.noHoverChange]: noHoverChange,
								})}
							>
								{item}
							</li>
						)}
					/>
				</>
			)}
		</ul>
	)
}

export default PopoverListContent
