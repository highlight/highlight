import { Popover, Transition } from '@headlessui/react'
import Image from 'next/image'
import { useState } from 'react'
import {
	HiCheckCircle,
	HiDotsCircleHorizontal,
	HiQuestionMarkCircle,
	HiXCircle,
} from 'react-icons/hi'
import highlightlogosmall from '../../public/images/logo-on-dark.png'
import { HighlightLogo } from '../common/HighlightLogo/HighlightLogo'
import { Typography } from '../common/Typography/Typography'
import {
	ComparisonTableRow,
	ComparisonTableSection,
	Competitor,
} from './competitors'

export function HeadlessTooltip(props: { tooltip: string; styling?: string }) {
	const [isShowing, setIsShowing] = useState(false)

	return (
		<Popover className="relative flex items-center">
			{({ open }) => (
				<>
					<Popover.Button
						onMouseEnter={() => setIsShowing(true)}
						onMouseLeave={() => setIsShowing(false)}
					>
						<HiQuestionMarkCircle className="h-7 w-7 p-1 text-copy-on-light hover:bg-divider-on-dark rounded-md" />
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
						<Popover.Panel
							className={`absolute right-0 bottom-4 z-10 p-2 w-[200px] bg-dark-background border-[1px] border-divider-on-dark rounded-md ${props.styling}`}
						>
							<Typography
								type="copy4"
								className="text-darker-copy-on-dark text-center"
							>
								{props.tooltip}
							</Typography>
						</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	)
}

export default function ComparisonTable(props: { competitor: Competitor }) {
	if (!props.competitor) {
		return <div>No Competitor Loaded</div>
	}

	return (
		<div className="">
			{props.competitor.sections.map(
				(section: ComparisonTableSection, i) => (
					<div
						key={`${section.title}` + `${i}`}
						className="w-full mb-8 max-w-[880px] mx-auto"
					>
						<div className="flex justify-between mb-2 items-end">
							<Typography
								type="copy1"
								className="text-white"
								emphasis
							>
								{section.title}
							</Typography>
							<div
								className={`${
									i == 0 ? 'flex' : 'hidden '
								} items-center`}
							>
								<div className="w-[50px] md:w-[200px] px-2">
									<div className="hidden md:flex">
										<HighlightLogo />
									</div>
									<Image
										src={highlightlogosmall}
										alt="Logo"
										height={32}
										className="md:hidden"
									/>
								</div>
								<div className="w-[50px] md:w-[200px] px-1">
									{props.competitor.logoDesktop &&
									props.competitor.logoMobile ? (
										<>
											<Image
												src={
													props.competitor.logoDesktop
												}
												alt="Logo"
												height={28}
												className="hidden md:flex"
											/>
											<Image
												src={
													props.competitor.logoMobile
												}
												height={32}
												width={32}
												alt="Logo"
												className="md:hidden"
											/>
										</>
									) : (
										<div style={{ fontSize: 20 }}>
											{props.competitor.name}
										</div>
									)}
								</div>
							</div>
						</div>
						{section.rows.map((row: ComparisonTableRow, j) => (
							<div
								key={`${row.feature}` + `${j}`}
								className="flex w-full justify-between items-center"
							>
								<Typography
									type="copy2"
									className="text-copy-on-dark whitespace-nowrap w-full mr-4 text-ellipsis overflow-hidden"
								>
									{row.feature}
								</Typography>
								<div className="flex items-center">
									{row.tooltip && (
										<HeadlessTooltip
											tooltip={row.tooltip}
										/>
									)}

									<div
										className={`bg-divider-on-dark px-2 py-2 w-[50px] md:w-[200px] border-r-[1px] border-copy-on-light ${
											j == 0
												? 'rounded-tl-lg'
												: j == section.rows.length - 1
													? 'rounded-bl-lg'
													: ''
										}`}
									>
										{row.highlight == 1 ? (
											<HiCheckCircle className="text-copy-on-dark h-7 w-7" />
										) : (
											<div className="flex">
												{row.highlight == 0 && (
													<HiXCircle className="text-copy-on-light h-7 w-7" />
												)}
												{row.highlight == 0.5 && (
													<div className="flex items-center gap-1">
														<HiDotsCircleHorizontal className="text-copy-on-light h-7 w-7" />
														<div className="hidden md:flex items-center bg-copy-on-light px-3 py-[2px] rounded-full">
															<Typography
																type="copy4"
																emphasis
																className="text-copy-on-dark rounded-full"
															>
																Coming soon
															</Typography>
														</div>
													</div>
												)}
											</div>
										)}
									</div>
									<div
										className={`bg-divider-on-dark px-2 py-2 w-[50px] md:w-[200px] ${
											j == 0
												? 'rounded-tr-lg'
												: j == section.rows.length - 1
													? 'rounded-br-lg'
													: ''
										}`}
									>
										{row.competitor ? (
											<HiCheckCircle className="text-copy-on-dark h-7 w-7" />
										) : (
											<HiXCircle className="text-copy-on-light h-7 w-7" />
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				),
			)}
		</div>
	)
}
