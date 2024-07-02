import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useEffect } from 'react'
import { useToggle } from 'react-use'

import styles from './Buttons.module.css'

const HitTargets = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const [isTrue, toggleTrue] = useToggle(false)

	return (
		<div className={styles.hitTargets}>
			<section>
				<h2>Rotating Buttons</h2>
				{isTrue ? (
					<button onClick={toggleTrue} className="true">
						True
					</button>
				) : (
					<button onClick={toggleTrue} className="false">
						False
					</button>
				)}
			</section>
			<section>
				<h2>Buttons</h2>
				{Array.from(Array(5)).map((_, i) => (
					<button
						key={i}
						onClick={() => {
							console.log(`hit ${i}`)
						}}
					>
						Button {i}
					</button>
				))}
			</section>
			<section>
				<h2>Same Target</h2>
				<button
					onClick={() => {
						console.log('Same')
					}}
				>
					Same Target
				</button>
			</section>
		</div>
	)
}

export default HitTargets
