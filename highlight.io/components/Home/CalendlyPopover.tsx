'use client'

import { Popover } from '@headlessui/react'
import { ArrowRightCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { InlineWidget } from 'react-calendly'
import { Typography } from '../common/Typography/Typography'
import { useSearchParams } from 'next/navigation'

export const CalendlyPopover = () => {
	const query = useSearchParams()

	return (
		<Popover className="relative inline-flex flex-col items-center">
			{({ open, close }) => (
				<>
					<Popover.Button
						className={classNames(
							'flex items-center gap-1 px-3 transition-colors rounded active:brightness-50',
							open
								? 'bg-blue-cta text-dark-background'
								: 'hover:bg-white/10',
						)}
					>
						<Typography type="copy2" emphasis>
							Request a Demo Call
						</Typography>
						<ArrowRightCircleIcon className="w-5 h-5" />
					</Popover.Button>

					<Popover.Overlay className="fixed inset-0 z-20 opacity-70 bg-dark-background" />

					<Popover.Panel
						static
						className={classNames(
							'fixed inset-0 z-50 grid place-items-center w-screen h-screen pointer-events-none',
							!open && 'hidden',
						)}
					>
						<div className="min-w-[320px] w-screen max-w-5xl min-[1000px]:h-[700px] h-[900px] transition-opacity max-[652px]:pt-14 pointer-events-auto">
							<InlineWidget
								url="https://calendly.com/d/2gt-rw5-qg5/highlight-demo-call"
								styles={{ width: '100%', height: '100%' }}
								utm={{
									utmCampaign:
										query.get('utm_campaign') ?? '',
									utmSource: query.get('utm_source') ?? '',
									utmMedium: query.get('utm_medium') ?? '',
									utmContent: query.get('utm_content') ?? '',
									utmTerm: query.get('utm_term') ?? '',
								}}
							/>
						</div>
						<button
							className="absolute grid w-10 h-10 rounded-full place-content-center bg-divider-on-dark max-[652px]:right-2 max-[652px]:top-2 right-10 top-10 hover:brightness-150 transition-all pointer-events-auto"
							onClick={close}
						>
							<XMarkIcon className="w-5 h-5" />
						</button>
					</Popover.Panel>
				</>
			)}
		</Popover>
	)
}
