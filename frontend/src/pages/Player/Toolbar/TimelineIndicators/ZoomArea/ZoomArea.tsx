import style from './ZoomArea.module.scss'

interface Props {
	leftProgress: number
	rightProgress: number
	isHidden: boolean
}
const ZOOM_AREA_SIDE_WIDTH = 15
const ZoomArea = ({ leftProgress, rightProgress, isHidden }: Props) => {
	return (
		<div
			style={{
				left: leftProgress,
				width: Math.max(
					rightProgress - leftProgress,
					ZOOM_AREA_SIDE_WIDTH * 2,
				),
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
