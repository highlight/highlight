import style from './ZoomArea.module.scss'

interface Props {
	leftProgress: number
	rightProgress: number
	isHidden: boolean
}
const ZoomArea = ({ leftProgress, rightProgress, isHidden }: Props) => {
	return (
		<div
			style={{
				left: leftProgress,
				width: Math.max(rightProgress - leftProgress, 1),
				visibility: isHidden ? 'hidden' : 'visible',
			}}
			className={style.zoomArea}
		>
			<div
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-start' }}
			>
				<div className={style.zoomAreaHandle} />
			</div>
			<div
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-end' }}
			>
				<div className={style.zoomAreaHandle} />
			</div>
		</div>
	)
}

export default ZoomArea
