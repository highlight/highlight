import { useState } from 'react'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { INTEGRATIONS } from '../components/Integrations/integration'
import IntegrationCard from '../components/Integrations/IntegrationCard'
import WideCard from '../components/Integrations/WideCard'

const IntegrationsPage = () => {
	const [activeCategory, setActiveCategory] = useState<string>('All')
	const [searchQuery, setSearchQuery] = useState('')

	const categories = ['All', ...Object.keys(INTEGRATIONS)]

	const filteredIntegrations =
		activeCategory !== 'All'
			? { [activeCategory]: INTEGRATIONS[activeCategory] }
			: INTEGRATIONS

	const searchedIntegrations = Object.entries(filteredIntegrations).reduce(
		(acc, [category, integrations]) => {
			const filtered = integrations.filter(
				(i) =>
					i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					i.description.toLowerCase().includes(searchQuery.toLowerCase()),
			)
			if (filtered.length > 0) acc[category] = filtered
			return acc
		},
		{} as typeof INTEGRATIONS,
	)

	const totalCount = Object.values(INTEGRATIONS).flat().length

	return (
		<div className="bg-[#0D0225] min-h-screen">
			<Navbar />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
				{/* Hero Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						Find the{' '}
						<span className="text-color-selected-light">integration</span> you
						need.
					</h1>
					<p className="text-lg text-[#9B8EC4] max-w-2xl mx-auto">
						Use your favorite tools with highlight.io.{' '}
						{totalCount}+ integrations available.
					</p>
				</div>

				{/* Search Bar */}
				<div className="relative max-w-lg mx-auto mb-8">
					<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
						<svg
							className="w-5 h-5 text-[#9B8EC4]"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<input
						type="text"
						placeholder="Search integrations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-3 bg-[#1A0E35] border border-[#2D1B69] rounded-xl text-white placeholder-[#9B8EC4] focus:outline-none focus:border-[#6C47FF] transition-colors"
					/>
				</div>

				{/* Category Filter Pills */}
				<div className="flex flex-wrap justify-center gap-2 mb-10">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setActiveCategory(category)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
								activeCategory === category
									? 'bg-[#6C47FF] text-white shadow-lg shadow-[#6C47FF]/30'
									: 'bg-[#1A0E35] text-[#9B8EC4] border border-[#2D1B69] hover:border-[#6C47FF] hover:text-white'
							}`}
						>
							{category}
						</button>
					))}
				</div>

				{/* Integration Grid */}
				{Object.entries(searchedIntegrations).length === 0 ? (
					<div className="text-center text-[#9B8EC4] py-16">
						<svg
							className="w-16 h-16 mx-auto mb-4 opacity-30"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p className="text-xl">
							No integrations found for &quot;{searchQuery}&quot;
						</p>
					</div>
				) : (
					Object.entries(searchedIntegrations).map(
						([category, integrations]) => (
							<div key={category} className="mb-10">
								<h2 className="text-xl font-semibold text-[#C4B5FD] mb-4 flex items-center gap-2">
									<span className="w-1 h-5 bg-[#6C47FF] rounded-full inline-block" />
									{category}
									<span className="text-sm font-normal text-[#9B8EC4]">
										({integrations.length})
									</span>
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
									{integrations.map((integration) => (
										<IntegrationCard
											key={integration.name}
											{...integration}
										/>
									))}
								</div>
							</div>
						),
					)
				)}

				{/* Footer CTA */}
				<div className="mt-16">
					<WideCard
						title="Are we missing anything?"
						desc="Reach out if you want support for another integration!"
						primaryLink="https://discord.gg/yxaXEAqgwN"
						primaryLinkText="Get in Touch"
					/>
				</div>
			</main>
			<FooterCallToAction />
			<Footer />
		</div>
	)
}

export default IntegrationsPage
