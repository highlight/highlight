import {
	ChevronDownIcon,
	InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { NextPage } from 'next'
import Image from 'next/image'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Typography } from '../../components/common/Typography/Typography'
import homeStyles from '../../components/Home/Home.module.scss'
import pricingStyles from '../../components/Pricing/Pricing.module.scss'

import CreditCard from '../../public/images/credit-card.svg'
import Delete from '../../public/images/delete.svg'
import Globe from '../../public/images/globe.svg'
import PcPlayMedia from '../../public/images/pc-play-media.svg'
import ReceiptList from '../../public/images/receipt-list.svg'
import Security from '../../public/images/security.svg'
import Stopwatch from '../../public/images/stopwatch.svg'
import TagLoyalty from '../../public/images/tag-loyalty.svg'
import Wallet from '../../public/images/wallet.svg'

import { RadioGroup } from '@headlessui/react'
import * as Slider from '@radix-ui/react-slider'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Collapsible from 'react-collapsible'
import { Section } from '../../components/common/Section/Section'
import { CompaniesReel } from '../../components/Home/CompaniesReel/CompaniesReel'

const PricingPage: NextPage = () => {
	return (
		<div>
			<Navbar />
			<div className="flex flex-col w-full px-10 mx-auto mt-24">
				<div className="flex flex-col items-center text-center gap-9">
					{/* Title, tagline and CTA */}
					<h1 className="max-w-3xl">
						Get the{' '}
						<span className="text-highlight-yellow">
							visibility
						</span>{' '}
						you need today.
					</h1>
					<Typography type="copy1" onDark>
						Fair and transparent pricing that scales with any
						organization.
					</Typography>
				</div>
				<PlanTable />
				<div
					className="flex flex-col items-center mt-32 text-center gap-9"
					id="overage"
				>
					{/* Pay as you go */}
					<h2>
						Pay{' '}
						<span className="text-highlight-yellow">
							as you go.
						</span>
					</h2>
					<Typography type="copy1" onDark className="max-w-4xl">
						Each of our plans comes with a pre-defined usage quota,
						and if you exceed that quota, we charge an additional
						fee. For custom plans,{' '}
						<a href="mailto:sales@highlight.io">reach out to us</a>.
					</Typography>
				</div>
				<PriceCalculator />
			</div>

			<div className="px-10 mt-32 mb-20">
				<CompaniesReel />

				<div className={classNames(homeStyles.anchorFeature, 'mt-20')}>
					<div className={homeStyles.anchorHead}>
						<h2>{`Frequently asked questions`}</h2>
					</div>
				</div>
				<Section>
					<div>
						{Faqs.map((faq, index) => (
							<Question
								key={index}
								question={faq.question}
								answer={faq.answer}
								icon={faq.icon}
							/>
						))}
					</div>
				</Section>
			</div>
			<FooterCallToAction />
			<Footer />
		</div>
	)
}

const Question = ({
	question,
	answer,
	icon,
}: {
	question: string
	answer: string
	icon: string
}) => {
	const [expanded, setExpanded] = useState(false)
	return (
		<div className={pricingStyles.faqRowClickable}>
			<Collapsible
				onOpening={() => setExpanded(true)}
				onClosing={() => setExpanded(false)}
				transitionTime={200}
				trigger={
					<div className={pricingStyles.faqRow}>
						<div className={pricingStyles.faqLeftContent}>
							<Image src={icon} alt="pc icon"></Image>
							<Typography
								className={pricingStyles.question}
								type="copy2"
								emphasis
							>
								{question}
							</Typography>
						</div>
						<button
							className={classNames(pricingStyles.circleButton, {
								[pricingStyles.expanded]: expanded,
							})}
						>
							<ChevronDownIcon
								className={classNames(
									'w-5 h-5',
									expanded
										? 'text-dark-background'
										: 'text-blue-cta',
								)}
							/>
						</button>
					</div>
				}
			>
				<div className={pricingStyles.collapseInner}>
					<Typography
						className={pricingStyles.questionDescription}
						type="copy3"
						onDark
					>
						<div dangerouslySetInnerHTML={{ __html: answer }}></div>
					</Typography>
				</div>
			</Collapsible>
			<hr className={pricingStyles.faqDivider} />
		</div>
	)
}

const docsUrl = '/docs'

const Faqs: { question: string; answer: string; icon: string }[] = [
	{
		question: 'Do you offer a discount for non-profits?',
		answer: `We love supporting non-profits and offer a 75% discount for the lifetime of the account. To activate the discount, create a workplace on either the Standard or Pro plan. Then reach out to support and mention the discount.`,
		icon: TagLoyalty,
	},
	{
		question: 'How long does it take to setup Highlight?',
		answer: `It generally takes an engineer less than ten minutes to understand the concepts of Highlight and integrate the app into their workflow. For more information on setup, take a look at our <a href="${docsUrl}">docs</a>.`,
		icon: Stopwatch,
	},
	{
		question: 'Can I deploy Highlight on-premise?',
		answer: `Yes! To get a glimpse at how our hobby deployment process looks, take a look <a href="${docsUrl}/general/company/open-source/self-host-hobby">here</a>. To get a license key for a production deployment, contacts at <a href="mailto:sales@highlight.io">sales@highlight.io</a>.`,
		icon: Globe,
	},
	{
		question: "Is Highlight secure? Where's my data stored?",
		answer: `Highlight uses end-to-end encryption to keep your data safe while it’s in transit, and we also offer an on-prem solution if you want to keep customer data on your own servers. For more information, see our <a href="/#privacy">security section</a> and <a href="${docsUrl}" target="_blank">docs</a>. If we don't answer your question there, <a href="mailto:jay@highlight.io">let us know</a>.`,
		icon: Security,
	},
	{
		question: 'Do I need a credit card to sign up?',
		answer: `Absolutely not! We never ask for your credit card on sign up. If you start on a paid plan then 30 days after signing up you will be politely prompted to enter in your payment information. At anytime you can switch back to a free plan as long as your workplace has less than 6 seats.`,
		icon: CreditCard,
	},
	{
		question: 'How will you charge me?',
		answer: `We ask for a credit card. Your credit card information will never touch our servers as we use <a href="https://stripe.com/" target="_blank">Stripe</a> as our payments processor. For Enterprise customers we can do ACH and custom invoices if requested.`,
		icon: Wallet,
	},
	{
		question: 'How does billing work?',
		answer: `We charge by usage; or number of sessions collected per month. Our billing system uses prorated billing, meaning you only pay for what you use below each of our thresholds (see above). For example if you move to the Startup plan from the Basic plan in the middle of the month, then you will only be charged for the time you are on the paid plan.`,
		icon: ReceiptList,
	},
	{
		question: 'What counts as a session?',
		answer: `A session is contiguous instance of a user's presence on your app for less than 4 hours. That is, if a user is browsing your application for 3 minutes, then closes the tab, this counts as a single session.`,
		icon: PcPlayMedia,
	},
	{
		question: 'Can I cancel at anytime?',
		answer: `Definitely! You can cancel or downgrade your subscription at anytime. You can also delete your workplace in the settings page at anytime.`,
		icon: Delete,
	},
]

const billingPeriodOptions = ['Monthly', 'Annual'] as const
type BillingPeriod = typeof billingPeriodOptions[number]

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

const tierOptions = ['Free', 'UsageBased'] as const
type TierName = typeof tierOptions[number]

type PricingTier = {
	label: string
	basePrice: number
	sessions: number
	errors: number
	logs: number
	isMostPopular: boolean
}

const priceTiers: Record<TierName, PricingTier> = {
	Free: {
		label: 'Free forever',
		basePrice: 0,
		sessions: 500,
		errors: 1_000,
		logs: 1_000_000,
		isMostPopular: false,
	},
	UsageBased: {
		label: 'Pay as you go',
		basePrice: 0,
		sessions: 500,
		errors: 1_000,
		logs: 1_000_000,
		isMostPopular: true,
	},
}

function getBasePrice(
	{ basePrice }: PricingTier,
	billing: BillingPeriod,
	retention: Retention,
) {
	const billingMultiplier = billing === 'Annual' ? 0.8 : 1
	const retentionMultiplier = retentionMultipliers[retention]

	return basePrice * billingMultiplier * retentionMultiplier
}

const PlanTable = () => {
	const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('Monthly')
	const [retention, setRetention] = useState<Retention>('3 months')

	return (
		<div className="flex flex-col items-center max-w-full gap-6 mx-auto mt-16">
			{/* Pricing */}
			<div className="flex flex-wrap justify-center gap-12 gap-y-3">
				<RadioOptions
					title="Billing Period"
					options={billingPeriodOptions}
					value={billingPeriod}
					onChange={(v: BillingPeriod) => setBillingPeriod(v)}
				/>
				<RadioOptions
					title="Retention"
					options={retentionOptions}
					value={retention}
					onChange={(v: Retention) => setRetention(v)}
				/>
			</div>
			<div className="grid items-stretch w-full grid-cols-1 sm:grid-cols-2 min-[1190px]:grid-flow-col gap-7">
				{Object.entries(priceTiers).map(([name, tier]) => (
					<PlanTier
						name={name}
						tier={tier}
						billingPeriod={billingPeriod}
						key={name}
						retention={retention}
					/>
				))}
			</div>
			<Typography type="copy1" onDark className="text-center my-9">
				If usage goes beyond the included monthly quota, your{' '}
				<a href="#overage">usage rate</a> kicks in.
			</Typography>
			<div className="flex-shrink w-48" />
		</div>
	)
}

const PlanTier = ({
	name,
	tier,
	billingPeriod,
	retention,
}: {
	name: string
	tier: PricingTier
	billingPeriod: BillingPeriod
	retention: Retention
}) => {
	const { sessions, errors, logs } = tier

	return (
		<div className="flex flex-col flex-grow border rounded-md min-[1190px]:min-w-[255px] basis-64 border-divider-on-dark">
			<div className="p-5 border-b border-divider-on-dark">
				<Typography type="copy1" emphasis>
					{tier.label}
				</Typography>
			</div>
			<div className="p-5 flex flex-col gap-2.5 flex-grow">
				<div className="flex items-center gap-1">
					<Typography type="copy3" emphasis>
						Included
					</Typography>
					<a
						href="#overage"
						className="text-white transition-colors hover:text-blue-cta"
					>
						<InformationCircleIcon className="inline w-5 h-5" />
					</a>
				</div>
				<Typography type="copy3">
					{formatNumber(sessions)} monthly sessions
				</Typography>
				<Typography type="copy3">
					{formatNumber(errors)} monthly errors
				</Typography>
				<Typography type="copy3">
					{formatNumber(logs)} monthly logs
				</Typography>
				<Typography type="copy3">Unlimited seats</Typography>
			</div>
			<div className="p-5">
				<PrimaryButton
					href="https://app.highlight.io/sign_up"
					className={homeStyles.hollowButton}
				>
					Start free trial
				</PrimaryButton>
			</div>
		</div>
	)
}

const formatNumber = (n: number) =>
	n.toLocaleString(undefined, {
		minimumFractionDigits: 0,
	})

const formatPrice = (price: number) =>
	price
		.toLocaleString(undefined, {
			style: 'currency',
			currency: 'USD',
			signDisplay: 'always',
		})
		.replace('+', '+ ')

const PriceCalculator = () => {
	const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('Monthly')
	const [tierName, setTierName] = useState<TierName>('Free')
	const [retention, setRetention] = useState<Retention>('3 months')

	const tier = priceTiers[tierName]

	const [errorUsage, setErrorUsage] = useState(0)
	const [sessionUsage, setSessionUsage] = useState(0)
	const [loggingUsage, setLoggingUsage] = useState(0)

	useEffect(() => {
		setErrorUsage(tier.errors)
		setSessionUsage(tier.sessions)
	}, [tier, tierName])

	const basePrice = getBasePrice(tier, billingPeriod, retention)

	const getUsagePrice = (usage: number, price: number, size: number) =>
		Math.trunc(
			((Math.max(usage, 0) * price) / size) *
				retentionMultipliers[retention] *
				100,
		) / 100

	const sessionsCost = getUsagePrice(sessionUsage - tier.sessions, 5.0, 1_000)
	const errorsCost = getUsagePrice(errorUsage - tier.errors, 0.2, 1_000)
	const loggingCost = getUsagePrice(loggingUsage, 1.5, 1_000_000)

	return (
		<div className="flex flex-col items-center w-full gap-10 mx-auto mt-12">
			{/* Price calculator */}
			<div className="flex flex-wrap justify-center gap-12 gap-y-3">
				<RadioOptions
					title="Billing Period"
					options={billingPeriodOptions}
					value={billingPeriod}
					onChange={(v: BillingPeriod) => setBillingPeriod(v)}
				/>
				<RadioOptions
					title="Pricing Tier"
					options={tierOptions}
					value={tierName}
					onChange={(v: TierName) => setTierName(v)}
				/>
				<RadioOptions
					title="Retention"
					options={retentionOptions}
					value={retention}
					onChange={(v: Retention) => setRetention(v)}
				/>
			</div>
			<div className="flex flex-col items-end w-full max-w-[1100px]">
				<div className="flex flex-col overflow-hidden border divide-y rounded-lg md:rounded-br-none divide-divider-on-dark border-divider-on-dark">
					<div className="hidden h-12 md:flex">
						<div className="flex items-center flex-1 border-r border-divider-on-dark px-7">
							<Typography type="copy2" emphasis>
								Product
							</Typography>
						</div>
						<div className="flex items-center justify-center w-[343px] px-7">
							<Typography type="copy2" emphasis>
								Cost breakdown
							</Typography>
						</div>
					</div>
					<CalculatorRowDesktop
						title="Error Monitoring Usage."
						description="Error monitoring usage is defined by the number of errors collected by Highlight per month. Our frontend/server SDKs send errors, but you can also send custom errors."
						value={errorUsage}
						cost={errorsCost + basePrice}
						includedRange={tier.errors}
						onChange={setErrorUsage}
					/>
					<CalculatorRowDesktop
						title="Session Replay Usage."
						description="Session replay usage is defined by the number of sessions collected per month. A session is defined by an instance of a user’s tab on your application. "
						value={sessionUsage}
						cost={sessionsCost + basePrice}
						includedRange={tier.sessions}
						onChange={setSessionUsage}
					/>
					<CalculatorRowDesktop
						title="Logging Usage."
						description="Log usage is defined by the number of logs collected by highlight.io per month. A log is defined by a text field with attributes."
						value={loggingUsage}
						cost={loggingCost + basePrice}
						includedRange={0}
						rangeMultiplier={100}
						onChange={setLoggingUsage}
					/>
					<div className="block px-3 py-5 rounded-b-lg md:hidden">
						<Typography type="copy1" emphasis>
							Total:{' '}
							{formatPrice(
								basePrice +
									sessionsCost +
									errorsCost +
									loggingCost,
							)}
						</Typography>
					</div>
				</div>
				<div className="hidden border border-t-0 rounded-b-lg md:block h-52 border-divider-on-dark">
					<CalculatorCostDisplay
						heading="Total"
						cost={
							basePrice + sessionsCost + errorsCost + loggingCost
						}
					/>
				</div>
			</div>
		</div>
	)
}

const CalculatorRowDesktop = ({
	title,
	description,
	value,
	cost,
	includedRange,
	rangeMultiplier = 1,
	onChange,
}: {
	title: string
	description: string
	value: number
	includedRange: number
	cost: number
	rangeMultiplier?: number
	onChange: (value: number) => void
}) => {
	const rangeOptions = [
		0, 500, 1_000, 5_000, 10_000, 100_000, 250_000, 500_000, 750_000,
		1_000_000,
	].map((v) => v * rangeMultiplier)

	return (
		<div className="flex flex-row">
			<div className="flex flex-col flex-1 gap-1 px-3 py-5 md:px-7">
				<Typography
					type="copy4"
					emphasis
					className="rounded-full bg-blue-cta py-0.5 px-3 text-dark-background self-start inline-block md:hidden"
				>
					{formatPrice(cost)}
				</Typography>
				<Typography type="copy1" emphasis>
					{title}
				</Typography>
				<Typography type="copy3" className="mt-2.5">
					{description}
				</Typography>
				<RangedInput
					options={rangeOptions}
					value={value}
					includedRange={includedRange}
					onChange={onChange}
				/>
			</div>
			<div className="hidden border-l border-divider-on-dark md:inline-block">
				<CalculatorCostDisplay heading="Base + Usage" cost={cost} />
			</div>
		</div>
	)
}

export const RangedInput = ({
	options,
	value,
	includedRange = 0,
	onChange,
}: {
	options: number[]
	value: number
	includedRange?: number
	onChange: (value: number) => void
}) => {
	const sortedOptions = [...options].sort((a, b) => a - b)
	const min = sortedOptions[0] ?? 0
	const max = sortedOptions[sortedOptions.length - 1] ?? 100

	const snapValue = (value: number) => {
		const deltas = sortedOptions.map((v) => Math.abs(v - value))
		for (const [i, delta] of deltas.entries()) {
			if ((deltas[i + 1] ?? Infinity) > delta) return sortedOptions[i]
		}
		return sortedOptions[0]
	}

	const normalize = (value: number) => (value - min) / (max - min)
	const denormalize = (normal: number) => normal * (max - min) + min

	return (
		<>
			<div className="block md:hidden">
				<div className="relative">
					<select
						className="flex items-center justify-center w-full h-12 gap-2 text-center text-transparent transition-all border rounded-lg appearance-none cursor-pointer border-copy-on-light hover:bg-white/10 bg-dark-background"
						onChange={(ev) => onChange(parseFloat(ev.target.value))}
					>
						{options.map((value, i) => (
							<option value={value} key={i}>
								{value.toLocaleString(undefined, {
									notation: 'compact',
								})}
							</option>
						))}
					</select>
					<div className="absolute inset-0 flex items-center justify-center w-full h-12 gap-2 transition-all border rounded-lg pointer-events-none border-copy-on-light hover:bg-white/10">
						<Typography type="copy2" emphasis onDark>
							{snapValue(value).toLocaleString(undefined, {
								notation: 'compact',
							})}
						</Typography>
						<ChevronDownIcon className="w-5 h-5 text-darker-copy-on-dark" />
					</div>
				</div>
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
				className="relative items-center hidden w-full h-16 mt-4 select-none md:flex touch-none group"
			>
				<Slider.Track className="relative flex-1 h-3 overflow-hidden rounded-full bg-divider-on-dark">
					<div
						className="absolute inset-y-0 left-0 h-full bg-blue-cta/30"
						style={{
							width: `${
								Math.pow(normalize(includedRange), 1 / 3) * 100
							}%`,
						}}
					/>
				</Slider.Track>
				<Slider.Thumb className="relative w-6 h-6 border-2 focus:border-blue-cta hover:shadow-white/25 hover:shadow-[0_0_0_4px] outline-none bg-[#F5F5F5] border-copy-on-dark rounded-full flex flex-col items-center transition-all">
					<div className="absolute w-2.5 h-2.5 rotate-45 rounded-sm -top-4 bg-blue-cta" />
					<div className="absolute px-1 py-0.5 mb-2 text-divider-on-dark font-semibold text-[10px] rounded-sm bottom-full bg-blue-cta">
						{value.toLocaleString(undefined, {
							notation: 'compact',
						})}
					</div>
				</Slider.Thumb>
			</Slider.Root>
		</>
	)
}

const CalculatorCostDisplay = ({
	cost,
	heading,
}: {
	cost: number
	heading: string
}) => (
	<div className="grid flex-shrink-0 place-content-center place-items-center w-[343px] h-full">
		<Typography type="copy3" emphasis onDark>
			{heading}
		</Typography>
		<span className="text-4xl font-semibold">{formatPrice(cost)}</span>
	</div>
)

const RadioOptions = <T extends string>({
	title,
	options,
	value,
	onChange,
}: {
	title: string
	options: readonly T[]
	value?: T
	onChange?: (value: T) => void
}) => {
	return (
		<RadioGroup
			value={value}
			onChange={onChange}
			className="flex flex-col items-center gap-2"
		>
			<RadioGroup.Label className="">
				<Typography
					type="copy4"
					className="text-center text-darker-copy-on-dark"
				>
					{title}
				</Typography>
			</RadioGroup.Label>
			<div className="flex p-px border rounded-[10px] gap-1 bg-user-black border-divider-on-dark">
				{options.map((option) => (
					<RadioGroup.Option value={option} key={option}>
						{({ checked }) => (
							<div className="cursor-pointer">
								<div
									className={classNames(
										'text-center px-2.5 py-1.5 select-none rounded-lg transition-colors',
										checked
											? 'text-dark-background bg-white'
											: 'text-white hover:bg-white/10',
									)}
								>
									<Typography type="copy3" emphasis>
										{option}
									</Typography>
								</div>
							</div>
						)}
					</RadioGroup.Option>
				))}
			</div>
		</RadioGroup>
	)
}

export default PricingPage
