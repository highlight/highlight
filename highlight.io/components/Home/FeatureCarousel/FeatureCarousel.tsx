import classNames from 'classnames'
import useEmblaCarousel from 'embla-carousel-react'
import { StaticImageData } from 'next/image'
import { useEffect, useState, type JSX } from 'react'
import { isMobile } from 'react-device-detect'
import {
	HiBell,
	HiChartBar,
	HiChevronDown,
	HiCloudDownload,
	HiCode,
	HiDatabase,
	HiDocumentSearch,
	HiExclamationCircle,
	HiFilm,
	HiGlobe,
	HiLightningBolt,
	HiPhoneOutgoing,
	HiSparkles,
	HiTemplate,
	HiTerminal,
	HiUserGroup,
	HiUsers,
	HiViewBoards,
} from 'react-icons/hi'
import errorMonitoring from '../../../public/images/error-monitoring.webp'
import fullstackLogging from '../../../public/images/fullstack-logging.webp'
import githubscreenshot from '../../../public/images/githubscreenshot.png'
import loggingscreenshot from '../../../public/images/loggingscreenshot.png'
import dashboards from '../../../public/images/dashboards.webp'
import monitoringscreenshot from '../../../public/images/monitoringscreenshot.png'
import openSource from '../../../public/images/open-source.webp'
import sessionReplay from '../../../public/images/session-replay.webp'
import sessionscreenshot from '../../../public/images/sessionscreenshot.png'
import traces from '../../../public/images/traces.webp'
import tracesscreenshot from '../../../public/images/tracesmobile.svg'
import { PrimaryButton } from '../../common/Buttons/PrimaryButton'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Home.module.scss'
import { CarouselCard } from './CarouselCard'

export type Feature = {
	name: string
	title: string
	description: string
	thumbnail: JSX.Element
	desktopImage: StaticImageData
	mobileImage: StaticImageData
	right?: boolean
	code?: string[]
	shortenWidth?: boolean
	beta?: boolean
	feature1?: string
	feature1Link?: string
	featureImage1?: JSX.Element
	feature2?: string
	feature2Link?: string
	featureImage2?: JSX.Element
	feature3?: string
	feature3Link?: string
	featureImage3?: JSX.Element
	link?: string
}

//feature images need classname "h-[20px] w-[20px]"
//thumbnail needs classname "h-[35px] w-[35px]"
const features: Feature[] = [
	{
		name: 'Session Replay',
		title: 'Session Replay',
		description:
			'Understand the real reason why bugs are happening in your web application.',
		thumbnail: <HiFilm className="h-[25px] w-[25px]" />,
		desktopImage: sessionReplay,
		mobileImage: sessionscreenshot,
		right: true,
		feature1: 'Console and Network Recording',
		featureImage1: <HiTerminal className="h-[20px] w-[20px]" />,
		feature2: 'Comprehensive Session Search',
		featureImage2: <HiDocumentSearch className="h-[20px] w-[20px]" />,
		feature3: 'Powerful Privacy Controls',
		featureImage3: <HiPhoneOutgoing className="h-[20px] w-[20px]" />,
		link: '/session-replay',
	},
	{
		name: 'Error Monitoring',
		title: 'Error Monitoring',
		description:
			'Get notified of the exceptions across your app before they become problematic.',
		thumbnail: <HiTerminal className="h-[25px] w-[25px]" />,
		desktopImage: errorMonitoring,
		mobileImage: monitoringscreenshot,
		right: true,
		feature1: 'Custom Error Grouping',
		featureImage1: <HiUserGroup className="h-[20px] w-[20px]" />,
		feature2: 'Customizable Alerting Rules',
		featureImage2: <HiViewBoards className="h-[20px] w-[20px]" />,
		feature3: 'Powered by Open Telemetry',
		featureImage3: <HiExclamationCircle className="h-[20px] w-[20px]" />,
		link: '/error-monitoring',
	},
	{
		name: 'Logging',
		title: 'Logging',
		description:
			'Search for and set alerts for logs being written throughout your stack.',
		thumbnail: <HiLightningBolt className="h-[25px] w-[25px]" />,
		desktopImage: fullstackLogging,
		mobileImage: loggingscreenshot,
		right: true,
		feature1: 'Customizable Log Alerts',
		featureImage1: <HiBell className="h-[20px] w-[20px]" />,
		feature2: 'Widespread SDK Support',
		featureImage2: <HiCode className="h-[20px] w-[20px]" />,
		feature3: 'Powered by Clickhouse',
		featureImage3: <HiDatabase className="h-[20px] w-[20px]" />,
		link: '/logging',
	},
	{
		name: 'Traces',
		title: 'Traces',
		description:
			'Get performance insights on requests and transactions throughout your web application stack.',
		thumbnail: <HiSparkles className="h-[25px] w-[25px]" />,
		desktopImage: traces,
		mobileImage: tracesscreenshot,
		right: true,
		shortenWidth: true,
		feature1: 'Powerful Visualization Capabilities',
		featureImage1: <HiTemplate className="h-[20px] w-[20px]" />,
		feature2: 'Distributed Tracing Support',
		featureImage2: <HiGlobe className="h-[20px] w-[20px]" />,
		feature3: 'OpenTelemetry Support',
		featureImage3: <HiExclamationCircle className="h-[20px] w-[20px]" />,
		link: '/traces',
	},
	{
		name: 'Dashboards',
		title: 'Dashboards & APM',
		description:
			'Visualize and analyze your observability data on a single pane.',
		thumbnail: <HiChartBar className="h-[25px] w-[25px]" />,
		desktopImage: dashboards,
		mobileImage: tracesscreenshot,
		right: true,
		feature1: 'Customizable dashboards',
		featureImage1: <HiTemplate className="h-[20px] w-[20px]" />,
		feature2: 'Performance visualizations',
		featureImage2: <HiChartBar className="h-[20px] w-[20px]" />,
		feature3: 'User analytics',
		featureImage3: <HiUsers className="h-[20px] w-[20px]" />,
		link: '/dashboards',
	},
	{
		name: 'Self-Hosting',
		title: 'Self-Hosting highlight.io',
		description:
			'Interested in self-hosting highlight? Spin up highlight.io in docker with just a few commands.',
		thumbnail: <HiCloudDownload className="h-[25px] w-[25px]" />,
		desktopImage: openSource,
		mobileImage: githubscreenshot,
		right: true,
		code: [
			`git clone --recurse-submodules https://github.com/highlight/highlight;`,
			`cd docker;`,
			`./run-hobby.sh;`,
		],
		link: '/docs/getting-started/self-host/overview',
	},
]

export const FeatureCarousel = () => {
	const [selected, setSelected] = useState(0)
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: false,
		draggable: isMobile,
	})

	useEffect(() => {
		if (emblaApi) {
			emblaApi.scrollTo(selected)
			emblaApi.on('select', () => {
				setSelected(emblaApi.selectedScrollSnap())
			})
		}
		;(document.getElementById('dropdown') as HTMLSelectElement).value =
			selected.toString()
	}, [emblaApi, selected])

	const handleDropdown = () => {
		let dropdownValue = parseInt(
			(document.getElementById('dropdown') as HTMLSelectElement).value,
		)
		setSelected(dropdownValue)
	}

	return (
		<div className="flex flex-col overflow-x-hidden xl:rounded-lg max-w-[100vw] xl:max-w-[1000px] xl:rounded-tr-lg xl:rounded-tl-lg">
			<div className={`hidden md:grid grid-cols-6`}>
				{features.map((feature, index) => (
					<div
						key={index}
						onClick={() => setSelected(index)}
						className={classNames(
							styles.carouselButton,
							'group',
							index == 0 ? 'xl:rounded-tl-lg' : '',
							index == features.length - 1
								? 'xl:rounded-tr-lg'
								: '',
						)}
					>
						<div
							className={`${
								selected == index
									? 'bg-divider-on-dark'
									: 'group-hover:bg-divider-on-dark group-hover:bg-opacity-75'
							} h-full flex justify-center gap-1 px-3 py-2 rounded-lg transition-all`}
						>
							<div className="flex flex-col gap-1">
								<div className="flex justify-center text-color-copy-on-dark">
									{feature.thumbnail}
								</div>
								<Typography
									type="copy4"
									className="text-center"
									emphasis
								>
									{feature.name}
								</Typography>
							</div>
						</div>
					</div>
				))}
			</div>
			<Typography
				type="copy4"
				className="md:hidden mb-3 text-copy-on-light"
			>
				Explore Our Features
			</Typography>
			<div className="relative flex md:hidden justify-center mx-5 mb-8 rounded-lg">
				<PrimaryButton
					className={classNames(
						styles.whiteButton,
						'w-full border-copy-on-dark py-0 px-0 h-[54px]',
					)}
				>
					<Typography
						type="copy2"
						className="bg-color-primary-500 rounded-lg w-full"
						emphasis={true}
					>
						<select
							onChange={() => handleDropdown()}
							id="dropdown"
							className="w-full px-4 bg-color-primary-500 h-full text-center rounded-lg appearance-none"
						>
							{features.map((feature, index) => (
								<option key={index} value={index}>
									{feature.name}
								</option>
							))}
						</select>
					</Typography>
				</PrimaryButton>
				<HiChevronDown className="absolute text-color-copy-on-dark h-[20px] w-[20px] top-4 right-5" />
			</div>
			<div className="w-full" ref={emblaRef}>
				<div className="flex scrollbar-hide md:gap-4">
					{features.map((feature, index) => (
						<CarouselCard
							key={index}
							feature={feature}
							index={index}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
