import { Popover, Transition } from '@headlessui/react'
import Image from 'next/image'
import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { Typography } from '../Typography/Typography'

import classNames from 'classnames'
import Link from 'next/link'
import LogoJS from '../../../public/images/jslogo.svg'
import LogoJSActive from '../../../public/images/jslogoactive.svg'
import LogoUbuntu from '../../../public/images/ubuntulogo.svg'
import LogoUbuntuActive from '../../../public/images/ubuntulogoactive.svg'
import {
	backendProductLinks,
	frontendProductLinks,
} from '../../Products/products'
import styles from './ProductDropdown.module.scss'

const ProductDropdown = ({ isOpen }: { isOpen?: boolean }) => {
	const [isShowing, setIsShowing] = useState(false)
	const [selected, setSelected] = useState('Frontend')
	const [selectedLinks, setSelectedLinks] = useState(frontendProductLinks)

	function handleCategorySelect(select: String) {
		switch (select) {
			case 'Frontend':
				setSelected('Frontend')
				setSelectedLinks(frontendProductLinks)
				break
			case 'Backend':
				setSelected('Backend')
				setSelectedLinks(backendProductLinks)
				break
			default:
				setSelected('Frontend')
				setSelectedLinks(frontendProductLinks)
		}
	}

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
							className={classNames(styles.headerButton, {
								[styles.white]: isShowing,
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
									<div className={styles.gridContainer}>
										<div className={styles.innerContainer}>
											<div
												className={styles.innerGridLeft}
											>
												<div
													onClick={() =>
														handleCategorySelect(
															'Frontend',
														)
													}
													className={classNames(
														styles.categoryButton,
														{
															[styles.categoryButtonActive]:
																selected ==
																'Frontend',
														},
													)}
												>
													{selected == 'Frontend' ? (
														<Image
															src={LogoJSActive}
															alt=""
															priority={true}
														/>
													) : (
														<Image
															src={LogoJS}
															priority={true}
															alt=""
														/>
													)}
													<Typography
														type="copy4"
														className="pl-2"
													>
														Frontend
													</Typography>
												</div>
												<div
													onClick={() =>
														handleCategorySelect(
															'Backend',
														)
													}
													className={classNames(
														styles.categoryButton,
														{
															[styles.categoryButtonActive]:
																selected ==
																'Backend',
														},
													)}
												>
													{selected == 'Backend' ? (
														<Image
															src={
																LogoUbuntuActive
															}
															alt=""
															priority={true}
														/>
													) : (
														<Image
															src={LogoUbuntu}
															alt=""
															priority={true}
														/>
													)}
													<Typography
														type="copy4"
														className="pl-2"
													>
														Backend
													</Typography>
												</div>
											</div>
										</div>
										<div className={styles.innerContainer}>
											<div>
												<Typography
													type="copy3"
													className="pl-2 text-color-copy-on-light"
												>
													For your {selected} app
												</Typography>
											</div>
											<div
												className={
													styles.innerGridRight
												}
											>
												{selectedLinks.map(
													(item, index) => (
														<Link
															key={index}
															href={
																'/for/' +
																item.slug
															}
															className={
																styles.link
															}
														>
															<Typography type="copy3">
																{item.title}
															</Typography>
														</Link>
													),
												)}
											</div>
										</div>
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

export default ProductDropdown
