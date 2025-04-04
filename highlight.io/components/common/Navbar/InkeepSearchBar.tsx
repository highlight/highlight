import dynamic from 'next/dynamic'
import type { InkeepSearchBarProps } from '@inkeep/cxkit-react'
import useInkeepSettings from 'highlight.io/utils/hooks'

const SearchBar = dynamic(
	() => import('@inkeep/cxkit-react').then((mod) => mod.InkeepSearchBar),
	{
		ssr: false,
	},
)

function InkeepSearchBar() {
	const { baseSettings, aiChatSettings, searchSettings, modalSettings } =
		useInkeepSettings()

	const searchBarProps: InkeepSearchBarProps = {
		baseSettings,
		aiChatSettings,
		searchSettings,
		modalSettings,
	}

	return <SearchBar {...searchBarProps} />
}

export default InkeepSearchBar
