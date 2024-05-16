import { Button } from '@components/Button'
import * as style from '@components/Modal/ModalV2.css'
import { Box, Stack } from '@highlight-run/ui/components'
import { getAttributionData } from '@util/attribution'
import clsx from 'clsx'
import React, { useState } from 'react'
import { InlineWidget } from 'react-calendly'
import { useHotkeys } from 'react-hotkeys-hook'

import { styledVerticalScrollbar } from '@/style/common.css'

export function Calendly() {
	const { referral } = getAttributionData()
	const utm = JSON.parse(referral)
	console.log({ utm })
	return (
		<InlineWidget
			url="https://calendly.com/highlight-io/discussion"
			styles={{ width: 1080, height: 720 }}
			utm={utm}
		/>
	)
}

export function CalendlyModal() {
	const [calendlyOpen, setCalendlyOpen] = useState(false)
	useHotkeys(
		'escape',
		() => {
			setCalendlyOpen(false)
		},
		[],
	)

	return (
		<>
			<Button
				kind="primary"
				size="small"
				emphasis="medium"
				onClick={() => setCalendlyOpen(true)}
				trackingId="ClickCalendlyOpen"
			>
				Book a call with Highlight
			</Button>
			{calendlyOpen ? (
				<Box
					display="flex"
					height="screen"
					width="screen"
					position="fixed"
					alignItems="flex-start"
					justifyContent="center"
					style={{
						top: 0,
						left: 0,
						zIndex: '90',
						overflow: 'hidden',
						backgroundColor: '#6F6E777A',
					}}
					onClick={() => setCalendlyOpen(false)}
				>
					<Stack
						cssClass={clsx(
							styledVerticalScrollbar,
							style.modalInner,
						)}
					>
						<Calendly />
					</Stack>
				</Box>
			) : null}
		</>
	)
}

/*

export function CalendlyModal({
								  className,
								  children,
							  }: React.PropsWithChildren<{ className?: string }>) {
	const [calendlyOpen, setCalendlyOpen] = useState(false)

	return (
		<div>
			<button
				type="button"
				onClick={() => setCalendlyOpen(true)}
				className={classNames(
					'flex items-center gap-1 px-3 transition-colors rounded active:brightness-50',
					className,
					calendlyOpen
						? 'bg-blue-cta text-dark-background'
						: 'hover:bg-white/10',
				)}
			>
				{children ?? (
					<div className={'flex items-center gap-1'}>
						<Typography type="copy2" emphasis>
							Request a Demo Call
						</Typography>
						<ArrowRightCircleIcon className="w-5 h-5" />
					</div>
				)}
			</button>

			<Transition appear show={calendlyOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-[999] w-screen h-screen"
					onClose={() => setCalendlyOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="fixed grid place-items-center inset-0 z-50 w-screen h-screen pointer-events-none">
									<div className="relative flex min-w-[320px] w-screen max-w-5xl min-[1000px]:h-[700px] h-[900px] transition-opacity max-[652px]:pt-14 pointer-events-auto">
										<Calendly />

										<button
											className="absolute grid w-10 h-10 rounded-full place-content-center bg-divider-on-dark max-[652px]:right-2 max-[652px]:top-2 right-10 top-16 hover:brightness-150 transition-all pointer-events-auto"
											onClick={() =>
												setCalendlyOpen(false)
											}
										>
											<XMarkIcon className="w-5 h-5" />
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	)
}*/
