import BarChart from '@components/BarChart/BarChart'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { getErrorGroupStats } from '@pages/ErrorsV2/utils'
import AutoSizer from 'react-virtualized-auto-sizer'

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const ErrorFrequencyChart = ({ errorGroup }: Props) => {
	const { counts } = getErrorGroupStats(errorGroup)
	return (
		<AutoSizer disableHeight>
			{({ width }: { width: number }) => (
				<BarChart
					data={counts || []}
					height={24}
					width={width}
					minBarHeight={5}
				/>
			)}
		</AutoSizer>
	)
}

export default ErrorFrequencyChart
