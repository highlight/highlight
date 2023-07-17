import classNames from 'classnames'
import { BiChevronRight } from 'react-icons/bi'
import { Typography } from '../common/Typography/Typography'
import styles from './Launch.module.scss'

const BoxOverlay = ({
	header,
	subheader,
	badge,
}: {
	header: string
	subheader: string
	badge: string
}) => {
	return (
		<div className="absolute left-4 bottom-4">
			<Typography
				className="text-darker-copy-on-dark"
				type="copy4"
				emphasis
			>
				{subheader}
			</Typography>

			<div className="flex gap-3 items-center">
				<Typography className="text-white" type="copy2" emphasis>
					{header}
				</Typography>
				<Typography
					className="flex items-center text-color-selected-light rounded-full border-[1px] border-color-selected-light px-2 py-[1px]"
					type="copy4"
					emphasis
				>
					{badge}
					<BiChevronRight
						className={classNames(styles.chevronRight, 'h-5 w-5')}
					/>
				</Typography>
			</div>
		</div>
	)
}

export default BoxOverlay
