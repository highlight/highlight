import { Popover, Transition } from '@headlessui/react'
import { useState } from 'react'
import { Typography } from '../Typography/Typography'

import { BsCodeSlash } from 'react-icons/bs'

import { FaChevronDown } from 'react-icons/fa'
import * as Icons from 'react-icons/hi'

import classNames from 'classnames'
import navStyles from './Navbar.module.scss'
import styles from './ResourceDropdown.module.scss'

const ResourceDropdown = ({
	isOpen,
	light,
}: {
	isOpen?: boolean
	light?: boolean
}) => {
	const [isShowing, setIsShowing] = useState(false)

	const otherLinks = [
		{
			title: 'Status Page',
			icon: <Icons.HiCloud className={styles.copyOnLight} />,
			link: 'https://status.highlight.io/',
		},
		{
			title: 'Customers',
			icon: <Icons.HiUsers className={styles.copyOnLight} />,
			link: '/customers',
			sameTab: true,
		},
		{
			title: 'Changelog',
			icon: <Icons.HiClipboardList className={styles.copyOnLight} />,
			link: '/docs/general/changelog/overview',
		},
		{
			title: 'Blog',
			icon: <Icons.HiChat className={styles.copyOnLight} />,
			link: '/blog',
			sameTab: true,
		},
		{
			title: 'Frameworks',
			icon: <BsCodeSlash className={styles.copyOnLight} />,
			link: '/frameworks',
			sameTab: true,
		},
		{
			title: 'Our Competitors',
			icon: <Icons.HiScale className={styles.copyOnLight} />,
			link: '/docs/general/company/our-competitors',
			sameTab: true,
		},
		{
			title: 'Documentation',
			icon: <Icons.HiDocumentSearch className={styles.copyOnLight} />,
			link: '/docs',
			sameTab: true,
		},
		{
			title: 'Roadmap',
			icon: <Icons.HiMap className={styles.copyOnLight} />,
			link: '/docs/general/roadmap',
			sameTab: true,
		},
		{
			title: 'Ambassadors',
			icon: <Icons.HiUserGroup className={styles.copyOnLight} />,
			link: '/ambassador-program',
			sameTab: true,
		},
		{
			title: 'Podcast',
			icon: <Icons.HiMicrophone className={styles.copyOnLight} />,
			link: 'https://podcasters.spotify.com/pod/show/highlightio',
			sameTab: false,
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
								<Typography type="copy2">Resources</Typography>
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
									<div className={styles.gridContainer}>
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

export default ResourceDropdown
