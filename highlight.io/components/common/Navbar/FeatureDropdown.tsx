import { Popover, Transition } from '@headlessui/react'
import { useState } from 'react'
import { Typography } from '../Typography/Typography'

import { FaChevronDown } from 'react-icons/fa'
import * as Icons from 'react-icons/hi'

import classNames from 'classnames'
import navStyles from './Navbar.module.scss'
import styles from './ResourceDropdown.module.scss'

const FeatureDropdown = ({
	isOpen,
	light,
}: {
	isOpen?: boolean
	light?: boolean
}) => {
	const [isShowing, setIsShowing] = useState(false)

	const otherLinks = [
		{
			title: 'Session Replay',
			icon: <Icons.HiFilm className={styles.copyOnLight} />,
			link: '/session-replay',
			sameTab: true,
		},
		{
			title: 'Error Monitoring',
			icon: <Icons.HiTerminal className={styles.copyOnLight} />,
			link: '/error-monitoring',
			sameTab: true,
		},
		{
			title: 'Logging',
			icon: <Icons.HiLightningBolt className={styles.copyOnLight} />,
			link: '/logging',
			sameTab: true,
		},
		{
			title: 'Traces',
			icon: <Icons.HiSparkles className={styles.copyOnLight} />,
			link: '/traces',
			sameTab: true,
		},
		{
			title: 'Metrics',
			icon: <Icons.HiChartBar className={styles.copyOnLight} />,
			link: '/metrics',
			sameTab: true,
		},
	]

	return (
		<Popover>
			{({ open }) => (
				<>
					<Popover.Button
						onMouseEnter={() => setIsShowing(true)}
						onMouseLeave={() => setIsShowing(false)}
						className={styles.popoverButton}
					>
						<a
							className={classNames({
								[styles.headerButton]: !light,
								[navStyles.headerButtonLight]: light,
								[styles.white]: isShowing && !light,
							})}
						>
							<div className="flex gap-[6.5px] items-center">
								<Typography type="copy2">Product</Typography>
								<FaChevronDown className="w-[10px]" />
							</div>
						</a>
					</Popover.Button>
					<Transition
						show={isShowing}
						onMouseEnter={() => setIsShowing(true)}
						onMouseLeave={() => setIsShowing(false)}
						enter="transition ease-out duration-200"
						enterFrom="opacity-0 translate-y-1"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-150"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-1"
					>
						{!isOpen && (
							<Popover.Panel className={styles.popover}>
								<div className={styles.popoverPanel}>
									<div
										className={styles.featureGridContainer}
									>
										{otherLinks.map((item, index) => (
											<a
												key={index}
												href={item.link}
												target={
													item.sameTab ? '' : '_blank'
												}
												rel="noreferrer"
												className={styles.gridItem}
											>
												{item.icon}
												<Typography type="copy3">
													{item.title}
												</Typography>
											</a>
										))}
									</div>
								</div>
							</Popover.Panel>
						)}
					</Transition>
				</>
			)}
		</Popover>
	)
}

export default FeatureDropdown
