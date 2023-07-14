import { Typography } from '../common/Typography/Typography'

const DayOne = () => {
	return (
		<div>
			<Typography
				className="text-darker-copy-on-dark"
				type="copy3"
				emphasis
			>
				Day 1: July 20th
			</Typography>
			<div className="w-full grid grid-cols-4 grid-flow-row grid-rows-2 gap-1">
				<div className="bg-white col-span-4"></div>
				<div className="bg-white col-span-4 flex w-screen">BIG BOX</div>
				<div className="bg-white col-span-4">BIG BOX</div>
				<div className="bg-white col-span-4">BIG BOX</div>
				<div className="bg-white col-span-4">BIG BOX</div>
				<div className="bg-white col-span-4">BIG BOX</div>
				<div className="bg-white col-span-4">BIG BOX</div>
			</div>
		</div>
	)
}

export default DayOne
