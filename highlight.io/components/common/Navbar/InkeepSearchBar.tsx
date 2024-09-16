import dynamic from 'next/dynamic'
import { InkeepSearchBarProps } from '@inkeep/uikit'
import useInkeepSettings from 'highlight.io/utils/hooks'

const SearchBar = dynamic(
	() => import('@inkeep/uikit').then((mod) => mod.InkeepSearchBar),
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
