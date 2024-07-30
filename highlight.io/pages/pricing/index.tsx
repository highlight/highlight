import { NextPage } from 'next'
import Link from 'next/link'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import { Typography } from '../../components/common/Typography/Typography'
import { CompaniesReel } from '../../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../../components/Home/CustomerReviewTrack'
import styles from '../../components/Home/Home.module.scss'

import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import * as Slider from '@radix-ui/react-slider'
import { Fragment, useState } from 'react'
import { CalendlyModal } from '../../components/common/CalendlyModal/CalendlyModal'
import { HeadlessTooltip } from '../../components/Competitors/ComparisonTable'

import {
	HiOfficeBuilding,
	HiPuzzle,
	HiReceiptTax,
	HiServer,
} from 'react-icons/hi'

import classNames from 'classnames'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import {
	businessPrices,
	enterprisePrices,
	freePrices,
	payAsYouGoPrices,
	Prices,
	selfHostPrices,
} from '../../components/Pricing/estimator_details'

const retentionOptions = [
	'30 days',
	'3 months',
	'6 months',
	'1 year',
	'2 years',
] as const
type Retention = typeof retentionOptions[number]
const retentionMultipliers: Record<Retention, number> = {
	'30 days': 1,
	'3 months': 1,
	'6 months': 1.5,
	'1 year': 2,
	'2 years': 2.5,
} as const

const tierOptions = [
	'Free',
	'PayAsYouGo',
	'Business',
	'Enterprise',
	'SelfHostedEnterprise',
] as const
type TierName = typeof tierOptions[number]

type PricingTier = {
	label: string
	id?: string //PlanTier name, if not same as label
	subText?: string
	prices: Prices
	icon: JSX.Element
	features: {
		feature: string
		tooltip?: string
	}[]
	calculateUsage?: boolean
	contactUs?: boolean
	buttonLabel: string
	buttonLink?: string
	hidden?: boolean // hidden from plan tier, but not in estimator
}

const priceTiers: Record<TierName, PricingTier> = {
	Free: {
		label: 'Free',
		prices: freePrices,
		subText: 'Free Forever',
		icon: (
			<HiReceiptTax className="text-darker-copy-on-dark w-8 h-8 -translate-x-1" />
		),
		features: [
			{
				feature: `500 monthly sessions`,
			},
			{
				feature: 'AI error grouping',
			},
			{
				feature: 'Unlimited seats',
			},
		],
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	PayAsYouGo: {
		label: 'Pay-as-you-go',
		id: 'PayAsYouGo',
		subText: 'Starts at',
		prices: payAsYouGoPrices,
		icon: <HiPuzzle className="text-[#0090FF] w-8 h-8 -translate-x-1" />,
		features: [
			{
				feature: 'Up to 3 dashboards',
				tooltip: `Create up to 3 dashboards in the metrics product.`,
			},
			{
				feature: 'Up to 2 projects',
				tooltip: `Create up to 2 projects for separating web app data.`,
			},
			{
				feature: 'Up to 15 seats',
			},
			{
				feature: 'Up to 7 day retention',
			},
		],
		calculateUsage: true,
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	Business: {
		label: 'Business',
		id: 'Business',
		subText: 'Starts at',
		prices: businessPrices,
		icon: <HiPuzzle className="text-[#0090FF] w-8 h-8 -translate-x-1" />,
		features: [
			{
				feature: 'Unlimited dashboards',
			},
			{
				feature: `Unlimited projects`,
				tooltip: `Separate your data into different projects in a single billing account.`,
			},
			{
				feature: 'Unlimited seats',
			},
			{
				feature: 'Custom retention policies',
			},
			{
				feature: `Filters for data ingest`,
				tooltip: `Ability to filter out data before it is ingested to mitigate costs.`,
			},
			{
				feature: `Everything in pay-as-you-go`,
			},
		],
		calculateUsage: true,
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},

	Enterprise: {
		label: 'Enterprise',
		subText: 'Contact sales for pricing',
		prices: enterprisePrices,
		icon: (
			<HiOfficeBuilding className="text-white w-8 h-8 -translate-x-1" />
		),
		features: [
			{
				feature: 'Volume discounts',
				tooltip:
					'At higher volumes, we can heavily discount usage; reach out to learn more.',
			},
			{
				feature: 'SAML & SSO',
				tooltip:
					'Secure user management to ensure you can manage your team with your existing tooling.',
			},
			{
				feature: 'Custom MSAs & SLAs',
				tooltip:
					'Custom contracts to abide by your compliance requirements; we handle these on a case-by-case basis.',
			},
			{
				feature: 'RBAC & audit logs',
				tooltip:
					'Infrastructure for auditing and adding fine-grained access controls.',
			},
			{
				feature: 'Data export & user reporting',
				tooltip:
					'Recurring or one-off exports of your observability data for offline analysis.',
			},
			{
				feature: 'Everything in Business',
			},
		],
		contactUs: true,
		buttonLabel: 'Contact us',
		calculateUsage: true,
	},
	SelfHostedEnterprise: {
		label: 'Self-Hosted Enterprise',
		id: 'SelfHostedEnterprise',

		subText: 'per month, billed annually',
		prices: selfHostPrices,
		icon: <HiServer className="text-[#E93D82] w-8 h-8 -translate-x-1" />,
		features: [],
		calculateUsage: true,
		buttonLabel: 'Learn More',
		buttonLink:
			'/docs/general/company/open-source/hosting/self-host-enterprise',
		contactUs: true,
		hidden: true,
	},
}

const PricingPage: NextPage = () => {
	const [estimatorCategory, setEstimatorCategory] = useState<
		'PayAsYouGo' | 'Enterprise' | 'SelfHostedEnterprise' | 'Business'
	>('PayAsYouGo')

	//Allows for the selection of the tier from the dropdown
	const setEstimatorCategoryWithLabel = (value: any) => {
		if (tierOptions.includes(value)) {
			setEstimatorCategory(value)
		} else {
			const val = value.replaceAll('-', '').replaceAll(' ', '')
			setEstimatorCategory(val)
		}
	}

	return (
		<div>
			<Navbar />
			<div className="w-full px-4 mx-auto my-24">
				<div className="flex flex-col items-center text-center">
					<h1 className="max-w-3xl">
						Get the{' '}
						<span className="text-highlight-yellow">
							visibility
						</span>{' '}
						you need today.
					</h1>
					<Typography type="copy1" className="my-4 text-copy-on-dark">
						Fair and transparent pricing that scales with any
						organization.
					</Typography>
				</div>
				<PlanTable
					setEstimatorCategory={setEstimatorCategoryWithLabel}
				/>
			</div>
			<div className="flex justify-center my-16 px-10" id="overage">
				<div className="text-center max-w-[950px]">
					<h2 className="mb-4">Estimate your bill</h2>
					<Typography type="copy1" className="text-copy-on-dark">
						Each of our plans comes with a pre-defined usage quota,
						and if you exceed that quota, we charge an additional
						fee. For custom plans,{' '}
						<span className="inline-block">
							<CalendlyModal className="underline">
								reach out to us.
							</CalendlyModal>
						</span>
					</Typography>
				</div>
			</div>
			<div className="my-16">
				<PriceCalculator
					pricingTier={priceTiers[estimatorCategory]}
					setEstimatorCategory={setEstimatorCategoryWithLabel}
				/>
			</div>

			<Section>
				<CompaniesReel />
			</Section>
			<Section>
				<div className={styles.anchorFeature}>
					<div className={styles.anchorHead}>
						<Typography type="copy2" onDark>
							Don&apos;t take our word.{' '}
							<Link href="/customers">
								Read our customer review section →
							</Link>
						</Typography>
					</div>
				</div>
			</Section>
			<CustomerReviewTrack />
			<FooterCallToAction />
			<Footer />
		</div>
	)
}
const PlanTable = ({
	setEstimatorCategory,
}: {
	setEstimatorCategory: (value: any) => void
}) => {
	return (
		<div className="flex flex-col items-center w-full gap-6 mx-auto mt-16">
			{/* Pricing */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 justify-center">
				{Object.entries(priceTiers).map(
					([name, tier]) =>
						!tier.hidden && (
							<PlanTier
								tier={tier}
								key={name}
								setEstimatorCategory={setEstimatorCategory}
							/>
						),
				)}

				<div className="md:col-span-2 lg:col-span-4 ">
					<SFECard setEstimatorCategory={setEstimatorCategory} />
				</div>
			</div>
			<div className="flex-shrink w-48" />
		</div>
	)
}

const PlanTier = ({
	tier,
	setEstimatorCategory,
}: {
	tier: PricingTier
	setEstimatorCategory: (value: any) => void
}) => {
	const { features, calculateUsage } = tier

	return (
		<div
			className={
				'flex flex-col flex-grow border rounded-md min-[1190px]:min-w-[300px] basis-64 border-divider-on-dark p-4'
			}
		>
			<div className="border-divider-on-dark pb-4">
				<div className="flex flex-col">
					{tier.icon}
					<Typography className="my-2" type="copy1" emphasis>
						{tier.label}
					</Typography>
					<div className="flex flex-col justify-end h-[60px] md:h-[72px]">
						<Typography
							className={`${
								tier.contactUs ? 'mb-2' : ''
							} text-darker-copy-on-dark`}
							type="copy4"
						>
							{tier.subText}
						</Typography>
						{!tier.contactUs && (
							<div className="flex items-end">
								<h4 className="mt-0">
									${tier.prices.monthlyPrice}
								</h4>

								<Typography
									className="text-darker-copy-on-dark mb-2 ml-1"
									type="copy4"
								>
									/ month
								</Typography>
							</div>
						)}
					</div>
				</div>
			</div>
			{tier.contactUs && (
				<CalendlyModal className="w-full !px-0">
					<PrimaryButton className="w-full bg-white text-dark-background rounded-md text-center py-1 hover:bg-copy-on-dark transition-colors">
						Contact us
					</PrimaryButton>
				</CalendlyModal>
			)}

			{!tier.contactUs && (
				<PrimaryButton
					href={tier.buttonLink}
					className="bg-white text-dark-background rounded-md text-center py-1 hover:bg-copy-on-dark transition-colors"
				>
					{tier.buttonLabel}
				</PrimaryButton>
			)}
			<div className="flex flex-col gap-2.5 flex-grow my-4">
				{features.map((feature, index) => (
					<div
						key={index}
						className="flex justify-between gap-1 items-start"
					>
						<Typography className="text-copy-on-dark" type="copy3">
							{feature.feature}
						</Typography>
						{feature.tooltip && (
							<HeadlessTooltip tooltip={feature.tooltip} />
						)}
					</div>
				))}
			</div>
			<div className="pt-4">
				{calculateUsage && (
					<PrimaryButton
						onClick={(e) => {
							setEstimatorCategory(tier.id || tier.label)
							e.preventDefault()
							document.querySelector('#overage')?.scrollIntoView({
								behavior: 'smooth',
							})
							window.history.pushState({}, '', `#overage`)
						}}
						href="#overage"
						className="w-full bg-dark-background border border-copy-on-dark text-copy-on-dark rounded-md text-center py-1 hover:bg-white hover:text-dark-background transition-colors"
					>
						<Typography type="copy3" emphasis>
							Estimate Costs
						</Typography>
					</PrimaryButton>
				)}
			</div>
		</div>
	)
}

const formatNumber = (num: number, digits?: number) => {
	let si = [
			{ value: 1e9, symbol: 'B' },
			{ value: 1e6, symbol: 'M' },
			{ value: 1e3, symbol: 'K' },
		],
		i
	for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
			return (
				(num / si[i].value)
					.toFixed(digits ?? 2)
					.replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
			)
		}
	}
	return num.toString()
}

const formatPrice = (
	price: number,
	signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' | undefined,
) =>
	price.toLocaleString(undefined, {
		style: 'currency',
		currency: 'USD',
		signDisplay: signDisplay ?? 'always',
	})

const PriceCalculator = ({
	pricingTier,
	setEstimatorCategory,
}: {
	pricingTier: PricingTier
	setEstimatorCategory: (value: any) => void
}) => {
	const defaultErrors = pricingTier.prices.Errors.free
	const defaultLogs = pricingTier.prices.Logs.free
	const defaultTraces = pricingTier.prices.Traces.free
	const defaultSessions = pricingTier.prices.Sessions.free

	const [errorUsage, setErrorUsage] = useState<number>(defaultErrors)
	const [sessionUsage, setSessionUsage] = useState<number>(defaultSessions)
	const [loggingUsage, setLoggingUsage] = useState<number>(defaultLogs)
	const [tracesUsage, setTracesUsage] = useState<number>(defaultTraces)

	const [errorRetention, setErrorRetention] = useState<Retention>('3 months')
	const [sessionRetention, setSessionRetention] =
		useState<Retention>('3 months')

	const [annualPricing, setAnnualPricing] = useState(false)

	const getUsagePrice = (
		usage: number,
		product: 'Sessions' | 'Errors' | 'Logs' | 'Traces',
		retention: Retention,
	) => {
		const cost = pricingTier.prices[product]
		let remainder = usage
		let tier = 0
		let price = 0
		while (remainder > 0) {
			const item = cost.items[tier]
			if (!item) break
			const itemUsage = Math.min(remainder, item.usage ?? Infinity)
			if (item.constant) {
				price = item.rate
			} else {
				price += itemUsage * item.rate
			}
			remainder -= itemUsage
			tier += 1
		}
		return (price * retentionMultipliers[retention] * 100) / 100
	}

	const base = pricingTier.prices.monthlyPrice

	const errorsCost = getUsagePrice(
		errorUsage - defaultErrors,
		'Errors',
		errorRetention,
	)
	const sessionsCost = getUsagePrice(
		sessionUsage - defaultSessions,
		'Sessions',
		sessionRetention,
	)
	const loggingCost = getUsagePrice(
		loggingUsage - defaultLogs,
		'Logs',
		'30 days',
	)
	const tracesCost = getUsagePrice(
		tracesUsage - defaultTraces,
		'Traces',
		'30 days',
	)

	return (
		<div className="flex justify-center px-4 sm:px-16">
			{/* Price calculator */}
			<div className="flex flex-col lg:flex-row items-center w-full lg:w-auto">
				<div className="flex flex-col lg:h-full w-full lg:w-[350px] border-y-[1px] border-l-[1px] rounded-b-none rounded-t-lg  border-r-[1px] border-divider-on-dark p-4 gap-4 lg:border-r-0 lg:rounded-l-lg lg:rounded-r-none">
					<div className="w-full">
						<ListboxOptions
							options={
								setEstimatorCategory !== undefined
									? [
											'Pay-As-You-Go',
											'Enterprise',
											'Self-Hosted Enterprise',
									  ]
									: ['']
							}
							value={pricingTier.label}
							onChange={setEstimatorCategory}
						/>
					</div>

					<div className="flex flex-col justify-between gap-8 border-[1px] border-divider-on-dark rounded-lg p-4 lg:h-full">
						<MonthlySlider
							annualPricing={annualPricing}
							setAnnualPricing={setAnnualPricing}
						/>
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-1">
								<CalculatorPriceRow
									title="Plan base fee"
									cost={base}
									contact={pricingTier.contactUs}
								/>
								<CalculatorPriceRow
									title="Session usage fee"
									cost={sessionsCost}
								/>
								<CalculatorPriceRow
									title="Error usage fee"
									cost={errorsCost}
								/>
								<CalculatorPriceRow
									title="Logging fee"
									cost={loggingCost}
								/>
								<CalculatorPriceRow
									title="Tracing usage fee"
									cost={tracesCost}
								/>
							</div>
							{annualPricing && (
								<>
									<div className="w-full h-[1px] rounded-full bg-divider-on-dark" />
									<div className="flex justify-between">
										<Typography
											type="copy3"
											className="text-darker-copy-on-dark"
										>
											Discount
										</Typography>
										<Typography
											type="copy3"
											className="text-darker-copy-on-dark"
											emphasis
										>
											-15%
										</Typography>
									</div>
								</>
							)}
							<div className="w-full h-[1px] rounded-full bg-divider-on-dark" />
							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Monthly Total
								</Typography>
								{!pricingTier.contactUs && (
									<Typography
										type="copy3"
										className="text-white"
										emphasis
									>
										{formatPrice(
											(base +
												sessionsCost +
												tracesCost +
												loggingCost +
												errorsCost) *
												(annualPricing ? 0.85 : 1),
											'never',
										)}
									</Typography>
								)}
								{pricingTier.contactUs && (
									<CalendlyModal>
										<Typography
											type="copy3"
											className="underline"
											emphasis
										>
											Contact Sales
										</Typography>
									</CalendlyModal>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col p-4 gap-4 overflow-hidden border border-t-0 rounded-b-lg rounded-t-none border-divider-on-dark h-full w-full lg:rounded-bl-none lg:rounded-tr-lg lg:border-t lg:w-[640px] xl:w-[720px] 2xl:w-[800px] ">
					<CalculatorRowDesktop
						title="Session Replay"
						product={'Sessions'}
						value={sessionUsage}
						cost={sessionsCost}
						retention={sessionRetention}
						onChange={setSessionUsage}
						onChangeRetention={setSessionRetention}
					/>
					<CalculatorRowDesktop
						title="Error Monitoring"
						product={'Errors'}
						value={errorUsage}
						cost={errorsCost}
						rangeMultiplier={100}
						retention={errorRetention}
						onChange={setErrorUsage}
						onChangeRetention={setErrorRetention}
					/>
					<CalculatorRowDesktop
						title="Logging"
						product={'Logs'}
						value={loggingUsage}
						cost={loggingCost}
						rangeMultiplier={10000}
						retention="30 days"
						onChange={setLoggingUsage}
					/>
					<CalculatorRowDesktop
						title="Traces"
						product={'Traces'}
						value={tracesUsage}
						cost={tracesCost}
						rangeMultiplier={10000}
						retention="30 days"
						onChange={setTracesUsage}
						showAbove
					/>
				</div>
			</div>
		</div>
	)
}

const CalculatorPriceRow = ({
	title,
	cost,
	contact,
}: {
	title: String
	cost: Number
	contact?: boolean
}) => {
	return (
		<div className="flex justify-between">
			<Typography type="copy3" className="text-darker-copy-on-dark">
				{title}
			</Typography>
			{!contact && (
				<Typography
					type="copy3"
					className="text-darker-copy-on-dark"
					emphasis
				>
					{`$${cost.toFixed(2)}`}
				</Typography>
			)}
			{contact && (
				<CalendlyModal>
					<Typography
						type="copy3"
						className="text-darker-copy-on-dark underline"
						emphasis
					>
						Contact Sales
					</Typography>
				</CalendlyModal>
			)}
		</div>
	)
}

const CalculatorRowDesktop = ({
	title,
	product,
	value,
	cost,
	rangeMultiplier = 1,
	retention,
	showAbove,
	onChange,
	onChangeRetention,
}: {
	title: string
	product: 'Sessions' | 'Errors' | 'Logs' | 'Traces'
	value: number
	cost: number
	rangeMultiplier?: number
	retention: Retention
	showAbove?: boolean //Shows listbox options above the button
	onChange: (value: number) => void
	onChangeRetention?: (value: Retention) => void
}) => {
	const rangeOptions = [
		0, 500, 1_000, 5_000, 10_000, 100_000, 250_000, 500_000, 750_000,
		1_000_000, 10_000_000,
	].map((v) => v * rangeMultiplier)

	return (
		<div className="flex border border-divider-on-dark rounded-lg w-full">
			<div className="flex flex-col flex-1 gap-1 p-3 w-full">
				<div className="flex justify-between items-center mb-4 md:mb-4">
					<div className="flex items-center gap-3">
						<Typography type="copy3" emphasis>
							{title}
						</Typography>
					</div>
					<Typography type="copy2" emphasis>
						${cost.toFixed(2)}
					</Typography>
				</div>
				<RangedInput
					options={rangeOptions}
					value={value}
					unit={product}
					showAbove={showAbove}
					onChange={onChange}
				/>

				<div className="flex justify-between">
					<div className="w-full md:w-auto">
						<ListboxOptions
							options={
								onChangeRetention !== undefined
									? [
											'3 months',
											'6 months',
											'1 year',
											'2 years',
									  ]
									: ['30 days']
							}
							title="Retention: "
							value={retention}
							showAbove={showAbove}
							onChange={onChangeRetention}
						/>
					</div>

					<div className="hidden md:flex items-center gap-2">
						<Typography
							type="copy3"
							className="text-darker-copy-on-dark"
						>
							Monthly ingested {product.toLowerCase()}:
						</Typography>
						<Typography
							type="copy4"
							emphasis
							className="text-white border-[1px] border-copy-on-light rounded-full px-3 py-[2px] w-[65px] text-center"
						>
							{value.toLocaleString(undefined, {
								notation: 'compact',
								compactDisplay: 'short',
							})}
						</Typography>
					</div>
				</div>
			</div>
		</div>
	)
}

const RangedInput = ({
	options,
	value,
	showAbove,
	onChange,
}: {
	options: number[]
	value: number
	unit: string
	showAbove?: boolean //Shows listbox options above the button
	onChange: (value: number) => void
}) => {
	const sortedOptions = [...options].sort((a, b) => a - b)
	const min = sortedOptions[0] ?? 0
	const max = sortedOptions[sortedOptions.length - 1] ?? 100

	const normalize = (value: number) => (value - min) / (max - min)
	const denormalize = (normal: number) => normal * (max - min) + min

	const parseFormattedNumber = (formattedNumberString: string) => {
		const si = [
			{ value: 1e9, symbol: 'B' },
			{ value: 1e6, symbol: 'M' },
			{ value: 1e3, symbol: 'K' },
		]

		const regex = /([0-9.]+)([BMK])/
		const match = formattedNumberString.match(regex)

		if (!match) {
			return parseFloat(formattedNumberString)
		}

		const [, valueStr, symbol] = match
		const value = parseFloat(valueStr)

		for (let i = 0; i < si.length; i++) {
			if (symbol === si[i].symbol) {
				return value * si[i].value
			}
		}

		return NaN // Invalid symbol
	}

	return (
		<>
			<div className="flex md:hidden w-full ">
				<ListboxOptions
					options={options.map((number) => formatNumber(number))}
					value={formatNumber(value)}
					onChange={(ev) => onChange(parseFormattedNumber(ev))}
					title="Usage: "
					showAbove={showAbove}
				/>
			</div>

			<Slider.Root
				min={min}
				max={max}
				step={500}
				value={[denormalize(Math.pow(normalize(value), 1 / 3))]}
				onValueChange={([value]) =>
					value != null &&
					onChange(
						Math.ceil(denormalize(Math.pow(normalize(value), 3))),
					)
				}
				className="relative items-center hidden w-full h-12 select-none md:flex touch-none group cursor-pointer"
			>
				<Slider.Track className="relative flex-1 h-3 overflow-hidden rounded-full bg-divider-on-dark">
					<div
						className="absolute inset-y-0 left-0 h-full bg-white"
						style={{
							width: `${
								Math.pow(normalize(value), 1 / 3) * 100
							}%`,
						}}
					/>
				</Slider.Track>
				<Slider.Thumb className="relative w-6 h-6 border-[4px] hover:shadow-white/25 hover:shadow-[0_0_0_4px] outline-none bg-[#F5F5F5] border-dark-background rounded-full flex flex-col items-center transition-all" />
			</Slider.Root>
		</>
	)
}

const ListboxOptions = <T extends string>({
	options,
	value,
	title,
	showAbove,
	onChange,
}: {
	options: readonly T[]
	value?: T
	title?: string //Displayed prefix to the value. "Usage: " for example.
	showAbove?: boolean //Displays options above the button
	onChange?: (value: T) => void
}) => {
	return (
		<Listbox
			value={value}
			onChange={(ev) => onChange?.(ev)}
			disabled={options.length <= 1}
		>
			<div className="relative w-full">
				<Listbox.Button
					className={`${
						options.length == 1
							? 'border-divider-on-dark pr-3 cursor-default'
							: 'border-copy-on-light cursor-pointer pr-10'
					} relative w-full rounded-lg bg-dark-background border-[1px] z-40 py-2 pl-3 text-left focus:outline-none sm:text-sm`}
				>
					<span className="block truncate text-center">
						<Typography
							type="copy3"
							className="text-copy-on-dark"
							emphasis
						>
							{title || ''}
							{value}
						</Typography>
					</span>
					{options.length > 1 && (
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronUpDownIcon
								className="h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
						</span>
					)}
				</Listbox.Button>
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Listbox.Options
						className={classNames(
							'absolute z-50 w-full max-h-60 overflow-auto rounded-md bg-dark-background border border-copy-on-light py-1 sm:text-sm',
							showAbove ? 'mb-1 bottom-full' : 'mt-1 top-full',
						)}
					>
						{options.map((option, optionIdx) => (
							<Listbox.Option
								key={optionIdx}
								className={({ active }) =>
									`relative cursor-pointer select-none py-2 px-4 ${
										active
											? 'text-white font-bold'
											: 'text-copy-on-dark'
									}`
								}
								value={option}
							>
								{({ selected }) => (
									<>
										<span
											className={`block truncate ${
												selected
													? 'font-semibold'
													: 'font-normal'
											}`}
										>
											{option}
										</span>
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	)
}

const MonthlySlider = ({
	annualPricing,
	setAnnualPricing,
}: {
	annualPricing: boolean
	setAnnualPricing: (value: any) => void
}) => {
	return (
		<div className="relative flex justify-center w-full p-1 border border-divider-on-dark rounded-md h-9">
			<div className="flex w-full z-10 items-center h-full">
				<div
					className="flex justify-center w-1/2 cursor-pointer"
					onClick={() => setAnnualPricing(false)}
				>
					<Typography
						type="copy3"
						className={`${
							!annualPricing ? 'text-white' : 'text-copy-on-dark'
						} transition-colors`}
						emphasis
					>
						Monthly
					</Typography>
				</div>

				<div
					className="flex justify-center w-1/2 cursor-pointer"
					onClick={() => setAnnualPricing(true)}
				>
					<Typography
						type="copy3"
						className={`${
							annualPricing ? 'text-white' : 'text-copy-on-dark'
						} transition-colors`}
						emphasis
					>
						Annually
					</Typography>
				</div>
			</div>

			<div className="absolute w-full h-full top-0">
				<div className="relative h-full mx-1">
					<span
						className={`${
							annualPricing ? 'left-1/2' : 'left-0'
						} absolute w-1/2 inset-y-1 bg-[#744ED4] border border-[#744ED4] transition-all rounded-[3px]`}
					/>
				</div>
			</div>
		</div>
	)
}

const SFECard = ({
	setEstimatorCategory,
}: {
	setEstimatorCategory: (value: any) => void
}) => {
	return (
		<div className="flex w-full flex-col lg:flex-row lg:items-center justify-between p-4 border-[1px] border-divider-on-dark rounded-lg gap-4">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<HiServer className="text-[#E93D82] w-8 h-8 -translate-x-1" />
					<Typography
						type="copy1"
						emphasis
						className="text-color-copy-on-dark"
					>
						Self-Hosted Enterprise
					</Typography>
				</div>
				<Typography
					type="copy3"
					className="text-color-darker-copy-on-dark"
				>
					For large enterprises hosting Highlight on their own
					infrastructure.{' '}
					<Link href="/docs/general/company/open-source/hosting/self-host-enterprise">
						Learn more.
					</Link>
				</Typography>
			</div>
			<PrimaryButton
				className={
					'bg-dark-background border border-copy-on-dark text-copy-on-dark rounded-md text-center py-1 hover:bg-white hover:text-dark-background transition-colors'
				}
				onClick={(e) => {
					setEstimatorCategory('SelfHostedEnterprise')
					e.preventDefault()
					document.querySelector('#overage')?.scrollIntoView({
						behavior: 'smooth',
					})
					window.history.pushState({}, '', `#overage`)
				}}
			>
				<Typography type="copy3" emphasis>
					Estimate Costs
				</Typography>
			</PrimaryButton>
		</div>
	)
}

export default PricingPage
