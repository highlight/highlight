import classNames from 'classnames'
import styles from '../../Home/Home.module.scss'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import { Typography } from '../Typography/Typography'

export const OSSCallToAction = () => {
	return (
		<div className={'flex justify-center mx-5 md:mx-[10vw] my-10 md:my-32'}>
			<div
				className={classNames(
					styles.ossCard,
					'w-full max-w-[1250px] border-[1px] border-divider-on-dark rounded-3xl py-10 px-2',
				)}
				style={{
					backgroundColor: '#30294E',
				}}
			>
				<h3 className="text-center leading-normal">
					Master OpenTelemetry with our{' '}
					<span className={styles.highlightedText}>
						Free Comprehensive Course
					</span>
				</h3>
				<div className="text-center px-2 md:px-16 mt-6">
					<Typography type="copy1" className="leading-relaxed">
						From fundamentals to advanced implementations, learn how
						OpenTelemetry can transform your engineering team&apos;s
						observability practices. Ideal for engineering leaders
						and developers building production-ready monitoring
						solutions.
					</Typography>
				</div>
				<div className="flex justify-center mt-8">
					<div className="flex flex-col lg:flex-row justify-center gap-4 w-full px-5 md:w-auto">
						<PrimaryButton
							href="/otel-course-signup?utm_source=highlight-oss-cta"
							className="md:max-w-[180px]"
						>
							<div className="flex justify-center items-center gap-3">
								<Typography type="copy2" emphasis={true}>
									Start Learning
								</Typography>
							</div>
						</PrimaryButton>
					</div>
				</div>
			</div>
		</div>
	)
}
